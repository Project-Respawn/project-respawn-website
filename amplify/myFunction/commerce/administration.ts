import { requireEffectivePermission } from '../shared/requirePermission'
import { writePermissionAudit } from '../shared/audit'
import { createCommerce } from './service'

/** Existing admin permission, no public reconciliation endpoint and no caller overrides. */
export async function reconcileCommerceOrder(event: any, client: any, injected?: ReturnType<typeof createCommerce>) {
  const actor=await requireEffectivePermission(event,client,'orders.fulfillment.manage')
  const id=String(event.arguments?.orderId||'')
  if(!/^cr_[a-f0-9-]{36}$/.test(id))throw Error('Invalid Commerce order reference')
  const service=injected||(await import('./runtime')).commerceService()
  const order=await service.reconcile(id)
  await writePermissionAudit(client,actor.actorUserId,'order.commerce.reconcile','CommerceOrder',id,null,{state:order.state,version:order.version})
  return{id,state:order.state}
}
