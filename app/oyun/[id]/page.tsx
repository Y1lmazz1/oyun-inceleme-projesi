import { supabase } from '@/lib/supabase';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { revalidatePath } from 'next/cache';

export const revalidate = 0;

interface Props {
  params: Promise<{ id: string }>;
}

export default async function OyunDetay({ params }: Props) {
  const { id } = await params;

  const { data: { user } } = await supabase.auth.getUser();
  const isAdmin = !!user;

  const [oyunRes, yorumRes] = await Promise.all([
    supabase.from('oyunlar').select('*').eq('id', id).single(),
    supabase.from('yorumlar').select('*').eq('oyun_id', id).order('created_at', { ascending: false })
  ]);

  if (oyunRes.error || !oyunRes.data) return notFound();
  const oyun = oyunRes.data;
  const yorumlar = yorumRes.data || [];

  // Server Actions
  async function yorumYap(formData: FormData) {
    'use server';
    const icerik = formData.get('icerik');
    const kullanici = formData.get('kullanici');
    await supabase.from('yorumlar').insert([{ oyun_id: id, kullanici_adi: kullanici, icerik: icerik }]);
    revalidatePath(`/oyun/${id}`);
  }

  async function yorumSil(commentId: string) {
    'use server';
    await supabase.from('yorumlar').delete().eq('id', commentId);
    revalidatePath(`/oyun/${id}`);
  }

  return (
    <div className="min-h-screen bg-[#020617] text-white relative">
      {/* Arka Plan Neon Blur Süslemeleri */}
      <div className="fixed top-0 left-0 w-full h-full -z-10 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-900/20 blur-[120px] rounded-full"></div>
        <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-900/20 blur-[120px] rounded-full"></div>
      </div>

      <div className="max-w-5xl mx-auto p-6 pt-12">
        {/* Üst Navigasyon */}
        <div className="flex justify-between items-center mb-12">
          <Link href="/" className="group flex items-center gap-2 text-slate-400 hover:text-purple-400 transition-all font-bold tracking-widest text-xs">
            <span className="group-hover:-translate-x-1 transition-transform">←</span> ANA GALAKSİYE DÖN
          </Link>
          {isAdmin && (
            <span className="bg-green-500/10 text-green-500 text-[10px] px-4 py-1.5 rounded-full border border-green-500/20 font-black tracking-tighter uppercase shadow-[0_0_15px_rgba(34,197,94,0.2)]">
              Admin Yetkisi Aktif
            </span>
          )}
        </div>

        {/* Oyun Kahraman Alanı (Hero Section) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 mb-20">
          <div className="lg:col-span-5">
            <div className="relative aspect-[3/4] rounded-[2.5rem] overflow-hidden border border-white/10 shadow-[0_0_50px_rgba(168,85,247,0.15)] group">
              <Image src={oyun.resim_url} alt={oyun.ad} fill className="object-cover transition-transform duration-1000 group-hover:scale-105" priority />
              <div className="absolute inset-0 bg-gradient-to-t from-[#020617] via-transparent to-transparent opacity-60"></div>
              <div className="absolute bottom-6 left-6 right-6 flex justify-between items-end">
                <div className="bg-black/60 backdrop-blur-md px-4 py-2 rounded-2xl border border-white/10">
                  <span className="text-yellow-400 font-black text-2xl">⭐ {oyun.puan}<span className="text-xs text-slate-500">/10</span></span>
                </div>
                <span className="bg-purple-600 px-4 py-1.5 rounded-xl text-[10px] font-black tracking-widest uppercase">{oyun.tur}</span>
              </div>
            </div>
          </div>

          <div className="lg:col-span-7 flex flex-col justify-center space-y-8">
            <h1 className="text-7xl font-black italic tracking-tighter uppercase leading-none drop-shadow-[0_0_15px_rgba(255,255,255,0.2)]">
              {oyun.ad}
            </h1>
            <div className="bg-slate-900/40 backdrop-blur-md border border-slate-800 p-8 rounded-[2rem] relative overflow-hidden group">
              <div className="absolute top-0 left-0 w-1 h-full bg-purple-600 shadow-[0_0_15px_#a855f7]"></div>
              <p className="text-xl text-slate-300 leading-relaxed italic font-medium">
                &quot;{oyun.ozet}&quot;
              </p>
            </div>
          </div>
        </div>

        {/* Yorumlar Bölümü */}
        <div className="max-w-3xl mx-auto space-y-12">
          <div className="flex items-center gap-4">
            <h2 className="text-3xl font-black tracking-tight">TOPLULUK <span className="text-purple-500">GÖRÜŞLERİ</span></h2>
            <div className="h-[2px] flex-grow bg-slate-800/50"></div>
          </div>
          
          {/* Yorum Yap Formu */}
          <form action={yorumYap} className="space-y-4 bg-slate-900/30 p-8 rounded-[2.5rem] border border-slate-800 focus-within:border-purple-500/50 transition-all shadow-2xl">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input name="kullanici" placeholder="Astronot Adın..." required className="bg-slate-950/50 p-4 rounded-2xl border border-slate-800 outline-none focus:ring-1 focus:ring-purple-500 text-white placeholder:text-slate-600 transition-all" />
            </div>
            <textarea name="icerik" placeholder="Düşüncelerini uzaya fırlat..." required rows={4} className="w-full bg-slate-950/50 p-4 rounded-2xl border border-slate-800 outline-none focus:ring-1 focus:ring-purple-500 text-white placeholder:text-slate-600 transition-all" />
            <button type="submit" className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 py-4 rounded-2xl font-black uppercase tracking-[0.2em] transition-all shadow-[0_0_20px_rgba(168,85,247,0.3)] hover:shadow-[0_0_30px_rgba(168,85,247,0.5)] active:scale-[0.98]">
              YORUMU GÖNDER
            </button>
          </form>

          {/* Yorum Listesi */}
          <div className="space-y-6 pt-6 pb-20">
            {yorumlar.length === 0 && (
              <div className="text-center py-20 bg-slate-900/20 rounded-[2.5rem] border border-dashed border-slate-800">
                <p className="text-slate-600 italic">Bu bölge henüz keşfedilmemiş. İlk yorumu sen yap!</p>
              </div>
            )}
            {yorumlar.map((y) => (
              <div key={y.id} className="group bg-[#0f172a]/40 backdrop-blur-sm p-8 rounded-[2.5rem] border border-slate-800 hover:border-slate-700 transition-all">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center font-black shadow-lg shadow-purple-900/20">
                      {y.kullanici_adi[0].toUpperCase()}
                    </div>
                    <div className="flex flex-col">
                      <span className="text-white font-bold tracking-tight">@{y.kullanici_adi}</span>
                      <span className="text-slate-500 text-[10px] uppercase tracking-widest font-bold">
                        {new Date(y.created_at).toLocaleDateString('tr-TR')}
                      </span>
                    </div>
                  </div>
                  
                  {isAdmin && (
                    <form action={async () => { 'use server'; await yorumSil(y.id); }}>
                      <button className="bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white text-[9px] font-black px-4 py-2 rounded-xl transition-all border border-red-500/20 tracking-tighter shadow-lg">
                        SİL
                      </button>
                    </form>
                  )}
                </div>
                <p className="text-slate-400 leading-relaxed text-lg pl-1">{y.icerik}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}