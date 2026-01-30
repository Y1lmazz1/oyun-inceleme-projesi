'use client';
import { useState } from 'react';
import { supabase } from '@/lib/supabase';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [yukleniyor, setYukleniyor] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setYukleniyor(true);

    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      alert("Hata: " + error.message);
      setYukleniyor(false);
    } else {
      window.location.href = '/admin'; 
    }
  };

  return (
    <div className="min-h-screen bg-[#0f172a] flex items-center justify-center p-6">
      <form 
        onSubmit={handleLogin} 
        className="bg-slate-800 p-8 rounded-3xl border border-slate-700 space-y-6 w-full max-w-md shadow-2xl"
      >
        <div className="text-center">
          <h1 className="text-3xl font-black text-white mb-2">Admin Girişi</h1>
          <p className="text-slate-400 text-sm">Panel erişimi için kimlik doğrulaması gerekli</p>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-slate-400 text-xs font-bold uppercase ml-1">E-Posta</label>
            <input 
              type="email" 
              className="w-full p-4 rounded-xl bg-slate-900 border border-slate-700 text-white outline-none focus:border-purple-500 transition-all mt-1" 
              onChange={(e) => setEmail(e.target.value)} 
              required
            />
          </div>

          <div>
            <label className="text-slate-400 text-xs font-bold uppercase ml-1">Şifre</label>
            <input 
              type="password" 
              className="w-full p-4 rounded-xl bg-slate-900 border border-slate-700 text-white outline-none focus:border-purple-500 transition-all mt-1" 
              onChange={(e) => setPassword(e.target.value)} 
              required
            />
          </div>
        </div>

        <button 
          disabled={yukleniyor}
          className="w-full bg-purple-600 p-4 rounded-xl font-bold text-white hover:bg-purple-500 transition-all active:scale-95 shadow-lg shadow-purple-500/20 disabled:opacity-50"
        >
          {yukleniyor ? 'Giriş Yapılıyor...' : 'Sisteme Giriş Yap'}
        </button>
      </form>
    </div>
  );
}