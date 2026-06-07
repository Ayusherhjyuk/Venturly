import Subscription from '../models/Subscription.js';
import { createOrder, verifyPayment, isDummyMode, getPublicKey } from '../utils/payment.js';

export const PLANS = {
  monthly: { amount: 499, label: 'Monthly', months: 1 },
  yearly: { amount: 4999, label: 'Yearly', months: 12 },
};

// GET /api/subscriptions/plans
export const getPlans = (req, res) => {
  res.json({ plans: PLANS, dummy: isDummyMode() });
};

// POST /api/subscriptions/order
export const createSubscriptionOrder = async (req, res) => {
  try {
    const { plan } = req.body;
    if (!PLANS[plan]) return res.status(400).json({ message: 'Invalid plan' });

    const amount = PLANS[plan].amount;
    const order = await createOrder(amount, `sub_${plan}_${Date.now()}`);

    const sub = await Subscription.create({
      user: req.user._id,
      plan,
      amount,
      status: 'pending',
      razorpayOrderId: order.id,
    });

    res.json({ order, subscriptionId: sub._id, key: getPublicKey(), dummy: isDummyMode() });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// POST /api/subscriptions/verify
export const verifySubscription = async (req, res) => {
  try {
    const { subscriptionId, razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
    const sub = await Subscription.findById(subscriptionId);
    if (!sub) return res.status(404).json({ message: 'Subscription not found' });

    const ok = verifyPayment({ razorpay_order_id, razorpay_payment_id, razorpay_signature });
    if (!ok) {
      sub.status = 'failed';
      await sub.save();
      return res.status(400).json({ message: 'Payment verification failed' });
    }

    const now = new Date();
    const expires = new Date(now);
    expires.setMonth(expires.getMonth() + PLANS[sub.plan].months);

    sub.status = 'active';
    sub.razorpayPaymentId = razorpay_payment_id || `pay_dummy_${Date.now()}`;
    sub.activatedAt = now;
    sub.expiresAt = expires;
    await sub.save();

    // activate on the user
    req.user.subscription = {
      isActive: true,
      plan: sub.plan,
      activatedAt: now,
      expiresAt: expires,
    };
    await req.user.save();

    res.json({ user: req.user.toPublic(), message: 'Subscription active — full ideas unlocked! 🔓' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
