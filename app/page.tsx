'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { motion, AnimatePresence } from 'framer-motion';

interface Oyun {
  id: number;
  ad: string;
  ozet: string;
  resim_url: string;
  puan: number;
  tur: string;
}

export default function Home() {
  const [oyunlar, setOyunlar] = useState<Oyun[]>([]);
  const [filteredOyunlar, setFilteredOyunlar] = useState<Oyun[]>([]);
  const [aktifKategori, setAktifKategori] = useState('Tümü');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [featuredGame, setFeaturedGame] = useState<Oyun | null>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  const kategoriler = ['Tümü', 'RPG', 'Aksiyon', 'FPS', 'Korku', 'Macera', 'Sandbox'];

  useEffect(() => {
    const fetchData = async () => {
      const { data: oyunData } = await supabase.from('oyunlar').select('*').order('puan', { ascending: false });
      const data = (oyunData as Oyun[]) || [];
      setOyunlar(data);
      setFilteredOyunlar(data);
      setLoading(false);
      if (data.length > 0) setFeaturedGame(data[0]);
    };
    fetchData();

    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({ x: (e.clientX - window.innerWidth / 2) / 50, y: (e.clientY - window.innerHeight / 2) / 50 });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  useEffect(() => {
    let result = oyunlar;
    if (aktifKategori !== 'Tümü') result = result.filter((oyun) => oyun.tur === aktifKategori);
    if (searchTerm) {
      result = result.filter((oyun) =>
        oyun.ad.toLowerCase().includes(searchTerm.toLowerCase()) ||
        oyun.tur.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    setFilteredOyunlar(result);
  }, [aktifKategori, searchTerm, oyunlar]);

  if (loading) return (
    <div className="min-h-screen bg-[#020617] flex items-center justify-center">
      <motion.div 
        animate={{ rotate: 360, scale: [1, 1.2, 1] }}
        transition={{ duration: 1.5, repeat: Infinity }}
        className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full shadow-[0_0_20px_#a855f7]"
      />
    </div>
  );
  

  return (

    <div className="min-h-screen bg-transparent text-slate-200 overflow-x-hidden selection:bg-purple-500/30">
      

      <div className="fixed inset-0 z-[-5] overflow-hidden pointer-events-none">
        <motion.div 
          animate={{ 
            x: mousePos.x * 1.5, 
            y: mousePos.y * 1.5,
          }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="absolute top-[-10%] right-[-10%] w-[60%] h-[60%] bg-purple-600/10 blur-[150px] rounded-full"
        />
        <motion.div 
          animate={{ 
            x: -mousePos.x, 
            y: -mousePos.y 
          }}
          className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-900/10 blur-[120px] rounded-full"
        />
      </div>

      <main className="max-w-7xl mx-auto py-16 px-6 relative z-10">

        {featuredGame && (
          <motion.section 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative w-full h-[65vh] md:h-[80vh] bg-slate-900/40 rounded-[3.5rem] overflow-hidden mb-24 border border-white/5 shadow-2xl group"
          >
            <Image 
              src={featuredGame.resim_url}
              alt={featuredGame.ad}
              fill
              className="object-cover object-top opacity-40 group-hover:opacity-60 transition-opacity duration-1000"
              unoptimized
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#020617] via-transparent to-transparent opacity-95" />
            
            <div className="absolute bottom-16 left-8 md:left-16 right-8 md:right-16 text-white">
              <motion.span 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="text-[10px] font-black tracking-[0.5em] uppercase text-purple-400 mb-6 block"
              >
                📡 YÜKSEK FREKANSLI ANALİZ
              </motion.span>
              <h2 className="text-6xl md:text-8xl font-black italic uppercase tracking-tighter leading-none mb-6">
                {featuredGame.ad}
              </h2>
              <p className="text-xl md:text-2xl text-slate-300 italic max-w-3xl line-clamp-2 mb-10 opacity-80 leading-relaxed">
                {featuredGame.ozet?.replace(/<[^>]*>/g, '')}
              </p>
              <Link href={`/oyun/${featuredGame.id}`}>
                <motion.button 
                  whileHover={{ scale: 1.05, boxShadow: "0 0 30px rgba(168,85,247,0.4)" }}
                  whileTap={{ scale: 0.95 }}
                  className="px-12 py-5 bg-white text-black rounded-2xl font-black uppercase tracking-[0.3em] text-xs transition-colors hover:bg-purple-500 hover:text-white"
                >
                  SİNYALİ TAKİP ET →
                </motion.button>
              </Link>
            </div>
          </motion.section>
        )}

<Link href="/quiz">
  <div className="bg-gradient-to-r from-purple-900/40 to-pink-900/40 border border-purple-500/30 p-8 rounded-[3rem] text-center hover:scale-[1.02] transition-transform cursor-pointer shadow-2xl shadow-purple-500/10">
    <h3 className="text-sm font-black text-purple-400 tracking-[0.3em] mb-2 uppercase">Radar Algoritması Hazır</h3>
    <h2 className="text-3xl font-black italic">HANGİ OYUN KARAKTERİSİN?</h2>
    <p className="text-slate-400 mt-2 font-bold text-xs uppercase tracking-widest">Kişiliğini analiz edelim, evrenini bulalım.</p>
  </div>
</Link>


        <header className="mb-20 space-y-12 text-center">
          <h1 className="text-7xl md:text-8xl font-black text-white tracking-tighter italic uppercase">
            OYUN <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-600">RADARI</span>
          </h1>

          <div className="sticky top-10 z-50 flex flex-col items-center gap-8">
            <div className="bg-slate-900/60 backdrop-blur-3xl border border-white/10 p-2 rounded-[3rem] flex flex-wrap justify-center gap-2 shadow-2xl">
              {kategoriler.map((kat) => (
                <button
                  key={kat}
                  onClick={() => setAktifKategori(kat)}
                  className={`px-8 py-4 rounded-[2.5rem] text-[10px] font-black tracking-widest uppercase transition-all ${
                    aktifKategori === kat 
                    ? 'bg-white text-black shadow-xl' 
                    : 'hover:bg-white/10 text-slate-400 hover:text-white'
                  }`}
                >
                  {kat}
                </button>
              ))}
            </div>

            <div className="relative w-full max-w-lg">
              <input
                type="text"
                placeholder="EVRENDE İZ SÜR..."
                className="w-full bg-slate-900/40 border border-white/10 rounded-2xl py-5 px-14 focus:outline-none focus:border-purple-500 transition-all text-xs font-bold tracking-widest italic"
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <span className="absolute left-6 top-5 opacity-40">🔍</span>
            </div>
          </div>
        </header>


        <motion.div 
          layout
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10"
        >
          <AnimatePresence mode='popLayout'>
            {filteredOyunlar.map((oyun) => (
              <motion.div
                key={oyun.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                whileHover={{ y: -10 }}
                className="group bg-slate-900/20 border border-white/5 rounded-[3rem] p-4 hover:border-purple-500/50 transition-all"
              >
                <Link href={`/oyun/${oyun.id}`}>
                  <div className="relative h-72 mb-6 overflow-hidden rounded-[2.5rem]">
                    <Image 
                      src={oyun.resim_url || '/placeholder.png'} 
                      alt={oyun.ad} 
                      fill 
                      className="object-cover transition-transform duration-700 group-hover:scale-110"
                      unoptimized 
                    />
                    <div className="absolute top-4 right-6 bg-black/60 backdrop-blur-md px-4 py-2 rounded-full border border-white/10">
                      <span className="text-yellow-400 font-black text-sm">⭐ {oyun.puan}</span>
                    </div>
                  </div>

                  <div className="px-4 pb-4">
                    <span className="text-[9px] font-black text-purple-500 tracking-[0.3em] uppercase mb-2 block">{oyun.tur}</span>
                    <h3 className="text-3xl font-black text-white italic uppercase tracking-tighter mb-4 group-hover:text-purple-400 transition-colors">
                      {oyun.ad}
                    </h3>
                    <p className="text-slate-400 text-sm line-clamp-2 italic mb-6 leading-relaxed">
                      {oyun.ozet?.replace(/<[^>]*>/g, '')}
                    </p>
                    <div className="w-full h-px bg-white/5 group-hover:bg-purple-500/30 transition-colors" />
                  </div>
                </Link>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      </main>
    </div>
  );
}