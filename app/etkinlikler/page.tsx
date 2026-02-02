'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import BackgroundParticles from "@/components/BackgroundParticles";


const RAWG_API_KEY = "3d7f66b39eed4e2e8fdb53abe22da0ae";

const KARAKTER_HAVUZU = [
  { ad: "Geralt of Rivia", slug: "the-witcher-3-wild-hunt", tip: "rpg", mesaj: "Efsunlu bir kılıç ustası ve yalnız bir kurtsun." },
  { ad: "Master Chief", slug: "halo-infinite", tip: "aksiyon", mesaj: "Stratejik bir deha ve durdurulamaz bir askersin." },
  { ad: "Johnny Silverhand", slug: "cyberpunk-2077", tip: "cyberpunk", mesaj: "Sistem karşıtı bir asi ve dijital bir hayaletsin." },
  { ad: "Ellie", slug: "the-last-of-us-part-ii", tip: "korku", mesaj: "Hayatta kalma içgüdüsü yüksek, dirençli bir savaşçısın." },
  { ad: "Kratos", slug: "god-of-war-2", tip: "aksiyon", mesaj: "Öfkesini güce dönüştüren bir lidersin." }
];

const QUIZ_SORULARI = [
  { s: "Dünya tehlikedeyse ilk tepkin ne olur?", sec: [{ m: "Kılıcımı kuşanırım.", t: "rpg" }, { m: "Taktik plan yaparım.", t: "aksiyon" }, { m: "Sistemi hacklerim.", t: "cyberpunk" }, { m: "Gölgede beklerim.", t: "korku" }] },
  { s: "Hangi ortam seni tanımlar?", sec: [{ m: "Sisli dağlar.", t: "rpg" }, { m: "Neon ışıklar.", t: "cyberpunk" }, { m: "Tozlu savaş alanı.", t: "aksiyon" }, { m: "Terk edilmiş şehir.", t: "korku" }] },
  { s: "Senin için en önemli şey?", sec: [{ m: "Onur.", t: "rpg" }, { m: "Zafer.", t: "aksiyon" }, { m: "Özgürlük.", t: "cyberpunk" }, { m: "Hayatta kalmak.", t: "korku" }] }
];

