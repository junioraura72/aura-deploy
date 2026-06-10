#!/usr/bin/env bash
set -euo pipefail

cd /workspaces/aura-deploy

rm -rf .next node_modules package-lock.json
mkdir -p app/api/auth/login app/api/auth/register app/api/ai/analyze app/api/architect/build app/api/whatsapp app/lib app/auth/register app/admin

cat > package.json <<'EOF'
{
  "name": "aura-core",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "start": "next start"
  },
  "dependencies": {
    "bcryptjs": "^3.0.3",
    "jsonwebtoken": "^9.0.1",
    "next": "14.2.15",
    "react": "18.3.1",
    "react-dom": "18.3.1",
    "recharts": "^2.9.0"
  },
  "devDependencies": {
    "@types/node": "20.14.15",
    "@types/react": "18.3.3",
    "@types/react-dom": "18.3.0",
    "autoprefixer": "10.4.20",
    "postcss": "8.4.41",
    "tailwindcss": "3.4.10",
    "typescript": "5.5.4"
  }
}
EOF

cat > tsconfig.json <<'EOF'
{
  "compilerOptions": {
    "target": "es2020",
    "lib": ["dom", "dom.iterable", "es2020"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [{ "name": "next" }]
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
EOF

cat > next-env.d.ts <<'EOF'
/// <reference types="next" />
/// <reference types="next/image-types/global" />
EOF

cat > next.config.js <<'EOF'
/** @type {import('next').NextConfig} */
const nextConfig = {
  poweredByHeader: false,
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'Content-Security-Policy', value: "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; connect-src 'self'; font-src 'self' data:; object-src 'none'; base-uri 'self'; frame-ancestors 'none';" },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-Content-Type-Options', value: 'nosniff' }
        ]
      }
    ];
  }
};
module.exports = nextConfig;
EOF

cat > postcss.config.js <<'EOF'
module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {}
  }
};
EOF

cat > tailwind.config.ts <<'EOF'
import type { Config } from 'tailwindcss';
export default {
  content: ['./app/**/*.{ts,tsx}'],
  theme: { extend: {} },
  plugins: []
} satisfies Config;
EOF

cat > app/globals.css <<'EOF'
@tailwind base;
@tailwind components;
@tailwind utilities;
:root { color-scheme: dark; }
html, body { background: #0A0F1A; color: #E5E7EB; }
EOF

cat > app/layout.tsx <<'EOF'
import type { ReactNode } from 'react';
import './globals.css';

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
EOF

cat > app/lib/mockAI.ts <<'EOF'
export function mockAIAnalysis(fileName: string) {
  return {
    fileName,
    summary: 'AI analysis completed. Demand is stable, revenue trend is upward, and operational risk is low.',
    confidence: '94%',
    sentiment: 'Positive',
    recommendation: 'Increase proactive outreach on the top 3 revenue accounts.'
  };
}
EOF

cat > app/api/architect/build/route.ts <<'EOF'
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  const { feature } = await req.json();
  return NextResponse.json({ message: `Feature ${feature} queued for build.` });
}
EOF

cat > app/api/whatsapp/route.ts <<'EOF'
import { NextResponse } from 'next/server';

const replies: Record<string, string> = {
  status: 'Elsie: All core systems are online and treasury is ready for demo activity.',
  briefing: 'Elsie: Briefing ready: pipeline is healthy, revenue is up, and risk remains low.',
  credits: 'Elsie: You have 12 demo credits remaining for this session.'
};

export async function POST(req: Request) {
  const { message } = await req.json();
  const text = String(message || '').trim().toLowerCase();
  const reply = replies[text] || 'Elsie: I can help with status, briefing, or credits.';
  return NextResponse.json({ reply, command: text });
}
EOF

cat > app/api/ai/analyze/route.ts <<'EOF'
import { NextResponse } from 'next/server';
import { mockAIAnalysis } from '../../../lib/mockAI';

export async function POST(req: Request) {
  const { fileName } = await req.json();
  return NextResponse.json(mockAIAnalysis(fileName || 'demo.csv'));
}
EOF

cat > app/lib/authStore.ts <<'EOF'
export type AuthUser = { email: string; password: string; name: string; organization: string };

