import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../lib/api';
import { runCheckout } from '../lib/checkout';
import { useAuth } from '../context/AuthContext';
import { Lock, Coins, Clock, Heart, Link as LinkIcon, Eye, Check } from '../components/Icons';
import { money, moneyFull, progress, categoryColor } from '../lib/format';

export default function IdeaDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [idea, setIdea] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showInvest, setShowInvest] = useState(false);
  const [connection, setConnection] = useState(null); // existing connection with this creator

  const load = async () => {
    try {
      const { data } = await api.get(`/ideas/${id}`);
      setIdea(data.idea);
      // for investors, check if they've already connected with this creator
      if (user?.role === 'investor' && data.idea?.creator?._id) {
        const { data: c } = await api.get('/connections/mine');
        setConnection(c.connections.find((x) => (x.creator?._id || x.creator) === data.idea.creator._id) || null);
      }
    } catch {
      toast.error('Not found');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); /* eslint-disable-next-line */ }, [id]);

  if (loading) return <div className="min-h-[60vh] grid place-items-center text-slate-400">Loading idea…</div>;
  if (!idea) return <div className="min-h-[60vh] grid place-items-center text-slate-400">Idea not found.</div>;

  const pct = progress(idea.amountRaised, idea.fundingGoal);
  const locked = idea.locked;

  const connect = async () => {
    try {
      const { data } = await api.post('/connections', { ideaId: idea._id, creatorId: idea.creator?._id, message: `I'm interested in ${idea.title}` });
      setConnection(data.connection);
      toast.success('Connection request sent to the creator!');
    } catch (err) {
      // already connected -> reflect existing state
      if (err.response?.data?.connection) setConnection(err.response.data.connection);
      toast(err.response?.data?.message || 'Failed', { icon: 'ℹ️' });
    }
  };

  return (
    <div className="min-h-screen" style={idea.backgroundImage ? {
      backgroundImage: `linear-gradient(rgba(11,11,20,0.92),rgba(11,11,20,0.97)), url(${idea.backgroundImage})`,
      backgroundSize: 'cover', backgroundAttachment: 'fixed',
    } : {}}>
      {/* Hero */}
      <div className="h-72 md:h-96 bg-cover bg-center relative"
        style={{ backgroundImage: `url(${idea.coverImage || 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=1600'})` }}>
        <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/40 to-transparent" />
        <div className="absolute bottom-0 inset-x-0 max-w-6xl mx-auto px-4 pb-8">
          <span className={`chip capitalize ${categoryColor(idea.category)} mb-3`}>{idea.category}</span>
          <h1 className="font-display text-3xl md:text-5xl font-extrabold text-white max-w-3xl">{idea.title}</h1>
          <p className="text-slate-300 mt-2 text-lg max-w-2xl">{idea.tagline}</p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-10 grid lg:grid-cols-[1fr_340px] gap-8">
        {/* Content */}
        <div>
          {/* creator */}
          <div className="flex items-center gap-3 mb-8 pb-6 border-b border-white/10">
            <div className="w-12 h-12 rounded-full bg-brand/20 text-brand-400 grid place-items-center font-bold text-lg">
              {idea.creator?.name?.[0]}
            </div>
            <div>
              <div className="font-semibold text-white">{idea.creator?.name}</div>
              <div className="text-sm text-slate-400">{idea.creator?.headline}</div>
            </div>
            <span className="ml-auto text-sm text-slate-500 flex items-center gap-1"><Eye size={15} /> {idea.views} views</span>
          </div>

          {/* blocks */}
          <div className="space-y-6">
            {idea.blocks?.map((b, i) => <Block key={i} block={b} />)}
          </div>

          {/* lock overlay */}
          {locked && (
            <div className="mt-8 card p-8 text-center bg-gradient-to-b from-transparent to-brand/10 border-brand/30 relative">
              <div className="w-14 h-14 rounded-2xl bg-brand/20 text-brand-400 grid place-items-center mx-auto mb-4"><Lock size={26} /></div>
              <h3 className="font-display text-2xl font-bold text-white">{idea.lockedBlockCount} more sections locked</h3>
              <p className="text-slate-400 mt-2 mb-6 max-w-md mx-auto">
                You're viewing a 10% preview. Subscribe to unlock the full pitch, all media and creator connect.
              </p>
              <button className="btn-primary" onClick={() => navigate('/app/pricing')}><Lock size={18} /> Unlock full idea</button>
            </div>
          )}
        </div>

        {/* Sidebar: funding */}
        <aside className="lg:sticky lg:top-20 h-fit space-y-4">
          <div className="card p-6">
            <div className="flex items-baseline justify-between mb-1">
              <span className="text-2xl font-bold text-emerald-400">{moneyFull(idea.amountRaised)}</span>
              <span className="text-sm text-slate-400">of {money(idea.fundingGoal)}</span>
            </div>
            <div className="h-2.5 rounded-full bg-white/10 overflow-hidden mb-4">
              <div className="h-full bg-gradient-to-r from-brand to-brand-400 rounded-full" style={{ width: `${pct}%` }} />
            </div>
            <div className="grid grid-cols-2 gap-3 text-sm mb-3">
              <Info icon={Coins} label="Min invest" value={money(idea.minInvestment)} />
              <Info icon={Clock} label="Period" value={`${idea.fundingPeriodMonths} mo`} />
            </div>
            <div className="rounded-xl bg-emerald-500/10 border border-emerald-500/20 p-3 mb-5 flex items-center justify-between">
              <span className="text-sm text-slate-300">Expected ROI</span>
              <span className="font-bold text-emerald-400">
                {idea.expectedRoi > 0 ? `${idea.expectedRoi}% / ${idea.fundingPeriodMonths}mo` : 'Donation (0%)'}
              </span>
            </div>

            {user?.role === 'investor' ? (
              <>
                <button className="btn-primary w-full mb-2" onClick={() => setShowInvest(true)}>
                  <Coins size={18} /> Invest now
                </button>
                {connection ? (
                  <div className={`w-full rounded-xl px-4 py-2.5 text-sm font-semibold text-center flex items-center justify-center gap-2 ${
                    connection.status === 'accepted'
                      ? 'bg-emerald-500/15 text-emerald-300'
                      : connection.status === 'declined'
                      ? 'bg-rose-500/15 text-rose-300'
                      : 'bg-white/5 text-slate-300 border border-white/10'
                  }`}>
                    {connection.status === 'accepted' && <><Check size={16} /> Connected with creator</>}
                    {connection.status === 'pending' && <><Clock size={16} /> Request sent · awaiting response</>}
                    {connection.status === 'declined' && <>Request declined</>}
                  </div>
                ) : (
                  <button className="btn-ghost w-full" onClick={connect}>
                    <Heart size={16} /> Connect with creator
                  </button>
                )}
              </>
            ) : (
              <p className="text-sm text-slate-400 text-center">Log in as an investor to fund this idea.</p>
            )}
          </div>

          {locked && (
            <div className="card p-5 bg-brand/5 border-brand/20 text-center">
              <Lock size={20} className="text-brand-400 mx-auto mb-2" />
              <p className="text-sm text-slate-300 mb-3">Unlock the full idea to invest with confidence.</p>
              <Link to="/app/pricing" className="btn-outline w-full text-sm">View plans</Link>
            </div>
          )}
        </aside>
      </div>

      {showInvest && (
        <InvestModal idea={idea} onClose={() => setShowInvest(false)} onDone={() => { setShowInvest(false); load(); }} />
      )}
    </div>
  );
}

