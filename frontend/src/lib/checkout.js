import api from './api';

/**
 * Runs a Razorpay checkout flow.
 * - createPath: backend endpoint that creates the order
 * - verifyPath: backend endpoint that verifies payment
 * - body: payload for createPath
 * In dummy mode (no real keys) we skip the widget and confirm instantly,
 * so the whole flow works end-to-end without real credentials.
 */
export async function runCheckout({ createPath, verifyPath, body, idField, name, description }) {
  const { data } = await api.post(createPath, body);
  const { order, key, dummy } = data;
  const refId = data[idField];

  // DUMMY MODE: fabricate a successful payment & verify immediately.
  if (dummy || !key || key.includes('dummy')) {
    const verify = await api.post(verifyPath, {
      [idField]: refId,
      razorpay_order_id: order.id,
      razorpay_payment_id: `pay_dummy_${Date.now()}`,
      razorpay_signature: 'dummy_signature',
    });
    return verify.data;
  }

  // REAL MODE: open Razorpay checkout widget.
  return new Promise((resolve, reject) => {
    if (!window.Razorpay) return reject(new Error('Razorpay SDK not loaded'));
    const rzp = new window.Razorpay({
      key,
      amount: order.amount,
      currency: order.currency,
      name: name || 'Venturly',
      description,
      order_id: order.id,
      theme: { color: '#7c5cff' },
      handler: async (resp) => {
        try {
          const verify = await api.post(verifyPath, { [idField]: refId, ...resp });
          resolve(verify.data);
        } catch (e) {
          reject(e);
        }
      },
      modal: { ondismiss: () => reject(new Error('Payment cancelled')) },
    });
    rzp.open();
  });
}
