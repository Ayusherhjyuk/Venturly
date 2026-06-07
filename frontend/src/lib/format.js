export const money = (n) => {
  const num = Number(n) || 0;
  if (num >= 10000000) return `₹${(num / 10000000).toFixed(2)}Cr`;
  if (num >= 100000) return `₹${(num / 100000).toFixed(2)}L`;
  if (num >= 1000) return `₹${(num / 1000).toFixed(1)}K`;
  return `₹${num.toLocaleString('en-IN')}`;
};

export const moneyFull = (n) => `₹${(Number(n) || 0).toLocaleString('en-IN')}`;

export const fmtDate = (d) => {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
};

export const daysLeft = (d) => {
  if (!d) return 0;
  return Math.max(0, Math.ceil((new Date(d) - new Date()) / 86400000));
};

export const progress = (raised, goal) => {
  if (!goal) return 0;
  return Math.min(100, Math.round((raised / goal) * 100));
};

export const categoryColor = (c) =>
  ({
    creative: 'bg-rose-500/15 text-rose-300',
    innovation: 'bg-brand/15 text-brand-400',
    charity: 'bg-pink-500/15 text-pink-300',
    startup: 'bg-emerald-500/15 text-emerald-300',
    other: 'bg-slate-500/15 text-slate-300',
  }[c] || 'bg-slate-500/15 text-slate-300');
