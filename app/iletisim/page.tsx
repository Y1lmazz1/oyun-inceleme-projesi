'use client';
import { motion } from 'framer-motion';
import BackgroundParticles from "@/components/BackgroundParticles";

export default function Iletisim() {
  return (
    <div className="min-h-screen bg-[#020617] text-white relative overflow-hidden">
      <BackgroundParticles />
      
      <main className="relative z-10 max-w-4xl mx-auto px-8 pt-32 pb-20">
        <div className="grid lg:grid-cols-2 gap-16">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
            <h1 className="text-6xl font-black italic tracking-tighter mb-6">İLETİŞİM.</h1>
            <p className="text-slate-400 font-bold mb-8">Radar sinyallerini bize gönderin. İş birliği, öneri veya sadece merhaba demek için buradayız.</p>
            
            <div className="space-y-4">
              <div className="flex items-center gap-4 text-sm font-black text-purple-400 tracking-widest">
                <span className="w-10 h-[1px] bg-purple-500"></span>
                RADAR@STATION.COM
              </div>
              <div className="flex items-center gap-4 text-sm font-black text-slate-500 tracking-widest">
                <span className="w-10 h-[1px] bg-slate-700"></span>
                NIGHT CITY, SECTOR 7
              </div>
            </div>
          </motion.div>

          <motion.form 
            initial={{ opacity: 0, x: 20 }} 
            animate={{ opacity: 1, x: 0 }}
            className="space-y-4 bg-slate-900/60 backdrop-blur-2xl p-8 rounded-[3rem] border border-white/5"
          >
            <input placeholder="KOD ADINIZ" className="w-full bg-black/40 border border-white/5 p-4 rounded-2xl outline-none focus:border-purple-500 transition-all font-bold text-xs" />
            <input placeholder="E-POSTA" className="w-full bg-black/40 border border-white/5 p-4 rounded-2xl outline-none focus:border-purple-500 transition-all font-bold text-xs" />
            <textarea placeholder="MESAJINIZ" rows={5} className="w-full bg-black/40 border border-white/5 p-4 rounded-2xl outline-none focus:border-purple-500 transition-all font-bold text-xs resize-none" />
            <button className="w-full bg-purple-600 hover:bg-white hover:text-black py-4 rounded-2xl font-black uppercase text-[10px] tracking-[0.3em] transition-all shadow-lg shadow-purple-600/20">
              SİNYALİ GÖNDER
            </button>
          </motion.form>
        </div>
      </main>
    </div>
  );
}