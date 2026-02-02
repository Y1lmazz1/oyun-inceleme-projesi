'use client';
import { motion } from 'framer-motion';
import BackgroundParticles from "@/components/BackgroundParticles";
import Link from 'next/link';

export default function Hakkimizda() {
  const ozellikler = [
    { baslik: "DÜRÜST ANALİZ", detay: "Sadece rakamlar değil, gerçek deneyimler.", ikon: "🎯" },
    { baslik: "FÜTÜRİSTİK VERİ", detay: "8 farklı kriterle en derin radar taraması.", ikon: "📡" },
    { baslik: "TOPLULUK GÜCÜ", detay: "Oyuncuların sesini merkeze alan yapı.", ikon: "👥" }
  ];

  return (
    <div className="min-h-screen bg-[#020617] text-white relative overflow-hidden">
      <BackgroundParticles />
      
      <main className="relative z-10 max-w-4xl mx-auto px-8 pt-32 pb-20">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-6xl font-black italic tracking-tighter mb-8 bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent">
            RADAR NEDİR?
          </h1>
          
          <p className="text-xl text-slate-400 leading-relaxed mb-12 font-medium">
            Oyun dünyasındaki gürültüyü kesmek için doğduk. Radar, sadece bir inceleme sitesi değil; 
            bir oyunun atmosferinden yapay zekasına kadar her detayı analiz eden dijital bir gözlem evidir.
          </p>

          <div className="grid md:grid-cols-3 gap-6">
            {ozellikler.map((item, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.2 }}
                className="bg-slate-900/40 backdrop-blur-xl border border-white/5 p-6 rounded-[2rem] hover:border-purple-500/30 transition-all"
              >
                <div className="text-3xl mb-4">{item.ikon}</div>
                <h3 className="font-black text-sm mb-2 text-purple-400 uppercase tracking-widest">{item.baslik}</h3>
                <p className="text-xs text-slate-500 font-bold leading-relaxed">{item.detay}</p>
              </motion.div>
            ))}
          </div>

          <div className="mt-16 p-8 bg-purple-600/10 border border-purple-500/20 rounded-[3rem] text-center">
            <h2 className="font-black italic text-2xl mb-4 uppercase">Vizyonumuz</h2>
            <p className="text-slate-300 italic">"Oyuncular için, oyuncular tarafından tasarlanan en hassas veri ağı."</p>
          </div>
        </motion.div>
      </main>
    </div>
  );
}