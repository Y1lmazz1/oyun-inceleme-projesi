'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { User } from '@supabase/supabase-js'; // User tipini ekledik

export default function Navbar() {
  // any yerine User | null kullanarak tip güvenliği sağladık
  const [user, setUser] = useState<User | null>(null);
  const router = useRouter();

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };
    getUser();

    // Oturum değişikliklerini dinleyen mekanizma
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (!error) {
      setUser(null);
      router.push('/');
      router.refresh(); // Sayfayı yenileyerek state'leri temizle
    }
  };

  return (
    <nav className="bg-[#0f172a] border-b border-slate-800 p-4 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <Link href="/" className="text-xl font-black italic bg-linear-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent hover:opacity-80 transition">
          OYUNİNCELE
        </Link>
        
        <div className="flex gap-4 items-center">
          {user ? (
            <>
              <Link href="/admin" className="text-sm text-slate-300 hover:text-white transition font-medium">
                Admin Paneli
              </Link>
              <button 
                onClick={handleLogout}
                className="bg-red-500/10 text-red-500 px-4 py-2 rounded-xl text-sm font-bold hover:bg-red-600 hover:text-white transition-all active:scale-95"
              >
                Çıkış Yap
              </button>
            </>
          ) : (
            <Link href="/login" className="bg-purple-600 text-white px-6 py-2 rounded-xl text-sm font-bold hover:bg-purple-700 transition-all active:scale-95 shadow-lg shadow-purple-500/20">
              Giriş Yap
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}