import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';

import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import Verify from './pages/Verify';
import Dashboard from './pages/Dashboard';
import Inbox from './pages/Inbox';
import EditIdea from './pages/EditIdea';
import Explore from './pages/Explore';
import IdeaDetail from './pages/IdeaDetail';
import Pricing from './pages/Pricing';
import Portfolio from './pages/Portfolio';
import Admin from './pages/Admin';

function Loader() {
  return (
    <div className="min-h-screen grid place-items-center">
      <div className="w-10 h-10 rounded-full border-2 border-brand/30 border-t-brand animate-spin" />
    </div>
  );
}

// Requires login; optionally restricts to roles
function Protected({ children, roles }) {
  const { user, loading } = useAuth();
  const location = useLocation();
  if (loading) return <Loader />;
  if (!user) return <Navigate to="/login" state={{ from: location }} replace />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/app" replace />;
  return children;
}

// Sends a logged-in user to their home screen
function HomeRedirect() {
  const { user, loading } = useAuth();
  if (loading) return <Loader />;
  if (!user) return <Navigate to="/" replace />;
  if (user.role === 'admin') return <Navigate to="/app/admin" replace />;
  if (user.role === 'creator') return <Navigate to="/app/dashboard" replace />;
  // investor
  if (!user.isVerified) return <Navigate to="/app/verify" replace />;
  return <Navigate to="/app/explore" replace />;
}

export default function App() {
  const { user } = useAuth();
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={user ? <Navigate to="/app" replace /> : <Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          <Route path="/app" element={<HomeRedirect />} />

          {/* Investor flows */}
          <Route path="/app/verify" element={<Protected roles={['investor']}><Verify /></Protected>} />
          <Route path="/app/explore" element={<Protected roles={['investor', 'admin']}><Explore /></Protected>} />
          <Route path="/app/idea/:id" element={<Protected roles={['investor', 'admin']}><IdeaDetail /></Protected>} />
          <Route path="/app/pricing" element={<Protected roles={['investor']}><Pricing /></Protected>} />
          <Route path="/app/portfolio" element={<Protected roles={['investor']}><Portfolio /></Protected>} />

          {/* Creator flows */}
          <Route path="/app/kyc" element={<Protected roles={['creator']}><Verify /></Protected>} />
          <Route path="/app/dashboard" element={<Protected roles={['creator', 'admin']}><Dashboard /></Protected>} />
          <Route path="/app/requests" element={<Protected roles={['creator', 'admin']}><Inbox /></Protected>} />
          <Route path="/app/create" element={<Protected roles={['creator', 'admin']}><EditIdea /></Protected>} />
          <Route path="/app/edit/:id" element={<Protected roles={['creator', 'admin']}><EditIdea /></Protected>} />

          {/* Admin */}
          <Route path="/app/admin" element={<Protected roles={['admin']}><Admin /></Protected>} />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  );
}
