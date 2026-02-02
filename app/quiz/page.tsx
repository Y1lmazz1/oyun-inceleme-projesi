'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import BackgroundParticles from "@/components/BackgroundParticles";
import Link from 'next/link';
import Image from 'next/image';


type OyunTipi = 'aksiyon' | 'rpg' | 'cyberpunk' | 'korku' | 'strateji' | 'hiz';

interface Secenek {
  metin: string;
  tip: OyunTipi;
}

interface Soru {
  id: number;
  soru: string;
  secenekler: Secenek[];
}

interface SonucVerisi {
  isim: string;
  oyun: string;
  resim: string;
  aciklama: string;
}

// VERİLER (Data)
const SORULAR: Soru[] = [
  {
    id: 1,
    soru: "Düşman kapına dayandığında ilk tepkin ne olur?",
    secenekler: [
      { metin: "Elimdeki en ağır silahla dalarım!", tip: "aksiyon" },
      { metin: "Görünmez olup arkalarından dolanırım.", tip: "strateji" },
      { metin: "Onlarla konuşup orta yol bulmaya çalışırım.", tip: "rpg" },
      { metin: "Sadece hayatta kalmaya odaklanırım.", tip: "korku" }
    ]
  },
  {
    id: 2,
    soru: "Hangi atmosfer seni daha çok içine çeker?",
    secenekler: [
      { metin: "Neon ışıklı, kalabalık bir gelecek.", tip: "cyberpunk" },
      { metin: "Karanlık, gotik ve sisli bir kale.", tip: "korku" },
      { metin: "Vahşi ve özgür doğa.", tip: "aksiyon" },
      { metin: "Büyülü ve ejderhalarla dolu bir evren.", tip: "rpg" }
    ]
  },
  {
    id: 3,
    soru: "Bir problemle karşılaştığında çözüm yöntemin hangisidir?",
    secenekler: [
      { metin: "Kaba kuvvet her zaman işe yarar.", tip: "aksiyon" },
      { metin: "Adım adım plan yapar, riskleri hesaplarım.", tip: "strateji" },
      { metin: "İçgüdülerime güvenir, akışına bırakırım.", tip: "hiz" },
      { metin: "Başkalarından yardım alarak çözerim.", tip: "rpg" }
    ]
  },
  {
    id: 4,
    soru: "Sana göre 'güç' neyi ifade eder?",
    secenekler: [
      { metin: "Teknolojik üstünlük ve implantlar.", tip: "cyberpunk" },
      { metin: "Sarsılmaz bir irade ve kas gücü.", tip: "aksiyon" },
      { metin: "Kadim büyüler ve bilgi.", tip: "rpg" },
      { metin: "Zekice kurulmuş bir tuzak.", tip: "strateji" }
    ]
  },
  {
    id: 5,
    soru: "Zamanın durduğu bir anda ne yapardın?",
    secenekler: [
      { metin: "En hızlı şekilde hedefe ulaşırım.", tip: "hiz" },
      { metin: "Etrafımdaki gizemleri incelerim.", tip: "korku" },
      { metin: "Stratejik olarak konumumu değiştiririm.", tip: "strateji" },
      { metin: "Anın tadını çıkarır, dünyayı seyrederim.", tip: "rpg" }
    ]
  },
  {
    id: 6,
    soru: "Seni en çok ne korkutur?",
    secenekler: [
      { metin: "Kontrolü kaybetmek.", tip: "strateji" },
      { metin: "Bilinmezlik ve karanlık.", tip: "korku" },
      { metin: "Yavaş kalmak ve geriye düşmek.", tip: "hiz" },
      { metin: "Yapay bir dünyada hapsolmak.", tip: "cyberpunk" }
    ]
  }
];

const SONUCLAR: Record<OyunTipi, SonucVerisi> = {
  aksiyon: { isim: "Arthur Morgan", oyun: "Red Dead Redemption 2", resim: "https://images.unsplash.com/photo-1544197150-b99a580bb7a8?q=80&w=2070", aciklama: "Vahşi batının son gerçek adamısın. Sadakat ve onur senin için her şey." },
  rpg: { isim: "Geralt of Rivia", oyun: "The Witcher 3", resim: "https://images.unsplash.com/photo-1534423861386-85a16f5d13fd?q=80&w=2070", aciklama: "Kaderin iki kılıç arasında. Gri bölgelerde yürümeyi ve doğruyu bulmayı biliyorsun." },
  cyberpunk: { isim: "V", oyun: "Cyberpunk 2077", resim: "https://images.unsplash.com/photo-1605898399783-1820b7f53bc5?q=80&w=1935", aciklama: "Şehir senin damarlarında akıyor. Kuralları yıkan bir isyancısın." },
  korku: { isim: "Ethan Winters", oyun: "Resident Evil Village", resim: "https://images.unsplash.com/photo-1509248961158-e54f6934749c?q=80&w=2070", aciklama: "Kabusların içinden geçsen de asla pes etmiyorsun. Hayatta kalmak senin uzmanlığın." },
  strateji: { isim: "Minthara", oyun: "Baldur's Gate 3", resim: "https://images.unsplash.com/photo-1511512578047-dfb367046420?q=80&w=2070", aciklama: "Zekan en büyük silahın. Her zaman üç adım sonrasını planlıyorsun." },
  hiz: { isim: "Doom Slayer", oyun: "DOOM Eternal", resim: "https://images.unsplash.com/photo-1511512578047-dfb367046420?q=80&w=2070", aciklama: "Seni hiçbir şey durduramaz. Sadece parçala ve yok et!" }
};