const Info = ({ icon: I, label, value }) => (
  <div className="rounded-xl bg-white/5 p-3">
    <div className="flex items-center gap-1.5 text-slate-400 text-xs mb-0.5"><I size={13} /> {label}</div>
    <div className="font-semibold text-white">{value}</div>
  </div>
);

function Block({ block }) {
  if (block.type === 'paragraph') {
    return (
      <div className="rounded-2xl overflow-hidden relative"
        style={block.backgroundImage ? {
          backgroundImage: `linear-gradient(rgba(10,10,18,0.78),rgba(10,10,18,0.78)), url(${block.backgroundImage})`,
          backgroundSize: 'cover', backgroundPosition: 'center',
        } : {}}>
        <p className={`leading-relaxed whitespace-pre-wrap ${block.backgroundImage ? 'text-slate-100 p-8 text-lg' : 'text-slate-300'}`}>
          {block.text}
        </p>
      </div>
    );
  }
  if (block.type === 'image') {
    return <img src={block.url} alt="" className="w-full rounded-2xl border border-white/10" />;
  }
  if (block.type === 'video') {
    const isEmbed = /youtube|vimeo|youtu\.be/.test(block.url);
    return isEmbed ? (
      <div className="aspect-video rounded-2xl overflow-hidden border border-white/10">
        <iframe src={block.url} title="video" className="w-full h-full" allowFullScreen />
      </div>
    ) : (
      <video src={block.url} controls className="w-full rounded-2xl border border-white/10" />
    );
  }
  if (block.type === 'link') {
    return (
      <a href={block.url} target="_blank" rel="noreferrer"
        className="card p-4 flex items-center gap-3 hover:border-brand/40 transition">
        <span className="w-10 h-10 rounded-lg bg-brand/15 text-brand-400 grid place-items-center"><LinkIcon size={18} /></span>
        <span className="text-white font-medium">{block.label || block.url}</span>
        <span className="ml-auto text-slate-500 text-sm">↗</span>
      </a>
    );
  }
  return null;
}

