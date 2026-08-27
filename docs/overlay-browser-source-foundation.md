# Overlay Browser Source foundation

## Product boundary

Each Brand has at most one active OBS Browser Source URL. That stable source loads the Brand's currently active scene snapshot and renders every enabled widget through the shared widget registry. Editor projects may still contain multiple scenes; **Replace Active Scene** switches the existing publication without changing its URL. Widgets never open their own network connections.

## Master infrastructure

Create a dedicated `overlay-source-stack`; do not add more directives to the existing FunctionDirectiveStack.

- One API Gateway WebSocket API with `$connect`, `$disconnect`, and `$default` routes.
- One dedicated overlay-source Lambda for Browser Source configuration, connection lifecycle, test-publication writes, and test-event fan-out.
- One HTTP API JWT authorizer using the existing Master Cognito user pool for Creator Tools publication/event operations.
- Public `GET /overlay/source/{credential}` handled by the same Lambda. Authorization is the opaque credential, not Cognito and not broadcaster/workspace/Brand IDs.
- DynamoDB `OverlayPublication` table keyed by publication ID, with a credential-hash GSI and server-side workspace/Brand/scene bindings.
- DynamoDB `OverlaySourceConnection` table keyed by connection ID, with a publication-ID GSI and TTL cleanup.
- API Gateway Management API permission scoped to the new WebSocket API.

The publication table stores only a SHA-256 credential hash. The random credential is returned once in the test URL. Revocation/status and any legacy expiry are checked on configuration retrieval and WebSocket connect. New early-access publications remain valid until explicitly revoked or rotated. Publishing requires the authenticated Cognito identity to own both the canonical Workspace and Brand; the server resolves those records and never trusts client identity fields.

A deterministic `BRAND_ACTIVE#{brandId}` lock item in the retained publication table points to the Brand's opaque publication ID. Creation writes the publication and lock in one DynamoDB transaction with conditional puts, so concurrent create requests cannot produce two active publications. An authenticated active-publication lookup restores non-secret metadata after refresh; the plaintext URL cannot be recovered and is never returned again.

Creators can rotate a publication URL through the authenticated management API. Rotation atomically replaces the stored SHA-256 hash and returns the new plaintext credential once. The old credential immediately fails configuration lookup and all future WebSocket reconnects. Connections established before rotation remain active until they disconnect or reconnect; rotation does not force-close existing sockets.

Revocation atomically marks the publication revoked and removes its matching Brand lock. A later create issues a new publication ID and credential; revoked credentials are never reused. This deterministic lock is an early-access uniqueness constraint rather than a permanent table-key design, so a future multi-publication product can remove the constraint without migrating publication records.

## Data shapes

Test publication:

```text
publicationId, entityType, credentialHash, ownerUserId, workspaceId, brandId,
sceneId, revision, status, sceneSnapshot, createdAt, updatedAt
```

Connection:

```text
connectionId, publicationId, expiresAt, connectedAt
```

The scene snapshot is separate from browser-local draft/session storage. Pressing **Update Source** updates the selected active scene; **Replace Active Scene** changes `sceneId` and snapshot on the same publication. Both increment `revision` without changing the credential. Browser Sources reload the snapshot after reconnect; explicit refresh is the predictable v1 update policy.

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

One connection per open Browser Source, not per widget. At 100 early-access creators/Brands with one active publication each and one or two OBS/browser instances, the normal expectation is roughly 100–200 concurrent WebSocket connections, with additional headroom for previews and secondary clients. This is an application lifecycle rule, not an infrastructure throttle: API Gateway WebSocket, Lambda, and DynamoDB on-demand capacity remain horizontally shared and can scale beyond the early-access cohort.

## OBS settings

- URL: `https://www.projectrespawn.com/overlay-source/{opaque-credential}`
- Width/height: the scene resolution shown by Creator Tools, normally 1920 × 1080.
- FPS: 30 for normal overlays; use 60 only when animation smoothness requires it.
- Custom CSS: none.
- Enable **Shutdown source when not visible** to avoid an idle connection when the OBS scene is inactive.
- Use **Refresh cache of current page** after pressing **Update Test Source** in this first revision.
