import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../lib/api';
import { useAuth } from '../context/AuthContext';
import { Lock, Eye, Coins, Compass, Sparkle } from '../components/Icons';
import { money, progress, categoryColor } from '../lib/format';

const categories = ['all', 'creative', 'innovation', 'charity', 'startup', 'other'];

export default function Explore() {
  const { user } = useAuth();
  const [ideas, setIdeas] = useState([]);
  const [cat, setCat] = useState('all');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/ideas', { params: { category: cat, search } });
      setIdeas(data.ideas);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to load');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); /* eslint-disable-next-line */ }, [cat]);

  const subscribed = user?.subscription?.isActive;

  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      <div className="flex items-end justify-between flex-wrap gap-4 mb-2">
        <div>
          <h1 className="font-display text-4xl font-bold text-white flex items-center gap-3">
            <Compass className="text-brand-400" /> Explore ideas
          </h1>
          <p className="text-slate-400 mt-1">Discover creators, innovators and causes worth backing.</p>
        </div>
        {!subscribed && (
          <Link to="/app/pricing" className="btn-outline"><Lock size={16} /> Unlock full ideas</Link>
        )}
      </div>

      {!subscribed && (
        <div className="card p-4 my-5 bg-brand/5 border-brand/20 flex items-center gap-3 text-sm">
          <Lock size={18} className="text-brand-400" />
          <span className="text-slate-300">You're seeing <b className="text-white">10% previews</b>. Subscribe to unlock full pitches, media & creator connect.</span>
          <Link to="/app/pricing" className="btn-primary text-sm py-1.5 ml-auto">See plans</Link>
        </div>
      )}

      {/* filters */}
      <div className="flex flex-wrap items-center gap-2 my-6">
        {categories.map((c) => (
          <button key={c} onClick={() => setCat(c)}
            className={`chip capitalize ${cat === c ? 'bg-brand text-white' : 'bg-white/5 text-slate-300 hover:bg-white/10'}`}>
            {c}
          </button>
        ))}
        <form onSubmit={(e) => { e.preventDefault(); load(); }} className="ml-auto">
          <input className="input py-2 w-56" placeholder="Search ideas…" value={search}
            onChange={(e) => setSearch(e.target.value)} />
        </form>
      </div>

      {loading ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {Array.from({ length: 6 }).map((_, i) => <div key={i} className="card h-80 animate-pulse" />)}
        </div>
      ) : ideas.length === 0 ? (
        <div className="card p-12 text-center text-slate-400">No ideas found in this category.</div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {ideas.map((idea) => <IdeaCard key={idea._id} idea={idea} subscribed={subscribed} />)}
        </div>
      )}
    </div>
  );
}

function IdeaCard({ idea, subscribed }) {
  const pct = progress(idea.amountRaised, idea.fundingGoal);
  return (
    <Link to={`/app/idea/${idea._id}`} className="card overflow-hidden group hover:border-brand/40 transition block">
      <div className="h-44 bg-cover bg-center relative"
        style={{ backgroundImage: `url(${idea.coverImage || 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800'})` }}>
        <span className={`absolute top-3 left-3 chip capitalize ${categoryColor(idea.category)}`}>{idea.category}</span>
        {!subscribed && (
          <span className="absolute top-3 right-3 chip bg-black/60 text-white"><Lock size={12} /> 10%</span>
        )}
      </div>
      <div className="p-5">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-6 h-6 rounded-full bg-brand/20 text-brand-400 grid place-items-center text-xs font-bold">
            {idea.creator?.name?.[0]}
          </div>
          <span className="text-xs text-slate-400">{idea.creator?.name}</span>
        </div>
        <h3 className="font-display font-semibold text-lg text-white line-clamp-1">{idea.title}</h3>
        <p className="text-sm text-slate-400 line-clamp-2 mb-4 min-h-[2.5rem]">{idea.tagline}</p>

        <div className="mb-2">
          <div className="flex justify-between text-xs text-slate-400 mb-1">
            <span className="text-emerald-400 font-medium">{money(idea.amountRaised)} raised</span>
            <span>{pct}% of {money(idea.fundingGoal)}</span>
          </div>
          <div className="h-2 rounded-full bg-white/10 overflow-hidden">
            <div className="h-full bg-gradient-to-r from-brand to-brand-400 rounded-full" style={{ width: `${pct}%` }} />
          </div>
        </div>

        <div className="flex items-center gap-3 text-xs text-slate-500 mt-3">
          <span className="flex items-center gap-1"><Coins size={13} /> Min {money(idea.minInvestment)}</span>
          <span className="flex items-center gap-1"><Eye size={13} /> {idea.views}</span>
          {idea.locked && <span className="ml-auto text-brand-400 flex items-center gap-1"><Lock size={12} /> {idea.lockedBlockCount} locked</span>}
        </div>
      </div>
    </Link>
  );
}
