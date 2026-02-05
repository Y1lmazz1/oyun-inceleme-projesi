'use client';
import { useEffect, useRef, useState, useCallback } from 'react';

interface WheelGame {
  ad: string;
  id: string;
}

interface LuckyWheelProps {
  onGameSelect: (slug: string) => void;
}

const API_KEY = "3d7f66b39eed4e2e8fdb53abe22da0ae";
const MARKA_RENKLERİ = ["#00f2ff", "#bc13fe"];
const WHEEL_SIZE = 450; 
const CENTER = WHEEL_SIZE / 2;

export default function LuckyWheel({ onGameSelect }: LuckyWheelProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const spinAudio = useRef<HTMLAudioElement | null>(null);
  const winAudio = useRef<HTMLAudioElement | null>(null);

  const [isSpinning, setIsSpinning] = useState(false);
  const [isDataLoading, setIsDataLoading] = useState(false); // Veri çekme kontrolü
  const [games, setGames] = useState<WheelGame[]>(Array(8).fill({ ad: "SİNYAL BEKLENİYOR...", id: "" }));
  const rotationRef = useRef(0);

  useEffect(() => {
    spinAudio.current = new Audio('/sounds/spin.mp3');
    if (spinAudio.current) spinAudio.current.loop = true;
    winAudio.current = new Audio('/sounds/win.mp3');
  }, []);


  const drawWheel = useCallback((currentGames: WheelGame[]) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) return;

    canvas.width = WHEEL_SIZE;
    canvas.height = WHEEL_SIZE;

  
    ctx.fillStyle = "#020617";
    ctx.fillRect(0, 0, WHEEL_SIZE, WHEEL_SIZE);

    const dilimSayisi = currentGames.length;
    const aci = (2 * Math.PI) / dilimSayisi;

    currentGames.forEach((oyun, i) => {
      const renk = i % 2 === 0 ? MARKA_RENKLERİ[0] : MARKA_RENKLERİ[1];
      
      ctx.save();
      ctx.beginPath();
      
      ctx.shadowBlur = 5;
      ctx.shadowColor = renk;
      ctx.fillStyle = "rgba(2, 6, 23, 0.95)";
      ctx.strokeStyle = renk;
      ctx.lineWidth = 1.5;

      ctx.moveTo(CENTER, CENTER);
      ctx.arc(CENTER, CENTER, CENTER - 20, i * aci, (i + 1) * aci);
      ctx.fill();
      ctx.stroke();

      ctx.translate(CENTER, CENTER);
      ctx.rotate(i * aci + aci / 2);
      ctx.textAlign = "right";
      ctx.fillStyle = renk;
      ctx.font = "bold 11px 'Orbitron', sans-serif";
      
      const temizAd = oyun.ad.toUpperCase();
      ctx.fillText(temizAd.length > 15 ? temizAd.substring(0, 13) + ".." : temizAd, CENTER - 50, 4);
      ctx.restore();
    });

 
    ctx.beginPath();
    ctx.arc(CENTER, CENTER, 10, 0, Math.PI * 2);
    ctx.fillStyle = "#fff";
    ctx.shadowBlur = 15;
    ctx.shadowColor = "#00f2ff";
    ctx.fill();
  }, []);

 
  useEffect(() => { drawWheel(games); }, [games, drawWheel]);

  const spin = async () => {
    if (isSpinning || isDataLoading) return;
    
    setIsDataLoading(true); 
    
    try {
    
      const page = Math.floor(Math.random() * 20) + 1;
      const res = await fetch(`https://api.rawg.io/api/games?key=${API_KEY}&page_size=12&page=${page}&metacritic=75,100`);
      const data = await res.json();
      
      const newGames = data.results.map((g: any) => ({ ad: g.name, id: g.slug }));
      
     
      setGames(newGames);
      setIsDataLoading(false);

     
      setTimeout(() => {
        setIsSpinning(true);
        spinAudio.current?.play().catch(() => {});

        
        const extraRotation = Math.floor(Math.random() * 360) + 2880; 
        rotationRef.current += extraRotation;
        
        if (canvasRef.current) {
          canvasRef.current.style.transform = `rotate(${rotationRef.current}deg)`;
        }

     
        setTimeout(() => {
          setIsSpinning(false);
          spinAudio.current?.pause();
          if (spinAudio.current) spinAudio.current.currentTime = 0;
          winAudio.current?.play().catch(() => {});

          const normalizeDegrees = (rotationRef.current % 360);
         
          const index = Math.floor(((270 - normalizeDegrees + 360) % 360) / (360 / newGames.length));
          onGameSelect(newGames[index].id);
        }, 4000);
      }, 50); 

    } catch (error) {
      console.error("Sinyal hatası:", error);
      setIsDataLoading(false);
      setIsSpinning(false);
    }
  };

  return (
    <div className="relative flex items-center justify-center p-4">
  
      <div className="absolute w-[500px] h-[500px] bg-cyan-500/10 blur-[100px] rounded-full pointer-events-none" />

      <div className="relative z-10 flex items-center justify-center">
      
        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-6 z-[50] 
                        text-3xl text-[#00f2ff] filter drop-shadow-[0_0_10px_#00f2ff] animate-bounce">
          ▼
        </div>
        
     
        <canvas 
          ref={canvasRef} 
          className={`rounded-full transition-transform duration-[4000ms] ease-[cubic-bezier(0.1,0,0,0.99)] 
                     drop-shadow-[0_0_40px_rgba(0,242,255,0.15)] will-change-transform border-4 border-white/5
                     ${isDataLoading ? 'animate-pulse opacity-70' : 'opacity-100'}`}
          style={{ 
            transform: 'translate3d(0,0,0)', 
          }}
        />
        
        
        <button 
          onClick={(e) => {
            e.stopPropagation();
            spin();
          }}
          disabled={isSpinning || isDataLoading}
          className={`
            absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 
            w-24 h-24 rounded-full z-[100] cursor-pointer
            bg-[#020617]/90 backdrop-blur-2xl border-2 
            text-white font-black uppercase tracking-tighter text-[9px] leading-tight
            transition-all duration-300 flex items-center justify-center text-center
            ${isDataLoading 
              ? 'border-cyan-500 shadow-[0_0_20px_#00f2ff] cursor-wait' 
              : 'border-[#bc13fe] shadow-[0_0_30px_rgba(188,19,254,0.6)] hover:shadow-[0_0_50px_#00f2ff] hover:border-[#00f2ff] hover:scale-110 active:scale-90'}
            ${isSpinning ? 'opacity-50 cursor-not-allowed' : ''}
          `}
        >
          {isDataLoading ? "SİNYAL\nALINIYOR" : isSpinning ? "TARANIYOR" : "SİSTEMİ\nTETİKLE"}
        </button>
      </div>

      {/* Dekoratif Alt Çizgi */}
      <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 w-full h-[1px] 
                      bg-gradient-to-r from-transparent via-cyan-500/20 to-transparent blur-[1px]" />
    </div>
  );
}