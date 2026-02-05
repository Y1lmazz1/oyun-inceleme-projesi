'use client';
import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState, useCallback } from 'react';

const STORES_CONFIG: Record<string, { icon: string, color: string, hover: string }> = {
  "steam": { icon: "🎮", color: "text-sky-400", hover: "hover:border-sky-500/50 hover:bg-sky-500/10" },
  "playstation-store": { icon: "🟦", color: "text-blue-600", hover: "hover:border-blue-600/50 hover:bg-blue-600/10" },
  "xbox-store": { icon: "🟩", color: "text-green-500", hover: "hover:border-green-500/50 hover:bg-green-500/10" },
  "epic-games": { icon: "🔘", color: "text-white", hover: "hover:border-white/40 hover:bg-white/5" },
  "gog": { icon: "🟣", color: "text-purple-400", hover: "hover:border-purple-500/50 hover:bg-purple-500/10" },
  "nintendo": { icon: "🟥", color: "text-red-500", hover: "hover:border-red-500/50 hover:bg-red-500/10" },
  "default": { icon: "🛒", color: "text-orange-500", hover: "hover:border-orange-500/50 hover:bg-orange-500/10" }
};


const playSound = (type: 'hover' | 'click' | 'open' | 'close') => {
  const soundMap = {
    hover: '/sounds/hover.mp3',
    click: '/sounds/click.mp3',
    open: '/sounds/open-panel.mp3',
    close: '/sounds/close.mp3'
  };
  const audio = new Audio(soundMap[type]);
  audio.volume = 0.1;
  audio.play().catch(() => {});
};


function ZoomableImage({ src }: { src: string }) {
  const [isZoomed, setIsZoomed] = useState(false);
  return (
    <>
      <div 
        onClick={() => { setIsZoomed(true); playSound('click'); }}
        onMouseEnter={() => playSound('hover')}
        className="relative group cursor-zoom-in overflow-hidden rounded-xl border border-white/10 aspect-video bg-white/5"
      >
        <img src={src} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" alt="Screenshot" />
        <div className="absolute inset-0 bg-cyan-500/0 group-hover:bg-cyan-500/10 transition-colors flex items-center justify-center">
            <span className="opacity-0 group-hover:opacity-100 transition-opacity text-white text-[8px] font-black tracking-[0.3em] uppercase bg-black/60 px-2 py-1 rounded">BÜYÜT</span>
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
              initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9 }}
              src={src} className="max-w-full max-h-[85vh] rounded-2xl border border-white/10 shadow-2xl object-contain" 
            />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

