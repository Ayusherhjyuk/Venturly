import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import api from '../lib/api';
import { Heart, Check, Coins } from '../components/Icons';
import { moneyFull, fmtDate, progress } from '../lib/format';

export default function Inbox() {
  const [connections, setConnections] = useState([]);
  const [investments, setInvestments] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try {
      const [c, i] = await Promise.all([
        api.get('/connections/received'),
        api.get('/investments/received'),
      ]);
      setConnections(c.data.connections);
      setInvestments(i.data.investments);
    } catch {
      toast.error('Failed to load requests');
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => { load(); }, []);

  const respond = async (id, status) => {
    try {
      const { data } = await api.put(`/connections/${id}`, { status });
      setConnections((list) => list.map((c) => (c._id === id ? { ...c, status: data.connection.status } : c)));
      toast.success(status === 'accepted' ? 'Request accepted 🤝' : 'Request declined');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed');
    }
  };

  if (loading) return <div className="min-h-[60vh] grid place-items-center text-slate-400">Loading requests…</div>;

  const pending = connections.filter((c) => c.status === 'pending');
  const handled = connections.filter((c) => c.status !== 'pending');

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <h1 className="font-display text-4xl font-bold text-white mb-1">Requests</h1>
      <p className="text-slate-400 mb-8">Investors reaching out to connect with you and back your work.</p>

      {/* Connection requests */}
      <section className="mb-12">
        <h2 className="font-display text-2xl font-bold text-white mb-4 flex items-center gap-2">
          <Heart className="text-brand-400" size={22} /> Connection requests
          {pending.length > 0 && <span className="chip bg-brand text-white text-xs">{pending.length} new</span>}
        </h2>

        {connections.length === 0 ? (
          <div className="card p-10 text-center text-slate-400">No connection requests yet.</div>
        ) : (
          <div className="space-y-3">
            {pending.map((c) => (
              <div key={c._id} className="card p-5 flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-brand/20 text-brand-400 grid place-items-center font-bold text-lg">
                  {c.investor?.name?.[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-white">{c.investor?.name}</div>
                  <div className="text-xs text-slate-400 mb-1">{c.investor?.headline}</div>
                  {c.idea?.title && <div className="text-sm text-slate-300">Interested in “{c.idea.title}”</div>}
                  {c.message && <p className="text-sm text-slate-400 italic mt-1">“{c.message}”</p>}
                </div>
                <div className="flex flex-col sm:flex-row gap-2 shrink-0">
                  <button className="btn-primary text-sm py-2" onClick={() => respond(c._id, 'accepted')}>
                    <Check size={15} /> Accept
                  </button>
                  <button className="btn-ghost text-sm py-2 text-rose-400 hover:bg-rose-500/10" onClick={() => respond(c._id, 'declined')}>
                    Decline
                  </button>
                </div>
              </div>
            ))}

            {handled.map((c) => (
              <div key={c._id} className="card p-5 flex items-center gap-4 opacity-70">
                <div className="w-12 h-12 rounded-full bg-white/10 text-slate-300 grid place-items-center font-bold text-lg">
                  {c.investor?.name?.[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-white">{c.investor?.name}</div>
                  {c.idea?.title && <div className="text-xs text-slate-400">“{c.idea.title}”</div>}
                </div>
                <span className={`chip capitalize ${c.status === 'accepted' ? 'bg-emerald-500/15 text-emerald-300' : 'bg-rose-500/15 text-rose-300'}`}>
                  {c.status}
                </span>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Investments received + record returns */}
      <section>
        <h2 className="font-display text-2xl font-bold text-white mb-4 flex items-center gap-2">
          <Coins className="text-emerald-400" size={22} /> Investments & returns to pay
        </h2>
        <p className="text-sm text-slate-400 mb-4">
          Each backer expects their principal + ROI back by maturity. Record the returns you disburse so they're tracked.
        </p>
        {investments.length === 0 ? (
          <div className="card p-10 text-center text-slate-400">No investments yet.</div>
        ) : (
          <div className="space-y-3">
            {investments.map((inv) => (
              <InvestmentRow key={inv._id} inv={inv}
                onPaid={(updated) => setInvestments((list) => list.map((x) => (x._id === updated._id ? { ...x, ...updated } : x)))} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function InvestmentRow({ inv, onPaid }) {
  const [open, setOpen] = useState(false);
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [busy, setBusy] = useState(false);

  const expected = inv.expectedReturn || inv.amount;
  const received = inv.totalReturned || 0;
  const pct = progress(received, expected);
  const matured = inv.returnStatus === 'matured';

  const pay = async () => {
    const amt = Number(amount);
    if (!amt || amt <= 0) return toast.error('Enter a valid amount');
    setBusy(true);
    try {
      const { data } = await api.post(`/investments/${inv._id}/payout`, { amount: amt, note });
      toast.success(data.message);
      onPaid(data.investment);
      setOpen(false); setAmount(''); setNote('');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="card p-5">
      <div className="flex items-start gap-4">
        <div className="w-10 h-10 rounded-full bg-emerald-500/15 text-emerald-300 grid place-items-center font-bold shrink-0">
          {inv.investor?.name?.[0]}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-white font-medium">{inv.investor?.name}</span>
            <span className={`chip text-xs ${matured ? 'bg-emerald-500/15 text-emerald-300' : 'bg-brand/15 text-brand-400'}`}>
              {matured ? 'Matured' : 'Active'}
            </span>
          </div>
          <div className="text-xs text-slate-400">backed “{inv.idea?.title}” · {inv.periodMonths} mo · matures {fmtDate(inv.maturityDate)}</div>

          <div className="grid grid-cols-3 gap-3 mt-3 text-sm">
            <div><div className="text-[11px] text-slate-500">Invested</div><div className="font-semibold text-white">{moneyFull(inv.amount)}</div></div>
            <div><div className="text-[11px] text-slate-500">You owe ({inv.roiPercent || 0}%)</div><div className="font-semibold text-emerald-400">{moneyFull(expected)}</div></div>
            <div><div className="text-[11px] text-slate-500">Paid so far</div><div className="font-semibold text-white">{moneyFull(received)}</div></div>
          </div>

          <div className="mt-3">
            <div className="h-2 rounded-full bg-white/10 overflow-hidden">
              <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${pct}%` }} />
            </div>
          </div>

          {!matured && (
            <div className="mt-3">
              {open ? (
                <div className="flex flex-wrap gap-2 items-center">
                  <input type="number" className="input py-2 w-32" placeholder="Amount ₹" value={amount} onChange={(e) => setAmount(e.target.value)} />
                  <input className="input py-2 flex-1 min-w-[140px]" placeholder="Note (e.g. Q1 return)" value={note} onChange={(e) => setNote(e.target.value)} />
                  <button className="btn-primary text-sm py-2" onClick={pay} disabled={busy}>{busy ? 'Saving…' : 'Record'}</button>
                  <button className="btn-ghost text-sm py-2" onClick={() => setOpen(false)}>Cancel</button>
                </div>
              ) : (
                <button className="btn-outline text-sm py-1.5" onClick={() => setOpen(true)}><Coins size={14} /> Record a return</button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
