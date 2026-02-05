'use client';

import { useEffect, useState, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';

// --- SENİN ARKAPLAN PARÇACIK BİLEŞENİN ---
function BackgroundParticles() {
  const [mounted, setMounted] = useState(false);
  const [particles, setParticles] = useState<{ id: number; x: number; y: number; size: number; duration: number; delay: number }[]>([]);

  useEffect(() => {
    setMounted(true);
    const newParticles = Array.from({ length: 50 }).map((_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 4 + 2, 
      duration: Math.random() * 10 + 10, 
      delay: Math.random() * 5,
    }));
    setParticles(newParticles);
  }, []);

  if (!mounted) return null;

  return (
    <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute rounded-full"
          style={{
            width: p.size,
            height: p.size,
            left: `${p.x}%`,
            top: `${p.y}%`,
            backgroundColor: '#a855f7', 
            boxShadow: '0 0 8px 2px rgba(168, 85, 247, 0.4)',
          }}
          animate={{
            y: [0, -120, 0],
            x: [0, 30, 0],
            opacity: [0.2, 0.8, 0.2],
            scale: [1, 1.5, 1],
          }}
          transition={{
            duration: p.duration,
            repeat: Infinity,
            delay: p.delay,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
}

// --- ANA SAYFA BİLEŞENİ ---
interface Oyun {
  id: number;
  ad: string;
  ozet: string;
  resim_url: string;
  puan: number;
  tur: string;
}

interface Etkinlik {
  id: number;
  baslik: string;
  ozet: string;
  link: string;
  etiket: string;
  color: string;
}

// Yeni Eklenen Yorum Interface'i
interface Yorum {
  id: number;
  kullanici: string;
  mesaj: string;
  avatar: string;
}

export default function Home() {
  const [oyunlar, setOyunlar] = useState<Oyun[]>([]);
  const [aktifKategori, setAktifKategori] = useState('Tümü');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [loadingMore, setLoadingMore] = useState<boolean>(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  const [heroIndex, setHeroIndex] = useState(0);
  const [eventIndex, setEventIndex] = useState(0);
  const [yorumIndex, setYorumIndex] = useState(0); // Yeni State

  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const ITEMS_PER_PAGE = 6;

  const { scrollY } = useScroll();
  const backgroundY = useTransform(scrollY, [0, 500], [0, 150]);

  const kategoriler = ['Tümü', 'RPG', 'Aksiyon', 'FPS', 'Korku', 'Macera', 'Sandbox'];

  const etkinlikler: Etkinlik[] = [
    { id: 1, baslik: "SİNYAL ANALİZİ", ozet: "Yapay zeka destekli algoritmalarla oyun dünyasının en derin verilerini ve istatistiklerini keşfet.", link: "/etkinlikler", etiket: "NEBULA SİSTEMİ", color: "from-cyan-500 to-blue-600" },
    { id: 2, baslik: "KADER TAHMİNİ", ozet: "Sıradaki favori oyunun hangisi olacak? Kişisel tercihlerini dijital bir kehanete dönüştür.", link: "/etkinlikler", etiket: "TAHMİN MOTORU", color: "from-purple-500 to-pink-600" },
    { id: 3, baslik: "ZAMANIN RUHU", ozet: "Oyun tarihinin kırılma noktalarına yolculuk yap ve gelecek projeksiyonlarını incele.", link: "/etkinlikler", etiket: "KRONOLOJİ", color: "from-blue-500 to-indigo-600" },
    { id: 4, baslik: "ŞANS ÇARKI", ozet: "Kararsız mı kaldın? Sinyali başlat ve kaderin senin için bir oyun seçmesine izin ver.", link: "/etkinlikler", etiket: "DİJİTAL ŞANS", color: "from-emerald-500 to-cyan-600" }
  ];

  // Statik Yorum Verileri
  const yorumlar: Yorum[] = [
    { id: 1, kullanici: "@tech_nomad", mesaj: "Radar sayesinde tam aradığım o indie RPG'yi buldum. Tahmin motoru gerçekten çalışıyor!", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=1" },
    { id: 2, kullanici: "@cyber_ghost", mesaj: "Arayüz tasarımı büyüleyici. Oyun detayları ve puanlamalar çok tutarlı.", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=2" },
    { id: 3, kullanici: "@pixel_queen", mesaj: "Sinyal analizi özelliği oyun dünyasına bakış açımı değiştirdi. Harika bir iş!", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=3" }
  ];

  const getScoreStyle = (puan: number) => {
    if (puan >= 90) return "border-yellow-500/40 shadow-[0_0_20px_rgba(234,179,8,0.1)] text-yellow-500";
    if (puan < 70) return "border-slate-800 opacity-60 text-slate-500";
    return "border-white/10 text-purple-400";
  };

  const fetchData = useCallback(async (currentPage: number, isInitial = false, kategori = 'Tümü', search = '') => {
    if (isInitial) setLoading(true);
    else setLoadingMore(true);

    const from = currentPage * ITEMS_PER_PAGE;
    const to = from + ITEMS_PER_PAGE - 1;

    let query = supabase.from('oyunlar').select('*', { count: 'exact' }).order('puan', { ascending: false });
    if (kategori !== 'Tümü') query = query.eq('tur', kategori);
    if (search.trim() !== '') query = query.or(`ad.ilike.%${search}%,tur.ilike.%${search}%`);

    const { data, count } = await query.range(from, to);
    const newGames = (data as Oyun[]) || [];
    
    if (isInitial) setOyunlar(newGames);
    else {
      setOyunlar(prev => {
        const existingIds = new Set(prev.map(game => game.id));
        const uniqueNewGames = newGames.filter(game => !existingIds.has(game.id));
        return [...prev, ...uniqueNewGames];
      });
    }

    setHasMore(count !== null && from + newGames.length < count);
    setLoading(false);
    setLoadingMore(false);
  }, []);

  useEffect(() => {
    setPage(0);
    fetchData(0, true, aktifKategori, searchTerm);
  }, [aktifKategori, searchTerm, fetchData]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({ 
        x: (e.clientX - window.innerWidth / 2) / 40, 
        y: (e.clientY - window.innerHeight / 2) / 40 
      });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  useEffect(() => {
    if (oyunlar.length > 0) {
      const heroTimer = setInterval(() => setHeroIndex((prev) => (prev + 1) % Math.min(oyunlar.length, 5)), 6000);
      return () => clearInterval(heroTimer);
    }
  }, [oyunlar]);

  useEffect(() => {
    const eventTimer = setInterval(() => {
        setEventIndex((prev) => (prev + 1) % etkinlikler.length);
        setYorumIndex((prev) => (prev + 1) % yorumlar.length); // Yorumlar da dönsün
    }, 8000);
    return () => clearInterval(eventTimer);
  }, [etkinlikler.length]);

  const loadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchData(nextPage, false, aktifKategori, searchTerm);
  };

  if (loading) return (
    <div className="min-h-screen bg-[#020617] flex items-center justify-center">
      <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin shadow-[0_0_20px_#a855f7]" />
    </div>
  );

  return (
    <div className="min-h-screen bg-[#020617] text-slate-200 overflow-x-hidden selection:bg-purple-500/30">
      
      {/* --- ARKA PLAN KATMANLARI --- */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        <BackgroundParticles />
        <motion.div 
          style={{ x: mousePos.x, y: mousePos.y }}
          className="absolute top-[-10%] right-[-10%] w-[70%] h-[70%] bg-purple-600/10 blur-[140px] rounded-full mix-blend-screen" 
        />
        <motion.div 
          style={{ x: -mousePos.x * 1.5, y: -mousePos.y * 1.5, translateY: backgroundY }}
          className="absolute bottom-[-5%] left-[-5%] w-[50%] h-[50%] bg-blue-600/10 blur-[120px] rounded-full mix-blend-overlay" 
        />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-50 contrast-150 pointer-events-none" />
      </div>

      <main className="max-w-7xl mx-auto py-16 px-6 relative z-10">
        
        {/* HERO SECTION */}
        {oyunlar.length > 0 && !searchTerm && (
          <section className="relative w-full h-[80vh] bg-slate-900/40 rounded-[4rem] overflow-hidden mb-24 border border-white/5 shadow-2xl group">
            <AnimatePresence mode="wait">
              <motion.div
                key={oyunlar[heroIndex]?.id}
                initial={{ opacity: 0, scale: 1.1 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
                className="absolute inset-0"
              >
                <Image src={oyunlar[heroIndex]?.resim_url} alt="Hero" fill className="object-cover opacity-60 transition-transform duration-[10s] group-hover:scale-110" unoptimized />
                <div className="absolute inset-0 bg-gradient-to-r from-[#020617] via-[#020617]/40 to-transparent" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#020617] via-transparent to-transparent" />
                <div className="absolute bottom-20 left-12 md:left-24 z-20 max-w-2xl">
                  <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 }}>
                    <span className="bg-purple-500 text-[10px] font-black uppercase tracking-[0.3em] px-4 py-1.5 rounded-full mb-6 inline-block">
                      {oyunlar[heroIndex]?.tur}
                    </span>
                    <h2 className="text-6xl md:text-[7rem] font-black italic uppercase tracking-tighter mb-8 text-white leading-[0.9] drop-shadow-2xl">
                      {oyunlar[heroIndex]?.ad}
                    </h2>
                    <Link href={`/oyun/${oyunlar[heroIndex]?.id}`}>
                      <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="px-14 py-6 bg-white text-black rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-purple-500 hover:text-white transition-colors">
                        SİNYALİ TAKİP ET →
                      </motion.button>
                    </Link>
                  </motion.div>
                </div>
              </motion.div>
            </AnimatePresence>
            <div className="absolute bottom-10 right-12 flex gap-3 z-30">
              {oyunlar.slice(0, 5).map((_, i) => (
                <button key={i} onClick={() => setHeroIndex(i)} className={`h-1.5 rounded-full transition-all duration-500 ${i === heroIndex ? 'w-12 bg-white' : 'w-3 bg-white/20'}`} />
              ))}
            </div>
          </section>
        )}

        {/* HEADER & FILTERS */}
        <header className="mb-24 text-center space-y-12">
          <motion.h1 initial={{ y: 20, opacity: 0 }} whileInView={{ y: 0, opacity: 1 }} className="text-7xl md:text-9xl font-black text-white tracking-tighter italic uppercase">
            OYUN <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-fuchsia-500 to-blue-500">RADARI</span>
          </motion.h1>
          
          <div className="flex flex-col items-center gap-8 sticky top-8 z-50">
            <div className="bg-slate-900/60 backdrop-blur-3xl border border-white/10 p-2 rounded-[2.5rem] flex flex-wrap justify-center gap-1 shadow-2xl">
              {kategoriler.map((kat) => (
                <button key={kat} onClick={() => setAktifKategori(kat)} className={`px-8 py-3.5 rounded-[2rem] text-[10px] font-black uppercase tracking-widest transition-all ${aktifKategori === kat ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/20' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}>
                  {kat}
                </button>
              ))}
            </div>
            <div className="relative w-full max-w-md">
              <input type="text" placeholder="SİSTEMDE ARA..." className="w-full bg-slate-900/80 backdrop-blur-md border border-white/10 rounded-2xl py-5 px-12 focus:outline-none focus:border-purple-500/50 transition-all text-xs font-bold tracking-widest italic text-white shadow-2xl" onChange={(e) => setSearchTerm(e.target.value)} />
              <div className="absolute left-5 top-1/2 -translate-y-1/2 opacity-30">🔍</div>
            </div>
          </div>
        </header>

        {/* OYUN LISTESI */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
          <AnimatePresence mode='popLayout'>
            {oyunlar.map((oyun, idx) => {
              const scoreStyle = getScoreStyle(oyun.puan);
              return (
                <motion.div key={oyun.id} layout initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: idx * 0.05 }} className={`bg-slate-900/40 border-2 rounded-[3.5rem] p-6 hover:shadow-[0_20px_50px_rgba(0,0,0,0.5)] group transition-all duration-500 ${scoreStyle.split(' ')[0]} ${scoreStyle.split(' ')[1]}`}>
                  <Link href={`/oyun/${oyun.id}`}>
                    <div className="relative h-72 mb-8 overflow-hidden rounded-[2.5rem] shadow-2xl">
                      <Image src={oyun.resim_url || '/placeholder.png'} alt={oyun.ad} fill className="object-cover transition-transform duration-700 group-hover:scale-110" unoptimized />
                      <div className="absolute top-5 right-5 bg-black/80 backdrop-blur-xl px-5 py-2.5 rounded-full border border-white/10 text-xs font-black text-white">⭐ {oyun.puan}</div>
                    </div>
                    <div className="px-2">
                      <span className="text-[10px] font-black text-purple-400 tracking-[0.3em] uppercase mb-3 block">{oyun.tur}</span>
                      <h3 className="text-3xl font-black text-white italic uppercase tracking-tighter mb-4 group-hover:text-purple-400 transition-colors">{oyun.ad}</h3>
                      <p className="text-slate-400 text-sm italic line-clamp-2 leading-relaxed opacity-70 group-hover:opacity-100 transition-opacity">{oyun.ozet?.replace(/<[^>]*>/g, '')}</p>
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>

        {/* LOAD MORE */}
        {hasMore && (
          <div className="mt-24 flex justify-center">
            <button onClick={loadMore} disabled={loadingMore} className="group relative px-20 py-7 bg-transparent overflow-hidden rounded-3xl border border-white/10">
              <div className="absolute inset-0 bg-white transition-transform duration-500 translate-y-full group-hover:translate-y-0" />
              <span className="relative z-10 font-black text-[10px] tracking-[0.5em] uppercase transition-colors duration-500 group-hover:text-black">
                {loadingMore ? "SİNYAL ALINIYOR..." : "RADARI GENİŞLET"}
              </span>
            </button>
          </div>
        )}

        {/* --- ETKINLIK & YORUM SECTION (REVİZE EDİLDİ) --- */}
        <section className="mt-48 grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch px-4">
          
          {/* SOL TARAF: ETKİNLİK SLIDER (2/3 ORANINDA) */}
          <div className="lg:col-span-2 relative">
            <AnimatePresence mode="wait">
              <motion.div 
                key={eventIndex} 
                initial={{ opacity: 0, x: -20 }} 
                animate={{ opacity: 1, x: 0 }} 
                exit={{ opacity: 0, x: 20 }} 
                className="h-full bg-slate-900/30 backdrop-blur-xl border border-white/10 p-12 md:p-16 rounded-[4rem] relative overflow-hidden flex flex-col justify-center min-h-[500px]"
              >
                <div className={`absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r ${etkinlikler[eventIndex].color}`} />
                <h3 className="text-[10px] font-black text-cyan-400 tracking-[0.5em] mb-6 uppercase">{etkinlikler[eventIndex].etiket}</h3>
                <h2 className="text-4xl md:text-6xl font-black italic uppercase tracking-tighter mb-6 text-white leading-none">{etkinlikler[eventIndex].baslik}</h2>
                <p className="text-slate-400 font-bold text-xs md:text-sm tracking-wide uppercase mb-10 opacity-70 leading-relaxed max-w-xl">{etkinlikler[eventIndex].ozet}</p>
                <Link href={etkinlikler[eventIndex].link}>
                  <motion.button whileHover={{ scale: 1.05 }} className="bg-white text-black px-12 py-5 rounded-2xl text-[10px] font-black tracking-widest uppercase hover:bg-cyan-400 transition-colors w-fit">
                    SİNYALİ BAŞLAT
                  </motion.button>
                </Link>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* SAĞ TARAF: KULLANICI YORUMLARI (1/3 ORANINDA) */}
          <div className="lg:col-span-1 relative">
            <div className="h-full bg-purple-900/10 backdrop-blur-xl border border-purple-500/20 p-12 rounded-[4rem] flex flex-col justify-between min-h-[500px]">
              <div>
                <div className="flex items-center gap-2 mb-8">
                  <div className="flex gap-1">
                    {[1, 2, 3].map(i => <div key={i} className="w-1.5 h-1.5 rounded-full bg-purple-500" />)}
                  </div>
                  <span className="text-[10px] font-black tracking-[0.3em] text-purple-400 uppercase ml-2">RADAR SESLERİ</span>
                </div>

                <div className="relative">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={yorumIndex}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="space-y-8"
                    >
                      <p className="text-xl md:text-2xl font-bold italic text-slate-200 leading-snug">
                        "{yorumlar[yorumIndex].mesaj}"
                      </p>
                      
                      <div className="flex items-center gap-4">
                        <div className="relative w-14 h-14 rounded-full overflow-hidden border-2 border-purple-500/30">
                          <Image 
                            src={yorumlar[yorumIndex].avatar} 
                            alt="User" 
                            fill 
                            className="object-cover"
                          />
                        </div>
                        <div>
                          <h4 className="text-sm font-black text-white tracking-wider uppercase">{yorumlar[yorumIndex].kullanici}</h4>
                          <span className="text-[9px] text-purple-400 font-black uppercase tracking-widest">DOĞRULANMIŞ SİNYAL</span>
                        </div>
                      </div>
                    </motion.div>
                  </AnimatePresence>
                </div>
              </div>

              {/* Slider Noktaları */}
              <div className="mt-8 flex gap-2">
                {yorumlar.map((_, i) => (
                  <button 
                    key={i} 
                    onClick={() => setYorumIndex(i)}
                    className={`h-1.5 rounded-full transition-all duration-500 ${i === yorumIndex ? 'w-10 bg-purple-500' : 'w-2 bg-white/10'}`} 
                  />
                ))}
              </div>
            </div>
          </div>
        </section>

      </main>

      <footer className="mt-40 py-20 border-t border-white/5 text-center">
        <p className="text-[10px] font-black tracking-[0.5em] opacity-20 uppercase">Radar V2.0 // Nebula OS</p>
      </footer>
    </div>
  );
}