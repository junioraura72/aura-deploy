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

export default function Home({ initialMode = 'login' }: { initialMode?: 'login' | 'register' }) {
  const [tab, setTab] = useState<'overview' | 'revenue' | 'risk'>('overview');
  const [authMode, setAuthMode] = useState<'login' | 'register'>(initialMode);
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

  useEffect(() => {
    setAuthMode(initialMode);
  }, [initialMode]);

  const storeSession = (jwt: string, email: string, role: string) => {
    localStorage.setItem('aura-jwt', jwt);
    localStorage.setItem('aura-user', email);
    localStorage.setItem('aura-role', role);
    setToken(jwt);
  };

  const handleAuth = async () => {
    setMessage('');
    const safeEmail = email.trim().toLowerCase();
    const safeName = name.trim();
    const safeOrganization = organization.trim();

    if (!safeEmail || password.length < 8 || (authMode === 'register' && (!safeName || !safeOrganization))) {
      setMessage('Please enter a valid email, a password of at least 8 characters, and complete your name and organization.');
      return;
    }

    const res = await fetch(`/api/auth/${authMode}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: safeName, email: safeEmail, password, organization: safeOrganization })
    });
    const data = await res.json();

    if (!res.ok) {
      setMessage(data.error || 'Authentication failed.');
      return;
    }

    if (authMode === 'login') {
      storeSession(data.token, data.email, data.role || 'user');
      setMessage('Signed in successfully.');
      if (data.role === 'admin') {
        window.location.replace('/secret-admin');
        return;
      }
      window.location.replace('/');
      return;
    }

    const loginRes = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: safeEmail, password })
    });
    const loginData = await loginRes.json();

    if (!loginRes.ok) {
      setMessage('Account created. Please sign in with your new credentials.');
      setAuthMode('login');
      return;
    }

    storeSession(loginData.token, loginData.email, loginData.role || 'user');
    setMessage('Account created and you are now signed in.');
    if (loginData.role === 'admin') {
      window.location.replace('/secret-admin');
      return;
    }
    window.location.replace('/');
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
            {token ? <span className="rounded-full border border-slate-700 px-3 py-2 text-slate-200">Signed in</span> : <button className="rounded-full bg-[#C9A96E] px-3 py-2 text-slate-950" onClick={() => setAuthMode('login')}>Login</button>}
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
            <p className="text-xs text-slate-500">Use the public sign-in form for standard access.</p>
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
