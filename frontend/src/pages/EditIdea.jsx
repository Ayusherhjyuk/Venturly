import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../lib/api';
import { uploadFile } from '../lib/upload';
import { Text, Image, Video, Link as LinkIcon, Plus, Trash, Upload, Eye } from '../components/Icons';
import { moneyFull } from '../lib/format';

const blockTypes = [
  { type: 'paragraph', icon: Text, label: 'Paragraph' },
  { type: 'image', icon: Image, label: 'Image' },
  { type: 'video', icon: Video, label: 'Video' },
  { type: 'link', icon: LinkIcon, label: 'Link' },
];

const emptyBlock = (type) => ({ type, text: '', url: '', label: '', backgroundImage: '' });

export default function EditIdea() {
  const { id } = useParams();
  const editing = Boolean(id);
  const navigate = useNavigate();

  const [form, setForm] = useState({
    title: '', tagline: '', category: 'creative',
    coverImage: '', backgroundImage: '',
    fundingGoal: 100000, minInvestment: 5000, fundingPeriodMonths: 12, expectedRoi: 12,
    blocks: [emptyBlock('paragraph')],
  });
  const [loading, setLoading] = useState(editing);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!editing) return;
    api.get(`/ideas/mine`).then(({ data }) => {
      const found = data.ideas.find((i) => i._id === id);
      if (found) setForm({ ...found, blocks: found.blocks?.length ? found.blocks : [emptyBlock('paragraph')] });
      else toast.error('Page not found');
      setLoading(false);
    });
  }, [id, editing]);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  const setBlock = (i, patch) => setForm((f) => ({
    ...f, blocks: f.blocks.map((b, idx) => (idx === i ? { ...b, ...patch } : b)),
  }));
  const addBlock = (type) => setForm((f) => ({ ...f, blocks: [...f.blocks, emptyBlock(type)] }));
  const removeBlock = (i) => setForm((f) => ({ ...f, blocks: f.blocks.filter((_, idx) => idx !== i) }));
  const moveBlock = (i, dir) => setForm((f) => {
    const arr = [...f.blocks];
    const j = i + dir;
    if (j < 0 || j >= arr.length) return f;
    [arr[i], arr[j]] = [arr[j], arr[i]];
    return { ...f, blocks: arr };
  });

  const handleUpload = async (file, cb) => {
    if (!file) return;
    const t = toast.loading('Uploading…');
    try {
      const url = await uploadFile(file);
      cb(url);
      toast.success('Uploaded', { id: t });
    } catch {
      toast.error('Upload failed', { id: t });
    }
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) return toast.error('Title is required');
    setSaving(true);
    try {
      const payload = {
        title: form.title, tagline: form.tagline, category: form.category,
        coverImage: form.coverImage, backgroundImage: form.backgroundImage,
        fundingGoal: form.fundingGoal, minInvestment: form.minInvestment,
        fundingPeriodMonths: form.fundingPeriodMonths, expectedRoi: form.expectedRoi,
        blocks: JSON.stringify(form.blocks),
      };
      if (editing) await api.put(`/ideas/${id}`, payload);
      else await api.post('/ideas', payload);
      toast.success(editing ? 'Page updated' : 'Page published!');
      navigate('/app/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="min-h-[60vh] grid place-items-center text-slate-400">Loading…</div>;

  return (
    <div className="max-w-6xl mx-auto px-4 py-10 grid lg:grid-cols-[1fr_360px] gap-8">
      {/* Editor */}
      <form onSubmit={submit} className="space-y-6">
        <div>
          <h1 className="font-display text-3xl font-bold text-white">{editing ? 'Edit page' : 'Create your page'}</h1>
          <p className="text-slate-400 mt-1">Tell your story with text, media and links.</p>
        </div>

        <section className="card p-6 space-y-4">
          <div>
            <label className="label">Title</label>
            <input className="input" value={form.title} onChange={(e) => set('title', e.target.value)}
              placeholder="e.g. Echoes of the Valley — A Documentary" />
          </div>
          <div>
            <label className="label">Tagline</label>
            <input className="input" value={form.tagline} onChange={(e) => set('tagline', e.target.value)}
              placeholder="One punchy line about your work" />
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="label">Category</label>
              <select className="input" value={form.category} onChange={(e) => set('category', e.target.value)}>
                <option value="creative">Creative</option>
                <option value="innovation">Innovation</option>
                <option value="charity">Charity</option>
                <option value="startup">Startup</option>
                <option value="other">Other</option>
              </select>
            </div>
            <ImageField label="Cover image" value={form.coverImage}
              onUpload={(f) => handleUpload(f, (url) => set('coverImage', url))}
              onUrl={(url) => set('coverImage', url)} />
          </div>
          <ImageField label="Page background image (optional)" value={form.backgroundImage}
            onUpload={(f) => handleUpload(f, (url) => set('backgroundImage', url))}
            onUrl={(url) => set('backgroundImage', url)} />
        </section>

        {/* Funding */}
        <section className="card p-6 space-y-4">
          <h2 className="font-semibold text-white">Funding & returns</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="label">Funding goal (₹)</label>
              <input type="number" className="input" value={form.fundingGoal} onChange={(e) => set('fundingGoal', +e.target.value)} />
            </div>
            <div>
              <label className="label">Min investment (₹)</label>
              <input type="number" className="input" value={form.minInvestment} onChange={(e) => set('minInvestment', +e.target.value)} />
            </div>
            <div>
              <label className="label">Period (months)</label>
              <input type="number" className="input" value={form.fundingPeriodMonths} onChange={(e) => set('fundingPeriodMonths', +e.target.value)} />
            </div>
            <div>
              <label className="label">Expected ROI (%)</label>
              <input type="number" className="input" value={form.expectedRoi} onChange={(e) => set('expectedRoi', +e.target.value)} />
              <p className="text-xs text-slate-500 mt-1">
                Return over the full period. Set <b>0</b> for charity/donation.
              </p>
            </div>
          </div>
          <div className="rounded-xl bg-brand/5 border border-brand/15 p-3 text-sm text-slate-300">
            An investor putting in <b className="text-white">{moneyFull(form.minInvestment)}</b> would expect back{' '}
            <b className="text-emerald-400">{moneyFull(Math.round(form.minInvestment * (1 + (form.expectedRoi || 0) / 100)))}</b>{' '}
            after {form.fundingPeriodMonths} months ({form.expectedRoi || 0}% ROI).
          </div>
        </section>

        {/* Blocks */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-white">Content blocks</h2>
            <div className="flex gap-1.5">
              {blockTypes.map((bt) => (
                <button key={bt.type} type="button" onClick={() => addBlock(bt.type)}
                  className="btn-ghost text-xs py-1.5 px-2.5" title={`Add ${bt.label}`}>
                  <bt.icon size={14} /> {bt.label}
                </button>
              ))}
            </div>
          </div>

          {form.blocks.map((block, i) => (
            <BlockEditor key={i} block={block} index={i}
              onChange={(patch) => setBlock(i, patch)}
              onRemove={() => removeBlock(i)}
              onMove={(d) => moveBlock(i, d)}
              onUpload={handleUpload} />
          ))}
        </section>

        <div className="flex gap-3">
          <button className="btn-primary" disabled={saving}>{saving ? 'Saving…' : editing ? 'Save changes' : 'Publish page'}</button>
          <button type="button" className="btn-ghost" onClick={() => navigate('/app/dashboard')}>Cancel</button>
        </div>
      </form>

      {/* Live preview */}
      <aside className="lg:sticky lg:top-20 h-fit">
        <div className="flex items-center gap-2 text-slate-400 text-sm mb-2"><Eye size={16} /> Live preview</div>
        <Preview form={form} />
      </aside>
    </div>
  );
}

function ImageField({ label, value, onUpload, onUrl }) {
  return (
    <div>
      <label className="label">{label}</label>
      <div className="flex gap-2">
        <input className="input flex-1" placeholder="Paste image URL…" value={value}
          onChange={(e) => onUrl(e.target.value)} />
        <label className="btn-ghost px-3 cursor-pointer" title="Upload">
          <Upload size={16} />
          <input type="file" accept="image/*" className="hidden" onChange={(e) => onUpload(e.target.files[0])} />
        </label>
      </div>
      {value && <img src={value} alt="" className="mt-2 h-20 w-full object-cover rounded-lg" />}
    </div>
  );
}

function BlockEditor({ block, index, onChange, onRemove, onMove, onUpload }) {
  const Icon = blockTypes.find((b) => b.type === block.type)?.icon || Text;
  return (
    <div className="card p-5">
      <div className="flex items-center justify-between mb-3">
        <span className="chip bg-white/5 text-slate-300 capitalize"><Icon size={14} /> {block.type}</span>
        <div className="flex items-center gap-1">
          <button type="button" className="btn-ghost p-1.5" onClick={() => onMove(-1)} title="Move up">↑</button>
          <button type="button" className="btn-ghost p-1.5" onClick={() => onMove(1)} title="Move down">↓</button>
          <button type="button" className="btn-ghost p-1.5 text-rose-400 hover:bg-rose-500/10" onClick={onRemove}><Trash size={15} /></button>
        </div>
      </div>

      {block.type === 'paragraph' && (
        <div className="space-y-3">
          <textarea className="input min-h-[120px]" placeholder="Write your story…" value={block.text}
            onChange={(e) => onChange({ text: e.target.value })} />
          <div>
            <label className="label text-xs">Paragraph background image (optional)</label>
            <div className="flex gap-2">
              <input className="input flex-1 text-sm" placeholder="Background image URL…" value={block.backgroundImage}
                onChange={(e) => onChange({ backgroundImage: e.target.value })} />
              <label className="btn-ghost px-3 cursor-pointer"><Upload size={16} />
                <input type="file" accept="image/*" className="hidden"
                  onChange={(e) => onUpload(e.target.files[0], (url) => onChange({ backgroundImage: url }))} />
              </label>
            </div>
          </div>
        </div>
      )}

      {block.type === 'image' && (
        <div className="flex gap-2">
          <input className="input flex-1" placeholder="Image URL or upload →" value={block.url}
            onChange={(e) => onChange({ url: e.target.value })} />
          <label className="btn-ghost px-3 cursor-pointer"><Upload size={16} />
            <input type="file" accept="image/*" className="hidden"
              onChange={(e) => onUpload(e.target.files[0], (url) => onChange({ url }))} />
          </label>
        </div>
      )}

      {block.type === 'video' && (
        <div className="flex gap-2">
          <input className="input flex-1" placeholder="YouTube/Vimeo embed URL or upload mp4 →" value={block.url}
            onChange={(e) => onChange({ url: e.target.value })} />
          <label className="btn-ghost px-3 cursor-pointer"><Upload size={16} />
            <input type="file" accept="video/*" className="hidden"
              onChange={(e) => onUpload(e.target.files[0], (url) => onChange({ url }))} />
          </label>
        </div>
      )}

      {block.type === 'link' && (
        <div className="space-y-2">
          <input className="input" placeholder="https://…" value={block.url} onChange={(e) => onChange({ url: e.target.value })} />
          <input className="input" placeholder="Link label (e.g. View pitch deck)" value={block.label} onChange={(e) => onChange({ label: e.target.value })} />
        </div>
      )}
    </div>
  );
}

function Preview({ form }) {
  return (
    <div className="card overflow-hidden">
      <div className="h-28 bg-cover bg-center"
        style={{ backgroundImage: `url(${form.coverImage || 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=600'})` }} />
      <div className="p-4">
        <h3 className="font-display font-bold text-white line-clamp-2">{form.title || 'Your title'}</h3>
        <p className="text-sm text-slate-400 line-clamp-2 mt-1">{form.tagline || 'Your tagline appears here'}</p>
        <div className="text-xs text-slate-500 mt-3">Goal: {moneyFull(form.fundingGoal)} · Min {moneyFull(form.minInvestment)} · {form.fundingPeriodMonths}mo</div>
        <div className="mt-3 text-xs text-slate-400">{form.blocks.length} content block{form.blocks.length !== 1 ? 's' : ''}</div>
      </div>
    </div>
  );
}
