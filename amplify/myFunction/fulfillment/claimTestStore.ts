// Offline model of an atomic conditional UpdateItem. Queue is the mock database, not an application lock.
export function conditionMatches(record: any, condition: any): boolean {
  if (!condition || !Object.keys(condition).length) throw new Error('Missing server condition')
  return Object.entries(condition).every(([key, rule]: [string, any]) => {
    if (key === 'and') return rule.every((c: any) => conditionMatches(record, c))
    if (key === 'or') return rule.some((c: any) => conditionMatches(record, c))
    if ('eq' in rule) return record?.[key] === rule.eq
    if ('attributeExists' in rule) return (record?.[key] !== undefined) === rule.attributeExists
    if (rule.attributeType === '_null') return record?.[key] === null
    throw new Error('Unsupported mock condition')
  })
}
export function installAtomicGraphQL(client: any) {
  let queue: Promise<any> = Promise.resolve()
  client.graphql = (request: any) => {
    const run = queue.then(async () => {
      if (request.authMode !== 'iam' || !request.query.includes('condition: $condition')) throw new Error('Conditional transport contract lost')
      const { input, condition } = request.variables
      const current = await client.models.FulfillmentOrder.get({ id: input.id })
      if (!conditionMatches(current.data, condition)) return { errors: [{ errorType: 'DynamoDB:ConditionalCheckFailedException' }] }
      const updated = await client.models.FulfillmentOrder.update(input)
      return { data: { updateFulfillmentOrder: updated.data }, errors: updated.errors }
    })
    queue = run.catch(() => undefined)
    return run
  }
  return client
}