export default function EtkinliklerMerkezi() {
  const [mod, setMod] = useState<'menu' | 'quiz' | 'tahmin' | 'yil'>('menu');
  const [loading, setLoading] = useState(false);


  const [sorular, setSorular] = useState<any[]>([]);
  const [asama, setAsama] = useState(0);
  const [skor, setSkor] = useState(0);
  const [bitti, setBitti] = useState(false);
  const [blur, setBlur] = useState(25);

 
  const [quizAsama, setQuizAsama] = useState(0);
  const [puanlar, setPuanlar] = useState<Record<string, number>>({ rpg: 0, aksiyon: 0, cyberpunk: 0, korku: 0 });
  const [quizSonuc, setQuizSonuc] = useState<any>(null);


  const veriGetir = async (targetMod: 'tahmin' | 'yil') => {
    setLoading(true);
    try {
      const randomPage = Math.floor(Math.random() * 20) + 1;
      const res = await fetch(`https://api.rawg.io/api/games?key=${RAWG_API_KEY}&page_size=30&page=${randomPage}&metacritic=70,100`);
      const data = await res.json();
      
      const islenmis = data.results.sort(() => Math.random() - 0.5).slice(0, 5).map((game: any) => {
        const dogruYil = new Date(game.released).getFullYear().toString();
        
   
        const yilSeti = new Set([dogruYil]);
        while(yilSeti.size < 4) {
          const randomYil = (parseInt(dogruYil) + (Math.floor(Math.random() * 10) - 5)).toString();
          yilSeti.add(randomYil);
        }

        const digerIsimler = data.results
          .filter((g: any) => g.name !== game.name)
          .slice(0, 3)
          .map((g: any) => g.name);

        return {
          cevap: targetMod === 'yil' ? dogruYil : game.name,
          resim: game.background_image,
          isim: game.name,
          secenekler: targetMod === 'yil' ? Array.from(yilSeti).sort() : [game.name, ...digerIsimler].sort()
        };
      });

      setSorular(islenmis);
      setAsama(0);
      setSkor(0);
      setBitti(false);
      setBlur(targetMod === 'yil' ? 0 : 25); 
      setMod(targetMod);
    } catch (e) {
      alert("Sinyal zayıf, tekrar dene!");
    } finally {
      setLoading(false);
    }
  };

  const handleCevap = (secim: string) => {
    const dogruMu = secim === sorular[asama].cevap;
    
    if (dogruMu) {
      setSkor(skor + (mod === 'yil' ? 20 : blur));
      if (asama < sorular.length - 1) {
        setAsama(asama + 1);
   
        setBlur(mod === 'yil' ? 0 : 25);
      } else {
        setBitti(true);
      }
    } else {
      if (mod === 'tahmin') {
        setBlur(prev => Math.max(2, prev - 6));
      } else {
    
        if (asama < sorular.length - 1) {
          setAsama(asama + 1);
          setBlur(0);
        } else {
          setBitti(true);
        }
      }
    }
  };

  const handleQuizCevap = async (tip: string) => {
    const yeniPuanlar = { ...puanlar, [tip]: puanlar[tip] + 1 };
    setPuanlar(yeniPuanlar);

    if (quizAsama < QUIZ_SORULARI.length - 1) {
      setQuizAsama(quizAsama + 1);
    } else {
      setLoading(true);
      const kazananTip = Object.entries(yeniPuanlar).reduce((a, b) => a[1] > b[1] ? a : b)[0];
      const karakter = KARAKTER_HAVUZU.find(k => k.tip === kazananTip) || KARAKTER_HAVUZU[0];
      
      try {
        const res = await fetch(`https://api.rawg.io/api/games/${karakter.slug}?key=${RAWG_API_KEY}`);
        const data = await res.json();
        setQuizSonuc({ ...karakter, resim: data.background_image });
      } catch {
        setQuizSonuc(karakter);
      } finally {
        setLoading(false);
        setMod('quiz');
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#020617] text-white flex items-center justify-center p-6 pt-24 overflow-hidden relative">
      <BackgroundParticles />
      
      <div className="relative z-10 w-full max-w-5xl">
        <AnimatePresence mode="wait">

          {/* ANA MENÜ */}
          {mod === 'menu' && (
            <motion.div key="menu" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center">
              <h1 className="text-6xl font-black italic mb-12 tracking-tighter uppercase">OPERASYON MERKEZİ</h1>
              <div className="grid md:grid-cols-3 gap-6">
                <button onClick={() => {setMod('quiz'); setQuizAsama(0); setQuizSonuc(null); setPuanlar({rpg:0,aksiyon:0,cyberpunk:0,korku:0});}} className="bg-slate-900/40 p-8 rounded-[2.5rem] border border-purple-500/20 hover:border-purple-500 transition-all group">
                  <div className="text-4xl mb-4 group-hover:scale-110 transition-transform">🎭</div>
                  <h3 className="text-xl font-black italic uppercase text-purple-400">Karakter Analizi</h3>
                  <p className="text-slate-500 text-[10px] mt-2 font-bold uppercase tracking-widest">Sen Kimsin?</p>
                </button>
                <button onClick={() => veriGetir('tahmin')} disabled={loading} className="bg-slate-900/40 p-8 rounded-[2.5rem] border border-blue-500/20 hover:border-blue-500 transition-all group">
                  <div className="text-4xl mb-4 group-hover:scale-110 transition-transform">👁️</div>
                  <h3 className="text-xl font-black italic uppercase text-blue-400">Görsel Tahmin</h3>
                  <p className="text-slate-500 text-[10px] mt-2 font-bold uppercase tracking-widest">Sinyal Çözücü</p>
                </button>
                <button onClick={() => veriGetir('yil')} disabled={loading} className="bg-slate-900/40 p-8 rounded-[2.5rem] border border-emerald-500/20 hover:border-emerald-500 transition-all group">
                  <div className="text-4xl mb-4 group-hover:scale-110 transition-transform">📅</div>
                  <h3 className="text-xl font-black italic uppercase text-emerald-400">Hangi Yıl?</h3>
                  <p className="text-slate-500 text-[10px] mt-2 font-bold uppercase tracking-widest">Zaman Yolcusu</p>
                </button>
              </div>
              {loading && <div className="mt-8 animate-pulse text-xs font-black tracking-[0.3em] text-blue-400 uppercase italic">Veri akışı sağlanıyor...</div>}
            </motion.div>
          )}

          {/* OYUNLAR (Tahmin & Yıl) */}
          {(mod === 'tahmin' || mod === 'yil') && (
            <motion.div key="game" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="max-w-xl mx-auto w-full">
              {!bitti ? (
                <div className="bg-slate-900/80 p-8 rounded-[3rem] border border-white/10 backdrop-blur-xl relative">
                  <div className="flex justify-between mb-6 text-[10px] font-black uppercase tracking-widest">
                    <button onClick={() => setMod('menu')} className="text-white/40 hover:text-white transition-colors">{"< Geri Dön"}</button>
                    <span className="text-blue-400">Soru {asama + 1}/5 — Skor: {skor}</span>
                  </div>
                  <div className="relative h-64 w-full rounded-2xl overflow-hidden mb-6 shadow-2xl">
                    <img src={sorular[asama]?.resim} style={{ filter: `blur(${blur}px)` }} className="w-full h-full object-cover transition-all duration-700" alt="Sinyal" />
                    {mod === 'yil' && (
                       <div className="absolute bottom-4 left-4 bg-black/90 px-4 py-2 rounded-lg border border-emerald-500/30">
                         <span className="text-xs font-black italic uppercase text-emerald-400">{sorular[asama]?.isim}</span>
                       </div>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    {sorular[asama]?.secenekler.map((s: string, i: number) => (
                      <button key={i} onClick={() => handleCevap(s)} className={`p-4 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 transition-all font-black text-[10px] uppercase tracking-tighter ${mod === 'yil' ? 'hover:border-emerald-500' : 'hover:border-blue-500'}`}>
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center p-12 bg-slate-900/80 rounded-[3rem] border border-white/10 shadow-2xl">
                  <h2 className="text-4xl font-black italic mb-2 uppercase text-white">ANALİZ BİTTİ</h2>
                  <div className="text-6xl font-black mb-10 text-blue-400 tracking-tighter italic">{skor}</div>
                  <button onClick={() => setMod('menu')} className="bg-white text-black px-12 py-4 rounded-full font-black text-xs uppercase tracking-[0.2em] hover:scale-105 transition-transform">MERKEZE DÖN</button>
                </div>
              )}
            </motion.div>
          )}

          {/* QUIZ (Karakter Analizi) */}
          {mod === 'quiz' && (
            <motion.div key="quiz" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-xl mx-auto w-full">
              {!quizSonuc ? (
                <div className="bg-slate-900/80 p-10 rounded-[3rem] border border-purple-500/30">
                  <div className="mb-8 text-[10px] font-black text-purple-400 uppercase tracking-widest text-center italic">Analiz ediliyor: Soru {quizAsama + 1}/3</div>
                  <h2 className="text-2xl font-black mb-8 italic text-center text-white">{QUIZ_SORULARI[quizAsama].s}</h2>
                  <div className="grid gap-3">
                    {QUIZ_SORULARI[quizAsama].sec.map((s, i) => (
                      <button key={i} onClick={() => handleQuizCevap(s.t)} className="p-5 rounded-2xl bg-white/5 hover:bg-purple-600 transition-all font-black text-xs text-left px-8 uppercase tracking-widest">{s.m}</button>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center bg-slate-900/90 p-8 rounded-[3rem] border border-purple-500 shadow-2xl">
                  <div className="relative h-64 w-full rounded-2xl overflow-hidden mb-6 border-2 border-purple-500/50">
                    <img src={quizSonuc.resim} className="w-full h-full object-cover" alt="Karakter" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-80" />
                  </div>
                  <h2 className="text-4xl font-black italic mb-2 uppercase text-purple-400">{quizSonuc.ad}</h2>
                  <p className="text-slate-400 mb-8 text-sm font-medium italic px-6 leading-relaxed">{quizSonuc.mesaj}</p>
                  <button onClick={() => setMod('menu')} className="bg-white text-black px-12 py-4 rounded-full font-black text-xs uppercase tracking-widest hover:bg-purple-400 transition-colors">MENÜYE DÖN</button>
                </div>
              )}
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </div>
  );
}