export default function GameDetailModal({ slug, onClose }: { slug: string; onClose: () => void }) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchGameDetails = useCallback(async () => {
    setLoading(true);
    try {
      const apiKey = "3d7f66b39eed4e2e8fdb53abe22da0ae";
      const [gameRes, screenRes] = await Promise.all([
        fetch(`https://api.rawg.io/api/games/${slug}?key=${apiKey}`),
        fetch(`https://api.rawg.io/api/games/${slug}/screenshots?key=${apiKey}`)
      ]);
      const gameData = await gameRes.json();
      const screenData = await screenRes.json();
      setData({ ...gameData, screenshots: screenData.results || [] });
      playSound('open');
    } catch (err) {
      console.error("Fetch Error:", err);
    } finally {
      setLoading(false);
    }
  }, [slug]);

  useEffect(() => {
    fetchGameDetails();
  }, [fetchGameDetails]);

  if (loading) return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm">
        <div className="flex flex-col items-center gap-4">
            <div className="w-12 h-12 border-2 border-cyan-500/10 border-t-cyan-500 rounded-full animate-spin" />
            <span className="text-cyan-400 font-black text-[9px] tracking-[0.4em] animate-pulse uppercase">Veri Akışı...</span>
        </div>
    </div>
  );

  if (!data) return null;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8">
      <div className="absolute inset-0 bg-[#020617]/90 backdrop-blur-xl" onClick={onClose} />

      <motion.div 
        initial={{ scale: 0.98, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }}
        className="relative z-10 w-full max-w-6xl bg-[#0a0c14]/95 border border-white/10 rounded-[32px] shadow-2xl overflow-hidden flex flex-col lg:flex-row h-[85vh]"
      >

        <div className="lg:w-2/5 relative flex flex-col border-r border-white/5 bg-black/30">
          <div className="h-[45%] relative group overflow-hidden">
            <img src={data.background_image} className="w-full h-full object-cover transition-transform duration-[3s] group-hover:scale-110" alt={data.name} />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0a0c14] via-transparent" />
            <div className="absolute bottom-6 left-6 right-6">
              <div className="flex gap-2 mb-3">
                <span className="bg-cyan-500 text-black text-[9px] font-black px-3 py-1 rounded-full uppercase tracking-widest">Metascore: {data.metacritic || 'N/A'}</span>
                <span className="bg-white/10 text-white/70 text-[9px] font-black px-3 py-1 rounded-full border border-white/10">{data.released?.split('-')[0]}</span>
              </div>
              <h2 className="text-4xl font-black italic uppercase tracking-tighter text-white leading-tight drop-shadow-2xl">{data.name}</h2>
            </div>
          </div>

          <div className="p-8 flex-1 overflow-y-auto custom-scrollbar">
            <div className="text-cyan-400 font-black text-[9px] uppercase tracking-[0.4em] mb-4 flex items-center gap-2 italic">
              <span className="w-1.5 h-1.5 bg-cyan-500 rounded-full animate-pulse shadow-[0_0_8px_#06b6d4]" />
              SİSTEM_GEREKSİNİMLERİ
            </div>
            <div className="text-[10px] text-slate-400 font-mono leading-relaxed bg-white/5 p-4 rounded-xl border border-white/5 italic opacity-80">
              {data.platforms?.find((p: any) => p.platform.name === "PC")?.requirements?.minimum 
                ? data.platforms.find((p: any) => p.platform.name === "PC").requirements.minimum.replace("Minimum:", "").trim()
                : "// Donanım verisi bu birim için tanımlanmadı."}
            </div>
          </div>
        </div>

  
        <div className="lg:w-3/5 p-8 md:p-10 overflow-y-auto custom-scrollbar flex flex-col bg-[#0a0c14]/40">
          
      
          <div className="mb-10">
            <span className="text-orange-500 text-[9px] font-black uppercase tracking-[0.4em] mb-5 block italic flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-orange-500 rounded-full animate-pulse shadow-[0_0_8px_#f97316]" />
              ERİŞİM_NOKTALARI
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {data.stores?.filter((s: any) => s.store).map((s: any) => {
                const config = STORES_CONFIG[s.store.slug] || STORES_CONFIG.default;
                return (
                  <a 
                    key={s.id} href={s.url} target="_blank" rel="noopener noreferrer"
                    onMouseEnter={() => playSound('hover')}
                    className={`group flex items-center gap-3 p-2 rounded-xl bg-white/5 border border-white/5 transition-all duration-300 ${config.hover}`}
                  >
                    <div className="w-9 h-9 flex items-center justify-center rounded-lg bg-black/40 border border-white/5 text-lg group-hover:scale-110 transition-transform">
                      <span className="grayscale group-hover:grayscale-0 transition-all">{config.icon}</span>
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span className="text-[10px] font-black text-white/70 group-hover:text-white uppercase tracking-wider truncate">{s.store.name}</span>
                      <span className={`text-[7px] font-mono tracking-tighter uppercase italic ${config.color} opacity-60`}>BAĞLANTI_OK</span>
                    </div>
                  </a>
                );
              })}
            </div>
          </div>

          <div className="space-y-10">
            <section>
              <div className="text-[#bc13fe] font-black text-[9px] uppercase tracking-[0.4em] mb-3 italic flex items-center gap-2">
                <span className="w-6 h-[1px] bg-[#bc13fe]/50" />
                MISSION_DATA
              </div>
              <p className="text-slate-300 text-[13px] leading-relaxed italic opacity-80 border-l-2 border-[#bc13fe]/30 pl-5">
                {data.description_raw || "Veri bulunamadı."}
              </p>
            </section>

            <section>
              <div className="text-cyan-400 font-black text-[9px] uppercase tracking-[0.4em] mb-4 italic flex items-center gap-2">
                <span className="w-6 h-[1px] bg-cyan-500/50" />
                GÖRSEL_LOGLAR
              </div>
              <div className="grid grid-cols-2 gap-3">
                {data.screenshots?.slice(0, 4).map((s: any, i: number) => (
                  <ZoomableImage key={i} src={s.image} />
                ))}
              </div>
            </section>
          </div>

    
          <div className="mt-12 pt-6 flex flex-col sm:flex-row gap-4 sticky bottom-0 bg-[#0a0c14]/60 backdrop-blur-md">
            <button 
              onClick={() => window.open(`https://www.youtube.com/results?search_query=${encodeURIComponent(data.name + ' official trailer')}`, '_blank')}
              onMouseEnter={() => playSound('hover')}
              className="flex-1 py-4 bg-cyan-500 hover:bg-cyan-400 text-black rounded-xl font-black text-[10px] uppercase tracking-[0.2em] shadow-[0_0_25px_rgba(6,182,212,0.2)] transition-all flex items-center justify-center gap-2"
            >
              ▶ ANALİZİ_İZLE
            </button>
            <button 
              onClick={() => { playSound('close'); onClose(); }}
              className="px-10 py-4 bg-white/5 border border-white/10 rounded-xl font-black text-[10px] uppercase tracking-[0.2em] text-white/50 hover:bg-white hover:text-black transition-all"
            >
              KAPAT
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}