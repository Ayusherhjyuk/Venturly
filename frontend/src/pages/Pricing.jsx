import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../lib/api';
import { runCheckout } from '../lib/checkout';
import { useAuth } from '../context/AuthContext';
import { Check, Lock, Sparkle } from '../components/Icons';
import { moneyFull } from '../lib/format';

const perks = [
  'Unlock 100% of every idea',
  'Full media galleries & pitch decks',
  'Direct connect with creators',
  'Invest for any amount & period',
  'Priority access to new ideas',
];

export default function Pricing() {
  const { user, patchUser } = useAuth();
  const navigate = useNavigate();
  const [plans, setPlans] = useState(null);
  const [busy, setBusy] = useState('');

  useEffect(() => {
    api.get('/subscriptions/plans').then(({ data }) => setPlans(data.plans));
  }, []);

  if (user?.subscription?.isActive) {
    return (
      <div className="min-h-[70vh] grid place-items-center px-4 text-center">
        <div className="max-w-md">
          <div className="w-16 h-16 rounded-2xl bg-emerald-500/15 text-emerald-400 grid place-items-center mx-auto mb-5"><Check size={30} /></div>
          <h1 className="font-display text-3xl font-bold text-white">You're subscribed 🔓</h1>
          <p className="text-slate-400 mt-2 mb-6">All ideas are fully unlocked. Happy investing!</p>
          <button className="btn-primary" onClick={() => navigate('/app/explore')}>Browse ideas</button>
        </div>
      </div>
    );
  }

  const subscribe = async (planKey) => {
    setBusy(planKey);
    try {
      const res = await runCheckout({
        createPath: '/subscriptions/order',
        verifyPath: '/subscriptions/verify',
        idField: 'subscriptionId',
        name: 'Venturly Subscription',
        description: `${planKey} plan`,
        body: { plan: planKey },
      });
      if (res.user) patchUser(res.user);
      toast.success(res.message || 'Subscription active 🔓');
      navigate('/app/explore');
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || 'Payment failed');
    } finally {
      setBusy('');
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-14">
      <div className="text-center mb-12">
        <div className="chip bg-brand/10 text-brand-400 border border-brand/20 mb-4 inline-flex"><Sparkle size={14} /> Investor membership</div>
        <h1 className="font-display text-4xl md:text-5xl font-bold text-white">Unlock the full picture</h1>
        <p className="text-slate-400 mt-3 max-w-xl mx-auto">
          You're currently seeing 10% previews. Subscribe to unlock every idea in full and connect with creators.
        </p>
      </div>

      {!plans ? (
        <div className="grid md:grid-cols-2 gap-6">{[1, 2].map((i) => <div key={i} className="card h-96 animate-pulse" />)}</div>
      ) : (
        <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto">
          <PlanCard k="monthly" plan={plans.monthly} busy={busy} onPick={subscribe} />
          <PlanCard k="yearly" plan={plans.yearly} featured busy={busy} onPick={subscribe}
            note="Save 17% vs monthly" />
        </div>
      )}

      <p className="text-center text-xs text-slate-500 mt-8">
        Payments processed by Razorpay in test/dummy mode — no real charge is made.
      </p>
    </div>
  );
}

function PlanCard({ k, plan, featured, note, busy, onPick }) {
  return (
    <div className={`card p-7 relative ${featured ? 'border-brand shadow-glow' : ''}`}>
      {featured && <span className="absolute -top-3 left-1/2 -translate-x-1/2 chip bg-brand text-white">Most popular</span>}
      <h3 className="font-display text-xl font-bold text-white">{plan.label}</h3>
      <div className="mt-3 mb-1 flex items-baseline gap-1">
        <span className="text-4xl font-extrabold text-white">{moneyFull(plan.amount)}</span>
        <span className="text-slate-400">/{k === 'monthly' ? 'mo' : 'yr'}</span>
      </div>
      {note && <p className="text-sm text-emerald-400 mb-4">{note}</p>}
      <ul className="space-y-3 my-6">
        {perks.map((p) => (
          <li key={p} className="flex items-center gap-2.5 text-sm text-slate-300">
            <span className="w-5 h-5 rounded-full bg-brand/20 text-brand-400 grid place-items-center"><Check size={13} /></span>{p}
          </li>
        ))}
      </ul>
      <button className={`w-full ${featured ? 'btn-primary' : 'btn-ghost'}`} disabled={busy === k} onClick={() => onPick(k)}>
        {busy === k ? 'Processing…' : <><Lock size={16} /> Subscribe {plan.label.toLowerCase()}</>}
      </button>
    </div>
  );
}