export const ADMIN_EMAIL = 'owusueddie1@gmail.com';
export const ADMIN_PASSWORD = 'pintogee12';
export const JWT_SECRET = 'aura-demo-secret';

export const users = new Map<string, AuthUser>();
export const attempts = new Map<string, number>();

export function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

export function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function isValidPassword(password: string) {
  return password.trim().length >= 8;
}
EOF

cat > app/api/auth/register/route.ts <<'EOF'
import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { attempts, isValidEmail, isValidPassword, normalizeEmail, users } from '../../../lib/authStore';

export async function POST(req: Request) {
  const { email, password, name, organization } = await req.json();
  const ip = req.headers.get('x-forwarded-for') || 'local';
  const count = (attempts.get(ip) || 0) + 1;
  attempts.set(ip, count);
  if (count > 8) return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 });

  const safeEmail = normalizeEmail(String(email || ''));
  const safePassword = String(password || '');
  const safeName = String(name || '').trim();

  if (!isValidEmail(safeEmail) || !isValidPassword(safePassword) || !safeName) {
    return NextResponse.json({ error: 'Use a valid email, a password of at least 8 characters, and a name.' }, { status: 400 });
  }
  if (users.has(safeEmail)) {
    return NextResponse.json({ error: 'Email already registered.' }, { status: 409 });
  }

  const hash = await bcrypt.hash(safePassword, 10);
  users.set(safeEmail, { email: safeEmail, password: hash, name: safeName, organization: String(organization || 'Unknown').trim() });
  return NextResponse.json({ ok: true, email: safeEmail });
}
EOF

cat > app/api/auth/login/route.ts <<'EOF'
import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { ADMIN_EMAIL, ADMIN_PASSWORD, JWT_SECRET, attempts, isValidEmail, isValidPassword, normalizeEmail, users } from '../../../lib/authStore';

export async function POST(req: Request) {
  const { email, password } = await req.json();
  const ip = req.headers.get('x-forwarded-for') || 'local';
  const count = (attempts.get(ip) || 0) + 1;
  attempts.set(ip, count);
  if (count > 8) return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 });

  const safeEmail = normalizeEmail(String(email || ''));
  const safePassword = String(password || '');

  if (!isValidEmail(safeEmail) || !isValidPassword(safePassword)) {
    return NextResponse.json({ error: 'Use a valid email and a password of at least 8 characters.' }, { status: 400 });
  }

  if (safeEmail === ADMIN_EMAIL && safePassword === ADMIN_PASSWORD) {
    const token = jwt.sign({ email: safeEmail, role: 'admin' }, JWT_SECRET, { expiresIn: '1h' });
    return NextResponse.json({ token, email: safeEmail, role: 'admin' });
  }

  const user = users.get(safeEmail);
  if (!user || !(await bcrypt.compare(safePassword, user.password))) {
    return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
  }

  const token = jwt.sign({ email: user.email, role: 'user' }, JWT_SECRET, { expiresIn: '1h' });
  return NextResponse.json({ token, email: user.email, role: 'user' });
}
EOF

cat > app/page.tsx <<'EOF'
'use client';

import { useEffect, useState } from 'react';
import { LineChart, Line, ResponsiveContainer, XAxis, Tooltip } from 'recharts';

const chartData = [
  { name: 'Mon', revenue: 20 },
  { name: 'Tue', revenue: 28 },
  { name: 'Wed', revenue: 35 },
  { name: 'Thu', revenue: 32 },
  { name: 'Fri', revenue: 40 },
];

