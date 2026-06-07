import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../lib/api';
import { Coins, Clock, Compass, Check } from '../components/Icons';
import { moneyFull, money, fmtDate, daysLeft, progress } from '../lib/format';

export default function Portfolio() {
  const [investments, setInvestments] = useState([]);
  const [connections, setConnections] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([api.get('/investments/mine'), api.get('/connections/mine')])
      .then(([a, b]) => { setInvestments(a.data.investments); setConnections(b.data.connections); })
      .finally(() => setLoading(false));
  }, []);

  const total = investments.reduce((s, i) => s + i.amount, 0);
  const expectedTotal = investments.reduce((s, i) => s + (i.expectedReturn || i.amount), 0);
  const receivedTotal = investments.reduce((s, i) => s + (i.totalReturned || 0), 0);

  if (loading) return <div className="min-h-[60vh] grid place-items-center text-slate-400">Loading portfolio…</div>;

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <h1 className="font-display text-4xl font-bold text-white mb-1">Your portfolio</h1>
      <p className="text-slate-400 mb-8">Everything you've backed, your expected returns, and your connections.</p>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
        <Stat icon={Coins} label="Total invested" value={moneyFull(total)} />
        <Stat icon={Coins} label="Expected return" value={moneyFull(expectedTotal)} accent="emerald" />
        <Stat icon={Check} label="Returns received" value={moneyFull(receivedTotal)} accent="emerald" />
        <Stat icon={Compass} label="Ideas backed" value={investments.length} />
      </div>

      <h2 className="font-display text-2xl font-bold text-white mb-4">Investments & returns</h2>
      {investments.length === 0 ? (
        <div className="card p-10 text-center text-slate-400">
          You haven't invested yet. <Link to="/app/explore" className="text-brand-400 hover:underline">Explore ideas →</Link>
        </div>
      ) : (
        <div className="space-y-4 mb-12">
          {investments.map((inv) => {
            const expected = inv.expectedReturn || inv.amount;
            const received = inv.totalReturned || 0;
            const pct = progress(received, expected);
            const matured = inv.returnStatus === 'matured';
            return (
              <div key={inv._id} className="card p-5">
                <div className="flex gap-4">
                  <Link to={`/app/idea/${inv.idea?._id}`}
                    className="w-16 h-16 rounded-xl bg-cover bg-center shrink-0"
                    style={{ backgroundImage: `url(${inv.idea?.coverImage || 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=300'})` }} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <Link to={`/app/idea/${inv.idea?._id}`} className="font-semibold text-white line-clamp-1 hover:text-brand-400">{inv.idea?.title}</Link>
                      <span className={`chip text-xs ${matured ? 'bg-emerald-500/15 text-emerald-300' : 'bg-brand/15 text-brand-400'}`}>
                        {matured ? 'Matured' : 'Active'}
                      </span>
                    </div>
                    <div className="text-xs text-slate-400">by {inv.creator?.name}</div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-3 text-sm">
                      <Mini label="Invested" value={moneyFull(inv.amount)} />
                      <Mini label={`Expected (${inv.roiPercent || 0}%)`} value={moneyFull(expected)} accent />
                      <Mini label="Received" value={moneyFull(received)} accent />
                      <Mini label={matured ? 'Status' : 'Matures'} value={matured ? 'Complete' : fmtDate(inv.maturityDate)} />
                    </div>

                    {/* returns progress */}
                    <div className="mt-3">
                      <div className="flex justify-between text-xs text-slate-400 mb-1">
                        <span>Returns paid out</span>
                        <span>{pct}% · {matured ? 'matured' : `${daysLeft(inv.maturityDate)} days left`}</span>
                      </div>
                      <div className="h-2 rounded-full bg-white/10 overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-full" style={{ width: `${pct}%` }} />
                      </div>
                    </div>

                    {inv.payouts?.length > 0 && (
                      <details className="mt-3">
                        <summary className="text-xs text-brand-400 cursor-pointer">{inv.payouts.length} payout(s) received</summary>
                        <div className="mt-2 space-y-1">
                          {inv.payouts.map((p, i) => (
                            <div key={i} className="flex justify-between text-xs text-slate-400">
                              <span>{fmtDate(p.date)} {p.note && `· ${p.note}`}</span>
                              <span className="text-emerald-400">{moneyFull(p.amount)}</span>
                            </div>
                          ))}
                        </div>
                      </details>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {connections.length > 0 && (
        <>
          <h2 className="font-display text-2xl font-bold text-white mb-4">Connections</h2>
          <div className="card divide-y divide-white/5">
            {connections.map((c) => (
              <div key={c._id} className="flex items-center gap-3 p-4">
                <div className="w-10 h-10 rounded-full bg-brand/20 text-brand-400 grid place-items-center font-bold">{c.creator?.name?.[0]}</div>
                <div className="flex-1">
                  <div className="text-white font-medium">{c.creator?.name}</div>
                  <div className="text-xs text-slate-400">{c.idea?.title}</div>
                </div>
                <span className={`chip capitalize ${c.status === 'accepted' ? 'bg-emerald-500/15 text-emerald-300' : c.status === 'declined' ? 'bg-rose-500/15 text-rose-300' : 'bg-amber-500/15 text-amber-300'}`}>
                  {c.status}
                </span>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

const Stat = ({ icon: I, label, value, accent }) => (
  <div className="card p-5 flex items-center gap-4">
    <div className={`w-12 h-12 rounded-xl grid place-items-center ${accent === 'emerald' ? 'bg-emerald-500/15 text-emerald-400' : 'bg-brand/15 text-brand-400'}`}><I size={22} /></div>
    <div><div className="text-2xl font-bold text-white">{value}</div><div className="text-sm text-slate-400">{label}</div></div>
  </div>
);

const Mini = ({ label, value, accent }) => (
  <div>
    <div className="text-[11px] text-slate-500">{label}</div>
    <div className={`font-semibold ${accent ? 'text-emerald-400' : 'text-white'}`}>{value}</div>
  </div>
);
