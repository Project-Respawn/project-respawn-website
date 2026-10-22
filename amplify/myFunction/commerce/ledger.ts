import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import { DynamoDBDocumentClient, GetCommand, PutCommand } from '@aws-sdk/lib-dynamodb'
import { Ledger, Order } from './contracts'
import { digest } from './quote'

/** CAS on the complete record; no stale lease automatically authorizes external resubmission. */
export function dynamoLedger(table: string, client = DynamoDBDocumentClient.from(new DynamoDBClient({})), prefix = 'ORDER#'): Ledger {
  if (!table) throw new Error('Commerce ledger is not configured')
  const key = (id: string) => ({ pk: prefix + id })
  async function conditional(input: any) {
    try { await client.send(new PutCommand(input)); return true }
    catch (error: any) { if (error.name === 'ConditionalCheckFailedException') return false; throw error }
  }
  return {
    async get(id) { return (await client.send(new GetCommand({ TableName: table, Key: key(id), ConsistentRead: true }))).Item as Order | undefined },
    create(order) { return conditional({ TableName: table, Item: { ...order, ...key(order.id) }, ConditionExpression: 'attribute_not_exists(pk)' }) },
    replace(previous, next) {
      if (previous.id !== next.id || previous.snapshotHash !== next.snapshotHash || digest(next.snapshot) !== previous.snapshotHash || next.version !== previous.version + 1) throw new Error('Invalid ledger transition')
      return conditional({ TableName: table, Item: { ...next, ...key(next.id) },
        ConditionExpression: '#v = :version AND snapshotHash = :hash', ExpressionAttributeNames: { '#v': 'version' },
        ExpressionAttributeValues: { ':version': previous.version, ':hash': previous.snapshotHash } })
    },
  }
}
