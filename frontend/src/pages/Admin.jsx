import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import api from '../lib/api';
import { Shield, Check, Coins, Sparkle, User, Eye } from '../components/Icons';
import { money } from '../lib/format';

export default function Admin() {
  const [investors, setInvestors] = useState([]);
  const [creators, setCreators] = useState([]);
  const [stats, setStats] = useState(null);
  const [tab, setTab] = useState('investors');
  const [loading, setLoading] = useState(true);

  const load = async () => {
    const [a, c, b] = await Promise.all([
      api.get('/admin/investors'),
      api.get('/admin/creators'),
      api.get('/admin/stats'),
    ]);
    setInvestors(a.data.investors);
    setCreators(c.data.creators);
    setStats(b.data.stats);
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const toggle = async (id, isVerified) => {
    try {
      const { data } = await api.put(`/admin/investors/${id}/verify`, { isVerified });
      const upd = (list) => list.map((u) => (u._id === id ? data.user : u));
      setInvestors(upd); setCreators(upd);
      toast.success(data.message);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed');
    }
  };

  if (loading) return <div className="min-h-[60vh] grid place-items-center text-slate-400">Loading admin…</div>;

  const rows = tab === 'investors' ? investors : creators;

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <h1 className="font-display text-4xl font-bold text-white flex items-center gap-3 mb-1">
        <Shield className="text-brand-400" /> Admin console
      </h1>
      <p className="text-slate-400 mb-8">Verify investors & creators and monitor the platform.</p>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-10">
        <Stat icon={Sparkle} label="Creators" value={stats.creators} />
        <Stat icon={User} label="Investors" value={stats.investors} />
        <Stat icon={Eye} label="Pending KYC" value={stats.pendingVerifications} highlight />
        <Stat icon={Sparkle} label="Ideas" value={stats.ideas} />
        <Stat icon={Coins} label="Invested" value={money(stats.totalInvested)} />
      </div>

      {/* tabs */}
      <div className="flex items-center gap-2 mb-4">
        <button onClick={() => setTab('investors')}
          className={`chip ${tab === 'investors' ? 'bg-brand text-white' : 'bg-white/5 text-slate-300 hover:bg-white/10'}`}>
          <User size={14} /> Investors
          {stats.pendingInvestors > 0 && <span className="ml-1 px-1.5 rounded-full bg-amber-500/30 text-amber-200 text-[10px]">{stats.pendingInvestors}</span>}
        </button>
        <button onClick={() => setTab('creators')}
          className={`chip ${tab === 'creators' ? 'bg-brand text-white' : 'bg-white/5 text-slate-300 hover:bg-white/10'}`}>
          <Sparkle size={14} /> Creators
          {stats.pendingCreators > 0 && <span className="ml-1 px-1.5 rounded-full bg-amber-500/30 text-amber-200 text-[10px]">{stats.pendingCreators}</span>}
        </button>
      </div>

      <p className="text-sm text-slate-400 mb-4">
        {tab === 'investors'
          ? <>Verify an <b className="text-white">investor</b> to let them browse ideas and invest.</>
          : <>Verify a <b className="text-white">creator's KYC</b> to make their pages visible to investors.</>}
      </p>

      <div className="card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-white/5 text-slate-400">
            <tr>
              <th className="text-left font-medium px-5 py-3 capitalize">{tab.slice(0, -1)}</th>
              <th className="text-left font-medium px-5 py-3 hidden md:table-cell">Document</th>
              <th className="text-left font-medium px-5 py-3">Status</th>
              <th className="text-right font-medium px-5 py-3">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {rows.map((u) => (
              <tr key={u._id} className="hover:bg-white/[0.02]">
                <td className="px-5 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-brand/20 text-brand-400 grid place-items-center font-bold">{u.name?.[0]}</div>
                    <div>
                      <div className="text-white font-medium">{u.name}</div>
                      <div className="text-xs text-slate-400">{u.email}</div>
                    </div>
                  </div>
                </td>
                <td className="px-5 py-4 hidden md:table-cell">
                  {u.verificationDocument ? (
                    <a href={u.verificationDocument} target="_blank" rel="noreferrer" className="text-brand-400 hover:underline">View doc ↗</a>
                  ) : <span className="text-slate-500">Not uploaded</span>}
                </td>
                <td className="px-5 py-4">
                  <StatusBadge status={u.verificationStatus} verified={u.isVerified} />
                </td>
                <td className="px-5 py-4 text-right">
                  {u.isVerified ? (
                    <button className="btn-ghost text-xs py-1.5 text-rose-400 hover:bg-rose-500/10" onClick={() => toggle(u._id, false)}>
                      Revoke
                    </button>
                  ) : (
                    <button className="btn-primary text-xs py-1.5" onClick={() => toggle(u._id, true)}>
                      <Check size={14} /> Verify
                    </button>
                  )}
                </td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr><td colSpan={4} className="px-5 py-10 text-center text-slate-400">No {tab} yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

const Stat = ({ icon: I, label, value, highlight }) => (
  <div className={`card p-4 ${highlight && value > 0 ? 'border-amber-500/40 bg-amber-500/5' : ''}`}>
    <div className="flex items-center gap-1.5 text-slate-400 text-xs mb-1"><I size={14} /> {label}</div>
    <div className="text-2xl font-bold text-white">{value}</div>
  </div>
);

const StatusBadge = ({ status, verified }) => {
  if (verified) return <span className="chip bg-emerald-500/15 text-emerald-300"><Check size={12} /> Verified</span>;
  const map = {
    pending: 'bg-amber-500/15 text-amber-300',
    rejected: 'bg-rose-500/15 text-rose-300',
    none: 'bg-slate-500/15 text-slate-400',
  };
  return <span className={`chip capitalize ${map[status] || map.none}`}>{status === 'none' ? 'No doc' : status}</span>;
};
