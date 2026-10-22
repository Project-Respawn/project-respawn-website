// Imported only by the explicitly selected local Vite demo, never a payment provider.
export async function mountMockPayment({ target, createOrder, onSuccess, baseUrl }) {
  const note = document.createElement('p')
  note.textContent = 'OFFLINE DEMO — synthetic payment and fulfilment. No money is collected.'
  const button = document.createElement('button')
  button.type = 'button'; button.className = 'primary-btn'; button.textContent = 'Simulate verified payment'
  for (const name of target.getAttributeNames().filter(name => name.startsWith('data-v-'))) button.setAttribute(name, '')
  button.addEventListener('click', async () => {
    button.disabled = true
    try {
      const { publicId } = await createOrder()
      const response = await fetch(`${baseUrl}/fixture/complete`, { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({ id:publicId }) })
      if (!response.ok) throw new Error('Fixture callback failed')
      await onSuccess()
    } catch { note.textContent = 'Fixture payment is awaiting review. Do not repeat an uncertain submission.' }
  })
  target.replaceChildren(note, button)
  return { destroy() { target.replaceChildren() } }
}
