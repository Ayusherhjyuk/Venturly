import Investment from '../models/Investment.js';
import Idea from '../models/Idea.js';
import { createOrder, verifyPayment, isDummyMode, getPublicKey } from '../utils/payment.js';

// POST /api/investments/order  -> create a razorpay order for an investment
export const createInvestmentOrder = async (req, res) => {
  try {
    const { ideaId, amount, periodMonths, message, agreementAccepted } = req.body;
    const idea = await Idea.findById(ideaId);
    if (!idea) return res.status(404).json({ message: 'Idea not found' });

    if (!agreementAccepted)
      return res.status(400).json({ message: 'You must accept the investment agreement to proceed.' });

    const amt = Number(amount);
    if (!amt || amt < (idea.minInvestment || 1))
      return res.status(400).json({ message: `Minimum investment is ₹${idea.minInvestment}` });

    const order = await createOrder(amt, `inv_${ideaId.slice(-6)}_${Date.now()}`);

    const months = Number(periodMonths) || idea.fundingPeriodMonths || 12;
    const roi = idea.expectedRoi || 0;
    const expectedReturn = Math.round(amt * (1 + roi / 100));
    const maturityDate = new Date();
    maturityDate.setMonth(maturityDate.getMonth() + months);

    const agreementText =
      `The investor commits ₹${amt.toLocaleString('en-IN')} to "${idea.title}" for ${months} months at ${roi}% ROI. ` +
      `The expected return at maturity is ₹${expectedReturn.toLocaleString('en-IN')}. Funds are held by the platform and ` +
      `disbursed to the creator per agreed terms; returns are settled back to the investor via the platform. ` +
      `Investments carry risk; returns are not guaranteed.`;

    const investment = await Investment.create({
      investor: req.user._id,
      idea: idea._id,
      creator: idea.creator,
      amount: amt,
      periodMonths: months,
      message: message || '',
      status: 'pending',
      roiPercent: roi,
      expectedReturn,
      maturityDate,
      agreementAccepted: true,
      agreementAcceptedAt: new Date(),
      agreementTerms: { amount: amt, roiPercent: roi, periodMonths: months, expectedReturn, maturityDate, text: agreementText },
      razorpayOrderId: order.id,
    });

    res.json({
      order,
      investmentId: investment._id,
      key: getPublicKey(),
      dummy: isDummyMode(),
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// POST /api/investments/verify  -> confirm payment & mark paid
export const verifyInvestment = async (req, res) => {
  try {
    const { investmentId, razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
    const investment = await Investment.findById(investmentId);
    if (!investment) return res.status(404).json({ message: 'Investment not found' });

    const ok = verifyPayment({ razorpay_order_id, razorpay_payment_id, razorpay_signature });
    if (!ok) {
      investment.status = 'failed';
      await investment.save();
      return res.status(400).json({ message: 'Payment verification failed' });
    }

    investment.status = 'paid';
    investment.razorpayPaymentId = razorpay_payment_id || `pay_dummy_${Date.now()}`;
    await investment.save();

    // bump idea raised amount
    await Idea.findByIdAndUpdate(investment.idea, { $inc: { amountRaised: investment.amount } });

    res.json({ investment, message: 'Investment successful 🎉' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/investments/mine  (investor's portfolio)
export const myInvestments = async (req, res) => {
  try {
    const investments = await Investment.find({ investor: req.user._id, status: 'paid' })
      .populate('idea', 'title coverImage category')
      .populate('creator', 'name avatar')
      .sort({ createdAt: -1 });
    res.json({ investments });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/investments/received  (creator sees who invested in their ideas)
export const receivedInvestments = async (req, res) => {
  try {
    const investments = await Investment.find({ creator: req.user._id, status: 'paid' })
      .populate('idea', 'title coverImage')
      .populate('investor', 'name avatar headline')
      .sort({ createdAt: -1 });
    res.json({ investments });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// POST /api/investments/:id/payout  (creator disburses a return to an investor)
export const recordPayout = async (req, res) => {
  try {
    const { amount, note } = req.body;
    const amt = Number(amount);
    if (!amt || amt <= 0) return res.status(400).json({ message: 'Enter a valid payout amount' });

    const investment = await Investment.findById(req.params.id);
    if (!investment) return res.status(404).json({ message: 'Investment not found' });
    if (String(investment.creator) !== String(req.user._id))
      return res.status(403).json({ message: 'Not your investment' });
    if (investment.status !== 'paid')
      return res.status(400).json({ message: 'Investment is not active' });

    investment.payouts.push({ amount: amt, note: note || '' });
    investment.totalReturned = (investment.totalReturned || 0) + amt;

    // mark matured once the investor has been fully repaid their expected return
    if (investment.totalReturned >= investment.expectedReturn) {
      investment.returnStatus = 'matured';
    }
    await investment.save();
    res.json({ investment, message: `Return of ₹${amt.toLocaleString('en-IN')} recorded.` });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// PUT /api/investments/:id/mature  (creator marks the investment complete)
export const markMatured = async (req, res) => {
  try {
    const investment = await Investment.findById(req.params.id);
    if (!investment) return res.status(404).json({ message: 'Investment not found' });
    if (String(investment.creator) !== String(req.user._id))
      return res.status(403).json({ message: 'Not your investment' });
    investment.returnStatus = 'matured';
    await investment.save();
    res.json({ investment, message: 'Investment marked as matured.' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
