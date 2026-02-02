'use client';
import { motion } from 'framer-motion';

export default function Iletisim() {
  return (
  
    <main className="min-h-screen bg-transparent text-white py-20 px-6 relative z-10">
      <div className="max-w-2xl mx-auto text-center">
        <motion.h2 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-4xl font-black uppercase italic tracking-tighter mb-12"
        >
          Merkez Üssüne <span className="text-blue-500">Mesaj Gönder</span>
        </motion.h2>

        <form className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input 
              type="text" 
              placeholder="KOD ADINIZ" 
              className="bg-slate-900/60 backdrop-blur-md border border-white/5 p-4 rounded-2xl focus:border-purple-500 outline-none transition-all italic text-sm" 
            />
            <input 
              type="email" 
              placeholder="FREKANS (E-POSTA)" 
              className="bg-slate-900/60 backdrop-blur-md border border-white/5 p-4 rounded-2xl focus:border-purple-500 outline-none transition-all italic text-sm" 
            />
          </div>
          <textarea 
            rows={5} 
            placeholder="İLETİNİZİ BURAYA BIRAKIN..." 
            className="w-full bg-slate-900/60 backdrop-blur-md border border-white/5 p-4 rounded-2xl focus:border-purple-500 outline-none transition-all italic text-sm" 
          />
          
          <motion.button 
            whileHover={{ scale: 1.02, boxShadow: "0 0 20px rgba(168,85,247,0.4)" }}
            whileTap={{ scale: 0.98 }}
            className="w-full py-4 bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl font-black uppercase tracking-[0.3em] text-sm shadow-xl shadow-purple-900/20"
          >
            Sinyali Gönder →
          </motion.button>
        </form>

        <div className="mt-16 flex justify-center gap-8 opacity-40">
          <span className="text-[10px] font-bold tracking-widest cursor-pointer hover:text-purple-400 transition-colors">TWITCH</span>
          <span className="text-[10px] font-bold tracking-widest cursor-pointer hover:text-purple-400 transition-colors">YOUTUBE</span>
          <span className="text-[10px] font-bold tracking-widest cursor-pointer hover:text-purple-400 transition-colors">X (TWITTER)</span>
        </div>
      </div>
    </main>
  );
}