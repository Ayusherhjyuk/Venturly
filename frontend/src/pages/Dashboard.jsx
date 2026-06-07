import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../lib/api';
import { Plus, Eye, Coins, Trash, Sparkle, User, Shield, Clock, Check } from '../components/Icons';
import { money, progress } from '../lib/format';
import { useAuth } from '../context/AuthContext';

export default function Dashboard() {
  const [ideas, setIdeas] = useState([]);
  const [received, setReceived] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const load = async () => {
    try {
      const [a, b] = await Promise.all([
        api.get('/ideas/mine'),
        api.get('/investments/received'),
      ]);
      setIdeas(a.data.ideas);
      setReceived(b.data.investments);
    } catch (err) {
      toast.error('Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const remove = async (id) => {
    if (!confirm('Delete this page permanently?')) return;
    await api.delete(`/ideas/${id}`);
    setIdeas((x) => x.filter((i) => i._id !== id));
    toast.success('Deleted');
  };

  const totalRaised = ideas.reduce((s, i) => s + (i.amountRaised || 0), 0);

  if (loading) return <Center>Loading your dashboard…</Center>;

  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      <div className="flex items-end justify-between flex-wrap gap-4 mb-8">
        <div>
          <h1 className="font-display text-4xl font-bold text-white">Creator dashboard</h1>
          <p className="text-slate-400 mt-1">Manage your pages, media and funding.</p>
        </div>
        <Link to="/app/create" className="btn-primary"><Plus size={18} /> New page</Link>
      </div>

      {/* KYC verification banner */}
      {user?.role === 'creator' && !user?.isVerified && (
        <KycBanner status={user.verificationStatus} />
      )}

      {/* stat cards */}
      <div className="grid sm:grid-cols-3 gap-4 mb-10">
        <StatCard icon={Sparkle} label="Pages published" value={ideas.length} />
        <StatCard icon={Coins} label="Total raised" value={money(totalRaised)} />
        <StatCard icon={User} label="Backers" value={received.length} />
      </div>

      {ideas.length === 0 ? (
        <Empty />
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {ideas.map((idea) => (
            <div key={idea._id} className="card overflow-hidden group">
              <div className="h-40 bg-cover bg-center relative"
                style={{ backgroundImage: `url(${idea.coverImage || 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800'})` }}>
                <span className="absolute top-3 left-3 chip bg-black/50 text-white capitalize">{idea.category}</span>
              </div>
              <div className="p-5">
                <h3 className="font-display font-semibold text-lg text-white line-clamp-1">{idea.title}</h3>
                <p className="text-sm text-slate-400 line-clamp-1 mb-3">{idea.tagline}</p>

                <div className="mb-3">
                  <div className="flex justify-between text-xs text-slate-400 mb-1">
                    <span>{money(idea.amountRaised)} raised</span>
                    <span>{progress(idea.amountRaised, idea.fundingGoal)}%</span>
                  </div>
                  <div className="h-2 rounded-full bg-white/10 overflow-hidden">
                    <div className="h-full bg-brand rounded-full" style={{ width: `${progress(idea.amountRaised, idea.fundingGoal)}%` }} />
                  </div>
                </div>

                <div className="flex items-center gap-3 text-xs text-slate-400 mb-4">
                  <span className="flex items-center gap-1"><Eye size={14} /> {idea.views}</span>
                  <span className="flex items-center gap-1"><User size={14} /> {idea.investorCount} backers</span>
                  <span className="flex items-center gap-1"><Coins size={14} /> goal {money(idea.fundingGoal)}</span>
                </div>

                <div className="flex gap-2">
                  <Link to={`/app/edit/${idea._id}`} className="btn-ghost flex-1 text-sm py-2">Edit</Link>
                  <button onClick={() => remove(idea._id)} className="btn-ghost px-3 text-rose-400 hover:bg-rose-500/10"><Trash size={16} /></button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* recent backers */}
      {received.length > 0 && (
        <div className="mt-12">
          <h2 className="font-display text-2xl font-bold text-white mb-4">Recent backers</h2>
          <div className="card divide-y divide-white/5">
            {received.slice(0, 8).map((inv) => (
              <div key={inv._id} className="flex items-center gap-4 p-4">
                <div className="w-10 h-10 rounded-full bg-brand/20 text-brand-400 grid place-items-center font-bold">
                  {inv.investor?.name?.[0]}
                </div>
                <div className="flex-1">
                  <div className="text-white font-medium">{inv.investor?.name}</div>
                  <div className="text-xs text-slate-400">backed “{inv.idea?.title}” · {inv.periodMonths} months</div>
                </div>
                <div className="text-emerald-400 font-semibold">{money(inv.amount)}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

const StatCard = ({ icon: I, label, value }) => (
  <div className="card p-5 flex items-center gap-4">
    <div className="w-12 h-12 rounded-xl bg-brand/15 text-brand-400 grid place-items-center"><I size={22} /></div>
    <div>
      <div className="text-2xl font-bold text-white">{value}</div>
      <div className="text-sm text-slate-400">{label}</div>
    </div>
  </div>
);

const Empty = () => (
  <div className="card p-12 text-center">
    <div className="w-16 h-16 rounded-2xl bg-brand/15 text-brand-400 grid place-items-center mx-auto mb-4"><Sparkle size={28} /></div>
    <h3 className="font-display text-xl font-bold text-white">No pages yet</h3>
    <p className="text-slate-400 mt-1 mb-5">Create your first page to start raising funds for your work.</p>
    <Link to="/app/create" className="btn-primary"><Plus size={18} /> Create a page</Link>
  </div>
);

const Center = ({ children }) => <div className="min-h-[60vh] grid place-items-center text-slate-400">{children}</div>;

function KycBanner({ status }) {
  const pending = status === 'pending';
  return (
    <div className={`card p-5 mb-8 flex items-center gap-4 ${pending ? 'border-amber-500/30 bg-amber-500/5' : 'border-brand/30 bg-brand/5'}`}>
      <div className={`w-12 h-12 rounded-xl grid place-items-center shrink-0 ${pending ? 'bg-amber-500/15 text-amber-300' : 'bg-brand/15 text-brand-400'}`}>
        {pending ? <Clock size={22} /> : <Shield size={22} />}
      </div>
      <div className="flex-1">
        <div className="font-semibold text-white">
          {pending ? 'KYC submitted — pending admin review' : 'Verify your creator account (KYC)'}
        </div>
        <div className="text-sm text-slate-400">
          {pending
            ? 'Your pages stay hidden from investors until the admin approves your KYC.'
            : 'Your pages are not visible to investors until you complete KYC verification.'}
        </div>
      </div>
      {!pending && <Link to="/app/kyc" className="btn-primary text-sm py-2"><Shield size={15} /> Complete KYC</Link>}
      {pending && <Link to="/app/kyc" className="btn-ghost text-sm py-2">View status</Link>}
    </div>
  );
}
