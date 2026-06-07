import { Link } from 'react-router-dom';
import { Rocket, Compass, Lock, Shield, Coins, Sparkle, Check, Image, Video, Heart } from '../components/Icons';

const Feature = ({ icon: I, title, desc }) => (
  <div className="card p-6 hover:border-brand/40 transition group">
    <div className="w-12 h-12 rounded-xl bg-brand/15 text-brand-400 grid place-items-center mb-4 group-hover:scale-110 transition">
      <I size={22} />
    </div>
    <h3 className="font-display font-semibold text-lg text-white mb-1.5">{title}</h3>
    <p className="text-sm text-slate-400 leading-relaxed">{desc}</p>
  </div>
);

export default function Landing() {
  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 pt-20 pb-24 text-center">
          <div className="inline-flex items-center gap-2 chip bg-brand/10 text-brand-400 border border-brand/20 mb-6 animate-fade-up">
            <Sparkle size={14} /> Where ideas meet capital
          </div>
          <h1 className="font-display text-5xl md:text-7xl font-extrabold tracking-tight text-white max-w-4xl mx-auto leading-[1.05] animate-fade-up">
            Fund the <span className="text-brand-400">work</span> that
            <br /> moves the world forward
          </h1>
          <p className="mt-6 text-lg text-slate-400 max-w-2xl mx-auto animate-fade-up">
            Creators, innovators & changemakers showcase their work. Verified investors discover,
            connect and back the ideas they believe in — for the time and amount that suits them.
          </p>
          <div className="mt-9 flex items-center justify-center gap-3 animate-fade-up">
            <Link to="/register" className="btn-primary text-base px-7 py-3"><Rocket size={18} /> Start your page</Link>
            <Link to="/register" className="btn-ghost text-base px-7 py-3"><Compass size={18} /> Explore as investor</Link>
          </div>
          <p className="mt-4 text-xs text-slate-500">It's free and takes less than a minute</p>

          {/* floating preview cards */}
          <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
            {[
              { i: Video, c: 'from-rose-500/20 to-orange-500/10', t: 'Pitch videos' },
              { i: Image, c: 'from-brand/20 to-indigo-500/10', t: 'Visual stories' },
              { i: Heart, c: 'from-pink-500/20 to-fuchsia-500/10', t: 'Charity drives' },
              { i: Coins, c: 'from-emerald-500/20 to-teal-500/10', t: 'Smart investing' },
            ].map((x, idx) => (
              <div
                key={x.t}
                className={`card p-6 bg-gradient-to-br ${x.c} animate-float`}
                style={{ animationDelay: `${idx * 0.4}s` }}
              >
                <x.i size={28} className="text-white mb-3 mx-auto" />
                <div className="text-sm font-medium text-white">{x.t}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="max-w-7xl mx-auto px-4 py-20">
        <div className="text-center mb-14">
          <h2 className="font-display text-4xl font-bold text-white">Publish your best work</h2>
          <p className="mt-3 text-slate-400 max-w-xl mx-auto">
            Build a beautiful page with videos, images, links and rich paragraphs — even custom
            background images. Then let verified backers fund it.
          </p>
        </div>
        <div className="grid md:grid-cols-3 gap-5">
          <Feature icon={Sparkle} title="1. Showcase your work" desc="Creators, innovators & NGOs post videos, images, links and styled paragraphs to tell their story." />
          <Feature icon={Shield} title="2. Investors get verified" desc="Investors upload a verification document. Once approved by the admin, the marketplace unlocks." />
          <Feature icon={Coins} title="3. Connect & invest" desc="Backers preview ideas, subscribe to see the full story, then invest a chosen amount for a chosen period." />
        </div>
      </section>

      {/* Gating explainer */}
      <section className="max-w-6xl mx-auto px-4 pb-24">
        <div className="card p-8 md:p-12 bg-gradient-to-br from-brand/10 to-transparent border-brand/20 grid md:grid-cols-2 gap-10 items-center">
          <div>
            <div className="chip bg-white/10 text-white mb-4"><Lock size={14} /> Smart preview</div>
            <h3 className="font-display text-3xl font-bold text-white mb-3">See 10% free, unlock the rest</h3>
            <p className="text-slate-400 leading-relaxed mb-6">
              Every idea shows a teaser preview to verified investors. Subscribe to a plan to unlock the
              full pitch, media, financials and connect directly with the creator.
            </p>
            <ul className="space-y-2.5">
              {['Full pitch & media gallery', 'Direct creator connect', 'Invest for a custom period & amount', 'Priority deal flow'].map((t) => (
                <li key={t} className="flex items-center gap-2.5 text-slate-300">
                  <span className="w-5 h-5 rounded-full bg-brand/20 text-brand-400 grid place-items-center"><Check size={13} /></span>
                  {t}
                </li>
              ))}
            </ul>
            <Link to="/register" className="btn-primary mt-7"><Rocket size={18} /> Join Venturly
            </Link>
          </div>
          <div className="relative">
            <div className="card p-5 relative overflow-hidden">
              <div className="h-40 rounded-xl bg-gradient-to-br from-brand/30 to-indigo-500/20 mb-4" />
              <div className="h-3 w-3/4 bg-white/10 rounded mb-2" />
              <div className="h-3 w-1/2 bg-white/10 rounded" />
              <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-card to-transparent grid place-items-center">
                <div className="chip bg-brand text-white"><Lock size={14} /> Unlock full idea</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <footer className="border-t border-white/10 py-8 text-center text-sm text-slate-500">
        © 2026 Venturly — Fund the work that matters. Built on the MERN stack.
      </footer>
    </div>
  );
}
