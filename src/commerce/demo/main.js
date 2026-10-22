import { createApp } from 'vue'
import Checkout from '../../views/Checkout/Checkout.vue'
// Dedicated localhost port and standalone entry: no Amplify configure, auth or production router.
if (!import.meta.env.DEV || import.meta.env.VITE_COMMERCE_DEMO !== '1') throw new Error('Offline demo unavailable')
if (!localStorage.getItem('cart')) localStorage.setItem('cart', JSON.stringify([{id:'fixture-shirt',productId:'fixture-shirt',variantId:'fixture-variant',name:'Project Respawn Fixture Shirt',quantity:1,price:0.01,color:'Black',size:'M'}]))
createApp(Checkout).mount('#app')