function InvestModal({ idea, onClose, onDone }) {
  const [amount, setAmount] = useState(idea.minInvestment || 5000);
  const [period, setPeriod] = useState(idea.fundingPeriodMonths || 12);
  const [message, setMessage] = useState('');
  const [agreed, setAgreed] = useState(false);
  const [busy, setBusy] = useState(false);

  const expectedReturn = Math.round(amount * (1 + (idea.expectedRoi || 0) / 100));

  const invest = async () => {
    if (amount < idea.minInvestment) return toast.error(`Minimum is ${moneyFull(idea.minInvestment)}`);
    if (!agreed) return toast.error('Please accept the investment agreement first');
    setBusy(true);
    try {
      const res = await runCheckout({
        createPath: '/investments/order',
        verifyPath: '/investments/verify',
        idField: 'investmentId',
        name: idea.title,
        description: `Investment in ${idea.title}`,
        body: { ideaId: idea._id, amount, periodMonths: period, message, agreementAccepted: true },
      });
      toast.success(res.message || 'Investment successful 🎉');
      onDone();
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || 'Payment failed');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/70 backdrop-blur-sm p-4" onClick={onClose}>
      <div className="card w-full max-w-md p-6" onClick={(e) => e.stopPropagation()}>
        <h3 className="font-display text-2xl font-bold text-white mb-1">Invest in this idea</h3>
        <p className="text-sm text-slate-400 mb-5">{idea.title}</p>

        <label className="label">Amount (₹)</label>
        <input type="number" className="input mb-1" value={amount} min={idea.minInvestment}
          onChange={(e) => setAmount(+e.target.value)} />
        <div className="flex gap-2 mb-4">
          {[idea.minInvestment, idea.minInvestment * 2, idea.minInvestment * 5].map((a) => (
            <button key={a} onClick={() => setAmount(a)} className="chip bg-white/5 text-slate-300 hover:bg-white/10">{money(a)}</button>
          ))}
        </div>

        <label className="label">Investment period (months)</label>
        <input type="number" className="input mb-4" value={period} onChange={(e) => setPeriod(+e.target.value)} />

        <label className="label">Message to creator (optional)</label>
        <textarea className="input mb-5 min-h-[70px]" value={message} onChange={(e) => setMessage(e.target.value)}
          placeholder="Why you're backing this…" />

        <div className="rounded-xl bg-white/5 p-3 text-sm space-y-2 mb-5">
          <div className="flex justify-between text-slate-300">
            <span>You invest</span>
            <span className="font-bold text-white">{moneyFull(amount)}</span>
          </div>
          <div className="flex justify-between text-slate-300">
            <span>ROI ({idea.expectedRoi || 0}% over {period} mo)</span>
            <span className="text-emerald-400">+ {moneyFull(Math.round(amount * (idea.expectedRoi || 0) / 100))}</span>
          </div>
          <div className="flex justify-between pt-2 border-t border-white/10">
            <span className="text-slate-300">Expected return at maturity</span>
            <span className="font-bold text-emerald-400">{moneyFull(expectedReturn)}</span>
          </div>
        </div>

        {/* Investment agreement */}
        <div className="rounded-xl border border-white/10 bg-white/[0.02] p-3 mb-4">
          <div className="text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5"><Check size={13} className="text-brand-400" /> Investment agreement</div>
          <p className="text-[12px] text-slate-400 leading-relaxed max-h-24 overflow-y-auto">
            You commit <b className="text-white">{moneyFull(amount)}</b> to “{idea.title}” for <b className="text-white">{period} months</b> at{' '}
            <b className="text-white">{idea.expectedRoi || 0}% ROI</b>, for an expected return of <b className="text-emerald-400">{moneyFull(expectedReturn)}</b> at maturity.
            Funds are held by the platform and disbursed to the creator per agreed terms; returns are settled back to you via the platform.
            Investments carry risk and returns are not guaranteed.
          </p>
          <label className="flex items-start gap-2 mt-3 cursor-pointer">
            <input type="checkbox" checked={agreed} onChange={(e) => setAgreed(e.target.checked)}
              className="mt-0.5 accent-[#7c5cff] w-4 h-4" />
            <span className="text-xs text-slate-300">I have read and agree to the investment agreement and terms.</span>
          </label>
        </div>

        <div className="flex gap-3">
          <button className="btn-primary flex-1" onClick={invest} disabled={busy || !agreed}>
            {busy ? 'Processing…' : <><Check size={18} /> Confirm & pay</>}
          </button>
          <button className="btn-ghost" onClick={onClose}>Cancel</button>
        </div>
        <p className="text-[11px] text-slate-500 mt-3 text-center">Secured via Razorpay · funds held in platform escrow.</p>
      </div>
    </div>
  );
}
