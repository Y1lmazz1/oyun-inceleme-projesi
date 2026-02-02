'use client';
import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { motion } from 'framer-motion';

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
    <main className="min-h-screen bg-transparent flex flex-col items-center justify-center p-6 relative z-10">
      {/* Üst Logo Barı */}
      <div className="absolute top-10 w-full max-w-7xl px-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center font-black text-white italic shadow-lg shadow-purple-500/20">R</div>
            <h1 className="text-xl font-black tracking-tighter text-white italic uppercase">RADAR<span className="text-purple-500">.</span></h1>
          </div>
        </div>
      </div>

      {/* Giriş Formu Kartı */}
      <motion.form 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        onSubmit={handleLogin} 
        className="bg-slate-900/40 backdrop-blur-2xl p-12 rounded-[3.5rem] border border-white/10 space-y-8 w-full max-w-md shadow-2xl"
      >
        <div className="text-center">
          <h1 className="text-4xl font-black text-white mb-2 italic tracking-tighter uppercase">Admin <span className="text-purple-500">Girişi</span></h1>
          <p className="text-slate-400 text-xs font-bold tracking-widest uppercase opacity-50">Güvenli Sinyal Hattı</p>
        </div>

        <div className="space-y-5">
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 ml-2">E-Posta</label>
            <input 
              type="email" 
              required
              placeholder="adres@radar.com"
              className="w-full bg-black/40 border border-white/5 p-4 rounded-2xl text-white outline-none focus:border-purple-500 transition-all italic text-sm" 
              onChange={(e) => setEmail(e.target.value)} 
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 ml-2">Şifreleme</label>
            <input 
              type="password" 
              required
              placeholder="••••••••"
              className="w-full bg-black/40 border border-white/5 p-4 rounded-2xl text-white outline-none focus:border-purple-500 transition-all italic text-sm" 
              onChange={(e) => setPassword(e.target.value)} 
            />
          </div>
        </div>

        <motion.button 
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          disabled={yukleniyor}
          className="w-full bg-gradient-to-r from-purple-600 to-blue-600 p-5 rounded-2xl font-black text-[10px] uppercase tracking-[0.3em] text-white shadow-xl shadow-purple-500/20 transition-all"
        >
          {yukleniyor ? 'BAĞLANILIYOR...' : 'SİSTEME GİRİŞ YAP'}
        </motion.button>
      </motion.form>
    </main>
  );
}