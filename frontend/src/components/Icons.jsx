// Lightweight inline SVG icon set (no external dep)
const base = { fill: 'none', stroke: 'currentColor', strokeWidth: 1.8, strokeLinecap: 'round', strokeLinejoin: 'round' };

export const Icon = ({ path, size = 20, className = '', children, ...rest }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" {...base} className={className} {...rest}>
    {children || <path d={path} />}
  </svg>
);

export const Logo = ({ size = 28 }) => (
  <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
    <rect width="32" height="32" rx="9" fill="#7c5cff" />
    <path d="M9 22V10l8 6-8 6zM19 10h4v12h-4z" fill="#fff" />
  </svg>
);

export const Rocket = (p) => <Icon {...p} path="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09zM12 15l-3-3a22 22 0 0 1 8-8c2.5 1 3 2 4 4-3.5 4-8 8-8 8M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5" />;
export const Compass = (p) => <Icon {...p}><circle cx="12" cy="12" r="9" /><path d="m14.5 9.5-2 5-5 2 2-5z" /></Icon>;
export const Plus = (p) => <Icon {...p} path="M12 5v14M5 12h14" />;
export const Lock = (p) => <Icon {...p}><rect x="4" y="11" width="16" height="10" rx="2" /><path d="M8 11V7a4 4 0 0 1 8 0v4" /></Icon>;
export const Check = (p) => <Icon {...p} path="M20 6 9 17l-5-5" />;
export const Shield = (p) => <Icon {...p} path="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />;
export const Heart = (p) => <Icon {...p} path="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 12 5 5.5 5.5 0 0 0 2 8.5c0 2.29 1.51 4.04 3 5.5l7 7 7-7z" />;
export const User = (p) => <Icon {...p}><circle cx="12" cy="8" r="4" /><path d="M4 21v-1a7 7 0 0 1 14 0v1" /></Icon>;
export const Image = (p) => <Icon {...p}><rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="9" cy="9" r="2" /><path d="m21 15-5-5L5 21" /></Icon>;
export const Video = (p) => <Icon {...p}><rect x="2" y="6" width="14" height="12" rx="2" /><path d="m22 8-6 4 6 4V8z" /></Icon>;
export const Link = (p) => <Icon {...p} path="M10 13a5 5 0 0 0 7 0l3-3a5 5 0 0 0-7-7l-1 1M14 11a5 5 0 0 0-7 0l-3 3a5 5 0 0 0 7 7l1-1" />;
export const Text = (p) => <Icon {...p} path="M4 6h16M4 12h16M4 18h10" />;
export const Trash = (p) => <Icon {...p} path="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m2 0v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" />;
export const Logout = (p) => <Icon {...p} path="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" />;
export const Sparkle = (p) => <Icon {...p} path="M12 3l1.9 5.1L19 10l-5.1 1.9L12 17l-1.9-5.1L5 10l5.1-1.9L12 3z" />;
export const Bolt = (p) => <Icon {...p} path="M13 2 3 14h7l-1 8 10-12h-7l1-8z" />;
export const Coins = (p) => <Icon {...p}><ellipse cx="9" cy="7" rx="6" ry="3" /><path d="M3 7v6c0 1.66 2.69 3 6 3s6-1.34 6-3M15 11.5c2.5.4 4 1.4 4 2.5 0 1.66-2.69 3-6 3-1 0-2-.1-3-.4" /></Icon>;
export const Eye = (p) => <Icon {...p}><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z" /><circle cx="12" cy="12" r="3" /></Icon>;
export const Upload = (p) => <Icon {...p} path="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12" />;
export const Clock = (p) => <Icon {...p}><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></Icon>;
