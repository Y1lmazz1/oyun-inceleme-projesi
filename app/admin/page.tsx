'use client';
import { useEffect, useState, useCallback, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import Image from 'next/image';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import BackgroundParticles from "@/components/BackgroundParticles"; // Yıldızlar buraya eklendi

interface Oyun { 
  id: string; ad: string; tur: string; puan: number; resim_url: string; ozet: string;
  atmosfer: number; oynanis: number; grafik: number; hikaye: number;
  ses: number; performans: number; ai: number; tekrar: number;
  artilar?: string; eksiler?: string;
  steam_url?: string; epic_url?: string;
}
interface Yorum { id: string; kullanici_adi: string; icerik: string; oyun_id: string; oyun_adi?: string; }

export default function AdminPage() {
  const [sekme, setSekme] = useState<'liste' | 'editor' | 'yorumlar'>('liste');
  const [oturum, setOturum] = useState<any>(null);
  const [yukleniyor, setYukleniyor] = useState(true);
  const [oyunlar, setOyunlar] = useState<Oyun[]>([]);
  const [tumYorumlar, setTumYorumlar] = useState<Yorum[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [duzenlemeId, setDuzenlemeId] = useState<string | null>(null);

  // Form State'leri
  const [ad, setAd] = useState('');
  const [tur, setTur] = useState('');
  const [resimUrl, setResimUrl] = useState('');
  const [artilar, setArtilar] = useState('');
  const [eksiler, setEksiler] = useState('');
  const [steamUrl, setSteamUrl] = useState('');
  const [epicUrl, setEpicUrl] = useState('');
  const [puanlar, setPuanlar] = useState({
    atmosfer: 5, oynanis: 5, grafik: 5, hikaye: 5,
    ses: 5, performans: 5, ai: 5, tekrar: 5
  });

  const editorRef = useRef<HTMLDivElement>(null);

  const verileriGetir = useCallback(async () => {
    setYukleniyor(true);
    const { data: oyunData } = await supabase.from('oyunlar').select('*').order('created_at', { ascending: false });
    const { data: yorumData } = await supabase.from('yorumlar').select('*, oyunlar(ad)').order('created_at', { ascending: false });
    setOyunlar(oyunData || []);
    setTumYorumlar(yorumData?.map((y: any) => ({ ...y, oyun_adi: y.oyunlar?.ad })) || []);
    setYukleniyor(false);
  }, []);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setOturum(session);
      if (session) verileriGetir();
      else setYukleniyor(false);
    });
  }, [verileriGetir]);

  const ortalamaSkor = () => {
    const vals = Object.values(puanlar);
    const toplam = vals.reduce((a, b) => a + b, 0);
    return (toplam / vals.length).toFixed(1);
  };

  const formuSifirla = () => {
    setDuzenlemeId(null);
    setAd(''); setTur(''); setResimUrl('');
    setArtilar(''); setEksiler('');
    setSteamUrl(''); setEpicUrl('');
    setPuanlar({ atmosfer: 5, oynanis: 5, grafik: 5, hikaye: 5, ses: 5, performans: 5, ai: 5, tekrar: 5 });
    if (editorRef.current) editorRef.current.innerHTML = '';
  };

  const duzenleModuAc = (oyun: Oyun) => {
    setDuzenlemeId(oyun.id);
    setAd(oyun.ad); setTur(oyun.tur); setResimUrl(oyun.resim_url || '');
    setArtilar(oyun.artilar || ''); setEksiler(oyun.eksiler || '');
    setSteamUrl(oyun.steam_url || ''); setEpicUrl(oyun.epic_url || '');
    setPuanlar({
      atmosfer: oyun.atmosfer, oynanis: oyun.oynanis, grafik: oyun.grafik, hikaye: oyun.hikaye,
      ses: oyun.ses, performans: oyun.performans, ai: oyun.ai, tekrar: oyun.tekrar
    });
    setSekme('editor');
    setTimeout(() => { if (editorRef.current) editorRef.current.innerHTML = oyun.ozet; }, 50);
  };

  const handleSubmit = async () => {
    if (!ad) return alert("Oyun adı zorunlu!");
    setIsAdding(true);
    const veri = { 
      ad, tur, puan: parseFloat(ortalamaSkor()), resim_url: resimUrl, 
      ozet: editorRef.current?.innerHTML || '', artilar, eksiler,
      steam_url: steamUrl, epic_url: epicUrl, ...puanlar 
    };
    if (duzenlemeId) await supabase.from('oyunlar').update(veri).eq('id', duzenlemeId);
    else await supabase.from('oyunlar').insert([veri]);
    formuSifirla(); await verileriGetir(); setSekme('liste');
    setIsAdding(false);
  };

  if (yukleniyor) return <div className="min-h-screen bg-[#020617] flex items-center justify-center text-purple-500 font-black animate-pulse uppercase italic">SİSTEM TARANIYOR...</div>;

  return (
    <div className="min-h-screen bg-[#020617] text-gray-300 selection:bg-purple-500/30 overflow-x-hidden">
      
      {/* ARKA PLAN YILDIZLARI */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <BackgroundParticles />
      </div>

      {/* 1. KATMAN: ÜST NAVİGASYON */}
      <nav className="h-20 px-8 flex items-center justify-between border-b border-white/5 bg-[#020617]/70 backdrop-blur-xl fixed top-0 left-0 right-0 z-[110]">
        <Link href="/" className="group flex items-center gap-2">
          <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center font-black text-white italic shadow-lg shadow-purple-500/20 group-hover:rotate-12 transition-transform">R</div>
          <span className="font-black italic tracking-tighter text-xl text-white group-hover:text-purple-500 transition-colors uppercase">RADAR.</span>
        </Link>
        <button 
          onClick={async () => { await supabase.auth.signOut(); window.location.href = '/'; }}
          className="text-[10px] font-black uppercase tracking-widest text-red-500 hover:text-white transition-all border border-red-500/20 px-4 py-2 rounded-lg bg-red-500/5 hover:bg-red-500"
        >
          ÇIKIŞ YAP
        </button>
      </nav>

      {/* 2. KATMAN: ADMIN KONTROLLERİ */}
      <div className="fixed top-20 left-0 right-0 z-[100] bg-[#020617]/40 backdrop-blur-md border-b border-white/5 py-4 px-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex bg-black/40 p-1.5 rounded-[1.5rem] border border-white/5 gap-1 shadow-inner">
            <button onClick={() => setSekme('liste')} className={`px-6 py-2.5 rounded-[1rem] text-[10px] font-black uppercase transition-all ${sekme === 'liste' ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/20' : 'text-slate-500 hover:text-white'}`}>Kütüphane</button>
            <button onClick={() => { formuSifirla(); setSekme('editor'); }} className={`px-6 py-2.5 rounded-[1rem] text-[10px] font-black uppercase transition-all ${sekme === 'editor' && !duzenlemeId ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/20' : 'text-slate-500 hover:text-white'}`}>Yeni Ekle</button>
            <button onClick={() => setSekme('yorumlar')} className={`px-6 py-2.5 rounded-[1rem] text-[10px] font-black uppercase transition-all ${sekme === 'yorumlar' ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/20' : 'text-slate-500 hover:text-white'}`}>Yorumlar</button>
          </div>

          {sekme === 'editor' && (
            <button onClick={handleSubmit} disabled={isAdding} className="bg-white text-black px-10 py-2.5 rounded-full text-[10px] font-black uppercase hover:bg-purple-600 hover:text-white transition-all active:scale-95 shadow-xl">
              {isAdding ? 'İŞLENİYOR...' : (duzenlemeId ? 'DEĞİŞİKLİKLERİ KAYDET' : 'SİSTEME YAYINLA')}
            </button>
          )}
        </div>
      </div>

      {/* İÇERİK ALANI */}
      <main className="relative z-10 max-w-7xl mx-auto px-8 pt-48 pb-20">
        {!oturum ? (
          <div className="text-center py-20 font-black text-white/10 text-4xl uppercase italic">YETKİSİZ ERİŞİM</div>
        ) : (
          <>
            <AnimatePresence mode="wait">
              {sekme === 'editor' && (
                <motion.div key="editor" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="flex flex-col lg:flex-row gap-10">
                  <div className="flex-1">
                    <input value={ad} onChange={e => setAd(e.target.value)} placeholder="OYUN ADI" className="w-full bg-transparent text-5xl font-black outline-none mb-6 uppercase italic border-l-4 border-purple-600 pl-6 text-white placeholder:opacity-10" />
                    <div ref={editorRef} contentEditable className="min-h-[600px] outline-none text-gray-400 text-lg border border-white/5 p-8 rounded-[2rem] bg-slate-900/40 backdrop-blur-sm focus:bg-slate-900/60 transition-all editor-canvas" />
                  </div>

                  <div className="w-full lg:w-80 space-y-6">
                    <div className="bg-slate-900/80 backdrop-blur-xl border border-white/10 rounded-[2rem] p-6 sticky top-[13rem] shadow-2xl">
                      <h3 className="text-[10px] font-black text-purple-500 mb-4 uppercase tracking-widest italic">Analiz Verileri</h3>
                      <div className="space-y-4 mb-6">
                        {Object.keys(puanlar).map((key) => (
                          <div key={key}>
                            <div className="flex justify-between text-[9px] font-black uppercase text-slate-500 mb-1">
                              <span>{key}</span> <span className="text-white">{puanlar[key as keyof typeof puanlar]}</span>
                            </div>
                            <input type="range" min="0" max="10" value={puanlar[key as keyof typeof puanlar]} onChange={(e) => setPuanlar({...puanlar, [key]: parseInt(e.target.value)})} className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-purple-600" />
                          </div>
                        ))}
                      </div>
                      <div className="space-y-3 pt-4 border-t border-white/5">
                        <input value={tur} onChange={e => setTur(e.target.value)} placeholder="Tür (örn: RPG)" className="w-full bg-black/40 p-3 rounded-xl border border-white/5 text-[10px] outline-none focus:border-purple-600 transition-all" />
                        <input value={resimUrl} onChange={e => setResimUrl(e.target.value)} placeholder="Resim URL" className="w-full bg-black/40 p-3 rounded-xl border border-white/5 text-[10px] outline-none focus:border-purple-600 transition-all" />
                        <textarea value={artilar} onChange={e => setArtilar(e.target.value)} placeholder="Artılar" className="w-full bg-black/40 p-3 rounded-xl border border-white/5 text-[10px] h-20 resize-none outline-none focus:border-purple-600 transition-all" />
                        <textarea value={eksiler} onChange={e => setEksiler(e.target.value)} placeholder="Eksiler" className="w-full bg-black/40 p-3 rounded-xl border border-white/5 text-[10px] h-20 resize-none outline-none focus:border-purple-600 transition-all" />
                      </div>
                      {duzenlemeId && (
                        <button 
                          onClick={() => { if(confirm("Kaydı silmek istediğine emin misin?")) supabase.from('oyunlar').delete().eq('id', duzenlemeId).then(() => verileriGetir().then(() => setSekme('liste'))) }}
                          className="w-full mt-4 py-2 text-red-500 text-[9px] font-black uppercase border border-red-500/20 rounded-lg hover:bg-red-500 hover:text-white transition-all"
                        >
                          KAYDI SİSTEMDEN SİL
                        </button>
                      )}
                    </div>
                  </div>
                </motion.div>
              )}

              {sekme === 'liste' && (
                <motion.div key="liste" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid grid-cols-2 md:grid-cols-5 gap-6">
                  {oyunlar.map((oyun) => (
                    <div key={oyun.id} onClick={() => duzenleModuAc(oyun)} className="group cursor-pointer">
                      <div className="relative aspect-[3/4] rounded-2xl overflow-hidden border border-white/10 mb-2 bg-slate-900/40 backdrop-blur-sm shadow-xl group-hover:border-purple-500/50 transition-all duration-500 group-hover:-translate-y-1">
                        {oyun.resim_url && <Image src={oyun.resim_url} alt={oyun.ad} unoptimized fill className="object-cover opacity-60 group-hover:opacity-100 transition-all duration-700 scale-105 group-hover:scale-100" />}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                        <div className="absolute bottom-2 left-2 bg-purple-600 text-[10px] font-black px-2 py-1 rounded italic shadow-lg">{oyun.puan}</div>
                      </div>
                      <h3 className="text-[10px] font-black uppercase truncate text-white px-1">{oyun.ad}</h3>
                      <p className="text-[9px] text-slate-500 font-bold px-1 italic">Düzenlemek için tıkla</p>
                    </div>
                  ))}
                </motion.div>
              )}

              {sekme === 'yorumlar' && (
                <motion.div key="yorumlar" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-3xl mx-auto space-y-4">
                  {tumYorumlar.map((y) => (
                    <div key={y.id} className="bg-slate-900/60 backdrop-blur-md border border-white/5 p-5 rounded-2xl flex justify-between items-center hover:bg-slate-900/80 transition-colors shadow-lg">
                      <div>
                        <span className="text-[9px] font-black text-purple-500 uppercase tracking-tighter bg-purple-500/10 px-2 py-0.5 rounded">{y.oyun_adi}</span>
                        <p className="text-white font-bold text-sm italic mt-1">@{y.kullanici_adi}</p>
                        <p className="text-slate-400 text-xs mt-1 leading-relaxed">{y.icerik}</p>
                      </div>
                      <button 
                        onClick={() => { if(confirm("Bu yorumu sil?")) supabase.from('yorumlar').delete().eq('id', y.id).then(() => verileriGetir()) }} 
                        className="w-10 h-10 rounded-xl bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white transition-all flex items-center justify-center font-bold"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </>
        )}
      </main>

      <style jsx global>{`
        .editor-canvas:empty:before { content: 'Radar sinyallerini buraya yazın...'; color: #334155; }
        input[type='range']::-webkit-slider-thumb {
          appearance: none;
          width: 12px;
          height: 12px;
          background: #a855f7;
          border-radius: 50%;
          cursor: pointer;
        }
        /* Scrollbar güzelleştirme */
        ::-webkit-scrollbar { width: 5px; }
        ::-webkit-scrollbar-track { background: #020617; }
        ::-webkit-scrollbar-thumb { background: #1e1b4b; border-radius: 10px; }
        ::-webkit-scrollbar-thumb:hover { background: #312e81; }
      `}</style>
    </div>
  );
}