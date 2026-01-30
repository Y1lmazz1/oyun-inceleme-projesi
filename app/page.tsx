'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { User } from '@supabase/supabase-js';
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
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchData = async () => {
      const { data: oyunData } = await supabase.from('oyunlar').select('*').order('id', { ascending: true });
      setOyunlar((oyunData as Oyun[]) || []);
      setLoading(false);
    };
    fetchData();
  }, []);

  const filteredOyunlar = oyunlar.filter((oyun) =>
    oyun.ad.toLowerCase().includes(searchTerm.toLowerCase()) ||
    oyun.tur.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Animasyon Ayarları (Varyantlar)
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 } // Kartlar sırayla gelsin
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 }
  };

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
    <div className="min-h-screen bg-[#020617] text-slate-200 overflow-x-hidden">
      {/* Hareketli Arka Plan Işıkları */}
      <motion.div 
        animate={{ scale: [1, 1.2, 1], opacity: [0.2, 0.4, 0.2] }}
        transition={{ duration: 8, repeat: Infinity }}
        className="fixed top-[-10%] left-[-10%] w-[50%] h-[50%] bg-purple-600/10 blur-[120px] rounded-full -z-10"
      />

      <main className="max-w-6xl mx-auto py-16 px-6">
        
        {/* Başlık Animasyonu */}
        <header className="mb-20 space-y-6 text-center">
          <motion.h2 
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-6xl font-black text-white tracking-tighter"
          >
            İncelediğim <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600 drop-shadow-[0_0_15px_rgba(168,85,247,0.5)]">Oyunlar</span>
          </motion.h2>

          {/* Arama Barı Neon Efekti */}
          <motion.div 
            whileHover={{ scale: 1.02 }}
            className="relative max-w-lg mx-auto"
          >
            <input
              type="text"
              placeholder="Oyun ara..."
              className="w-full bg-slate-900/60 border border-slate-800 rounded-full py-4 px-12 focus:outline-none focus:border-purple-500 focus:shadow-[0_0_25px_rgba(168,85,247,0.2)] transition-all"
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <span className="absolute left-5 top-4 opacity-50">🔍</span>
          </motion.div>
        </header>

        {/* Kartlar: Sıralı ve Etkileşimli */}
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10"
        >
          <AnimatePresence mode='popLayout'>
            {filteredOyunlar.map((oyun) => (
              <motion.div
                key={oyun.id}
                variants={itemVariants}
                layout // Arama yaparken kartların yer değiştirmesini sağlar
                whileHover={{ y: -10, transition: { duration: 0.2 } }}
                className="group relative"
              >
                {/* Neon Kenar Parlaması (Hover Durumunda) */}
                <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-600 to-pink-600 rounded-[2.5rem] opacity-0 group-hover:opacity-30 blur transition duration-500" />
                
                <Link href={`/oyun/${oyun.id}`} className="relative block h-full bg-slate-900 border border-slate-800 rounded-[2.5rem] p-4 overflow-hidden">
                  
                  {/* Resim Zoom Efekti */}
                  <div className="relative h-56 mb-6 overflow-hidden rounded-[2rem]">
                    <Image 
                      src={oyun.resim_url || '/placeholder.png'} 
                      alt={oyun.ad} 
                      fill 
                      className="object-cover transition-transform duration-700 group-hover:scale-110" 
                    />
                  </div>

                  <div className="px-2">
                    <h3 className="text-2xl font-bold text-white mb-2 group-hover:text-purple-400 transition-colors">
                      {oyun.ad}
                    </h3>
                    <p className="text-slate-400 text-sm line-clamp-2 mb-6">
                      {oyun.ozet}
                    </p>
                    
                    <div className="flex justify-between items-center border-t border-slate-800 pt-4">
                      <span className="text-xs font-black text-purple-400 tracking-widest uppercase">{oyun.tur}</span>
                      <motion.span 
                        animate={{ x: [0, 5, 0] }}
                        transition={{ repeat: Infinity, duration: 1.5 }}
                        className="text-white font-bold"
                      >
                        →
                      </motion.span>
                    </div>
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