
'use client';
import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Navbar from '../../../components/Navbar';
import Footer from '../../../components/Footer';
import Link from 'next/link';

const IMG = {
  poster: 'https://image.tmdb.org/t/p/w500',
  backdrop: 'https://image.tmdb.org/t/p/original',
  placeholder: 'https://via.placeholder.com/500x750/12121a/71717a?text=No+Image',
  backdropPlaceholder: 'https://via.placeholder.com/1280x720/0a0a0f/71717a?text=PhantomBox'
};

const PROVIDERS = [
  { id:'vidsrc-cc', name:'VidSrc CC', build:(id)=>`https://vidsrc.cc/v2/embed/movie/${id}` },
  { id:'vidsrc-xyz', name:'VidSrc XYZ', build:(id)=>`https://vidsrc.xyz/embed/movie/${id}` },
  { id:'embed-su', name:'Embed SU', build:(id)=>`https://embed.su/embed/movie/${id}` },
  { id:'autoembed', name:'AutoEmbed', build:(id)=>`https://autoembed.co/movie/tmdb/${id}` },
];

export default function MoviePage(){
  const params = useParams();
  const id = params.id;
  const [movie,setMovie]=useState(null);
  const [loading,setLoading]=useState(true);
  const [playerMode,setPlayerMode]=useState('none');
  const [providerIdx,setProviderIdx]=useState(0);
  const [src,setSrc]=useState('');

  useEffect(()=>{
    if(!id) return;
    const key = process.env.NEXT_PUBLIC_TMDB_API_KEY;
    fetch(`https://api.themoviedb.org/3/movie/${id}?api_key=${key}&append_to_response=videos,credits,similar`)
      .then(r=>r.json())
      .then(data=>{ setMovie(data); setLoading(false); })
      .catch(()=>setLoading(false));
  },[id]);

  useEffect(()=>{
    if(playerMode==='none' || !id) { setSrc(''); return; }
    if(playerMode==='trailer'){
      const t = movie?.videos?.results?.find(v=>v.site==='YouTube' && (v.type==='Trailer'||v.type==='Teaser'));
      if(t) setSrc(`https://www.youtube.com/embed/${t.key}?autoplay=1`);
    } else if(playerMode==='movie'){
      setSrc(PROVIDERS[providerIdx].build(id));
    }
  },[playerMode, providerIdx, id, movie]);

  if(loading) return <div className="min-h-screen bg-[#050507] grid place-items-center text-white">Loading...</div>;
  if(!movie || movie.success===false) return <div className="min-h-screen bg-[#050507] grid place-items-center text-white">Not found <Link href="/" className="underline ml-2">Home</Link></div>;

  const backdrop = movie.backdrop_path ? `${IMG.backdrop}${movie.backdrop_path}` : IMG.backdropPlaceholder;
  const poster = movie.poster_path ? `${IMG.poster}${movie.poster_path}` : IMG.placeholder;
  const trailer = movie.videos?.results?.find(v=>v.site==='YouTube' && (v.type==='Trailer'||v.type==='Teaser'));

  return (
    <div className="min-h-screen bg-[#050507] text-white">
      <Navbar />
      
      <div className="relative min-h-[85vh] overflow-hidden">
        <img src={backdrop} alt={movie.title} className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#050507] via-[#050507]/60 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#050507]/90 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-4 md:p-10 max-w-7xl">
          <div className="flex gap-6 items-end">
            <img src={poster} alt="" className="w-28 md:w-48 rounded-xl hidden md:block border border-white/10" />
            <div className="flex-1">
              <div className="inline-block px-3 py-1 bg-white text-black text-[10px] font-black rounded-full mb-2">v4.2 NO-SANDBOX EDITION</div>
              <h1 className="text-3xl md:text-5xl font-black">{movie.title}</h1>
              <div className="flex gap-2 text-sm mt-2 text-zinc-300"><span className="text-emerald-400 font-bold">{movie.vote_average?.toFixed(1)} ★</span><span>{movie.release_date?.slice(0,4)}</span><span>{movie.runtime}m</span></div>
              
              <div className="flex flex-wrap gap-3 mt-6">
                <button onClick={()=>setPlayerMode('movie')} className="bg-white text-black px-8 py-4 rounded-full font-black text-[18px] hover:bg-zinc-200 shadow-[0_0_40px_white]">▶ WATCH NOW</button>
                <button onClick={()=>{ setPlayerMode('movie'); setTimeout(()=>window.open(PROVIDERS[providerIdx].build(id),'_blank'),500); }} className="bg-emerald-400 text-black px-8 py-4 rounded-full font-black text-[16px] hover:bg-emerald-300">⬇ DOWNLOAD</button>
                {trailer && <button onClick={()=>setPlayerMode('trailer')} className="bg-white/10 border border-white/20 text-white px-6 py-4 rounded-full font-bold hover:bg-white/20">▶ Trailer</button>}
              </div>
              <p className="text-[11px] text-zinc-400 mt-3">No sandbox - normal iframe - plays directly. If blocked, switch server in player.</p>
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 md:px-10 py-4 bg-zinc-900 flex gap-3 border-y border-white/10">
        <button onClick={()=>setPlayerMode('movie')} className="bg-white text-black px-6 py-3 rounded-full font-bold">▶ Watch</button>
        <button onClick={()=>setPlayerMode('movie')} className="bg-emerald-400 text-black px-6 py-3 rounded-full font-bold">⬇ Download</button>
      </div>

      <div className="px-4 md:px-10 py-8 grid md:grid-cols-[1fr_320px] gap-8 max-w-7xl mx-auto">
        <div>
          <p className="text-[15px] leading-relaxed text-zinc-200">{movie.overview}</p>
          
          {movie.similar?.results?.length>0 && (
            <>
              <h3 className="font-bold mt-8 mb-3 text-xl">More Like This</h3>
              <div className="grid grid-cols-3 md:grid-cols-5 gap-3">
                {movie.similar.results.slice(0,10).map(m=>(
                  <Link key={m.id} href={`/movie/${m.id}`} className="rounded-xl overflow-hidden bg-zinc-900 block hover:scale-105 transition">
                    <img src={m.poster_path ? `https://image.tmdb.org/t/p/w500${m.poster_path}` : IMG.placeholder} alt={m.title} className="aspect-[2/3] object-cover" />
                  </Link>
                ))}
              </div>
            </>
          )}
        </div>
        <div>
          <div className="bg-zinc-900/50 border border-white/10 rounded-2xl p-4">
            <h4 className="font-bold mb-2">Where to Watch</h4>
            <p className="text-sm text-zinc-400">Use WATCH NOW above for instant playback. No sandbox blocking.</p>
          </div>
          <Link href="/" className="block mt-4 text-center bg-white text-black rounded-xl py-3 font-bold">← Back Home</Link>
        </div>
      </div>

      {playerMode!=='none' && (
        <div className="fixed inset-0 z-[9999] bg-black flex flex-col">
          <div className="flex items-center justify-between px-4 py-3 bg-zinc-900 border-b border-white/10">
            <div className="flex items-center gap-2">
              <span className="font-bold">{playerMode==='movie' ? '🎬 Now Playing' : '▶ Trailer'}</span>
              <span className="text-[10px] px-2 py-1 bg-emerald-500/20 text-emerald-300 rounded-full">NO SANDBOX</span>
            </div>
            <button onClick={()=>setPlayerMode('none')} className="w-10 h-10 rounded-full bg-white text-black font-black">×</button>
          </div>
          {playerMode==='movie' && (
            <div className="px-4 py-2 bg-zinc-800 flex gap-2 overflow-x-auto border-b border-white/10">
              {PROVIDERS.map((p,i)=>(
                <button key={p.id} onClick={()=>setProviderIdx(i)} className={`px-4 py-2 rounded-full text-xs border ${i===providerIdx ? 'bg-white text-black font-bold' : 'bg-white/10 text-white border-white/10'}`}>{p.name}</button>
              ))}
            </div>
          )}
          <div className="flex-1 bg-black relative">
            <iframe src={src} title="Player" allow="autoplay; fullscreen; encrypted-media" allowFullScreen className="absolute inset-0 w-full h-full border-0" />
          </div>
          <div className="px-4 py-3 bg-zinc-900 flex justify-between items-center">
            <a href={src} target="_blank" className="text-xs px-4 py-2 bg-white/10 rounded-full">Open in new tab ↗</a>
            <button onClick={()=>setPlayerMode('none')} className="text-xs px-6 py-2 bg-white text-black rounded-full font-bold">Close Player</button>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
