import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import { DynamoDBDocumentClient, TransactWriteCommand } from '@aws-sdk/lib-dynamodb'

export const TEAM_HUB_CONFLICT = 'Team Hub changed; refresh and try again'

export function tableNames(environment: NodeJS.ProcessEnv = process.env) {
  const names = {
    team: environment.TEAM_HUB_TEAM_TABLE,
    membership: environment.TEAM_HUB_MEMBERSHIP_TABLE,
    roster: environment.TEAM_HUB_ROSTER_TABLE,
  }
  if (Object.values(names).some((value) => !value)) throw new Error('Team Hub storage is unavailable')
  return names as Record<keyof typeof names, string>
}

export function transactionClient() {
  const documentClient = DynamoDBDocumentClient.from(new DynamoDBClient({}))
  return { transact: (items: any[]) => documentClient.send(new TransactWriteCommand({ TransactItems: items })) }
}

export async function commitTransaction(transaction: { transact(items: any[]): Promise<any> }, items: any[]) {
  try {
    await transaction.transact(items)
  } catch (error: any) {
    if (error?.name === 'TransactionCanceledException' || error?.name === 'ConditionalCheckFailedException') throw new Error(TEAM_HUB_CONFLICT)
    console.error('Team Hub transaction failed', error)
    throw new Error('Team Hub update failed')
  }
}
