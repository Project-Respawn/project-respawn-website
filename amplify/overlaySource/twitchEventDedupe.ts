import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, PutCommand, UpdateCommand } from '@aws-sdk/lib-dynamodb';

export const LEGACY_DISPOSITIONS = {
  suppress: 'SUPPRESS_LEGACY',
  allowFallback: 'ALLOW_LEGACY_FALLBACK',
} as const;

export type LegacyDisposition = typeof LEGACY_DISPOSITIONS[keyof typeof LEGACY_DISPOSITIONS];
export type TwitchEventDedupeClaim =
  | { status: 'CLAIMED' }
  | { status: 'DUPLICATE'; record: Record<string, unknown> };

export interface TwitchEventDedupeStore {
  claim(record: Record<string, unknown>): Promise<TwitchEventDedupeClaim>;
  update(dedupeKey: string, values: Record<string, unknown>): Promise<void>;
}

type DedupeCommand = PutCommand | UpdateCommand;
type DedupeCommandSender = (command: DedupeCommand) => Promise<unknown>;

function conditionalFailureRecord(error: unknown): Record<string, unknown> | null {
  if (!error || typeof error !== 'object') return null;
  const failure = error as { name?: unknown; Item?: unknown };
  if (failure.name !== 'ConditionalCheckFailedException') return null;
  return failure.Item && typeof failure.Item === 'object' && !Array.isArray(failure.Item)
    ? failure.Item as Record<string, unknown>
    : {};
}

export function createTwitchEventDedupeStore(environment: NodeJS.ProcessEnv = process.env, injectedSend?: DedupeCommandSender): TwitchEventDedupeStore {
  const tableName = environment.TWITCH_EVENT_DEDUPE_TABLE; if (!tableName) throw new Error('Missing TWITCH_EVENT_DEDUPE_TABLE');
  const db = DynamoDBDocumentClient.from(new DynamoDBClient({}));
  const send: DedupeCommandSender = injectedSend || ((command) => command instanceof PutCommand ? db.send(command) : db.send(command));
  return {
    async claim(record) {
      try {
        await send(new PutCommand({
          TableName: tableName,
          Item: record,
          ConditionExpression: 'attribute_not_exists(dedupeKey)',
          ReturnValuesOnConditionCheckFailure: 'ALL_OLD',
        }));
        return { status: 'CLAIMED' };
      } catch (error: unknown) {
        const existing = conditionalFailureRecord(error);
        if (existing) return { status: 'DUPLICATE', record: existing };
        throw error;
      }
    },
    async update(dedupeKey, values) {
      const keys = Object.keys(values), names = Object.fromEntries(keys.map((key) => [`#${key}`, key])), data = Object.fromEntries(keys.map((key) => [`:${key}`, values[key]]));
      await send(new UpdateCommand({ TableName: tableName, Key: { dedupeKey }, UpdateExpression: `SET ${keys.map((key) => `#${key} = :${key}`).join(', ')}`, ConditionExpression: 'attribute_exists(dedupeKey)', ExpressionAttributeNames: names, ExpressionAttributeValues: data }));
    },
  };
}