export default function Home() {
  const [tab, setTab] = useState<'overview' | 'revenue' | 'risk'>('overview');
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [organization, setOrganization] = useState('');
  const [token, setToken] = useState('');
  const [analysis, setAnalysis] = useState('');
  const [treasury, setTreasury] = useState(0);
  const [log, setLog] = useState(['Demo treasury ready']);
  const [message, setMessage] = useState('');

  useEffect(() => {
    setToken(localStorage.getItem('aura-jwt') || '');
  }, []);

  const handleAuth = async () => {
    setMessage('');
    const safeEmail = email.trim().toLowerCase();
    if (!safeEmail || password.length < 8 || (authMode === 'register' && !name.trim())) {
      setMessage('Please enter a valid email and at least 8 characters for your password.');
      return;
    }

    const res = await fetch(`/api/auth/${authMode}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email: safeEmail, password, organization })
    });
    const data = await res.json();

    if (!res.ok) {
      setMessage(data.error || 'Authentication failed.');
      return;
    }

    if (authMode === 'login') {
      localStorage.setItem('aura-jwt', data.token);
      localStorage.setItem('aura-user', data.email);
      localStorage.setItem('aura-role', data.role || 'user');
      setToken(data.token);
      setMessage('Signed in successfully.');
      if (data.role === 'admin') window.location.href = '/admin';
      return;
    }

    setMessage('Account created. You can sign in now.');
    setAuthMode('login');
  };

  const handleAnalyze = async () => {
    const res = await fetch('/api/ai/analyze', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ fileName: 'demo-upload.csv' }) });
    const data = await res.json();
    setAnalysis(data.summary);
  };

  const handleDeposit = () => {
    setTreasury((v) => v + 500);
    setLog((prev) => [`Deposit +$500 at ${new Date().toLocaleTimeString()}`, ...prev].slice(0, 6));
  };

  return (
    <main className="min-h-screen bg-[#0A0F1A] text-slate-100">
      <section className="mx-auto flex max-w-7xl flex-col gap-8 px-6 py-10">
        <nav className="flex items-center justify-between rounded-2xl border border-slate-800 bg-slate-950/80 p-4 shadow-2xl">
          <div>
            <p className="text-xl font-semibold text-[#C9A96E]">AURA</p>
            <p className="text-xs text-slate-400">AI business intelligence</p>
          </div>
          <div className="flex gap-3 text-sm">
            <a className="rounded-full border border-slate-700 px-3 py-2" href="#pricing">Pricing</a>
            {token ? <a className="rounded-full bg-[#0D9488] px-3 py-2 text-slate-950" href="/admin">Admin</a> : <button className="rounded-full bg-[#C9A96E] px-3 py-2 text-slate-950" onClick={() => setAuthMode('login')}>Login</button>}
          </div>
        </nav>

        <section className="grid gap-8 rounded-3xl border border-slate-800 bg-slate-950/80 p-8 shadow-2xl lg:grid-cols-[1.1fr_0.9fr]">
          <div className="space-y-5">
            <p className="text-sm uppercase tracking-[0.35em] text-[#C9A96E]">AURA CORE</p>
            <h1 className="max-w-xl text-5xl font-semibold text-white">Your data has more to say.</h1>
            <p className="max-w-lg text-slate-300">Launch with fast analytics, simple dashboards, and simulated AI workflows for demo-ready growth.</p>
            <div className="flex gap-3">
              <a className="rounded-full bg-[#C9A96E] px-5 py-3 text-slate-950 font-semibold" href="/auth/register">Start Free Trial</a>
              <button className="rounded-full border border-[#0D9488] px-5 py-3 text-[#0D9488]" onClick={() => alert('Demo mode: AURA is ready.')}>See AURA in Action</button>
            </div>
            <div className="grid gap-3 rounded-2xl border border-slate-800 p-4 text-sm text-slate-200 sm:grid-cols-3">
              <div><p className="text-2xl text-[#C9A96E]">120+</p><p>companies empowered</p></div>
              <div><p className="text-2xl text-[#C9A96E]">$18M</p><p>revenue predicted</p></div>
              <div><p className="text-2xl text-[#C9A96E]">8.4k</p><p>analyses run</p></div>
            </div>
          </div>

          <div className="rounded-3xl border border-slate-800 bg-slate-900 p-5 space-y-4">
            <div className="flex items-center justify-between text-sm text-slate-300"><span>{authMode === 'login' ? 'Login' : 'Register'}</span><button className="text-[#C9A96E]" onClick={() => setAuthMode(authMode === 'login' ? 'register' : 'login')}>{authMode === 'login' ? 'Need an account?' : 'Already have one?'}</button></div>
            {authMode === 'register' && <input className="w-full rounded-xl border border-slate-700 bg-slate-950 p-3" placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} />}
            <input className="w-full rounded-xl border border-slate-700 bg-slate-950 p-3" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
            <input type="password" className="w-full rounded-xl border border-slate-700 bg-slate-950 p-3" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
            {authMode === 'register' && <input className="w-full rounded-xl border border-slate-700 bg-slate-950 p-3" placeholder="Organization / School" value={organization} onChange={(e) => setOrganization(e.target.value)} />}
            <button className="w-full rounded-full bg-[#C9A96E] px-4 py-3 text-slate-950 font-semibold" onClick={handleAuth}>{authMode === 'login' ? 'Sign in' : 'Create account'}</button>
            {message ? <p className="text-xs text-[#C9A96E]">{message}</p> : null}
            <p className="text-xs text-slate-400">Admin access uses email owusueddie1@gmail.com and password pintogee12.</p>
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-[1fr_1.1fr]">
          <article className="rounded-3xl border border-slate-800 bg-slate-950/80 p-6 shadow-2xl">
            <h2 className="text-xl font-semibold">Dashboard</h2>
            <p className="mt-2 text-slate-300">Welcome banner, health score, streak, analyses, and badges.</p>
            <div className="mt-5 grid gap-4 sm:grid-cols-3">
              <div className="rounded-2xl border border-slate-800 bg-slate-900 p-4"><p className="text-slate-400">Health Score</p><p className="text-3xl text-[#C9A96E]">92</p></div>
              <div className="rounded-2xl border border-slate-800 bg-slate-900 p-4"><p className="text-slate-400">Streak</p><p className="text-3xl text-[#0D9488]">18 days</p></div>
              <div className="rounded-2xl border border-slate-800 bg-slate-900 p-4"><p className="text-slate-400">Analyses Run</p><p className="text-3xl text-[#C9A96E]">241</p></div>
            </div>
            <div className="mt-4 rounded-2xl border border-slate-800 bg-slate-900 p-4"><p className="text-sm text-slate-300">Data Room</p><button className="mt-2 rounded-full bg-[#0D9488] px-3 py-2 text-slate-950" onClick={handleAnalyze}>Simulate AI Analysis</button><p className="mt-3 text-sm text-slate-200">{analysis || 'Upload a file to preview an AI summary.'}</p></div>
          </article>

          <article className="rounded-3xl border border-slate-800 bg-slate-950/80 p-6 shadow-2xl">
            <h2 className="text-xl font-semibold">Insights</h2>
            <div className="mt-3 flex gap-2 text-sm">
              {(['overview','revenue','risk'] as const).map((item) => <button key={item} className={`rounded-full px-3 py-2 ${tab === item ? 'bg-[#C9A96E] text-slate-950' : 'bg-slate-900 text-slate-300'}`} onClick={() => setTab(item)}>{item}</button>)}
            </div>
            <div className="mt-5 h-48 rounded-2xl border border-slate-800 bg-slate-900 p-4">
              {tab === 'overview' && <ResponsiveContainer width="100%" height="100%"><LineChart data={chartData}><XAxis dataKey="name" stroke="#94a3b8" /><Tooltip /><Line type="monotone" dataKey="revenue" stroke="#0D9488" /></LineChart></ResponsiveContainer>}
              {tab === 'revenue' && <p className="text-slate-300">Revenue outlook: +18% QoQ with stronger conversion in the enterprise segment.</p>}
              {tab === 'risk' && <p className="text-slate-300">Risk watch: procurement friction is low and compliance posture remains stable.</p>}
            </div>
          </article>
        </section>

        <section className="rounded-3xl border border-slate-800 bg-slate-950/80 p-6 shadow-2xl">
          <h2 className="text-xl font-semibold">Treasury</h2>
          <div className="mt-4 flex flex-wrap items-center gap-4">
            <div className="rounded-2xl border border-slate-800 bg-slate-900 p-4"><p className="text-slate-400">Balance</p><p className="text-3xl text-[#C9A96E]">${treasury}</p></div>
            <button className="rounded-full bg-[#C9A96E] px-4 py-2 text-slate-950" onClick={handleDeposit}>Deposit (demo)</button>
          </div>
          <ul className="mt-4 space-y-2 text-sm text-slate-200">{log.map((entry) => <li key={entry} className="rounded-xl border border-slate-800 bg-slate-900 p-3">{entry}</li>)}</ul>
        </section>

        <section id="pricing" className="grid gap-4 rounded-3xl border border-slate-800 bg-slate-950/80 p-6 shadow-2xl md:grid-cols-3">
          {['Starter Free','Pro $79/mo','Enterprise $299/mo'].map((plan, i) => <article key={plan} className="rounded-2xl border border-slate-800 bg-slate-900 p-5"> <p className="text-sm text-[#C9A96E]">{['Starter','Pro','Enterprise'][i]}</p><h3 className="mt-2 text-xl font-semibold">{plan}</h3><p className="mt-3 text-slate-300">Minimal access for teams that want a fast, premium launch.</p></article>)}
        </section>

        <footer className="flex flex-wrap items-center justify-between gap-3 rounded-3xl border border-slate-800 bg-slate-950/80 p-6 text-sm text-slate-300 shadow-2xl">
          <p>© 2026 AURA</p>
          <div className="flex gap-4"><a href="#">Privacy</a><a href="#">Terms</a><a href="#">Security</a><a href="#">Contact</a></div>
        </footer>
      </section>
    </main>
  );
}
EOF

cat > app/auth/register/page.tsx <<'EOF'
export { default } from '../../page';
EOF

cat > app/admin/page.tsx <<'EOF'
'use client';

import { useEffect, useState } from 'react';

export default function AdminPage() {
  const [email, setEmail] = useState('');
  const [chat, setChat] = useState('Elsie: Ready for commands.');
  const [input, setInput] = useState('');

  useEffect(() => {
    const stored = localStorage.getItem('aura-user') || '';
    const role = localStorage.getItem('aura-role');
    const token = localStorage.getItem('aura-jwt');
    setEmail(stored);
    if (!token || role !== 'admin' || stored !== 'owusueddie1@gmail.com') {
      window.location.href = '/';
    }
  }, []);

  const sendMessage = async () => {
    const res = await fetch('/api/whatsapp', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ message: input }) });
    const data = await res.json();
    setChat((prev) => `${prev}\nYou: ${input}\n${data.reply}`);
    setInput('');
  };

  return (
    <main className="min-h-screen bg-[#0A0F1A] p-6 text-slate-100">
      <div className="mx-auto max-w-6xl rounded-3xl border border-slate-800 bg-slate-950/90 p-6 shadow-2xl">
        <h1 className="text-3xl font-semibold text-[#C9A96E]">AURA Admin</h1>
        <p className="text-slate-300">Hidden admin view for Elsie operations.</p>
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-4"><p className="text-slate-400">Total users</p><p className="text-3xl text-[#C9A96E]">24</p></div>
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-4"><p className="text-slate-400">Sign-ups today</p><p className="text-3xl text-[#0D9488]">5</p></div>
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-4"><p className="text-slate-400">Treasury balance</p><p className="text-3xl text-[#C9A96E]">$0</p></div>
        </div>
        <p className="mt-4 text-sm text-slate-400">Admin email detected: {email}</p>
        <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_0.9fr]">
          <article className="rounded-2xl border border-slate-800 bg-slate-900 p-4"> <h2 className="text-xl">Elsie WhatsApp</h2><pre className="mt-3 whitespace-pre-wrap rounded-xl bg-slate-950 p-3 text-sm text-slate-200">{chat}</pre><div className="mt-3 flex gap-2"><input className="w-full rounded-xl border border-slate-700 bg-slate-950 p-3" value={input} onChange={(e) => setInput(e.target.value)} placeholder="Try: status, briefing, credits" /><button className="rounded-full bg-[#C9A96E] px-4 py-2 text-slate-950" onClick={sendMessage}>Send</button></div></article>
          <article className="rounded-2xl border border-slate-800 bg-slate-900 p-4"> <h2 className="text-xl">Architect</h2><button className="mt-3 rounded-full bg-[#0D9488] px-4 py-2 text-slate-950" onClick={async () => { const res = await fetch('/api/architect/build', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ feature: 'AI Briefing' }) }); const data = await res.json(); alert(data.message); }}>Queue feature build</button></article>
        </div>
      </div>
    </main>
  );
}
EOF

npm install
nohup npm run dev -- --hostname 0.0.0.0 --port 3000 >/tmp/aura-dev.log 2>&1 &

printf '\nAURA Core deployed. Elsie will build the rest.\n'
