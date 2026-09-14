import type { APIGatewayProxyHandlerV2 } from 'aws-lambda';
import { handleTwitchRuntime } from '../../myFunction/twitch/runtimeHandlers';
import { jsonResponse } from '../../myFunction/shared/responses';
import { logger } from '../../myFunction/shared/logger';

export const handler: APIGatewayProxyHandlerV2 = async (event) => {
  const path = event.rawPath || event.requestContext.http.path;
  const method = event.requestContext.http.method;
  try {
    return await handleTwitchRuntime(path, method, event) as any;
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    logger.error('API request failed', { message });
    return jsonResponse(500, { error: 'Request failed', message }) as any;
  }
};
