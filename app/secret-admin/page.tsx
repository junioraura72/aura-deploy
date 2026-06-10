'use client';

import { useEffect, useState } from 'react';

export default function SecretAdminPage() {
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
      return;
    }
  }, []);

  const sendMessage = async () => {
    const res = await fetch('/api/whatsapp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: input })
    });
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
          <article className="rounded-2xl border border-slate-800 bg-slate-900 p-4">
            <h2 className="text-xl">Elsie WhatsApp</h2>
            <pre className="mt-3 whitespace-pre-wrap rounded-xl bg-slate-950 p-3 text-sm text-slate-200">{chat}</pre>
            <div className="mt-3 flex gap-2">
              <input className="w-full rounded-xl border border-slate-700 bg-slate-950 p-3" value={input} onChange={(e) => setInput(e.target.value)} placeholder="Try: status, briefing, credits" />
              <button className="rounded-full bg-[#C9A96E] px-4 py-2 text-slate-950" onClick={sendMessage}>Send</button>
            </div>
          </article>

          <article className="rounded-2xl border border-slate-800 bg-slate-900 p-4">
            <h2 className="text-xl">Architect</h2>
            <button
              className="mt-3 rounded-full bg-[#0D9488] px-4 py-2 text-slate-950"
              onClick={async () => {
                const res = await fetch('/api/architect/build', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ feature: 'AI Briefing' })
                });
                const data = await res.json();
                alert(data.message);
              }}
            >
              Queue feature build
            </button>
          </article>
        </div>
      </div>
    </main>
  );
}