export default function QuizPage() {
  const [asama, setAsama] = useState(0);
  const [skorlar, setSkorlar] = useState<Partial<Record<OyunTipi, number>>>({});
  const [tamamlandi, setTamamlandi] = useState(false);

  const cevapla = (tip: OyunTipi) => {
    setSkorlar(prev => ({ ...prev, [tip]: (prev[tip] || 0) + 1 }));
    if (asama < SORULAR.length - 1) {
      setAsama(asama + 1);
    } else {
      setTamamlandi(true);
    }
  };

  const kazananTip = (): OyunTipi => {
    return (Object.keys(skorlar) as OyunTipi[]).reduce((a, b) => 
      (skorlar[a] || 0) > (skorlar[b] || 0) ? a : b, 'aksiyon' as OyunTipi
    );
  };

  const sonuc = SONUCLAR[kazananTip()];

  return (
    <div className="min-h-screen bg-[#020617] text-white relative overflow-hidden flex items-center justify-center p-4">
      <BackgroundParticles />
      
      <div className="relative z-10 w-full max-w-2xl">
        <AnimatePresence mode="wait">
          {!tamamlandi ? (
            <motion.div 
              key={asama}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.05 }}
              className="bg-slate-900/60 backdrop-blur-2xl p-8 md:p-12 rounded-[3rem] border border-white/10 shadow-2xl relative"
            >
              <div className="absolute top-8 right-12 text-[10px] font-black text-purple-500 tracking-widest opacity-50">
                {asama + 1} / {SORULAR.length}
              </div>
              
              <h2 className="text-3xl font-black italic mb-10 leading-tight">
                {SORULAR[asama].soru}
              </h2>
              
              <div className="grid gap-3">
                {SORULAR[asama].secenekler.map((sec, i) => (
                  <button 
                    key={i}
                    onClick={() => cevapla(sec.tip)}
                    className="group w-full text-left p-5 rounded-2xl bg-white/5 border border-white/5 hover:border-purple-500/50 hover:bg-purple-600/20 transition-all duration-300 flex justify-between items-center"
                  >
                    <span className="font-bold text-sm text-slate-300 group-hover:text-white">{sec.metin}</span>
                    <div className="w-2 h-2 rounded-full bg-white/10 group-hover:bg-purple-500 transition-colors" />
                  </button>
                ))}
              </div>
            </motion.div>
          ) : (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center bg-slate-900/80 backdrop-blur-3xl p-10 rounded-[3rem] border border-purple-500/30 overflow-hidden relative"
            >
              <div className="absolute inset-0 opacity-20 pointer-events-none">
                <img src={sonuc.resim} alt="bg" className="w-full h-full object-cover blur-xl" />
              </div>
              
              <div className="relative z-10">
                <h1 className="text-[10px] font-black text-purple-500 tracking-[0.5em] mb-6">ANALİZ TAMAMLANDI</h1>
                <div className="text-5xl font-black italic mb-2 uppercase text-white">{sonuc.isim}</div>
                <div className="text-purple-400 font-black text-xs tracking-widest mb-8">{sonuc.oyun}</div>
                
                <div className="relative h-64 w-full rounded-2xl overflow-hidden mb-8 border border-white/10 shadow-2xl">
                  <img src={sonuc.resim} className="object-cover w-full h-full" alt={sonuc.isim} />
                </div>
                
                <p className="text-slate-300 mb-10 font-medium leading-relaxed max-w-md mx-auto italic">
                  {sonuc.aciklama}
                </p>
                
                <div className="flex gap-4 justify-center">
                  <Link href="/" className="bg-white text-black px-10 py-4 rounded-full font-black text-[10px] tracking-widest hover:bg-purple-600 hover:text-white transition-all uppercase shadow-lg shadow-white/5">
                   {"RADAR'A DÖN"}
                  </Link>
                  <button onClick={() => {setAsama(0); setTamamlandi(false); setSkorlar({});}} className="border border-white/20 px-10 py-4 rounded-full font-black text-[10px] tracking-widest hover:bg-white/10 transition-all uppercase">
                    TEKRAR ÇÖZ
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}