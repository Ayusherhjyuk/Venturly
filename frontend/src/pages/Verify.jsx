import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../lib/api';
import { useAuth } from '../context/AuthContext';
import { Shield, Upload, Check, Clock } from '../components/Icons';

export default function Verify() {
  const { user, patchUser } = useAuth();
  const navigate = useNavigate();
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);

  const isCreator = user.role === 'creator';
  const copy = isCreator
    ? {
        title: 'Creator KYC verification',
        intro: 'Upload a KYC document (PAN, bank proof, or business registration). Once the admin approves you, your pages become visible to investors.',
        verifiedMsg: 'Your creator account is KYC-verified. Your pages are now visible to investors.',
        cta: 'Go to dashboard', dest: '/app/dashboard',
      }
    : {
        title: 'Investor verification',
        intro: "Upload a verification document (ID, accreditation letter, or company proof). Once the admin approves you, you'll be able to browse creators and invest.",
        verifiedMsg: 'Your investor account is approved. The marketplace is unlocked.',
        cta: 'Go to Explore', dest: '/app/explore',
      };

  // already verified -> bounce to home screen
  if (user.isVerified) {
    return (
      <Centered>
        <div className="w-16 h-16 rounded-2xl bg-emerald-500/15 text-emerald-400 grid place-items-center mx-auto mb-5">
          <Check size={30} />
        </div>
        <h1 className="font-display text-3xl font-bold text-white">You're verified ✅</h1>
        <p className="text-slate-400 mt-2 mb-6">{copy.verifiedMsg}</p>
        <button className="btn-primary" onClick={() => navigate(copy.dest)}>{copy.cta}</button>
      </Centered>
    );
  }

  const submit = async (e) => {
    e.preventDefault();
    if (!file) return toast.error('Please choose a document');
    setLoading(true);
    try {
      const fd = new FormData();
      fd.append('document', file);
      const { data } = await api.post('/uploads/verification', fd);
      patchUser(data.user);
      toast.success(data.message);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Upload failed');
    } finally {
      setLoading(false);
    }
  };

  const pending = user.verificationStatus === 'pending';

  return (
    <Centered>
      <div className="w-16 h-16 rounded-2xl bg-brand/15 text-brand-400 grid place-items-center mx-auto mb-5">
        <Shield size={30} />
      </div>
      <h1 className="font-display text-3xl font-bold text-white">{copy.title}</h1>
      <p className="text-slate-400 mt-2 mb-7 max-w-md mx-auto">{copy.intro}</p>

      {pending ? (
        <div className="card p-6 text-left">
          <div className="flex items-center gap-3 text-amber-300">
            <Clock size={22} />
            <div>
              <div className="font-semibold">Document submitted — pending review</div>
              <div className="text-sm text-amber-300/70">The admin will verify your account shortly.</div>
            </div>
          </div>
          <a href={user.verificationDocument} target="_blank" rel="noreferrer"
            className="text-sm text-brand-400 hover:underline mt-3 inline-block">View submitted document</a>
          <button className="btn-ghost w-full mt-4" onClick={() => patchUser({ verificationStatus: 'none' })}>
            Replace document
          </button>
        </div>
      ) : (
        <form onSubmit={submit} className="card p-6 text-left space-y-4">
          <label className="block border-2 border-dashed border-white/15 rounded-xl p-8 text-center cursor-pointer hover:border-brand/50 transition">
            <Upload size={26} className="mx-auto text-slate-400 mb-2" />
            <span className="text-sm text-slate-300">
              {file ? file.name : 'Click to upload (PDF, JPG, PNG, DOCX)'}
            </span>
            <input type="file" className="hidden" accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
              onChange={(e) => setFile(e.target.files[0])} />
          </label>
          <button className="btn-primary w-full" disabled={loading}>
            {loading ? 'Uploading…' : 'Submit for verification'}
          </button>
        </form>
      )}
    </Centered>
  );
}

function Centered({ children }) {
  return (
    <div className="min-h-[calc(100vh-4rem)] grid place-items-center px-4 py-12">
      <div className="w-full max-w-lg text-center">{children}</div>
    </div>
  );
}
