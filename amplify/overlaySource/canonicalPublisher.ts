import { fanOutOverlayEvent, publicationIsActive } from './domain';

export interface CanonicalPublisherDependencies {
  getActivePublication(brandId: string): Promise<any | null>;
  getConfigRevision(brandId: string): Promise<number>;
  listConnections(publicationId: string): Promise<any[]>;
  send(connectionId: string, event: any): Promise<void>;
  remove(connectionId: string): Promise<void>;
  log?(entry: Record<string, unknown>): void;
}

export class CanonicalPublicationError extends Error {
  readonly deliveryMayHaveOccurred: boolean;

  constructor(message: string, deliveryMayHaveOccurred: boolean, cause: unknown) {
    super(message, { cause });
    this.name = 'CanonicalPublicationError';
    this.deliveryMayHaveOccurred = deliveryMayHaveOccurred;
  }
}

export async function publishCanonicalOverlayEvent(input: { workspaceId: string; brandId: string; event: any; expectedPublicationId?: string }, dependencies: CanonicalPublisherDependencies) {
  try {
    const publication = await dependencies.getActivePublication(input.brandId);
    const skip = (reason: string) => ({ status: 'SKIPPED' as const, reason, publicationId: publication?.publicationId || null, configRevision: null, delivered: 0, staleRemoved: 0, failed: 0 });
    if (!publication || !publicationIsActive(publication)) return skip('NO_ACTIVE_PUBLICATION');
    if (publication.workspaceId !== input.workspaceId || publication.brandId !== input.brandId || (input.expectedPublicationId && publication.publicationId !== input.expectedPublicationId)) return skip('PUBLICATION_IDENTITY_MISMATCH');
    const alerts = (publication.sceneSnapshot?.widgets || []).find((widget: any) => widget.type === 'alerts' && widget.enabled !== false && widget.hidden !== true);
    if (!alerts) return skip('ALERTS_WIDGET_DISABLED');
    if (!(alerts.dataSource?.topics || []).includes(input.event.type)) return skip('TOPIC_NOT_ENABLED');
    const configRevision = await dependencies.getConfigRevision(input.brandId);
    const message = { ...input.event, configRevision };
    const connections = await dependencies.listConnections(publication.publicationId);
    try {
      const outcome = await fanOutOverlayEvent(connections, message, dependencies.send, dependencies.remove, (error, connectionId) => dependencies.log?.({ level: 'error', failureStage: 'websocket-send', connectionId, errorName: error?.name || 'Error' }));
      return { status: 'DELIVERED' as const, reason: null, publicationId: publication.publicationId, configRevision, ...outcome, event: message };
    } catch (error: unknown) {
      throw new CanonicalPublicationError('Canonical fanout outcome is indeterminate', true, error);
    }
  } catch (error: unknown) {
    if (error instanceof CanonicalPublicationError) throw error;
    throw new CanonicalPublicationError('Canonical publication failed before fanout', false, error);
  }
}
