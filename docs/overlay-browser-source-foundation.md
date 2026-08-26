# Overlay Browser Source foundation

## Product boundary

One published/test overlay scene maps to one OBS Browser Source URL. That source loads one immutable scene snapshot and renders every enabled widget through the shared widget registry. Widgets never open their own network connections.

## Proposed Master infrastructure (not deployed)

Create a dedicated `overlay-source-stack`; do not add more directives to the existing FunctionDirectiveStack.

- One API Gateway WebSocket API with `$connect`, `$disconnect`, and `$default` routes.
- One dedicated overlay-source Lambda for Browser Source configuration, connection lifecycle, test-publication writes, and test-event fan-out.
- One HTTP API JWT authorizer using the existing Master Cognito user pool for Creator Tools publication/event operations.
- Public `GET /overlay/source/{credential}` handled by the same Lambda. Authorization is the opaque credential, not Cognito and not broadcaster/workspace/Brand IDs.
- DynamoDB `OverlayTestPublication` table keyed by publication ID, with a credential-hash GSI and server-side workspace/Brand/scene bindings.
- DynamoDB `OverlaySourceConnection` table keyed by connection ID, with a publication-ID GSI and TTL cleanup.
- API Gateway Management API permission scoped to the new WebSocket API.

The publication table stores only a SHA-256 credential hash. The random credential is returned once in the test URL. Revocation/status and expiry are checked on configuration retrieval and WebSocket connect. Publishing requires an authenticated Cognito identity with `workspace.overlays.manage`; the server resolves the Workspace and Brand and never trusts client identity fields.

## Data shapes

Test publication:

```text
publicationId, credentialHash, ownerUserId, workspaceId, brandId, sceneId,
revision, status, expiresAt, sceneSnapshot, createdAt, updatedAt
```

Connection:

```text
connectionId, publicationId, expiresAt, connectedAt
```

The scene snapshot is separate from browser-local draft/session storage. Pressing **Update Test Source** replaces the server-side snapshot and increments `revision`. Browser Sources reload the snapshot after reconnect; explicit refresh is the predictable v1 update policy.

## Event flow

Creator Tools sends a versioned event to the authenticated test-event endpoint. The Lambda validates the event, validates publication ownership/bindings, queries connections by publication ID, and posts one event to every active Browser Source connection. Gone connections are removed. Future Twitch runtime delivery calls the same server-side publish function after runtime lease validation.

```json
{
  "version": 1,
  "id": "opaque-event-id",
  "type": "stream.follow",
  "timestamp": "2026-08-26T20:00:00.000Z",
  "source": "test",
  "data": {
    "actor": { "displayName": "TestFollower" },
    "payload": {}
  }
}
```

## Capacity

One connection per open Browser Source, not per widget. At 100 creators with four active scenes and two OBS/browser instances per scene, the initial expectation is roughly 800 concurrent WebSocket connections. API Gateway WebSocket, Lambda, and DynamoDB on-demand capacity are horizontally shared and do not depend on an ECS task's memory.

## OBS settings

- URL: `https://www.projectrespawn.com/overlay-source/{opaque-credential}`
- Width/height: the scene resolution shown by Creator Tools, normally 1920 × 1080.
- FPS: 30 for normal overlays; use 60 only when animation smoothness requires it.
- Custom CSS: none.
- Enable **Shutdown source when not visible** to avoid an idle connection when the OBS scene is inactive.
- Use **Refresh cache of current page** after pressing **Update Test Source** in this first revision.
