'use client';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

export default function AdminPage() {
  const [yukleniyor, setYukleniyor] = useState(true);
  const [oyunlar, setOyunlar] = useState<any[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const router = useRouter();

  // FORM STATE'LERİ
  const [ad, setAd] = useState('');
  const [tur, setTur] = useState('');
  const [puan, setPuan] = useState('');
  const [resimUrl, setResimUrl] = useState('');
  const [ozet, setOzet] = useState('');

  useEffect(() => {
    verileriGetir();
  }, []);

  async function verileriGetir() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      router.push('/login');
      return;
    }

    const { data } = await supabase.from('oyunlar').select('*').order('created_at', { ascending: false });
    setOyunlar(data || []);
    setYukleniyor(false);
  }

  // YENİ OYUN EKLEME
  async function oyunEkle(e: React.FormEvent) {
    e.preventDefault();
    setIsAdding(true);

    const { error } = await supabase.from('oyunlar').insert([
      { ad, tur, puan: parseFloat(puan), resim_url: resimUrl, ozet }
    ]);

    if (error) alert("Hata: " + error.message);
    else {
      alert("Oyun başarıyla eklendi!");
      setAd(''); setTur(''); setPuan(''); setResimUrl(''); setOzet('');
      verileriGetir(); // Listeyi güncelle
    }
    setIsAdding(false);
  }

  // OYUN SİLME
  async function oyunSil(id: string) {
    if (!confirm("Bu incelemeyi silmek istediğine emin misin?")) return;

    const { error } = await supabase.from('oyunlar').delete().eq('id', id);
    if (error) alert("Silinemedi: " + error.message);
    else verileriGetir();
  }

  if (yukleniyor) return <div className="min-h-screen bg-[#0f172a] flex items-center justify-center text-white">Yükleniyor...</div>;

  return (
    <div className="min-h-screen bg-[#0f172a] text-white p-4 md:p-10">
      <div className="max-w-6xl mx-auto">
        
        {/* ÜST BAŞLIK */}
        <div className="flex justify-between items-center mb-10">
          <h1 className="text-3xl font-black bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent italic">ADMIN KONTROL PANELİ</h1>
          <button onClick={() => window.location.href = '/'} className="text-slate-400 hover:text-white transition">← Siteye Dön</button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          
          {/* SOL TARAF: OYUN EKLEME FORMU */}
          <div className="lg:col-span-1">
            <form onSubmit={oyunEkle} className="bg-slate-800/40 p-6 rounded-3xl border border-slate-700 sticky top-10">
              <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                <span className="text-green-400">✚</span> Yeni İnceleme Yaz
              </h2>
              <div className="space-y-4">
                <input value={ad} onChange={e => setAd(e.target.value)} placeholder="Oyun Adı" className="w-full bg-slate-900 p-3 rounded-xl border border-slate-700 outline-none focus:border-purple-500" required />
                <input value={tur} onChange={e => setTur(e.target.value)} placeholder="Tür (RPG, FPS vb.)" className="w-full bg-slate-900 p-3 rounded-xl border border-slate-700 outline-none focus:border-purple-500" required />
                <input value={puan} onChange={e => setPuan(e.target.value)} type="number" step="0.1" placeholder="Puan (0-10)" className="w-full bg-slate-900 p-3 rounded-xl border border-slate-700 outline-none focus:border-purple-500" required />
                <input value={resimUrl} onChange={e => setResimUrl(e.target.value)} placeholder="Resim URL (URL olarak)" className="w-full bg-slate-900 p-3 rounded-xl border border-slate-700 outline-none focus:border-purple-500" required />
                <textarea value={ozet} onChange={e => setOzet(e.target.value)} placeholder="İnceleme özeti..." rows={5} className="w-full bg-slate-900 p-3 rounded-xl border border-slate-700 outline-none focus:border-purple-500" required />
                <button disabled={isAdding} className="w-full bg-purple-600 hover:bg-purple-500 p-4 rounded-xl font-bold shadow-lg shadow-purple-500/20 transition-all disabled:opacity-50">
                  {isAdding ? 'Yayınlanıyor...' : 'İncelemeyi Yayınla'}
                </button>
              </div>
            </form>
          </div>

          {/* SAĞ TARAF: YAZILARI GÖRÜNTÜLEME VE DÜZENLEME/SİLME */}
          <div className="lg:col-span-2 space-y-4">
            <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
              <span className="text-purple-400">📝</span> Mevcut Yazılar ({oyunlar.length})
            </h2>
            
            {oyunlar.map((oyun) => (
              <div key={oyun.id} className="bg-slate-800/20 border border-slate-800 p-4 rounded-2xl flex items-center gap-4 hover:bg-slate-800/40 transition-all">
                <div className="relative w-20 h-20 rounded-lg overflow-hidden flex-shrink-0 border border-slate-700">
                  <Image src={oyun.resim_url} alt={oyun.ad} fill className="object-cover" />
                </div>
                <div className="flex-grow">
                  <h3 className="font-bold text-lg">{oyun.ad}</h3>
                  <p className="text-xs text-slate-500">{oyun.tur} • ⭐ {oyun.puan}</p>
                </div>
                <div className="flex gap-2">
                  <button 
                    onClick={() => router.push(`/oyun/${oyun.id}`)}
                    className="p-2 bg-blue-500/10 text-blue-500 rounded-lg hover:bg-blue-500 hover:text-white transition"
                    title="Yorumları Yönet"
                  >
                    💬
                  </button>
                  <button 
                    onClick={() => oyunSil(oyun.id)}
                    className="p-2 bg-red-500/10 text-red-500 rounded-lg hover:bg-red-500 hover:text-white transition"
                    title="Sil"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            ))}
          </div>

        </div>
      </div>
    </div>
  );
}