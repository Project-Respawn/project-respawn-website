import { computed, nextTick, onBeforeUnmount, reactive, ref, watch } from 'vue';
import { checkoutCurrencies } from '../commerce/currencyPrices.js';
import { createSecureCheckout, statusMessage } from '../commerce/secureCheckout.js';
import { getApiBaseUrl } from '../config/apiBaseUrl';
import { isSameCartVariant, normaliseCartItem } from '../commerce/cartItem.js';
const DEMO = import.meta.env.DEV && import.meta.env.VITE_COMMERCE_DEMO === '1';
export function useCheckout() {
    const activeStep = ref('address'), orderComplete = ref(false), orderId = ref('');
    const addressComplete = ref(false), addressError = ref(''), revolutLoading = ref(false), revolutError = ref('');
    const fulfillmentError = ref(''), paymentReady = ref(false), paymentStarted = ref(false), quoting = ref(false);
    const checkoutEnabled = ref(false), destinations = ref([]), configurationError = ref('');
    const statusReference = ref(''), statusLookupMessage = ref(''), statusLookupBusy = ref(false);
    const orderState = ref('PENDING_PAYMENT');
    const canStartNewOrder = computed(() => ['PAYMENT_VERIFIED', 'PROVIDER_CONFIRMED', 'SHIPPED', 'CANCELLED', 'REFUNDED', 'PARTIALLY_REFUNDED', 'PAYMENT_FAILED'].includes(orderState.value));
    const authoritativeTotals = ref(null), currency = ref('GBP'), cartItems = ref([]);
    const customer = reactive({ fullName: '', email: '', phone: '', address: '', city: '', postcode: '', country: '', state: '' });
    const apiBase = DEMO ? '/__commerce_demo' : getApiBaseUrl('checkout API requests');
    const commerce = createSecureCheckout({ baseUrl: apiBase, accessToken: async () => {
            if (DEMO)
                return undefined;
            const { fetchAuthSession } = await import('aws-amplify/auth');
            return (await fetchAuthSession()).tokens?.accessToken?.toString();
        } });
    let embedded = null, activeOrder = null, timer = null, disposed = false, generation = 0, lockKey = '';
    const currencyCodes = checkoutCurrencies;
    const hasAuthoritativeQuote = computed(() => authoritativeTotals.value?.currency === currency.value);
    const subtotal = computed(() => hasAuthoritativeQuote.value ? authoritativeTotals.value.subtotalMinor / 100 : null);
    const total = computed(() => hasAuthoritativeQuote.value ? authoritativeTotals.value.totalMinor / 100 : null);
    const taxTotal = computed(() => hasAuthoritativeQuote.value ? authoritativeTotals.value.taxMinor / 100 : null);
    const originalShipping = computed(() => 0);
    const cartCount = computed(() => cartItems.value.reduce((sum, i) => sum + i.quantity, 0));
    const formatMoney = amount => amount === null || !Number.isFinite(amount) ? 'Awaiting server quote' : new Intl.NumberFormat('en-GB', { style: 'currency', currency: currency.value }).format(amount);
    const recipient = () => ({ name: customer.fullName, email: customer.email, address1: customer.address, city: customer.city, zip: customer.postcode, country_code: customer.country, ...(customer.state ? { state_code: customer.state } : {}) });
    const selectionKey = () => JSON.stringify({ items: cartItems.value.map(({ variantId, quantity }) => ({ variantId, quantity })), recipient: recipient(), currency: currency.value });
    function loadCart() { if (paymentStarted.value)
        return; try {
        const value = JSON.parse(localStorage.getItem('cart') || '[]');
        cartItems.value = (Array.isArray(value) ? value : []).map(normaliseCartItem);
    }
    catch {
        cartItems.value = [];
    } }
    function removeCartItem(item) { if (paymentStarted.value || quoting.value)
        return; const next = cartItems.value.filter(value => !isSameCartVariant(value, item)); localStorage.setItem('cart', JSON.stringify(next)); loadCart(); window.dispatchEvent(new Event('cart-updated')); }
    function destroy() { try {
        embedded?.destroy?.();
    }
    catch { } embedded = null; paymentReady.value = false; }
    async function refreshStatus() {
        try {
            const status = await commerce.status();
            if (disposed)
                return;
            fulfillmentError.value = statusMessage(status.state);
            orderState.value = status.state;
            if (['PAYMENT_VERIFIED', 'FULFILMENT_CLAIMED', 'PROVIDER_ORDER_CREATED', 'PROVIDER_CONFIRMING', 'PROVIDER_CONFIRMED', 'SHIPPED'].includes(status.state)) {
                // Do not erase a basket edited in another tab while payment was in progress.
                const saved = JSON.parse(localStorage.getItem('cart') || '[]').map(normaliseCartItem);
                if (JSON.stringify(saved.map(({ variantId, quantity }) => ({ variantId, quantity }))) === JSON.stringify(cartItems.value.map(({ variantId, quantity }) => ({ variantId, quantity }))))
                    localStorage.removeItem('cart');
                window.dispatchEvent(new Event('cart-updated'));
            }
            if (!['SHIPPED', 'CANCELLED', 'REFUNDED', 'PARTIALLY_REFUNDED', 'PAYMENT_FAILED', 'RECONCILIATION_REQUIRED'].includes(status.state))
                timer = setTimeout(refreshStatus, 5000);
        }
        catch {
            if (!disposed)
                fulfillmentError.value = 'Order status is unavailable. Keep your reference and contact support. Do not pay again.';
        }
    }
    async function completePaidOrder() {
        if (!activeOrder || disposed)
            return;
        orderId.value = activeOrder.id;
        orderComplete.value = true;
        fulfillmentError.value = 'Payment submitted. Waiting for backend verification.';
        await refreshStatus();
    }
    async function createEmbeddedCheckoutOrder() {
        if (lockKey !== selectionKey())
            throw new Error('Order details changed. Review the basket again.');
        if (authoritativeTotals.value.expiresAt <= Date.now())
            throw new Error('Your quote expired. Do not create another session until this order has been checked.');
        const order = await commerce.start(cartItems.value, recipient(), currency.value);
        activeOrder = order;
        orderId.value = order.id;
        return { publicId: order.token };
    }
    async function mountPaymentField() {
        if (revolutLoading.value || !addressComplete.value)
            return;
        revolutLoading.value = true;
        revolutError.value = '';
        try {
            destroy();
            await nextTick();
            const target = document.getElementById('revolut-checkout');
            if (!target)
                throw new Error('Payment container not found');
            if (DEMO) {
                const { mountMockPayment } = await import('../commerce/demo/payment.js');
                embedded = await mountMockPayment({ target, createOrder: createEmbeddedCheckoutOrder, onSuccess: completePaidOrder, baseUrl: apiBase });
            }
            else {
                const mode = String(import.meta.env.VITE_REVOLUT_MODE || '').toLowerCase(), publicToken = import.meta.env.VITE_REVOLUT_PUBLIC_KEY;
                if (!['sandbox', 'live'].includes(mode) || !publicToken)
                    throw new Error('Secure payment configuration is unavailable.');
                const { default: RevolutCheckout } = await import('@revolut/checkout');
                embedded = await RevolutCheckout.embeddedCheckout({ publicToken, mode: mode === 'live' ? 'prod' : 'sandbox', target, locale: 'en', email: customer.email,
                    createOrder: createEmbeddedCheckoutOrder, onSuccess: () => void completePaidOrder(),
                    onError: () => { revolutError.value = 'Payment could not be confirmed. Check this order before paying again.'; },
                    onCancel: () => { revolutError.value = 'Payment form closed. This does not confirm cancellation of the server payment.'; } });
            }
            if (disposed) {
                destroy();
                return;
            }
            paymentReady.value = true;
        }
        catch (error) {
            revolutError.value = error instanceof Error ? error.message : 'Unable to load payment form. Keep your order reference; do not start a second payment.';
        }
        finally {
            revolutLoading.value = false;
        }
    }
    async function saveAddress() {
        if (quoting.value || paymentStarted.value)
            return;
        addressError.value = '';
        quoting.value = true;
        const ownGeneration = ++generation;
        try {
            if (!checkoutEnabled.value)
                throw new Error('Checkout is temporarily unavailable while secure release checks are completed.');
            if (!cartItems.value.length)
                throw new Error('Your basket is empty');
            for (const key of ['fullName', 'email', 'address', 'city', 'postcode', 'country'])
                if (!customer[key].trim())
                    throw new Error('Complete all required delivery details.');
            if (!destinations.value.includes(customer.country))
                throw new Error('This delivery destination is not enabled for secure checkout.');
            const key = selectionKey(), quote = await commerce.quote(cartItems.value, recipient(), currency.value);
            if (disposed || generation !== ownGeneration || key !== selectionKey())
                throw new Error('Order details changed. Review your basket again.');
            authoritativeTotals.value = quote;
            cartItems.value = cartItems.value.map(item => { const line = quote.items.find(l => l.variantId === item.variantId); return line ? { ...item, name: line.name, price: line.unitMinor / 100 } : item; });
            addressComplete.value = true;
            activeStep.value = 'payment';
            lockKey = selectionKey();
            // Lock selection before creating any payment session. No repricing after token creation.
            paymentStarted.value = true;
            await mountPaymentField();
        }
        catch (error) {
            addressComplete.value = false;
            addressError.value = error instanceof Error ? error.message : 'Unable to quote your order securely.';
        }
        finally {
            quoting.value = false;
        }
    }
    function resetCheckout() {
        if (paymentStarted.value && !canStartNewOrder.value)
            return;
        clearTimeout(timer);
        destroy();
        commerce.reset();
        generation++;
        activeOrder = null;
        authoritativeTotals.value = null;
        paymentStarted.value = false;
        orderComplete.value = false;
        addressComplete.value = false;
        orderId.value = '';
        addressError.value = '';
        revolutError.value = '';
        fulfillmentError.value = '';
        activeStep.value = 'address';
        loadCart();
    }
    async function lookupOrderStatus() {
        statusLookupBusy.value = true;
        statusLookupMessage.value = '';
        try {
            const status = await commerce.status(statusReference.value.trim());
            statusLookupMessage.value = statusMessage(status.state);
        }
        catch {
            statusLookupMessage.value = 'This order could not be accessed. Sign in to the account that placed it, or use the original guest checkout tab. A reference alone does not grant access.';
        }
        finally {
            statusLookupBusy.value = false;
        }
    }
    async function loadConfiguration() { try {
        const res = await fetch(`${apiBase}/commerce/orders/config`, { cache: 'no-store' });
        if (!res.ok)
            throw Error();
        const config = await res.json();
        checkoutEnabled.value = config.checkoutEnabled === true;
        destinations.value = Array.isArray(config.destinations) ? config.destinations.filter(c => typeof c === 'string' && /^[A-Z]{2}$/.test(c)) : [];
    }
    catch {
        configurationError.value = 'Checkout is temporarily unavailable. Your basket has been preserved.';
    } }
    watch(selectionKey, () => { if (!paymentStarted.value) {
        authoritativeTotals.value = null;
        addressComplete.value = false;
    } });
    loadCart();
    void loadConfiguration();
    window.addEventListener('storage', loadCart);
    window.addEventListener('cart-updated', loadCart);
    onBeforeUnmount(() => { disposed = true; generation++; clearTimeout(timer); destroy(); window.removeEventListener('storage', loadCart); window.removeEventListener('cart-updated', loadCart); });
    return { activeStep, orderComplete, orderId, addressComplete, addressError, revolutLoading, revolutError, fulfillmentError, paymentReady, originalShipping, taxTotal, hasAuthoritativeQuote, currency, currencyCodes, cartItems, customer, cartCount, subtotal, total, saveAddress, resetCheckout, removeCartItem, formatMoney, quoting, checkoutEnabled, destinations, configurationError, paymentStarted, statusReference, statusLookupMessage, statusLookupBusy, lookupOrderStatus, canStartNewOrder };
}
