'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter, usePathname } from 'next/navigation';
import { User } from '@supabase/supabase-js'; 
import { motion } from 'framer-motion';

export default function Navbar() {
  const [user, setUser] = useState<User | null>(null);
  const router = useRouter();
  const pathname = usePathname();

  const isAdminPage = pathname?.startsWith('/admin');

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };
    getUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (!error) {
      setUser(null);
      router.push('/');
      router.refresh(); 
    }
  };


  if (isAdminPage) return null;

  const navLinks = [
  { isim: 'KEŞFET', href: '/' },
  { isim: 'HAKKIMIZDA', href: '/hakkimda' },
  { isim: 'ETKİNLİK', href: '/quiz', isNew: true },
  { isim: 'İLETİŞİM', href: '/iletisim' },
];

  return (
    <nav className="absolute top-0 left-0 right-0 z-[100] px-6 py-6">
      <div className="max-w-7xl mx-auto flex justify-between items-center bg-slate-900/60 backdrop-blur-xl border border-white/5 p-3 rounded-[2rem] shadow-2xl">
        
        {/* LOGO */}
        <Link href="/" className="group pl-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-purple-600 to-pink-600 rounded-lg flex items-center justify-center shadow-lg group-hover:rotate-12 transition-transform">
              <span className="text-white font-black italic">R</span>
            </div>
            <span className="text-xl font-black italic tracking-tighter text-white group-hover:text-purple-400 transition-colors">
              RADAR<span className="text-purple-500">.</span>
            </span>
          </div>
        </Link>

        <div className="hidden md:flex gap-8 items-center bg-white/5 px-6 py-2 rounded-2xl border border-white/5">
          {navLinks.map((link) => {
  const isActive = pathname === link.href;
  return (
    <Link key={link.href} href={link.href} className="relative group flex items-center gap-1">
      <span className={`text-[10px] font-black tracking-[0.2em] transition-colors ${
        isActive ? 'text-purple-400' : 'text-slate-400 group-hover:text-white'
      }`}>
        {link.isim}
      </span>
      
    
      {link.isNew && (
        <span className="flex h-2 w-2 relative">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-purple-500"></span>
        </span>
      )}

      {isActive && (
        <motion.div 
          layoutId="navUnderline"
          className="absolute -bottom-1 left-0 right-0 h-0.5 bg-purple-500 rounded-full"
        />
      )}
    </Link>
  );
})}
        </div>

 
        <div className="flex gap-3 items-center pr-2">
          {user ? (
            <>
              <Link href="/admin" className="text-[10px] font-black tracking-widest text-slate-400 hover:text-white transition uppercase mr-2">
                Panel
              </Link>
              <button 
                onClick={handleLogout}
                className="bg-red-500/10 text-red-500 px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all active:scale-95 border border-red-500/20"
              >
                Çıkış
              </button>
            </>
          ) : (
            <Link href="/login" className="bg-purple-600 text-white px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-purple-700 transition-all active:scale-95 shadow-lg shadow-purple-500/20">
              Giriş
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}