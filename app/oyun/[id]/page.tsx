import { supabase } from '@/lib/supabase';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import RadarBileseni from '@/components/RadarBileseni';

export const revalidate = 0;

interface Props {
  params: Promise<{ id: string }>;
}

export default async function OyunDetay({ params }: Props) {
  const { id } = await params;

  // Kullanıcı ve Veri Çekme
  const { data: { user } } = await supabase.auth.getUser();
  const isAdmin = !!user;

  const [oyunRes, yorumRes] = await Promise.all([
    supabase.from('oyunlar').select('*').eq('id', id).single(),
    supabase.from('yorumlar').select('*').eq('oyun_id', id).order('created_at', { ascending: false })
  ]);

  if (oyunRes.error || !oyunRes.data) return notFound();
  const oyun = oyunRes.data;
  const yorumlar = yorumRes.data || [];

  // Benzer Oyunları Çek
  const { data: benzerOyunlar } = await supabase
    .from('oyunlar')
    .select('id, ad, resim_url, puan, tur')
    .eq('tur', oyun.tur)
    .neq('id', id)
    .limit(3);

  // --- Server Actions ---
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
    <div className="min-h-screen bg-[#020617] text-white relative selection:bg-purple-500/30">
      {/* Arka Plan Efektleri */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-purple-900/20 blur-[120px] rounded-full"></div>
        <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-900/20 blur-[120px] rounded-full"></div>
      </div>

      <div className="max-w-7xl mx-auto p-6 pt-12">
        {/* Üst Navigasyon */}
        <div className="flex justify-between items-center mb-16">
          <Link href="/" className="group flex items-center gap-2 text-slate-400 hover:text-purple-400 transition-all font-bold tracking-widest text-xs italic">
            <span className="group-hover:-translate-x-1 transition-transform">←</span> ANA GALAKSİYE DÖN
          </Link>
          {isAdmin && (
            <span className="bg-green-500/10 text-green-500 text-[10px] px-4 py-1.5 rounded-full border border-green-500/20 font-black tracking-tighter uppercase animate-pulse">
              Admin Yetkisi Aktif
            </span>
          )}
        </div>

        {/* --- ANA İÇERİK ALANI --- */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 mb-24">
          
          {/* SOL SÜTUN: Görsel & Satın Al */}
          <div className="lg:col-span-4 space-y-8">
            <div className="relative aspect-[3/4] rounded-[2.5rem] overflow-hidden border border-white/10 shadow-2xl shadow-purple-900/20 lg:sticky lg:top-12">
              <Image src={oyun.resim_url} alt={oyun.ad} fill className="object-cover" priority unoptimized />
              {oyun.puan >= 9.0 && (
                <div className="absolute top-8 left-[-35px] bg-gradient-to-r from-yellow-600 to-yellow-400 text-black font-black text-[10px] py-1 w-[150px] text-center -rotate-45 shadow-2xl z-10 uppercase tracking-widest">
                  ELİT SEÇİM
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-[#020617] via-transparent to-transparent opacity-70"></div>
              <div className="absolute bottom-8 left-8 right-8 flex justify-between items-center">
                 <div className="bg-black/60 backdrop-blur-md px-5 py-2 rounded-2xl border border-white/10">
                    <span className="text-yellow-400 font-black text-3xl italic">⭐ {oyun.puan}</span>
                 </div>
                 <span className="bg-purple-600 px-4 py-1.5 rounded-xl text-[10px] font-black tracking-widest uppercase italic shadow-lg">
                    {oyun.tur}
                 </span>
              </div>
            </div>

            <div className="flex flex-col gap-3 pt-4">
              <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] italic ml-2">Mağaza Bağlantıları</h4>
              {oyun.steam_url && (
                <a href={oyun.steam_url} target="_blank" className="flex items-center justify-center gap-3 w-full bg-slate-800 hover:bg-indigo-600 text-white py-5 rounded-2xl font-black text-[11px] transition-all border border-white/10 shadow-xl group uppercase tracking-widest">
                    Steam Mağazası <span className="group-hover:translate-x-1 transition-transform">→</span>
                </a>
              )}
              {oyun.epic_url && (
                <a href={oyun.epic_url} target="_blank" className="flex items-center justify-center gap-3 w-full bg-white text-black hover:bg-slate-200 py-5 rounded-2xl font-black text-[11px] transition-all shadow-xl group uppercase tracking-widest">
                    Epic Games Store <span className="group-hover:translate-x-1 transition-transform">→</span>
                </a>
              )}
            </div>
          </div>

          {/* SAĞ SÜTUN: Detaylar */}
          <div className="lg:col-span-8 space-y-12">
            <div>
              <span className="text-[10px] font-bold text-purple-500 uppercase tracking-[0.4em] mb-4 block">
                ⏱️ {Math.ceil((oyun.ozet?.length || 0) / 1000)} Dakikalık Derin Analiz
              </span>
              <h1 className="text-6xl md:text-[90px] font-black italic tracking-tighter uppercase leading-[0.85] drop-shadow-2xl">
                {oyun.ad}
              </h1>
            </div>
            
            <div className="bg-slate-900/30 backdrop-blur-sm p-10 rounded-[3rem] border border-white/5 shadow-inner">
               <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.4em] mb-10 italic">Yetenek ve Performans Matrisi</h3>
               <RadarBileseni 
                  genelPuan={oyun.puan} 
                  puanlar={{
                    atmosfer: oyun.atmosfer || 0,
                    oynanis: oyun.oynanis || 0,
                    grafik: oyun.grafik || 0,
                    hikaye: oyun.hikaye || 0,
                    ses: oyun.ses || 0,
                    performans: oyun.performans || 0,
                    ai: oyun.ai || 0,
                    tekrar: oyun.tekrar || 0
                  }} 
               />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-green-500/5 border border-green-500/10 rounded-[2.5rem] p-10 relative overflow-hidden group">
                <h4 className="text-green-500 font-black text-[10px] uppercase tracking-[0.4em] mb-6 italic">GÜÇLÜ YANLAR</h4>
                <ul className="space-y-4">
                  {oyun.artilar?.split(',').map((arti: string, i: number) => (
                    <li key={i} className="flex items-start gap-3 text-slate-300 text-sm leading-relaxed italic">
                      <span className="text-green-500 font-bold">✓</span> {arti.trim()}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="bg-red-500/5 border border-red-500/10 rounded-[2.5rem] p-10 relative overflow-hidden group">
                <h4 className="text-red-500 font-black text-[10px] uppercase tracking-[0.4em] mb-6 italic">ZAYIF YANLAR</h4>
                <ul className="space-y-4">
                  {oyun.eksiler?.split(',').map((eksi: string, i: number) => (
                    <li key={i} className="flex items-start gap-3 text-slate-300 text-sm leading-relaxed italic">
                      <span className="text-red-500 font-bold">✕</span> {eksi.trim()}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="bg-slate-900/20 border-l-8 border-purple-600 p-10 rounded-r-[3rem] relative overflow-hidden">
               <div className="absolute top-0 right-0 w-64 h-64 bg-purple-600/5 blur-[100px] rounded-full"></div>
               <div 
                 className="text-2xl text-slate-200 leading-[1.6] font-medium italic prose prose-invert max-w-none"
                 dangerouslySetInnerHTML={{ __html: oyun.ozet }} 
               />
            </div>
          </div>
        </div>

        {/* --- BENZER OYUNLAR --- */}
        {benzerOyunlar && benzerOyunlar.length > 0 && (
          <div className="mt-40 mb-20">
            <div className="flex items-center gap-6 mb-12">
              <h2 className="text-4xl font-black italic uppercase tracking-tighter">
                AYNI TÜRDE <span className="text-purple-500">DİĞER KEŞİFLER</span>
              </h2>
              <div className="h-px flex-grow bg-slate-800"></div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
              {benzerOyunlar.map((bo) => (
                <Link href={`/oyun/${bo.id}`} key={bo.id} className="group relative">
                  <div className="relative aspect-video rounded-[2.5rem] overflow-hidden border border-white/5 shadow-2xl transition-all duration-500 group-hover:-translate-y-4 group-hover:border-purple-500/50">
                    <Image src={bo.resim_url} alt={bo.ad} fill className="object-cover opacity-60 group-hover:opacity-100 transition-all duration-700" unoptimized />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#020617] via-transparent to-transparent"></div>
                    <div className="absolute bottom-8 left-8">
                      <span className="text-[9px] font-black text-purple-400 uppercase tracking-widest">{bo.tur} ANALİZİ</span>
                      <h4 className="text-xl font-black text-white uppercase italic leading-none">{bo.ad}</h4>
                    </div>
                    <div className="absolute top-6 right-6 bg-black/50 backdrop-blur-md px-4 py-1.5 rounded-full border border-white/10 text-xs font-black text-yellow-400">
                      ⭐ {bo.puan}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* --- DOSYA KONULARI VE BÜLTEN --- */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 mb-40">
          <div className="lg:col-span-7 space-y-8">
            <div className="flex items-center gap-4 mb-4">
              <h3 className="text-xl font-black italic uppercase text-slate-400 tracking-tighter">İLGİLİ <span className="text-white">DOSYA KONULARI</span></h3>
            </div>
            <div className="space-y-4">
              {benzerOyunlar?.map((bo) => (
                <Link href={`/oyun/${bo.id}`} key={`doc-${bo.id}`} className="group flex items-center gap-6 p-6 rounded-3xl bg-slate-900/20 border border-white/5 hover:border-purple-500/30 hover:bg-slate-900/40 transition-all">
                  <div className="w-24 h-16 relative rounded-xl overflow-hidden flex-shrink-0 opacity-40 group-hover:opacity-100 transition-all">
                    <Image src={bo.resim_url} alt={bo.ad} fill className="object-cover" unoptimized />
                  </div>
                  <div>
                    <span className="text-[9px] font-bold text-purple-500 uppercase tracking-[0.3em]">{bo.tur} İNCELEMESİ</span>
                    <h4 className="text-lg font-bold text-slate-300 group-hover:text-white transition-colors leading-tight uppercase italic italic">
                      {bo.ad}: Evrenin Sınırlarını Zorlayan Mekanikler
                    </h4>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          <div className="lg:col-span-5">
            <div className="bg-gradient-to-br from-purple-900/30 to-blue-900/30 border border-white/10 rounded-[3rem] p-12 relative overflow-hidden h-full flex flex-col justify-center">
               <div className="absolute -top-12 -right-12 w-48 h-48 bg-purple-500/20 blur-[60px] rounded-full"></div>
               <h4 className="text-3xl font-black italic uppercase leading-[0.9] mb-4">GALAKTİK BÜLTENE <br /> KATILIN</h4>
               <p className="text-sm text-slate-400 mb-10 italic font-medium">Yeni incelemeler ve kritik analizler radarınıza anında düşsün.</p>
               <div className="flex flex-col gap-3">
                 <input type="email" placeholder="E-posta Adresin..." className="bg-black/40 border border-white/10 rounded-2xl px-6 py-4 text-sm outline-none focus:border-purple-500 transition-all shadow-inner" />
                 <button className="bg-white text-black text-[11px] font-black py-4 rounded-2xl hover:bg-purple-600 hover:text-white transition-all uppercase tracking-[0.2em] shadow-xl">Abone Ol</button>
               </div>
            </div>
          </div>
        </div>

        {/* --- TOPLULUK GÖRÜŞLERİ --- */}
        <div className="max-w-4xl mx-auto space-y-16 pb-40">
          <div className="text-center">
            <h2 className="text-5xl font-black italic uppercase tracking-tighter mb-2">TOPLULUK <span className="text-purple-500">VERİLERİ</span></h2>
            <div className="h-1 w-24 bg-purple-600 mx-auto rounded-full"></div>
          </div>
          
          <form action={yorumYap} className="space-y-6 bg-slate-900/40 p-10 rounded-[3rem] border border-slate-800 shadow-2xl">
            <input name="kullanici" placeholder="Astronot Kimliğiniz..." required className="w-full md:w-1/2 bg-[#020617] p-5 rounded-2xl border border-slate-800 outline-none focus:ring-2 focus:ring-purple-500 transition-all text-white font-bold" />
            <textarea name="icerik" placeholder="Düşüncelerinizi uzaya fırlatın..." required rows={5} className="w-full bg-[#020617] p-5 rounded-2xl border border-slate-800 outline-none focus:ring-2 focus:ring-purple-500 transition-all text-white italic" />
            <button type="submit" className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 py-5 rounded-[2rem] font-black uppercase tracking-[0.3em] transition-all shadow-2xl shadow-purple-900/40">
              YORUMU SİNYALE DÖNÜŞTÜR
            </button>
          </form>

          <div className="space-y-8">
            {yorumlar.length === 0 ? (
              <div className="text-center py-20 border-2 border-dashed border-slate-800 rounded-[3rem]">
                <p className="text-slate-600 italic font-bold tracking-widest uppercase">Bu bölge henüz sessiz...</p>
              </div>
            ) : (
              yorumlar.map((y) => (
                <div key={y.id} className="bg-[#0f172a]/40 p-10 rounded-[3rem] border border-slate-800 hover:border-slate-700 transition-all group relative">
                  <div className="flex justify-between items-start mb-6">
                    <div className="flex items-center gap-5">
                      <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center font-black text-xl shadow-xl">
                        {y.kullanici_adi[0].toUpperCase()}
                      </div>
                      <div className="flex flex-col">
                        <span className="text-white font-black text-lg">@{y.kullanici_adi}</span>
                        <span className="text-slate-500 text-[10px] uppercase font-bold tracking-widest italic">{new Date(y.created_at).toLocaleDateString('tr-TR')}</span>
                      </div>
                    </div>
                    {isAdmin && (
                      <form action={async () => { 'use server'; await yorumSil(y.id); }}>
                        <button className="bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white text-[10px] font-black px-5 py-2.5 rounded-xl transition-all border border-red-500/20 uppercase">Sil</button>
                      </form>
                    )}
                  </div>
                  <p className="text-slate-300 text-xl leading-relaxed italic pl-2 border-l-2 border-purple-500/30">{y.icerik}</p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}