import { randomUUID } from 'node:crypto'
import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import { DynamoDBDocumentClient, GetCommand, PutCommand } from '@aws-sdk/lib-dynamodb'

/** Durable safety wrapper for existing records; never migrates or rewrites their ownership.
 * A failed/uncertain attempt is quarantined indefinitely, not stolen after a timeout.
 */
export function legacyAttempts(table: string, environment: string, client = DynamoDBDocumentClient.from(new DynamoDBClient({}))) {
  return async <T>(id: string, execute: () => Promise<T>): Promise<T> => {
    if (!table || !id || !['production', 'sandbox'].includes(environment)) throw new Error('Legacy claim configuration is invalid')
    const pk = `LEGACY#${environment}#${id}`, attemptId = randomUUID()
    try {
      await client.send(new PutCommand({ TableName: table, Item: { pk, attemptId, state: 'CLAIMED' }, ConditionExpression: 'attribute_not_exists(pk)' }))
    } catch (error: any) {
      if (error.name !== 'ConditionalCheckFailedException') throw error
      const existing = (await client.send(new GetCommand({ TableName: table, Key: { pk }, ConsistentRead: true }))).Item
      if (existing?.state === 'DONE') return existing.result as T
      throw new Error('Legacy provider attempt requires authorized reconciliation; automatic retry denied')
    }
    const result = await execute()
    // If execution or this persistence fails, CLAIMED remains a durable fence.
    await client.send(new PutCommand({ TableName: table, Item: { pk, attemptId, state: 'DONE', result },
      ConditionExpression: 'attemptId = :attempt AND #s = :claimed', ExpressionAttributeNames: { '#s': 'state' },
      ExpressionAttributeValues: { ':attempt': attemptId, ':claimed': 'CLAIMED' } }))
    return result
  }
}
