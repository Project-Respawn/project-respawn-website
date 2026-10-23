import fs from 'node:fs/promises'
import assert from 'node:assert/strict'
import { createRequire } from 'node:module'
const require=createRequire(import.meta.url)
const {chromium}=require(process.env.COMMERCE_PLAYWRIGHT_MODULE || 'playwright')
const browser=await chromium.launch({headless:true,channel:process.env.COMMERCE_BROWSER_CHANNEL||'msedge'})
const results=[]
try{
  for(const [currency,total,width,height]of [['GBP','£25.00',1440,900],['EUR','€29.00',390,844],['USD','US$32.00',390,844]]){
    const context=await browser.newContext({viewport:{width,height},serviceWorkers:'block'})
    const denied=[],errors=[]
    await context.route('**/*',route=>{const url=new URL(route.request().url());if(url.hostname==='127.0.0.1'&&url.port==='5187')return route.continue();denied.push(url.origin);return route.abort()})
    const page=await context.newPage();page.on('pageerror',error=>errors.push(error.message))
    await page.goto('http://127.0.0.1:5187/checkout-demo.html')
    await page.locator('#full-name').fill('Offline Fixture Customer');await page.locator('#email').fill('test@example.invalid')
    await page.locator('#address').fill('1 Fixture Street');await page.locator('#city').fill('Fixture City');await page.locator('#postcode').fill('TEST1')
    await page.locator('#country').selectOption('GB');await page.getByLabel('Payment currency').selectOption(currency)
    await page.getByRole('button',{name:'Review all-inclusive total'}).click()
    await page.getByRole('button',{name:'Simulate verified payment'}).waitFor()
    assert.match(await page.locator('.summary-row.total').innerText(),new RegExp(total.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')))
    assert.equal((await page.locator('.shipping-quote').innerText()).trim(),'FREE')
    assert.equal(await page.locator('#address').isDisabled(),true)
    assert.notEqual(await page.locator('.checkout-page').evaluate(el=>getComputedStyle(el).color),'rgb(0, 0, 0)','Scoped checkout tokens must provide readable foreground colour')
    await fs.mkdir('.amplify/browser-check',{recursive:true});await page.screenshot({path:`.amplify/browser-check/${currency}-quote.png`,fullPage:true})
    await page.getByRole('button',{name:'Simulate verified payment'}).click()
    await page.waitForFunction(()=>document.body.textContent.includes('accepted for production'))
    assert.ok((await page.locator('body').innerText()).includes('Payment Submitted'))
    assert.equal(errors.length,0,errors.join('\n'));assert.equal(denied.length,0,denied.join('\n'))
    const overflow=await page.evaluate(()=>document.documentElement.scrollWidth>window.innerWidth)
    assert.equal(overflow,false,'Checkout must fit the mobile viewport')
    await fs.mkdir('.amplify/browser-check',{recursive:true});await page.screenshot({path:`.amplify/browser-check/${currency}.png`,fullPage:true})
    results.push({currency,width,height,passed:true,externalRequests:denied.length});await context.close()
  }
}finally{await browser.close()}
await fs.writeFile('.amplify/browser-check/results.json',JSON.stringify(results,null,2));console.log(JSON.stringify(results))
