// Local acceptance transport only. Never alter Core's signed-in actor decision,
// TTL or Team's validator. A laptop just behind AWS can wait until issue time.
export async function waitForIssueTime(result,{now=Date.now,sleep=ms=>new Promise(resolve=>setTimeout(resolve,ms))}={}){
 const issued=result?.data?.evaluatedAt;
 if(result?.ok!==true||!Number.isSafeInteger(issued))return result;
 const remaining=issued*1000-now();
 if(remaining>0&&remaining<=1000)await sleep(remaining);
 return result;
}
