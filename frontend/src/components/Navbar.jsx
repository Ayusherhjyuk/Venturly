import { useEffect, useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../lib/api';
import { Logo, Compass, Plus, Logout, Shield, Coins, Sparkle, Heart } from './Icons';

const linkClass = ({ isActive }) =>
  `px-3 py-2 rounded-lg text-sm font-medium transition flex items-center gap-2 ${
    isActive ? 'bg-white/10 text-white' : 'text-slate-300 hover:text-white hover:bg-white/5'
  }`;

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [pending, setPending] = useState(0);

  // poll pending connection requests for creators
  useEffect(() => {
    if (user?.role !== 'creator') return;
    let active = true;
    const fetchPending = () =>
      api.get('/connections/received')
        .then(({ data }) => active && setPending(data.connections.filter((c) => c.status === 'pending').length))
        .catch(() => {});
    fetchPending();
    const t = setInterval(fetchPending, 20000);
    return () => { active = false; clearInterval(t); };
  }, [user]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className="sticky top-0 z-40 glass border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link to={user ? '/app' : '/'} className="flex items-center gap-2.5">
          <Logo />
          <span className="font-display text-lg font-bold tracking-tight text-white">
            Ventur<span className="text-brand-400">ly</span>
          </span>
        </Link>

        <nav className="flex items-center gap-1.5">
          {!user && (
            <>
              <Link to="/login" className="btn-ghost text-sm py-2">Log in</Link>
              <Link to="/register" className="btn-primary text-sm py-2">Get started</Link>
            </>
          )}

          {user?.role === 'creator' && (
            <>
              <NavLink to="/app/dashboard" className={linkClass}><Sparkle size={16} /> Dashboard</NavLink>
              <NavLink to="/app/requests" className={linkClass}>
                <Heart size={16} /> Requests
                {pending > 0 && (
                  <span className="ml-1 min-w-[18px] h-[18px] px-1 rounded-full bg-brand text-white text-[11px] font-bold grid place-items-center">
                    {pending}
                  </span>
                )}
              </NavLink>
              <NavLink to="/app/create" className={linkClass}><Plus size={16} /> New page</NavLink>
            </>
          )}

          {user?.role === 'investor' && (
            <>
              <NavLink to="/app/explore" className={linkClass}><Compass size={16} /> Explore</NavLink>
              <NavLink to="/app/portfolio" className={linkClass}><Coins size={16} /> Portfolio</NavLink>
              {!user.subscription?.isActive && (
                <NavLink to="/app/pricing" className="btn-outline text-sm py-2">Unlock full ideas</NavLink>
              )}
            </>
          )}

          {user?.role === 'admin' && (
            <NavLink to="/app/admin" className={linkClass}><Shield size={16} /> Admin</NavLink>
          )}

          {user && (
            <div className="flex items-center gap-3 ml-2 pl-3 border-l border-white/10">
              <div className="text-right hidden sm:block">
                <div className="text-sm font-semibold text-white leading-tight">{user.name}</div>
                <div className="text-[11px] text-slate-400 capitalize">{user.role}</div>
              </div>
              <div className="w-9 h-9 rounded-full bg-brand/20 border border-brand/40 grid place-items-center text-brand-400 font-bold">
                {user.name?.[0]?.toUpperCase()}
              </div>
              <button onClick={handleLogout} className="btn-ghost p-2" title="Log out">
                <Logout size={18} />
              </button>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
}
