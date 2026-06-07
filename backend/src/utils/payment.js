import crypto from 'crypto';
import Razorpay from 'razorpay';

const keyId = process.env.RAZORPAY_KEY_ID || '';
const keySecret = process.env.RAZORPAY_KEY_SECRET || '';

// "dummy" mode is active when no real test keys are configured (placeholder keys),
// or PAYMENT_MODE=dummy. In dummy mode we fabricate orders & always "succeed"
// verification so the full flow works without real Razorpay credentials.
export const isDummyMode = () =>
  process.env.PAYMENT_MODE === 'dummy' ||
  !keyId ||
  keyId.includes('dummy') ||
  !keySecret ||
  keySecret.includes('dummy');

let instance = null;
if (!isDummyMode()) {
  instance = new Razorpay({ key_id: keyId, key_secret: keySecret });
}

export const getPublicKey = () => keyId;

/**
 * Creates a Razorpay order (amount in INR rupees -> converted to paise).
 * Returns a normalized order object for the frontend checkout.
 */
export const createOrder = async (amountRupees, receipt) => {
  const amountPaise = Math.round(amountRupees * 100);

  if (isDummyMode()) {
    return {
      id: `order_dummy_${crypto.randomBytes(8).toString('hex')}`,
      amount: amountPaise,
      currency: 'INR',
      receipt,
      dummy: true,
    };
  }

  const order = await instance.orders.create({
    amount: amountPaise,
    currency: 'INR',
    receipt,
  });
  return { ...order, dummy: false };
};

/**
 * Verifies the Razorpay payment signature.
 * In dummy mode any payment is treated as valid.
 */
export const verifyPayment = ({ razorpay_order_id, razorpay_payment_id, razorpay_signature }) => {
  if (isDummyMode()) return true;

  const expected = crypto
    .createHmac('sha256', keySecret)
    .update(`${razorpay_order_id}|${razorpay_payment_id}`)
    .digest('hex');
  return expected === razorpay_signature;
};
