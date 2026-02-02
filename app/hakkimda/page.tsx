'use client';
import { motion } from 'framer-motion';

export default function Hakkimda() {
  const yetenekler = [
    { isim: 'RPG Uzmanlığı', oran: '95%' },
    { isim: 'Teknik Analiz', oran: '88%' },
    { isim: 'Hikaye Anlatımı', oran: '92%' },
    { isim: 'Sektör Bilgisi', oran: '85%' },
  ];

  return (
 

    <main className="min-h-screen bg-transparent text-white py-20 px-6 relative z-10">
      <div className="max-w-4xl mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
       
          className="bg-slate-900/40 border border-white/10 rounded-[3rem] p-10 backdrop-blur-xl shadow-2xl"
        >
          <h1 className="text-5xl font-black italic uppercase tracking-tighter mb-8">
            Sinyal Sahibi: <span className="text-purple-500">Kaptan</span>
          </h1>
          
          <div className="grid md:grid-cols-2 gap-10">
            <div className="space-y-6 text-slate-300 italic">
              <p>
                20 yılı aşkın süredir piksellerin arasında kaybolmuş, hikaye odaklı oyunların evreninde kendine yer edinmiş bir oyun tutkunuyum.
              </p>
              <p>
                Bu platform, oyunları sadece birer eğlence aracı olarak değil, birer sanat eseri ve teknik başarı olarak görenlerin buluşma noktasıdır.
              </p>
            </div>

            <div className="space-y-4">
              {yetenekler.map((y) => (
                <div key={y.isim}>
                  <div className="flex justify-between text-[10px] font-black uppercase tracking-widest mb-1">
                    <span>{y.isim}</span>
                    <span className="text-purple-400">{y.oran}</span>
                  </div>
                  <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: y.oran }}
                      transition={{ duration: 1.5, delay: 0.5 }}
                      className="h-full bg-gradient-to-r from-purple-600 to-blue-500"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </main>
  );
}