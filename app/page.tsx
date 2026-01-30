'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { User } from '@supabase/supabase-js';

// 1. Oyun Verisi İçin Güçlü Tip Tanımı
interface Oyun {
  id: number;
  ad: string;
  ozet: string;
  resim_url: string;
  puan: number;
  tur: string;
  created_at?: string;
}

export default function Home() {
  // 2. State Tanımları (Any içermez)
  const [oyunlar, setOyunlar] = useState<Oyun[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Oyunları Getir
        const { data: oyunData, error: oyunError } = await supabase
          .from('oyunlar')
          .select('*')
          .order('id', { ascending: true });
        
        if (oyunError) throw oyunError;

        // Oturum Durumunu Getir
        const { data: { user: authUser } } = await supabase.auth.getUser();

        setOyunlar((oyunData as Oyun[]) || []);
        setUser(authUser);
      } catch (error) {
        console.error("Veri yüklenirken bir hata oluştu:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // 3. Filtreleme Mantığı
  const filteredOyunlar = oyunlar.filter((oyun) =>
    oyun.ad.toLowerCase().includes(searchTerm.toLowerCase()) ||
    oyun.tur.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Yükleme Ekranı
  if (loading) {
    return (
      <div className="min-h-screen bg-[#0f172a] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0f172a] text-slate-200">
      <main className="max-w-6xl mx-auto py-12 px-6">
        
        {/* Başlık ve Arama Çubuğu Alanı */}
        <header className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-2">
            <h2 className="text-4xl font-black text-white tracking-tight">İncelediğim Oyunlar</h2>
            <p className="text-slate-400">En son deneyimlediğim oyunlar ve detaylı görüşlerim.</p>
          </div>

          <div className="relative w-full md:w-80">
            <input
              type="text"
              placeholder="Oyun veya tür ara..."
              className="w-full bg-slate-800/50 border border-slate-700 rounded-2xl py-3 px-11 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all placeholder:text-slate-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <span className="absolute left-4 top-3.5 text-slate-500">🔍</span>
          </div>
        </header>

        {/* Oyun Kartları Grid Yapısı */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredOyunlar.length > 0 ? (
            filteredOyunlar.map((oyun) => (
              <Link href={`/oyun/${oyun.id}`} key={oyun.id} className="group">
                <div className="bg-slate-800/40 rounded-3xl p-5 border border-slate-700 hover:border-purple-500/50 transition-all h-full backdrop-blur-sm flex flex-col shadow-xl hover:shadow-purple-500/10">
                  
                  {/* Oyun Resmi */}
                  <div className="relative w-full h-52 mb-5 overflow-hidden rounded-2xl border border-slate-700 bg-slate-900">
                    <Image 
                      src={oyun.resim_url || '/placeholder-game.png'} 
                      alt={oyun.ad} 
                      fill 
                      className="object-cover group-hover:scale-110 transition-transform duration-700" 
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
                      <span className="text-white text-sm font-bold">DETAYLARI GÖR →</span>
                    </div>
                  </div>

                  {/* Oyun Metin Bilgileri */}
                  <h3 className="text-2xl font-bold group-hover:text-purple-400 transition-colors mb-2">{oyun.ad}</h3>
                  <p className="text-sm text-slate-400 line-clamp-3 mb-6 flex-grow leading-relaxed italic">
                    {oyun.ozet}
                  </p>
                  
                  {/* Alt Bilgi Çubuğu (Puan ve Tür) */}
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
            ))
          ) : (
            <div className="col-span-full text-center py-20 bg-slate-800/10 rounded-3xl border border-dashed border-slate-700">
              <p className="text-slate-500 text-lg">{searchTerm} aramasına uygun oyun bulunamadı.</p>
              <button 
                onClick={() => setSearchTerm('')}
                className="mt-4 text-purple-400 hover:text-purple-300 underline text-sm"
              >
                Aramayı temizle
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}