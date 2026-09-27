export interface Preview {
  contractVersion: 'tournament-preview.v1'; environment: 'Ntgre';
  preview: true; nonProduction: true; registrationEnabled: false;
  revision: string;
  tournaments: {id: string; name: string; game: string; format: string; status: 'preview'; registrationEnabled: false}[];
}
export function assertPreview(value: unknown): asserts value is Preview {
  const v = value as Preview;
  if (!v || v.contractVersion !== 'tournament-preview.v1' || v.environment !== 'Ntgre' || v.preview !== true || v.nonProduction !== true || v.registrationEnabled !== false || !/^[a-f0-9]{64}$/.test(v.revision) || !Array.isArray(v.tournaments) || v.tournaments.some(t => !t || !t.id?.startsWith('fixture-') || !t.name || !t.game || !t.format || t.status !== 'preview' || t.registrationEnabled !== false)) throw new Error('Invalid Tournament preview contract');
}
