'use client';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, ResponsiveContainer } from 'recharts';

// Puanların yapısını buraya tanımlıyoruz
interface Puanlar {
  atmosfer: number;
  oynanis: number;
  grafik: number;
  hikaye: number;
  ses: number;
  performans: number;
  ai: number;
  tekrar: number;
}

interface RadarProps {
  puanlar: Puanlar;
  genelPuan: number;
}

export default function RadarBileseni({ puanlar, genelPuan }: RadarProps) {

  const data = Object.keys(puanlar).map((key) => ({
    subject: key.toUpperCase(),
    A: puanlar[key as keyof Puanlar], 
  }));

  return (
    <div className="bg-slate-900/20 border border-white/5 p-8 rounded-[2rem] grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
      <div className="h-56 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart cx="50%" cy="50%" outerRadius="80%" data={data}>
            <PolarGrid stroke="#1e293b" />
            <PolarAngleAxis dataKey="subject" tick={{ fill: '#475569', fontSize: 9, fontWeight: 'bold' }} />
            <Radar dataKey="A" stroke="#a855f7" fill="#a855f7" fillOpacity={0.5} />
          </RadarChart>
        </ResponsiveContainer>
      </div>
      <div className="space-y-3">
        <div className="text-4xl font-black italic text-purple-500 mb-4">
          {genelPuan}<span className="text-xs text-slate-600"> / 10</span>
        </div>
        {data.map((item) => (
          <div key={item.subject} className="space-y-1">
            <div className="flex justify-between text-[9px] font-black text-slate-500 uppercase tracking-tighter">
              <span>{item.subject}</span>
              <span className="text-white">{item.A}</span>
            </div>
            <div className="h-1 w-full bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-purple-600 transition-all duration-700"
                style={{ width: `${(item.A || 0) * 10}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}