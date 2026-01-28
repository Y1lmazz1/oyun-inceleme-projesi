import Image from 'next/image';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';

export const revalidate = 0;

export default async function Home() {
  // 1. Veritabanından oyunları çekiyoruz
  const { data: oyunlar, error } = await supabase
    .from('oyunlar')
    .select('*')
    .order('id', { ascending: true });

  // 2. ADMİN KONTROLÜ: Supabase'e "Şu an kimse giriş yapmış mı?" diye soruyoruz
  const { data: { user } } = await supabase.auth.getUser();
  const isAdmin = !!user; // Kullanıcı varsa true, yoksa false olur.

  if (error) return <div className="p-10 text-white">Veritabanı Hatası: {error.message}</div>;

  return (
    <div className="min-h-screen bg-[#0f172a] text-slate-200">
      {/* NAVİGASYON */}
      <nav className="p-6 border-b border-slate-800 flex justify-between items-center backdrop-blur-md sticky top-0 z-50">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-600 bg-clip-text text-transparent">
          GameCritique
        </h1>
        
        {/* SADECE ADMİN GİRİŞ YAPTIYSA "OYUN EKLE" BUTONUNU GÖSTER */}
        {isAdmin && (
          <div className="flex items-center gap-4">
            <span className="text-[10px] bg-green-500/10 text-green-500 px-2 py-1 rounded border border-green-500/20 font-bold">ADMİN PANELİ</span>
            <Link href="/admin" className="bg-purple-600 px-4 py-2 rounded-lg hover:bg-purple-700 transition shadow-lg shadow-purple-500/20 text-white font-semibold">
              + Oyun Ekle
            </Link>
          </div>
        )}
      </nav>

      <main className="max-w-6xl mx-auto py-12 px-6">
        <header className="mb-12">
          <h2 className="text-4xl font-black text-white mb-2">İncelediğim Oyunlar</h2>
          <p className="text-slate-400">En son deneyimlediğim oyunlar ve detaylı görüşlerim.</p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {oyunlar?.map((oyun) => (
            <Link href={`/oyun/${oyun.id}`} key={oyun.id} className="group">
              <div className="bg-slate-800/40 rounded-3xl p-5 border border-slate-700 hover:border-purple-500/50 transition-all h-full backdrop-blur-sm flex flex-col shadow-xl hover:shadow-purple-500/10">
                {/* OYUN RESMİ */}
                <div className="relative w-full h-52 mb-5 overflow-hidden rounded-2xl border border-slate-700">
                  <Image 
                    src={oyun.resim_url} 
                    alt={oyun.ad} 
                    fill 
                    className="object-cover group-hover:scale-110 transition-transform duration-700 ease-in-out" 
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
                    <span className="text-white text-sm font-bold tracking-wider">DETAYLARI GÖR →</span>
                  </div>
                </div>

                {/* OYUN BİLGİLERİ */}
                <h3 className="text-2xl font-bold group-hover:text-purple-400 transition-colors mb-2">{oyun.ad}</h3>
                <p className="text-sm text-slate-400 line-clamp-3 mb-6 flex-grow leading-relaxed">
                  {oyun.ozet}
                </p>
                
                {/* ALT BİLGİLER */}
                <div className="flex justify-between items-center mt-auto pt-4 border-t border-slate-700/50">
                  <div className="flex items-center gap-2">
                    <span className="text-yellow-400">⭐</span>
                    <span className="text-white font-black text-lg">{oyun.puan}</span>
                    <span className="text-slate-500 text-xs mt-1">/ 10</span>
                  </div>
                  <span className="text-[10px] bg-slate-900 px-3 py-1.5 rounded-full text-purple-300 font-bold border border-slate-800 tracking-widest uppercase">
                    {oyun.tur}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
}