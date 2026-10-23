import { CognitoIdentityProviderClient, GetUserCommand } from '@aws-sdk/client-cognito-identity-provider'
import { CommerceError, Principal } from './contracts'
import { createCommerce } from './service'

// Requires Cognito to validate the actual access token. Decoding alone never authenticates.
export function cognitoIdentity(poolId: string, clientId: string, client = new CognitoIdentityProviderClient({ region: poolId.split('_')[0] })) {
  return async (token: string) => {
    try {
      const claims = JSON.parse(Buffer.from(token.split('.')[1], 'base64url').toString('utf8'))
      const issuer = `https://cognito-idp.${poolId.split('_')[0]}.amazonaws.com/${poolId}`
      if (!poolId || !clientId || claims.iss !== issuer || claims.client_id !== clientId || claims.token_use !== 'access' || !Number.isFinite(claims.exp) || claims.exp * 1000 <= Date.now()) throw new Error('Invalid token')
      const user = await client.send(new GetUserCommand({ AccessToken: token }))
      const sub = user.UserAttributes?.find(a => a.Name === 'sub')?.Value
      if (!sub || sub !== claims.sub) throw new Error('Invalid subject')
      return sub
    } catch { throw new CommerceError('UNAUTHORIZED', 401) }
  }
}
export function commerceHttp(service: ReturnType<typeof createCommerce>, verify: (token: string) => Promise<string>, checkoutEnabled: boolean) {
  return async (path: string, method: string, body: unknown, event: any) => {
    const headers = { 'Content-Type': 'application/json', 'Cache-Control': 'no-store', 'Pragma': 'no-cache', Vary: 'Authorization' }
    try {
      if (JSON.stringify(body ?? {}).length > 20000) throw new CommerceError('REQUEST_TOO_LARGE', 413)
      const authorization = Object.entries(event?.headers || {}).find(([k]) => k.toLowerCase() === 'authorization')?.[1]
      let principal: Principal = { kind: 'guest' }
      if (typeof authorization === 'string') {
        if (authorization.startsWith('Bearer ')) principal = { kind: 'customer', sub: await verify(authorization.slice(7)) }
        else if (/^Guest [A-Za-z0-9_-]{43}$/.test(authorization)) principal = { kind: 'guest', capability: authorization.slice(6) }
        else throw new CommerceError('UNAUTHORIZED', 401)
      }
      let result: unknown
      if (path === '/commerce/quotes' && method === 'POST') {
        if (!checkoutEnabled) throw new CommerceError('CHECKOUT_SECURITY_HOLD', 503)
        result = await service.createQuote(body, principal)
      } else {
        const match = /^\/commerce\/orders\/(cr_[a-f0-9-]{36})(?:\/(payment|revoke))?$/.exec(path)
        if (!match) throw new CommerceError('NOT_FOUND', 404)
        if (method === 'GET' && !match[2]) result = await service.status(match[1], principal)
        else if (method === 'POST' && match[2] === 'payment') {
          if (!checkoutEnabled) throw new CommerceError('CHECKOUT_SECURITY_HOLD', 503)
          result = await service.startPayment(match[1], principal)
        } else if (method === 'POST' && match[2] === 'revoke') result = await service.revoke(match[1], principal)
        else throw new CommerceError('NOT_FOUND', 404)
      }
      return { statusCode: 200, headers, body: JSON.stringify(result) }
    } catch (error) {
      const known = error instanceof CommerceError
      return { statusCode: known ? error.status : 503, headers, body: JSON.stringify({ error: known ? error.code : 'COMMERCE_UNAVAILABLE' }) }
    }
  }
}
