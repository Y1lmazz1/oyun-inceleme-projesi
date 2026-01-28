import { supabase } from '@/lib/supabase';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { revalidatePath } from 'next/cache';

export const revalidate = 0;

export default async function OyunDetay({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  // --- GERÇEK ADMİN KONTROLÜ ---
  // Supabase'e "Bu isteği yapan kişinin geçerli bir oturumu var mı?" diye soruyoruz.
  const { data: { user } } = await supabase.auth.getUser();
  const isAdmin = !!user; // Eğer kullanıcı giriş yapmışsa true, yapmamışsa false.

  const [oyunRes, yorumRes] = await Promise.all([
    supabase.from('oyunlar').select('*').eq('id', id).single(),
    supabase.from('yorumlar').select('*').eq('oyun_id', id).order('created_at', { ascending: false })
  ]);

  if (oyunRes.error || !oyunRes.data) return notFound();
  const oyun = oyunRes.data;
  const yorumlar = yorumRes.data || [];

  // YORUM EKLEME (Herkes yapabilir)
  async function yorumYap(formData: FormData) {
    'use server';
    const icerik = formData.get('icerik');
    const kullanici = formData.get('kullanici');
    
    await supabase.from('yorumlar').insert([
      { oyun_id: id, kullanici_adi: kullanici, icerik: icerik }
    ]);
    revalidatePath(`/oyun/${id}`);
  }

  // YORUM SİLME (Sadece yetkili admin yapabilir)
  async function yorumSil(commentId: string) {
    'use server';
    
    // Sunucu tarafında güvenlik check'i: 
    // Birisi tarayıcıdan kodu manipüle etse bile buradaki kontrol isteği durdurur.
    const { data: { user: authUser } } = await supabase.auth.getUser();
    if (!authUser) {
      console.error("Yetkisiz silme denemesi!");
      return;
    }

    await supabase.from('yorumlar').delete().eq('id', commentId);
    revalidatePath(`/oyun/${id}`);
  }

  return (
    <div className="min-h-screen bg-[#0f172a] text-white p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <Link href="/" className="text-purple-400 hover:text-purple-300">← Galeriye Dön</Link>
          {isAdmin && <span className="bg-green-500/10 text-green-500 text-xs px-3 py-1 rounded-full border border-green-500/20 font-bold tracking-widest uppercase">Admin Modu Aktif</span>}
        </div>
        
        <div className="bg-slate-800/30 border border-slate-700 p-8 rounded-3xl mb-10 shadow-2xl backdrop-blur-md">
          <h1 className="text-5xl font-black mb-6 bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">{oyun.ad}</h1>
          <div className="relative w-full h-[450px] rounded-2xl overflow-hidden mb-8 shadow-2xl border border-slate-700">
            <Image src={oyun.resim_url} alt={oyun.ad} fill className="object-cover" priority />
          </div>
          <div className="p-6 bg-slate-900/50 rounded-2xl border-l-4 border-purple-500 shadow-inner">
             <p className="text-xl text-slate-300 leading-relaxed italic">
  {`"${oyun.ozet}"`}
</p>
          </div>
        </div>

        <div className="space-y-6">
          <h2 className="text-2xl font-bold flex items-center gap-3">
            <span className="bg-purple-500/20 p-2 rounded-lg">💬</span> Topluluk Yorumları
          </h2>
          
          <form action={yorumYap} className="grid gap-4 bg-slate-800/50 p-6 rounded-2xl border border-slate-700 shadow-xl">
            <input name="kullanici" placeholder="Takma Adın" required className="bg-slate-900 p-4 rounded-xl border border-slate-700 outline-none focus:border-purple-500 transition-all text-white placeholder:text-slate-500" />
            <textarea name="icerik" placeholder="Oyun hakkındaki düşüncelerin..." required rows={3} className="bg-slate-900 p-4 rounded-xl border border-slate-700 outline-none focus:border-purple-500 transition-all text-white placeholder:text-slate-500" />
            <button type="submit" className="bg-purple-600 hover:bg-purple-500 py-4 rounded-xl font-bold transition-all active:scale-95 shadow-lg shadow-purple-500/30">
              Yorumu Gönder
            </button>
          </form>

          <div className="space-y-4 pt-6">
            {yorumlar.length === 0 && <p className="text-slate-500 text-center py-10 italic">Henüz yorum yapılmamış.</p>}
            {yorumlar.map((y) => (
              <div key={y.id} className="group relative bg-slate-800/20 p-6 rounded-2xl border border-slate-800 hover:border-slate-600 transition-all duration-300">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center font-bold text-white">
                      {y.kullanici_adi[0].toUpperCase()}
                    </div>
                    <div className="flex flex-col">
                      <span className="text-purple-400 font-bold">@{y.kullanici_adi}</span>
                      <span className="text-slate-500 text-xs">{new Date(y.created_at).toLocaleDateString('tr-TR')}</span>
                    </div>
                  </div>
                  
                  {/* Sadece admin giriş yapmışsa silme butonu görünür */}
                  {isAdmin && (
                    <form action={async () => { 'use server'; await yorumSil(y.id); }}>
                      <button className="opacity-0 group-hover:opacity-100 bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white text-[10px] font-black px-4 py-2 rounded-lg transition-all duration-200 border border-red-500/20">
                        SİL
                      </button>
                    </form>
                  )}
                </div>
                <p className="text-slate-300 leading-relaxed pl-13">{y.icerik}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}