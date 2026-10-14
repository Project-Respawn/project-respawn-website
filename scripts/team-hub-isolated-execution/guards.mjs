import assert from 'node:assert/strict';
export function requireReservedConcurrency(settings,reservation){
 assert.ok(Number.isSafeInteger(reservation)&&reservation>0,'Expected a positive pinned reservation');
 const available=settings?.AccountLimit?.UnreservedConcurrentExecutions;
 assert.ok(Number.isSafeInteger(available),'Missing actual Lambda concurrency evidence');
 assert.ok(available>=100+reservation,'PINNED_CURSOR_PROBE_RESERVED_CONCURRENCY: must leave 100 unreserved');
 return true;
}
