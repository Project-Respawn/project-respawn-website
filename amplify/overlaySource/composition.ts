import type { Stack } from 'aws-cdk-lib';
import type { ITable } from 'aws-cdk-lib/aws-dynamodb';
import { OverlaySourceInfrastructure } from './infrastructure';

export interface OverlaySourceTableRegistry {
  CreatorWorkspaceRecord?: ITable;
  Brand?: ITable;
}

export function composeOverlaySourceStack(input: {
  stack: Stack;
  tables: OverlaySourceTableRegistry;
  userPoolId: string;
  userPoolClientId: string;
  frontendOrigin: string;
  addOutput: (output: Record<string, unknown>) => void;
  handlerEntry?: string;
}) {
  const workspaceTable = input.tables.CreatorWorkspaceRecord;
  const brandTable = input.tables.Brand;
  if (!workspaceTable?.tableName) throw new Error('CreatorWorkspaceRecord table is unavailable to overlay-source-stack');
  if (!brandTable?.tableName) throw new Error('Brand table is unavailable to overlay-source-stack');

  const overlaySource = new OverlaySourceInfrastructure(input.stack, 'OverlaySource', {
    workspaceTable,
    brandTable,
    userPoolId: input.userPoolId,
    userPoolClientId: input.userPoolClientId,
    frontendOrigin: input.frontendOrigin,
    handlerEntry: input.handlerEntry,
  });
  input.addOutput({ custom: { overlaySource: { httpUrl: overlaySource.httpUrl, websocketUrl: overlaySource.websocketUrl, region: input.stack.region } } });
  return overlaySource;
}
