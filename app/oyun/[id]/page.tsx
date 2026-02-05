import { supabase } from '@/lib/supabase';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import RadarBileseni from '@/components/RadarBileseni';
import * as motion from "framer-motion/client"; // Client animasyonları için

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
    <div className="min-h-screen bg-[#020617] text-white relative selection:bg-purple-500/30 overflow-x-hidden">
      {/* Dinamik Arka Plan Efektleri */}
      <div className="fixed inset-0 -z-10 pointer-events-none">
        <div className="absolute top-[-10%] right-[-10%] w-[60%] h-[60%] bg-purple-900/10 blur-[140px] rounded-full animate-pulse"></div>
        <div className="absolute bottom-[-10%] left-[-10%] w-[60%] h-[60%] bg-blue-900/10 blur-[140px] rounded-full animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>

      <div className="max-w-7xl mx-auto p-6 pt-12">
        {/* Üst Navigasyon */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex justify-between items-center mb-16"
        >
          <Link href="/" className="group flex items-center gap-2 text-slate-400 hover:text-purple-400 transition-all font-bold tracking-widest text-xs italic">
            <span className="group-hover:-translate-x-2 transition-transform">←</span> ANA GALAKSİYE DÖN
          </Link>
          {isAdmin && (
            <div className="relative group">
               <div className="absolute inset-0 bg-green-500/20 blur-md rounded-full animate-ping"></div>
               <span className="relative bg-black/40 backdrop-blur-md text-green-500 text-[10px] px-4 py-1.5 rounded-full border border-green-500/40 font-black tracking-tighter uppercase shadow-[0_0_15px_rgba(34,197,94,0.3)]">
                Admin Yetkisi Aktif
              </span>
            </div>
          )}
        </motion.div>

        {/* --- ANA İÇERİK ALANI --- */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 mb-24">
          
          {/* SOL SÜTUN: Görsel & Satın Al */}
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-4 space-y-8"
          >
            <div className="relative aspect-[3/4] rounded-[2.5rem] overflow-hidden border border-white/10 shadow-2xl shadow-purple-900/20 lg:sticky lg:top-12 group">
              <Image src={oyun.resim_url} alt={oyun.ad} fill className="object-cover transition-transform duration-700 group-hover:scale-110" priority unoptimized />
              {oyun.puan >= 9.0 && (
                <div className="absolute top-8 left-[-35px] bg-gradient-to-r from-yellow-600 to-yellow-400 text-black font-black text-[10px] py-1 w-[150px] text-center -rotate-45 shadow-2xl z-10 uppercase tracking-widest">
                  ELİT SEÇİM
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-[#020617] via-transparent to-transparent opacity-90"></div>
              <div className="absolute bottom-8 left-8 right-8 flex justify-between items-end">
                 <div className="bg-black/60 backdrop-blur-xl px-5 py-3 rounded-2xl border border-white/10 shadow-2xl">
                    <span className="text-yellow-400 font-black text-4xl italic drop-shadow-[0_0_10px_rgba(250,204,21,0.5)]">⭐ {oyun.puan}</span>
                 </div>
                 <span className="bg-purple-600/80 backdrop-blur-md px-4 py-2 rounded-xl text-[10px] font-black tracking-widest uppercase italic shadow-lg border border-white/20">
                    {oyun.tur}
                 </span>
              </div>
            </div>

            <div className="flex flex-col gap-3 pt-4">
              <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] italic ml-2">Hızlı Erişim Kanalları</h4>
              {oyun.steam_url && (
                <a href={oyun.steam_url} target="_blank" className="relative overflow-hidden flex items-center justify-center gap-3 w-full bg-slate-800 hover:bg-indigo-600 text-white py-5 rounded-2xl font-black text-[11px] transition-all border border-white/10 shadow-xl group uppercase tracking-widest">
                    <div className="absolute inset-0 bg-white/5 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
                    <span className="relative">Steam Mağazası</span> <span className="relative group-hover:translate-x-2 transition-transform">→</span>
                </a>
              )}
              {oyun.epic_url && (
                <a href={oyun.epic_url} target="_blank" className="flex items-center justify-center gap-3 w-full bg-white text-black hover:bg-slate-200 py-5 rounded-2xl font-black text-[11px] transition-all shadow-xl group uppercase tracking-widest">
                    Epic Games Store <span className="group-hover:translate-x-2 transition-transform">→</span>
                </a>
              )}
            </div>
          </motion.div>

          {/* SAĞ SÜTUN: Detaylar */}
          <div className="lg:col-span-8 space-y-12">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <span className="text-[10px] font-bold text-purple-500 uppercase tracking-[0.4em] mb-4 block">
                ⏱️ {Math.ceil((oyun.ozet?.length || 0) / 1000)} Dakikalık Derin Analiz
              </span>
              <h1 className="text-6xl md:text-[95px] font-black italic tracking-tighter uppercase leading-[0.85] drop-shadow-2xl bg-clip-text text-transparent bg-gradient-to-b from-white to-slate-500">
                {oyun.ad}
              </h1>
            </motion.div>
            
            <motion.div 
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="bg-slate-900/30 backdrop-blur-sm p-10 rounded-[3rem] border border-white/5 shadow-inner group"
            >
               <h3 className="text-[10px] font-bold text-slate-500 group-hover:text-purple-400 transition-colors uppercase tracking-[0.4em] mb-10 italic">Yetenek ve Performans Matrisi</h3>
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
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <motion.div whileHover={{ scale: 1.02 }} className="bg-green-500/5 border border-green-500/10 rounded-[2.5rem] p-10 relative overflow-hidden">
                <h4 className="text-green-500 font-black text-[10px] uppercase tracking-[0.4em] mb-6 italic">GÜÇLÜ YANLAR</h4>
                <ul className="space-y-4">
                  {oyun.artilar?.split(',').map((arti: string, i: number) => (
                    <li key={i} className="flex items-start gap-3 text-slate-300 text-sm leading-relaxed italic">
                      <span className="text-green-500 font-bold">✓</span> {arti.trim()}
                    </li>
                  ))}
                </ul>
              </motion.div>
              <motion.div whileHover={{ scale: 1.02 }} className="bg-red-500/5 border border-red-500/10 rounded-[2.5rem] p-10 relative overflow-hidden">
                <h4 className="text-red-500 font-black text-[10px] uppercase tracking-[0.4em] mb-6 italic">ZAYIF YANLAR</h4>
                <ul className="space-y-4">
                  {oyun.eksiler?.split(',').map((eksi: string, i: number) => (
                    <li key={i} className="flex items-start gap-3 text-slate-300 text-sm leading-relaxed italic">
                      <span className="text-red-500 font-bold">✕</span> {eksi.trim()}
                    </li>
                  ))}
                </ul>
              </motion.div>
            </div>

            <motion.div 
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="bg-slate-900/20 border-l-8 border-purple-600 p-10 rounded-r-[3rem] relative overflow-hidden"
            >
               <div className="absolute top-0 right-0 w-64 h-64 bg-purple-600/5 blur-[100px] rounded-full"></div>
               <div 
                 className="text-2xl text-slate-200 leading-[1.6] font-medium italic prose prose-invert max-w-none first-letter:text-6xl first-letter:font-black first-letter:text-purple-500 first-letter:mr-3 first-letter:float-left"
                 dangerouslySetInnerHTML={{ __html: oyun.ozet }} 
               />
            </motion.div>
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
              {benzerOyunlar.map((bo, idx) => (
                <motion.div
                  key={bo.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ delay: idx * 0.1 }}
                >
                  <Link href={`/oyun/${bo.id}`} className="group relative block">
                    <div className="relative aspect-video rounded-[2.5rem] overflow-hidden border border-white/5 shadow-2xl transition-all duration-500 group-hover:-translate-y-4 group-hover:border-purple-500/50">
                      <Image src={bo.resim_url} alt={bo.ad} fill className="object-cover opacity-60 group-hover:opacity-100 transition-all duration-700" unoptimized />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#020617] via-transparent to-transparent"></div>
                      <div className="absolute bottom-8 left-8">
                        <span className="text-[9px] font-black text-purple-400 uppercase tracking-widest">{bo.tur} ANALİZİ</span>
                        <h4 className="text-xl font-black text-white uppercase italic leading-none">{bo.ad}</h4>
                      </div>
                      <div className="absolute top-6 right-6 bg-black/50 backdrop-blur-md px-4 py-1.5 rounded-full border border-white/10 text-xs font-black text-yellow-400 shadow-xl">
                        ⭐ {bo.puan}
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* --- DOSYA KONULARI VE BÜLTEN --- */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 mb-40">
          <div className="lg:col-span-7 space-y-8">
            <h3 className="text-xl font-black italic uppercase text-slate-400 tracking-tighter">İLGİLİ <span className="text-white">DOSYA KONULARI</span></h3>
            <div className="space-y-4">
              {benzerOyunlar?.map((bo) => (
                <Link href={`/oyun/${bo.id}`} key={`doc-${bo.id}`} className="group flex items-center gap-6 p-6 rounded-3xl bg-slate-900/20 border border-white/5 hover:border-purple-500/30 hover:bg-slate-900/40 transition-all">
                  <div className="w-24 h-16 relative rounded-xl overflow-hidden flex-shrink-0 opacity-40 group-hover:opacity-100 transition-all">
                    <Image src={bo.resim_url} alt={bo.ad} fill className="object-cover" unoptimized />
                  </div>
                  <div>
                    <span className="text-[9px] font-bold text-purple-500 uppercase tracking-[0.3em]">{bo.tur} İNCELEMESİ</span>
                    <h4 className="text-lg font-bold text-slate-300 group-hover:text-white transition-colors leading-tight uppercase italic">
                      {bo.ad}: Evrenin Sınırlarını Zorlayan Mekanikler
                    </h4>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          <div className="lg:col-span-5">
            <div className="bg-gradient-to-br from-purple-900/40 to-blue-900/40 border border-white/10 rounded-[3rem] p-12 relative overflow-hidden h-full flex flex-col justify-center shadow-[0_0_50px_rgba(88,28,135,0.2)]">
               <div className="absolute -top-12 -right-12 w-48 h-48 bg-purple-500/20 blur-[60px] rounded-full"></div>
               <h4 className="text-3xl font-black italic uppercase leading-[0.9] mb-4">GALAKTİK BÜLTENE <br /> KATILIN</h4>
               <p className="text-sm text-slate-400 mb-10 italic font-medium">Yeni incelemeler ve kritik analizler radarınıza anında düşsün.</p>
               <div className="flex flex-col gap-3">
                 <input type="email" placeholder="E-posta Adresin..." className="bg-black/60 border border-white/10 rounded-2xl px-6 py-4 text-sm outline-none focus:border-purple-500 transition-all shadow-inner placeholder:text-slate-700" />
                 <button className="bg-white text-black text-[11px] font-black py-4 rounded-2xl hover:bg-purple-600 hover:text-white transition-all uppercase tracking-[0.2em] shadow-xl active:scale-95">Abone Ol</button>
               </div>
            </div>
          </div>
        </div>

        {/* --- TOPLULUK GÖRÜŞLERİ --- */}
        <div className="max-w-4xl mx-auto space-y-16 pb-40">
          <div className="text-center">
            <h2 className="text-5xl font-black italic uppercase tracking-tighter mb-2">TOPLULUK <span className="text-purple-500">VERİLERİ</span></h2>
            <div className="h-1 w-24 bg-purple-600 mx-auto rounded-full shadow-[0_0_10px_rgba(147,51,234,0.8)]"></div>
          </div>
          
          <form action={yorumYap} className="space-y-6 bg-slate-900/40 p-10 rounded-[3rem] border border-slate-800 shadow-2xl relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-tr from-purple-500/5 to-transparent opacity-0 group-focus-within:opacity-100 transition-opacity pointer-events-none"></div>
            <input name="kullanici" placeholder="Astronot Kimliğiniz..." required className="relative z-10 w-full md:w-1/2 bg-[#020617] p-5 rounded-2xl border border-slate-800 outline-none focus:ring-2 focus:ring-purple-500 transition-all text-white font-bold placeholder:text-slate-700" />
            <textarea name="icerik" placeholder="Düşüncelerinizi uzaya fırlatın..." required rows={5} className="relative z-10 w-full bg-[#020617] p-5 rounded-2xl border border-slate-800 outline-none focus:ring-2 focus:ring-purple-500 transition-all text-white italic placeholder:text-slate-700" />
            <button type="submit" className="relative z-10 w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 py-5 rounded-[2rem] font-black uppercase tracking-[0.3em] transition-all shadow-2xl shadow-purple-900/40 active:scale-[0.98]">
              YORUMU SİNYALE DÖNÜŞTÜR
            </button>
          </form>

          <div className="space-y-8">
            {yorumlar.length === 0 ? (
              <div className="text-center py-20 border-2 border-dashed border-slate-800 rounded-[3rem]">
                <p className="text-slate-600 italic font-bold tracking-widest uppercase">Bu bölge henüz sessiz...</p>
              </div>
            ) : (
              yorumlar.map((y, idx) => (
                <motion.div 
                  key={y.id} 
                  initial={{ opacity: 0, x: idx % 2 === 0 ? -20 : 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  className="bg-[#0f172a]/40 p-10 rounded-[3rem] border border-slate-800 hover:border-purple-500/20 transition-all group relative overflow-hidden"
                >
                  <div className="flex justify-between items-start mb-6">
                    <div className="flex items-center gap-5">
                      <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center font-black text-xl shadow-xl ring-2 ring-white/5">
                        {y.kullanici_adi[0].toUpperCase()}
                      </div>
                      <div className="flex flex-col">
                        <span className="text-white font-black text-lg">@{y.kullanici_adi}</span>
                        <span className="text-slate-500 text-[10px] uppercase font-bold tracking-widest italic">{new Date(y.created_at).toLocaleDateString('tr-TR')}</span>
                      </div>
                    </div>
                    {isAdmin && (
                      <form action={async () => { 'use server'; await yorumSil(y.id); }}>
                        <button className="bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white text-[10px] font-black px-5 py-2.5 rounded-xl transition-all border border-red-500/20 uppercase active:scale-90">Sil</button>
                      </form>
                    )}
                  </div>
                  <p className="text-slate-300 text-xl leading-relaxed italic pl-6 border-l-2 border-purple-500/30 group-hover:border-purple-500 transition-colors">{y.icerik}</p>
                </motion.div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}