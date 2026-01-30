'use client';
import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import Image from 'next/image';

interface Oyun {
  id: string;
  ad: string;
  tur: string;
  puan: number;
  resim_url: string;
  ozet: string;
}

interface Yorum {
  id: string;
  kullanici_adi: string;
  icerik: string;
  oyun_id: string;
}

export default function AdminPage() {
  const [yukleniyor, setYukleniyor] = useState(true);
  const [oyunlar, setOyunlar] = useState<Oyun[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [seciliOyunYorumlari, setSeciliOyunYorumlari] = useState<Yorum[]>([]);
  const [aktifOyunId, setAktifOyunId] = useState<string | null>(null);
  const [duzenlemeId, setDuzenlemeId] = useState<string | null>(null);

  const [ad, setAd] = useState('');
  const [tur, setTur] = useState('');
  const [puan, setPuan] = useState('');
  const [resimUrl, setResimUrl] = useState('');
  const [ozet, setOzet] = useState('');

  const verileriGetir = useCallback(async () => {
    const { data } = await supabase.from('oyunlar').select('*').order('created_at', { ascending: false });
    setOyunlar(data || []);
    setYukleniyor(false);
  }, []);

  const oturumKontrol = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      window.location.replace('/login');
    } else {
      await verileriGetir();
    }
  }, [verileriGetir]);

  useEffect(() => {
    oturumKontrol();
  }, [oturumKontrol]);

  function duzenle(oyun: Oyun) {
    setDuzenlemeId(oyun.id);
    setAd(oyun.ad);
    setTur(oyun.tur);
    setPuan(oyun.puan.toString());
    setResimUrl(oyun.resim_url);
    setOzet(oyun.ozet);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsAdding(true);
    const veri = { ad, tur, puan: parseFloat(puan), resim_url: resimUrl, ozet };

    if (duzenlemeId) {
      const { error } = await supabase.from('oyunlar').update(veri).eq('id', duzenlemeId);
      if (!error) {
        alert("Güncellendi!");
        setDuzenlemeId(null);
      }
    } else {
      const { error } = await supabase.from('oyunlar').insert([veri]);
      if (!error) alert("Eklendi!");
    }

    setAd(''); setTur(''); setPuan(''); setResimUrl(''); setOzet('');
    await verileriGetir();
    setIsAdding(false);
  }

  async function oyunSil(id: string) {
    if (!confirm("Emin misin?")) return;
    await supabase.from('oyunlar').delete().eq('id', id);
    await verileriGetir();
  }

  async function yorumlariGoster(oyunId: string) {
    setAktifOyunId(oyunId);
    const { data } = await supabase.from('yorumlar').select('*').eq('oyun_id', oyunId).order('created_at', { ascending: false });
    setSeciliOyunYorumlari(data || []);
  }

  async function yorumSil(yorumId: string) {
    if (!confirm("Silinsin mi?")) return;
    await supabase.from('yorumlar').delete().eq('id', yorumId);
    setSeciliOyunYorumlari(prev => prev.filter(y => y.id !== yorumId));
  }

  if (yukleniyor) {
    return (
      <div className="min-h-screen bg-[#0f172a] flex items-center justify-center text-white italic">
        Kontrol ediliyor...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0f172a] text-white p-6 md:p-10">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-10">
          <h1 className="text-3xl font-black bg-linear-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent italic">
            ADMIN PANEL
          </h1>
          <button 
            onClick={() => window.location.href = '/'} 
            className="text-slate-400 hover:text-white transition text-sm underline"
          >
            Siteden Çık
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-4">
            <form 
              onSubmit={handleSubmit} 
              className={`p-6 rounded-3xl border transition-all sticky top-10 ${
                duzenlemeId ? 'border-yellow-500/50 bg-yellow-500/5' : 'border-slate-700 bg-slate-800/40'
              }`}
            >
              <h2 className="text-xl font-bold mb-6">
                {duzenlemeId ? '✏️ Yazıyı Düzenle' : '✚ Yeni İnceleme'}
              </h2>
              <div className="space-y-4">
                <input value={ad} onChange={e => setAd(e.target.value)} placeholder="Oyun Adı" className="w-full bg-slate-900/50 p-3 rounded-xl border border-slate-700 outline-none focus:border-purple-500" required />
                <input value={tur} onChange={e => setTur(e.target.value)} placeholder="Tür" className="w-full bg-slate-900/50 p-3 rounded-xl border border-slate-700 outline-none focus:border-purple-500" required />
                <input value={puan} onChange={e => setPuan(e.target.value)} type="number" step="0.1" placeholder="Puan" className="w-full bg-slate-900/50 p-3 rounded-xl border border-slate-700 outline-none focus:border-purple-500" required />
                <input value={resimUrl} onChange={e => setResimUrl(e.target.value)} placeholder="Resim URL" className="w-full bg-slate-900/50 p-3 rounded-xl border border-slate-700 outline-none focus:border-purple-500" required />
                <textarea value={ozet} onChange={e => setOzet(e.target.value)} placeholder="Özet..." rows={4} className="w-full bg-slate-900/50 p-3 rounded-xl border border-slate-700 outline-none focus:border-purple-500" required />
                <button 
                  disabled={isAdding} 
                  className={`w-full p-4 rounded-xl font-bold transition-all ${duzenlemeId ? 'bg-yellow-600' : 'bg-purple-600'}`}
                >
                  {isAdding ? '...' : (duzenlemeId ? 'Güncelle' : 'Yayınla')}
                </button>
                {duzenlemeId && (
                  <button 
                    type="button" 
                    onClick={() => {setDuzenlemeId(null); setAd(''); setTur(''); setPuan(''); setResimUrl(''); setOzet('');}} 
                    className="w-full text-slate-500 text-xs mt-2"
                  >
                    Vazgeç
                  </button>
                )}
              </div>
            </form>
          </div>

          <div className="lg:col-span-8 space-y-4">
            <h2 className="text-xl font-bold text-slate-400 italic mb-4">Mevcut İçerikler</h2>
            {oyunlar.map((oyun) => (
              <div key={oyun.id} className="bg-slate-800/20 border border-slate-800 p-4 rounded-2xl flex flex-col gap-4">
                <div className="flex items-center gap-4">
                  <div className="relative w-14 h-14 rounded-lg overflow-hidden shrink-0 border border-slate-700">
                    <Image src={oyun.resim_url} alt={oyun.ad} fill className="object-cover" />
                  </div>
                  <div className="grow">
                    <h3 className="font-bold">{oyun.ad}</h3>
                    <p className="text-[10px] text-slate-500 uppercase">{oyun.tur} • ⭐ {oyun.puan}</p>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => duzenle(oyun)} className="p-2 bg-yellow-500/10 text-yellow-500 rounded-lg hover:bg-yellow-500 hover:text-white transition">✏️</button>
                    <button onClick={() => yorumlariGoster(oyun.id)} className="p-2 bg-blue-500/10 text-blue-500 rounded-lg hover:bg-blue-500 hover:text-white transition">💬</button>
                    <button onClick={() => oyunSil(oyun.id)} className="p-2 bg-red-500/10 text-red-500 rounded-lg hover:bg-red-500 hover:text-white transition">🗑️</button>
                  </div>
                </div>
                {aktifOyunId === oyun.id && (
                  <div className="bg-slate-900/50 p-4 rounded-xl border border-blue-500/20">
                    <div className="space-y-2">
                      {seciliOyunYorumlari.length === 0 ? (
                        <p className="text-xs text-slate-600">Henüz yorum yok.</p>
                      ) : (
                        seciliOyunYorumlari.map(y => (
                          <div key={y.id} className="bg-slate-800/50 p-2 rounded flex justify-between items-center text-xs">
                            <p><span className="text-purple-400 font-bold">@{y.kullanici_adi}:</span> {y.icerik}</p>
                            <button onClick={() => yorumSil(y.id)} className="text-red-500 ml-2 font-bold hover:underline">SİL</button>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}