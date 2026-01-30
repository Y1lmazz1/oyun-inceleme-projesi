'use client';
import { useEffect, useState, useCallback, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import Image from 'next/image';

interface Oyun { id: string; ad: string; tur: string; puan: number; resim_url: string; ozet: string; }
interface Yorum { id: string; kullanici_adi: string; icerik: string; oyun_id: string; oyun_adi?: string; }

interface SupabaseYorumResponse extends Yorum {
  oyunlar: { ad: string } | null;
}

export default function AdminPage() {
  const [sekme, setSekme] = useState<'liste' | 'editor' | 'yorumlar'>('liste');
  const [yukleniyor, setYukleniyor] = useState(true);
  const [oyunlar, setOyunlar] = useState<Oyun[]>([]);
  const [tumYorumlar, setTumYorumlar] = useState<Yorum[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [duzenlemeId, setDuzenlemeId] = useState<string | null>(null);

  const [ad, setAd] = useState('');
  const [tur, setTur] = useState('');
  const [puan, setPuan] = useState('');
  const [resimUrl, setResimUrl] = useState('');
  const editorRef = useRef<HTMLDivElement>(null);

  // --- FORMU SIFIRLAMA ---
  const formuSifirla = () => {
    setDuzenlemeId(null);
    setAd('');
    setTur('');
    setPuan('');
    setResimUrl('');
    if (editorRef.current) {
      editorRef.current.innerHTML = '';
    }
  };

  const verileriGetir = useCallback(async () => {
    setYukleniyor(true);
    const { data: oyunData } = await supabase.from('oyunlar').select('*').order('created_at', { ascending: false });
    const { data: yorumData } = await supabase.from('yorumlar').select('*, oyunlar(ad)').order('created_at', { ascending: false }) as { data: SupabaseYorumResponse[] | null };
    
    setOyunlar(oyunData || []);
    setTumYorumlar(yorumData?.map(y => ({ ...y, oyun_adi: y.oyunlar?.ad })) || []);
    setYukleniyor(false);
  }, []);

  useEffect(() => {
    let isMounted = true;
    if (isMounted) { verileriGetir(); }
    return () => { isMounted = false; };
  }, [verileriGetir]);

  // --- YAZI SİLME FONKSİYONU ---
  const oyunSil = async (id: string) => {
    if (!confirm("Bu yazıyı tamamen silmek istediğine emin misin? Bu işlem geri alınamaz!")) return;
    
    const { error } = await supabase.from('oyunlar').delete().eq('id', id);
    
    if (error) {
      alert("Hata: " + error.message);
    } else {
      setOyunlar(prev => prev.filter(o => o.id !== id));
      formuSifirla();
      setSekme('liste');
    }
  };

  const yorumSil = async (id: string) => {
    if (!confirm("Bu yorumu silmek istediğine emin misin?")) return;
    const { error } = await supabase.from('yorumlar').delete().eq('id', id);
    if (error) {
      alert("Hata: " + error.message);
    } else {
      setTumYorumlar(prev => prev.filter(y => y.id !== id));
    }
  };

  const komutUygula = (komut: string, deger?: string) => {
    if (komut === 'insertImage') {
      const url = prompt("Görsel URL'sini yapıştırın:");
      if (url) {
        const imgHTML = `<img src="${url}" style="max-width:100%; border-radius:1rem; margin:1.5rem 0; display:block; border: 1px solid rgba(255,255,255,0.1);" />`;
        document.execCommand('insertHTML', false, imgHTML);
      }
    } else if (komut === 'removeFormat') {
      document.execCommand('removeFormat', false, undefined);
      document.execCommand('formatBlock', false, 'p');
    } else {
      document.execCommand(komut, false, deger);
    }
  };

  const duzenleModuAc = (oyun: Oyun) => {
    setDuzenlemeId(oyun.id);
    setAd(oyun.ad);
    setTur(oyun.tur);
    setPuan(oyun.puan.toString());
    setResimUrl(oyun.resim_url || '');
    setSekme('editor');
    setTimeout(() => {
      if (editorRef.current) editorRef.current.innerHTML = oyun.ozet;
    }, 50);
  };

  async function handleSubmit() {
    const icerik = editorRef.current?.innerHTML || '';
    if (!ad || !icerik) return alert("Başlık ve içerik boş bırakılamaz!");
    
    setIsAdding(true);
    const veri = { ad, tur, puan: parseFloat(puan) || 0, resim_url: resimUrl, ozet: icerik };
    
    if (duzenlemeId) {
      await supabase.from('oyunlar').update(veri).eq('id', duzenlemeId);
    } else {
      await supabase.from('oyunlar').insert([veri]);
    }

    formuSifirla();
    await verileriGetir();
    setIsAdding(false);
    setSekme('liste');
  }

  if (yukleniyor) return <div className="min-h-screen bg-[#0a0a0c] flex items-center justify-center text-purple-500 font-bold tracking-widest animate-pulse">SİSTEM YÜKLENİYOR...</div>;

  return (
    <div className="min-h-screen bg-[#0a0a0c] text-gray-300 font-sans selection:bg-purple-500/30">
      <nav className="border-b border-white/5 bg-[#111114] sticky top-0 z-50">
        <div className="max-w-400 mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-10">
            <h1 className="text-sm font-black tracking-widest text-white uppercase italic">GAMER<span className="text-purple-600">EDITOR</span></h1>
            <div className="flex gap-4">
              <button onClick={() => setSekme('liste')} className={`px-4 py-2 text-[11px] font-bold uppercase transition-all ${sekme === 'liste' ? 'text-purple-500' : 'text-gray-500 hover:text-gray-300'}`}>Kütüphane</button>
              <button onClick={() => { formuSifirla(); setSekme('editor'); }} className={`px-4 py-2 text-[11px] font-bold uppercase transition-all ${sekme === 'editor' && !duzenlemeId ? 'text-purple-500' : 'text-gray-500 hover:text-gray-300'}`}>Yeni Yazı</button>
              <button onClick={() => setSekme('yorumlar')} className={`px-4 py-2 text-[11px] font-bold uppercase transition-all ${sekme === 'yorumlar' ? 'text-purple-500' : 'text-gray-500 hover:text-gray-300'}`}>Yorumlar</button>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {sekme === 'editor' && (
              <>
                {duzenlemeId && (
                  <button onClick={() => oyunSil(duzenlemeId)} className="bg-red-500/10 hover:bg-red-600 text-red-500 hover:text-white px-6 py-2 rounded-full text-[10px] font-black uppercase transition-all border border-red-500/20">
                    Yazıyı Sil
                  </button>
                )}
                <button onClick={handleSubmit} disabled={isAdding} className="bg-purple-600 hover:bg-purple-500 text-white px-8 py-2 rounded-full text-[10px] font-black uppercase tracking-tighter transition-all shadow-lg shadow-purple-900/20">
                  {isAdding ? 'İŞLENİYOR' : (duzenlemeId ? 'GÜNCELLE' : 'YAYINLA')}
                </button>
              </>
            )}
          </div>
        </div>
      </nav>

      <main className="max-w-400 mx-auto p-6">
        {sekme === 'editor' && (
          <div className="flex flex-col lg:flex-row gap-12 animate-in fade-in duration-700">
            <div className="flex-1 max-w-4xl mx-auto">
              <input value={ad} onChange={e => setAd(e.target.value)} placeholder="YAZI BAŞLIĞI..." className="w-full bg-transparent text-5xl font-black outline-none placeholder:text-gray-900 mb-8 uppercase italic border-l-8 border-purple-600 pl-6 focus:border-white transition-all" />
              <div className="sticky top-20 z-40 flex flex-wrap items-center gap-1 p-2 bg-[#111114] border border-white/5 rounded-xl mb-6 shadow-xl backdrop-blur-md">
                <select onChange={(e) => komutUygula('fontSize', e.target.value)} className="bg-transparent text-[10px] font-bold text-gray-400 outline-none hover:text-white cursor-pointer p-1">
                  <option value="3">Boyut: Normal</option>
                  <option value="4">Büyük</option>
                  <option value="5">Daha Büyük</option>
                  <option value="6">Çok Büyük</option>
                  <option value="7">Devasa</option>
                </select>
                <div className="w-px h-4 bg-white/10 mx-2" />
                <button onClick={() => komutUygula('formatBlock', 'H1')} className="p-2 hover:bg-white/5 rounded text-xs font-black text-purple-500">H1</button>
                <button onClick={() => komutUygula('formatBlock', 'H2')} className="p-2 hover:bg-white/5 rounded text-xs font-bold">H2</button>
                <div className="w-px h-4 bg-white/10 mx-1" />
                <button onClick={() => komutUygula('bold')} className="p-2 hover:bg-white/5 rounded font-black text-white w-8 h-8">B</button>
                <button onClick={() => komutUygula('italic')} className="p-2 hover:bg-white/5 rounded italic w-8 h-8">I</button>
                <button onClick={() => komutUygula('underline')} className="p-2 hover:bg-white/5 rounded underline w-8 h-8">U</button>
                <div className="w-px h-4 bg-white/10 mx-1" />
                <button onClick={() => komutUygula('insertImage')} className="flex items-center gap-2 px-3 py-1 hover:bg-purple-600/20 text-purple-400 rounded text-[10px] font-black uppercase tracking-widest border border-purple-500/20">🖼️ Görsel Ekle</button>
                <button onClick={() => komutUygula('removeFormat')} className="p-2 hover:bg-red-500/10 text-red-400 rounded text-[10px] font-bold ml-auto">BİÇİMİ SIFIRLA</button>
                <button onClick={() => formuSifirla()} className="p-2 hover:bg-red-500/10 text-red-600 rounded text-[10px] font-bold">TÜMÜNÜ TEMİZLE</button>
              </div>
              <div ref={editorRef} contentEditable className="prose prose-invert prose-purple max-w-none w-full min-h-150 outline-none text-gray-400 text-lg leading-relaxed font-light pb-20 editor-canvas" data-placeholder="Yazmaya başlayın..." />
            </div>

            <div className="w-full lg:w-72 space-y-4">
              <div className="bg-[#111114] border border-white/5 rounded-3xl p-6 sticky top-24">
                <h3 className="text-[10px] font-black text-gray-600 uppercase tracking-widest mb-6">Yayın Ayarları</h3>
                <div className="space-y-5">
                  <div className="space-y-2">
                    <label className="text-[9px] font-bold text-purple-400 uppercase">Kategori</label>
                    <input value={tur} onChange={e => setTur(e.target.value)} placeholder="Aksiyon, RPG..." className="w-full bg-black/40 p-3 rounded-xl border border-white/5 text-xs focus:border-purple-600 outline-none" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[9px] font-bold text-purple-400 uppercase">Puan</label>
                    <input value={puan} onChange={e => setPuan(e.target.value)} type="number" step="0.1" className="w-full bg-black/40 p-3 rounded-xl border border-white/5 text-xs focus:border-purple-600 outline-none" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[9px] font-bold text-purple-400 uppercase">Kapak (URL)</label>
                    <input value={resimUrl} onChange={e => setResimUrl(e.target.value)} placeholder="Kapak fotoğrafı linki" className="w-full bg-black/40 p-3 rounded-xl border border-white/5 text-xs focus:border-purple-600 outline-none" />
                  </div>
                  {/* SRC HATA DÜZELTMESİ: resimUrl varsa ve boş değilse göster */}
                  {resimUrl && resimUrl.trim() !== "" && (
                    <div className="relative aspect-video rounded-xl overflow-hidden border border-purple-500/20">
                      <Image src={resimUrl} alt="Preview" unoptimized fill className="object-cover" />
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {sekme === 'liste' && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {oyunlar.map((oyun, index) => (
              <div key={oyun.id} className="group cursor-pointer" onClick={() => duzenleModuAc(oyun)}>
                <div className="relative aspect-3/4 rounded-2xl overflow-hidden mb-4 border border-white/5 bg-[#111114] shadow-2xl transition-all group-hover:border-purple-500/40 group-hover:-translate-y-2">
                  {oyun.resim_url && (
                    <Image src={oyun.resim_url} alt={oyun.ad} unoptimized fill className="object-cover opacity-60 group-hover:opacity-100 transition-all duration-500 scale-105 group-hover:scale-100" />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0c] via-transparent to-transparent" />
                  <div className="absolute top-3 left-3 w-6 h-6 bg-black/80 rounded-lg flex items-center justify-center text-[10px] font-black text-purple-500 border border-white/5 italic">
                    {index + 1}
                  </div>
                </div>
                <h3 className="text-[11px] font-black text-white uppercase truncate mb-1">{oyun.ad}</h3>
                <div className="flex items-center justify-between">
                  <span className="text-[9px] font-bold text-gray-600 uppercase tracking-tighter">{oyun.tur}</span>
                  <span className="text-[10px] font-black text-purple-400 italic">⭐ {oyun.puan}</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {sekme === 'yorumlar' && (
          <div className="max-w-4xl mx-auto space-y-4 animate-in zoom-in-95 duration-500">
            <h2 className="text-xl font-black italic uppercase tracking-widest mb-10 text-white border-b-2 border-purple-600 inline-block pb-2">MODERASYON</h2>
            {tumYorumlar.map((y) => (
              <div key={y.id} className="bg-[#111114] border border-white/5 p-6 rounded-4xl flex items-center justify-between group hover:bg-[#16161b] transition-all">
                <div className="flex gap-6 items-center">
                  <div className="text-[10px] font-black text-purple-500 italic bg-purple-500/5 px-3 py-1 rounded-md border border-purple-500/10 uppercase">
                    {y.oyun_adi}
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs font-bold text-white tracking-tight italic">@{y.kullanici_adi}</p>
                    <p className="text-xs text-gray-500 font-light leading-relaxed">{y.icerik}</p>
                  </div>
                </div>
                <button onClick={() => yorumSil(y.id)} className="w-10 h-10 rounded-xl bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white transition-all border border-red-500/10 flex items-center justify-center font-bold">✕</button>
              </div>
            ))}
          </div>
        )}
      </main>

      <style jsx global>{`
        [contenteditable]:empty:before { content: attr(data-placeholder); color: #444; font-style: italic; }
        .editor-canvas font[size="4"] { font-size: 1.2rem; }
        .editor-canvas font[size="5"] { font-size: 1.5rem; }
        .editor-canvas font[size="6"] { font-size: 2rem; }
        .editor-canvas font[size="7"] { font-size: 3rem; }
      `}</style>
    </div>
  );
}