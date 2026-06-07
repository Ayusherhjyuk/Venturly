import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { Logo, Sparkle, Coins, Check } from '../components/Icons';

const RoleCard = ({ active, onClick, icon: I, title, desc }) => (
  <button type="button" onClick={onClick}
    className={`text-left p-4 rounded-xl border transition ${
      active ? 'border-brand bg-brand/10 shadow-glow' : 'border-white/10 bg-white/5 hover:border-white/20'
    }`}>
    <div className="flex items-center gap-2 mb-1">
      <I size={18} className={active ? 'text-brand-400' : 'text-slate-300'} />
      <span className="font-semibold text-white">{title}</span>
      {active && <Check size={16} className="text-brand-400 ml-auto" />}
    </div>
    <p className="text-xs text-slate-400">{desc}</p>
  </button>
);

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'creator', headline: '' });
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const user = await register(form);
      toast.success('Account created!');
      if (user.role === 'investor') navigate('/app/verify');
      else navigate('/app');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] grid place-items-center px-4 py-12">
      <div className="w-full max-w-lg">
        <div className="text-center mb-8">
          <div className="inline-flex"><Logo size={44} /></div>
          <h1 className="font-display text-3xl font-bold text-white mt-4">Create your account</h1>
          <p className="text-slate-400 mt-1">Join as a creator or an investor</p>
        </div>

        <form onSubmit={submit} className="card p-7 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <RoleCard active={form.role === 'creator'} onClick={() => setForm({ ...form, role: 'creator' })}
              icon={Sparkle} title="Creator" desc="Post your work & raise funds" />
            <RoleCard active={form.role === 'investor'} onClick={() => setForm({ ...form, role: 'investor' })}
              icon={Coins} title="Investor" desc="Discover & back great ideas" />
          </div>

          <div>
            <label className="label">Full name</label>
            <input className="input" required value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Jane Doe" />
          </div>
          <div>
            <label className="label">{form.role === 'creator' ? 'Headline (e.g. Indie filmmaker)' : 'Headline (e.g. Angel investor)'}</label>
            <input className="input" value={form.headline}
              onChange={(e) => setForm({ ...form, headline: e.target.value })} placeholder="One line about you" />
          </div>
          <div>
            <label className="label">Email</label>
            <input className="input" type="email" required value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="you@example.com" />
          </div>
          <div>
            <label className="label">Password</label>
            <input className="input" type="password" required minLength={6} value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="At least 6 characters" />
          </div>

          {form.role === 'investor' && (
            <p className="text-xs text-amber-300/80 bg-amber-500/10 border border-amber-500/20 rounded-lg p-3">
              As an investor you'll upload a verification document next. The marketplace unlocks once the admin approves you.
            </p>
          )}

          <button className="btn-primary w-full" disabled={loading}>
            {loading ? 'Creating…' : 'Create account'}
          </button>
          <p className="text-center text-sm text-slate-400">
            Already have an account? <Link to="/login" className="text-brand-400 font-medium hover:underline">Log in</Link>
          </p>
        </form>
      </div>
    </div>
  );
}
