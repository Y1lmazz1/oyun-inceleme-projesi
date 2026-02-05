'use client';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import LuckyWheel from "@/components/LuckyWheel";

const RAWG_API_KEY = process.env.NEXT_PUBLIC_RAWG_API_KEY;


const MOD_THEMES = {
  menu: { primary: '#06b6d4', secondary: 'rgba(6, 182, 212, 0.12)', label: 'NEUTRAL' },
  quiz: { primary: '#a855f7', secondary: 'rgba(168, 85, 247, 0.12)', label: 'ANALYSIS' },
  tahmin: { primary: '#3b82f6', secondary: 'rgba(59, 130, 246, 0.12)', label: 'SIGNAL' },
  yil: { primary: '#10b981', secondary: 'rgba(16, 185, 129, 0.12)', label: 'CHRONO' },
  cark: { primary: '#f97316', secondary: 'rgba(249, 115, 22, 0.12)', label: 'CHANCE' }
};

const playSound = (type: 'hover' | 'click' | 'open' | 'close' | 'win' | 'spin') => {
  const audio = new Audio(`/sounds/${type}.mp3`);
  audio.volume = 0.15;
  audio.play().catch(() => {});
};


function ZoomableImage({ src }: { src: string }) {
  const [isZoomed, setIsZoomed] = useState(false);
  return (
    <>
      <div 
        onClick={() => { setIsZoomed(true); playSound('click'); }}
        className="relative group cursor-zoom-in overflow-hidden rounded-xl border border-white/10 aspect-video bg-white/5"
      >
        <img src={src} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" alt="Game Screenshot" />
        <div className="absolute inset-0 bg-white/0 group-hover:bg-white/10 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
            <span className="text-[8px] font-black tracking-widest uppercase bg-black/60 px-2 py-1 rounded">ZOOM</span>
        </div>
      </div>
      <AnimatePresence>
        {isZoomed && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setIsZoomed(false)}
            className="fixed inset-0 z-[10001] bg-black/95 backdrop-blur-md flex items-center justify-center p-4 cursor-zoom-out"
          >
            <motion.img 
              initial={{ scale: 0.9 }} animate={{ scale: 1 }}
              src={src} className="max-w-full max-h-[90vh] rounded-2xl border border-white/10 shadow-2xl" 
            />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

// --- ANA BİLEŞEN ---
export default function EtkinliklerMerkezi() {
  const [mod, setMod] = useState<keyof typeof MOD_THEMES>('menu');
  const [loading, setLoading] = useState(false);
  const [sorular, setSorular] = useState<any[]>([]);
  const [asama, setAsama] = useState(0);
  const [skor, setSkor] = useState(0);
  const [bitti, setBitti] = useState(false);
  const [blur, setBlur] = useState(25);
  const [secilenOyunSlug, setSecilenOyunSlug] = useState<string | null>(null);

  const [quizAsama, setQuizAsama] = useState(0);
  const [puanlar, setPuanlar] = useState<Record<string, number>>({ rpg: 0, aksiyon: 0, cyberpunk: 0, korku: 0 });
  const [quizSonuc, setQuizSonuc] = useState<any | null>(null);

  const QUIZ_SORULARI = [
    { s: "Dünya tehlikedeyse ilk tepkin ne olur?", sec: [{ m: "Kılıcımı kuşanırım.", t: "rpg" }, { m: "Taktik plan yaparım.", t: "aksiyon" }, { m: "Sistemi hacklerim.", t: "cyberpunk" }, { m: "Gölgede beklerim.", t: "korku" }] },
    { s: "Hangi atmosfer seni daha çok çeker?", sec: [{ m: "Büyülü ormanlar.", t: "rpg" }, { m: "Fütüristik neon şehirler.", t: "cyberpunk" }, { m: "Barut kokan cepheler.", t: "aksiyon" }, { m: "Gerilim dolu sessiz sokaklar.", t: "korku" }] },
    { s: "Senin için en büyük erdem nedir?", sec: [{ m: "Bilgelik.", t: "rpg" }, { m: "Disiplin.", t: "aksiyon" }, { m: "Özgürlük.", t: "cyberpunk" }, { m: "Cesaret.", t: "korku" }] },
    { s: "Bir çatışmada tercihin?", sec: [{ m: "Yakın dövüş ve kombolar.", t: "aksiyon" }, { m: "Uzaktan gizli suikast.", t: "korku" }, { m: "Yüksek teknoloji silahlar.", t: "cyberpunk" }, { m: "Simya ve büyüler.", t: "rpg" }] },
    { s: "Hikayen nasıl bitmeli?", sec: [{ m: "Efsane olarak.", t: "rpg" }, { m: "Görevimi tamamlamış olarak.", t: "aksiyon" }, { m: "Düzeni yıkarak.", t: "cyberpunk" }, { m: "Sadece hayatta kalarak.", t: "korku" }] }
  ];

  const KARAKTER_HAVUZU = [
    { ad: "Geralt of Rivia", slug: "the-witcher-3-wild-hunt", tip: "rpg", mesaj: "Efsunlu bir kılıç ustası ve yalnız bir kurtsun. Kararların dünyayı değiştiriyor." },
    { ad: "Master Chief", slug: "halo-infinite", tip: "aksiyon", mesaj: "Stratejik bir deha ve durdurulamaz bir askersin. İnsanlığın son umudu sensin." },
    { ad: "Johnny Silverhand", slug: "cyberpunk-2077", tip: "cyberpunk", mesaj: "Sistem karşıtı bir asi ve dijital bir hayaletsin. Şehri yakmaya hazırsın." },
    { ad: "Ellie", slug: "the-last-of-us-part-ii", tip: "korku", mesaj: "Hayatta kalma içgüdüsü yüksek, dirençli bir savaşçısın. İntikam senin yakıtın." },
    { ad: "Arthur Morgan", slug: "red-dead-redemption-2", tip: "macera", mesaj: "Vahşi batının son sadık adamlarından birisin. Onur her şeyden önce gelir." }
  ];

  const veriGetir = async (targetMod: 'tahmin' | 'yil') => {
    setLoading(true);
    playSound('click');
    try {
      const randomPage = Math.floor(Math.random() * 50) + 1;
      const res = await fetch(`https://api.rawg.io/api/games?key=${RAWG_API_KEY}&page_size=20&page=${randomPage}&metacritic=70,100`);
      const data = await res.json();
      const shuffledGames = data.results.sort(() => Math.random() - 0.5).slice(0, 5);

      const islenmis = shuffledGames.map((game: any) => {
        const dogruYil = new Date(game.released).getFullYear().toString();
        let secenekler = [];
        if (targetMod === 'yil') {
          const yilSeti = new Set([dogruYil]);
          while(yilSeti.size < 4) {
            const sapma = Math.floor(Math.random() * 10) - 5;
            yilSeti.add((parseInt(dogruYil) + sapma).toString());
          }
          secenekler = Array.from(yilSeti).sort(() => Math.random() - 0.5);
        } else {
          const digerIsimler = data.results.filter((g: any) => g.name !== game.name).sort(() => Math.random() - 0.5).slice(0, 3).map((g: any) => g.name);
          secenekler = [game.name, ...digerIsimler].sort(() => Math.random() - 0.5);
        }
        return { cevap: targetMod === 'yil' ? dogruYil : game.name, resim: game.background_image, isim: game.name, secenekler: secenekler };
      });

      setSorular(islenmis);
      setAsama(0); setSkor(0); setBitti(false); setBlur(targetMod === 'yil' ? 0 : 25);
      setMod(targetMod);
    } catch (e) {
      alert("Terminal bağlantı hatası.");
    } finally { setLoading(false); }
  };

  const handleCevap = (secim: string) => {
    const dogruMu = secim === sorular[asama].cevap;
    if (dogruMu) {
      playSound('win');
      setSkor(skor + (mod === 'yil' ? 20 : Math.round(blur)));
      if (asama < sorular.length - 1) {
        setAsama(asama + 1);
        setBlur(mod === 'yil' ? 0 : 25);
      } else { setBitti(true); }
    } else {
      playSound('click');
      if (mod === 'tahmin') setBlur(prev => Math.max(0, prev - 7));
      else {
        if (asama < sorular.length - 1) setAsama(asama + 1);
        else setBitti(true);
      }
    }
  };

  const handleQuizCevap = async (tip: string) => {
    playSound('click');
    const yeniPuanlar = { ...puanlar, [tip]: puanlar[tip] + 1 };
    setPuanlar(yeniPuanlar);

    if (quizAsama < QUIZ_SORULARI.length - 1) {
      setQuizAsama(quizAsama + 1);
    } else {
      setLoading(true);
      const kazananTip = Object.entries(yeniPuanlar).reduce((a:any, b:any) => (a[1] > b[1] ? a : b))[0];
      const karakter = KARAKTER_HAVUZU.find(k => k.tip === kazananTip) || KARAKTER_HAVUZU[0];
      try {
        const res = await fetch(`https://api.rawg.io/api/games/${karakter.slug}?key=${RAWG_API_KEY}`);
        const data = await res.json();
        setQuizSonuc({ ...karakter, resim: data.background_image });
        playSound('open');
      } finally { setLoading(false); }
    }
  };

  return (
    <div className="min-h-screen bg-[#02040a] text-white flex flex-col items-center justify-center p-6 overflow-hidden relative font-sans">
      
    
      <motion.div 
        animate={{ 
          backgroundColor: MOD_THEMES[mod].secondary,
          boxShadow: `inset 0 0 150px ${MOD_THEMES[mod].secondary}`
        }}
        transition={{ duration: 1.5 }}
        className="fixed inset-0 z-0 pointer-events-none"
      />

      <div className="fixed inset-0 z-0 pointer-events-none opacity-20 mix-blend-screen grayscale brightness-50">
        <video autoPlay loop muted playsInline className="w-full h-full object-cover">
          <source src="/videos/nebula.mp4" type="video/mp4" />
        </video>
      </div>

      <motion.div 
        animate={{ opacity: [0.05, 0.15, 0.05] }}
        transition={{ duration: 5, repeat: Infinity }}
        className="fixed inset-0 z-0 pointer-events-none"
        style={{ background: `radial-gradient(circle at 50% 50%, ${MOD_THEMES[mod].primary}, transparent 70%)` }}
      />
      

      <div className="relative z-10 w-full max-w-6xl">
        <AnimatePresence mode="wait">

          {mod === 'menu' && (
            <motion.div key="menu" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, y: -20 }} className="text-center">
              <h1 className="text-8xl font-black italic tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white to-white/20 mb-2">NEBULA</h1>
              <div className="h-1 w-24 bg-cyan-500 mx-auto mb-16 shadow-[0_0_20px_#06b6d4]" />
              
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 px-4">
                <MenuCard icon="🎭" title="Analiz" desc="Karakter Testi" color="purple" onClick={() => {setMod('quiz'); setQuizAsama(0); setQuizSonuc(null);}} />
                <MenuCard icon="👁️" title="Tahmin" desc="Görsel Sinyal" color="blue" onClick={() => veriGetir('tahmin')} disabled={loading} />
                <MenuCard icon="📅" title="Zaman" desc="Hangi Yıl?" color="emerald" onClick={() => veriGetir('yil')} disabled={loading} />
                <MenuCard icon="🎡" title="Çark" desc="Şansını Dene" color="orange" onClick={() => {setMod('cark'); playSound('open');}} />
              </div>
            </motion.div>
          )}

          {mod === 'cark' && (
            <motion.div key="cark" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col items-center">
              <LuckyWheel onGameSelect={(slug) => {setSecilenOyunSlug(slug); playSound('open');}} />
              <button onClick={() => setMod('menu')} className="mt-8 opacity-40 hover:opacity-100 transition-opacity text-[10px] tracking-widest font-black uppercase tracking-[0.5em]">{"// Geri Dön"}</button>
            </motion.div>
          )}

          {(mod === 'tahmin' || mod === 'yil') && (
            <GameComponent mod={mod} asama={asama} sorular={sorular} blur={blur} skor={skor} bitti={bitti} handleCevap={handleCevap} setMod={setMod} />
          )}

          {mod === 'quiz' && (
            <div className="max-w-xl mx-auto w-full">
              {!quizSonuc ? (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white/5 p-12 rounded-[3.5rem] border border-white/10 backdrop-blur-3xl">
                  <div className="text-[10px] font-black text-purple-400 uppercase tracking-widest mb-10 text-center">Analiz {quizAsama + 1}/5</div>
                  <h2 className="text-3xl font-black mb-10 italic text-center text-white">{QUIZ_SORULARI[quizAsama].s}</h2>
                  <div className="grid gap-4">
                    {QUIZ_SORULARI[quizAsama].sec.map((s, i) => (
                      <button key={i} onClick={() => handleQuizCevap(s.t)} className="group p-6 rounded-2xl bg-white/5 border border-white/5 hover:bg-purple-600 transition-all font-black text-xs uppercase tracking-widest">
                        {s.m}
                      </button>
                    ))}
                  </div>
                </motion.div>
              ) : (
                <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="text-center bg-[#0a0a0a] border border-purple-500/40 rounded-[3rem] overflow-hidden shadow-[0_0_50px_rgba(168,85,247,0.2)]">
                  <div className="relative h-80">
                    <img src={quizSonuc.resim} className="w-full h-full object-cover" alt="" />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a]" />
                    <h2 className="absolute bottom-4 left-0 right-0 text-5xl font-black italic uppercase">{quizSonuc.ad}</h2>
                  </div>
                  <div className="p-10">
                    <p className="text-purple-300/80 mb-10 italic">"{quizSonuc.mesaj}"</p>
                    <button onClick={() => setMod('menu')} className="w-full py-5 bg-purple-600 rounded-2xl font-black text-xs uppercase shadow-[0_0_20px_rgba(168,85,247,0.4)]">Sistemi Yenile</button>
                  </div>
                </motion.div>
              )}
            </div>
          )}

        </AnimatePresence>

        <AnimatePresence>
          {secilenOyunSlug && (
            <GameDetailModal slug={secilenOyunSlug} onClose={() => setSecilenOyunSlug(null)} />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}


function MenuCard({ icon, title, desc, color, onClick, disabled }: any) {
  const colors = {
    purple: "border-purple-500/20 hover:border-purple-500 text-purple-400 shadow-purple-500/5",
    blue: "border-blue-500/20 hover:border-blue-500 text-blue-400 shadow-blue-500/5",
    emerald: "border-emerald-500/20 hover:border-emerald-500 text-emerald-400 shadow-emerald-500/5",
    orange: "border-orange-500/20 hover:border-orange-500 text-orange-400 shadow-orange-500/5"
  };
  return (
    <button onClick={onClick} disabled={disabled} className={`bg-white/5 p-10 rounded-[2.5rem] border transition-all group flex flex-col items-center justify-center hover:scale-105 ${colors[color as keyof typeof colors]} ${disabled ? 'opacity-30 cursor-not-allowed' : 'hover:bg-white/10'}`}>
      <div className="text-5xl mb-6">{icon}</div>
      <h3 className="text-sm font-black italic uppercase tracking-widest">{title}</h3>
      <p className="text-[8px] mt-3 font-bold uppercase tracking-[0.3em] opacity-40">{desc}</p>
    </button>
  );
}

function GameComponent({ mod, asama, sorular, blur, skor, bitti, handleCevap, setMod }: any) {
    if (bitti) return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center p-16 bg-white/5 rounded-[4rem] border border-cyan-500/30 backdrop-blur-3xl">
          <h2 className="text-2xl font-black text-cyan-400 mb-2 uppercase tracking-widest">SİMÜLASYON TAMAM</h2>
          <div className="text-8xl font-black italic mb-10 text-white">{skor}</div>
          <button onClick={() => setMod('menu')} className="px-16 py-5 bg-white text-black rounded-2xl font-black text-xs uppercase tracking-widest">Ana Menü</button>
      </motion.div>
    );

    return (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white/5 p-8 rounded-[3rem] border border-white/10 backdrop-blur-3xl max-w-2xl mx-auto shadow-2xl">
            <div className="flex justify-between items-center mb-8">
                <button onClick={() => setMod('menu')} className="text-[10px] font-black uppercase tracking-widest opacity-30 hover:opacity-100">{"< Terminal"}</button>
                <div className="px-4 py-1 rounded-full bg-white/10 border border-white/10 text-[10px] font-black text-white/80 uppercase tracking-widest">Puan: {skor}</div>
            </div>
            <div className="relative h-72 w-full rounded-[2.5rem] overflow-hidden mb-8 border border-white/10">
                <img src={sorular[asama]?.resim} style={{ filter: `blur(${blur}px)` }} className="w-full h-full object-cover transition-all duration-700" alt="" />
                {mod === 'yil' && <div className="absolute inset-0 flex items-center justify-center bg-black/40"><span className="text-2xl font-black uppercase italic text-center px-4">{sorular[asama]?.isim}</span></div>}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {sorular[asama]?.secenekler.map((s: string, i: number) => (
                    <button key={i} onClick={() => handleCevap(s)} className="group relative p-5 rounded-2xl bg-white/5 border border-white/5 hover:border-white/50 hover:bg-white/10 transition-all text-left">
                        <span className="font-black text-[11px] uppercase tracking-widest">{s}</span>
                    </button>
                ))}
            </div>
        </motion.div>
    );
}


function GameDetailModal({ slug, onClose }: { slug: string; onClose: () => void }) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function getDetails() {
      try {
        const [gameRes, screenRes] = await Promise.all([
          fetch(`https://api.rawg.io/api/games/${slug}?key=${RAWG_API_KEY}`),
          fetch(`https://api.rawg.io/api/games/${slug}/screenshots?key=${RAWG_API_KEY}`)
        ]);
        const gData = await gameRes.json();
        const sData = await screenRes.json();
        setData({ ...gData, screenshots: sData.results || [] });
      } catch (err) {
        console.error("Detay yüklenemedi", err);
      } finally { setLoading(false); }
    }
    getDetails();
  }, [slug]);

  const handleTrailer = () => {
    if (!data) return;
    window.open(`https://www.youtube.com/results?search_query=${encodeURIComponent(data.name + ' official trailer')}`, '_blank');
  };

  if (loading) return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-md">
       <div className="w-12 h-12 border-2 border-cyan-500/20 border-t-cyan-500 rounded-full animate-spin" />
    </div>
  );

  if (!data) return null;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-[#02040a]/90 backdrop-blur-md" onClick={onClose} />
      <motion.div initial={{ scale: 0.9, y: 30 }} animate={{ scale: 1, y: 0 }} className="relative w-full max-w-6xl bg-[#0f1117] border border-white/10 rounded-[40px] overflow-hidden flex flex-col lg:flex-row h-[85vh] shadow-2xl">
        
 
        <div className="lg:w-2/5 relative border-r border-white/5 flex flex-col bg-black/20">
          <div className="h-2/3 relative group overflow-hidden">
            <img src={data.background_image} className="w-full h-full object-cover transition-transform duration-[3s] group-hover:scale-110" alt={data.name} />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0f1117] via-transparent" />
            <div className="absolute bottom-8 left-8 right-8">
              <div className="flex gap-2 mb-4">
                <span className="bg-cyan-500 text-black text-[9px] font-black px-3 py-1 rounded-full uppercase tracking-widest shadow-[0_0_15px_#06b6d4]">Score: {data.metacritic || '??'}</span>
                <span className="bg-white/10 text-white text-[9px] font-black px-3 py-1 rounded-full border border-white/10 backdrop-blur-md">{data.released?.split('-')[0]}</span>
              </div>
              <h2 className="text-5xl font-black italic tracking-tighter uppercase leading-[0.9] text-white drop-shadow-2xl">
                <motion.span initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }}>
                  {data.name}
                </motion.span>
              </h2>
            </div>
          </div>
          <div className="p-8 flex-1 overflow-y-auto custom-scrollbar">
             <span className="text-[#bc13fe] text-[9px] font-black uppercase tracking-[0.4em] mb-4 block underline underline-offset-4">HARDWARE_SPECS</span>
             <div className="text-[11px] text-slate-400 font-mono italic opacity-70 leading-relaxed bg-white/5 p-4 rounded-xl border border-white/5">
                {data.platforms?.find((p:any) => p.platform.name === "PC")?.requirements?.minimum?.replace("Minimum:", "").trim() || "// Terminal verisi bulunamadı."}
             </div>
          </div>
        </div>

       
        <div className="lg:w-3/5 p-8 md:p-12 overflow-y-auto custom-scrollbar flex flex-col bg-[#0a0c14]/50">
          <div className="mb-12">
            <span className="text-orange-500 text-[9px] font-black uppercase tracking-[0.4em] mb-6 block italic flex items-center gap-2">
              <span className="w-2 h-2 bg-orange-500 rounded-full animate-pulse shadow-[0_0_8px_#f97316]" />
              SİNYAL_ERİŞİM_NOKTALARI
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {data.stores?.map((s: any) => (
                <a key={s.id} href={s.url || `https://${s.store.domain}`} target="_blank" rel="noopener noreferrer" className="group relative flex items-center gap-4 p-2 rounded-2xl bg-white/5 border border-white/5 hover:border-orange-500/50 hover:bg-orange-500/10 transition-all overflow-hidden">
                  <div className="w-16 h-10 relative overflow-hidden rounded-xl border border-white/5 bg-black">
                    <img src={data.background_image} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500" alt="" />
                    <div className="absolute inset-0 bg-black/40 group-hover:bg-transparent transition-colors" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[11px] font-black text-white/70 group-hover:text-white uppercase tracking-widest">{s.store.name}</span>
                    <span className="text-[8px] text-orange-500/50 font-mono tracking-tighter uppercase">{s.store.domain || "Digital Store"}</span>
                  </div>
                  <div className="ml-auto mr-4 opacity-0 group-hover:opacity-100 transition-opacity text-orange-500">↗</div>
                </a>
              ))}
            </div>
          </div>

          <div className="space-y-12">
            <section>
              <span className="text-cyan-400 text-[9px] font-black uppercase tracking-[0.4em] mb-4 block italic">MISSION_BRIEFING</span>
              <p className="text-slate-300 text-sm leading-relaxed italic opacity-80 border-l-2 border-cyan-500/30 pl-6 bg-cyan-500/5 py-4 rounded-r-xl">
                {data.description_raw || "Data packets corrupted. Description missing."}
              </p>
            </section>
            <section>
              <span className="text-orange-500 text-[9px] font-black uppercase tracking-[0.4em] mb-4 block italic">VISUAL_LOGS</span>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                 {data.screenshots?.slice(0, 4).map((s:any, i:number) => (
                   <ZoomableImage key={i} src={s.image} />
                 ))}
              </div>
            </section>
          </div>

          <div className="mt-auto pt-10 flex flex-col sm:flex-row gap-4 sticky bottom-0 bg-[#0f1117]/90 backdrop-blur-sm py-4">
            <button onClick={handleTrailer} className="flex-1 py-5 bg-cyan-500 text-black rounded-2xl font-black text-[11px] uppercase tracking-widest hover:bg-cyan-400 transition-all shadow-[0_0_30px_rgba(6,182,212,0.3)]">Analizi Başlat (Fragman)</button>
            <button onClick={() => { playSound('close'); onClose(); }} className="px-10 py-5 bg-white/5 border border-white/10 rounded-2xl font-black text-[11px] uppercase tracking-widest hover:bg-white hover:text-black transition-all">Terminali Kapat</button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}