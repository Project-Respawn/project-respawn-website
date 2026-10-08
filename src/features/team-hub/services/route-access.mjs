// Authorization or dependency failure must deny navigation without leaving an
// uncaught router rejection or the previous Team page visible.
export function teamEntryGuard(resolveAccess){
 return async to=>{try{await resolveAccess(String(to.params.teamSlug||''));return true;}
 catch{return {path:'/team-hub',query:{denied:'1'}};}};
}
