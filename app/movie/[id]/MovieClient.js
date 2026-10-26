
'use client';
import { useState } from 'react';
import Link from 'next/link';
import SecurePlayer from '../../../components/SecurePlayer';

export default function MovieClient({ movie, backdrop, poster, trailer }){
  const [playerMode,setPlayerMode]=useState('none');

  const handleDownload = () => {
    // Simple download - opens current server in new tab, user can use browser save
    // For real download you need a download API - this is placeholder that works with many providers
    alert('Download: The movie will open in new tab. Use browser menu or video downloader extension to save. For direct download we can integrate a download server next.');
    setPlayerMode('movie');
  };

  return (
    <>
      <div className="relative min-h-[80vh] overflow-hidden">
        <img src={backdrop} alt={movie.title} className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#050507] via-[#050507]/60 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#050507]/80 via-transparent to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-4 md:p-10 flex gap-6 items-end max-w-7xl">
          <img src={poster} alt="" className="w-28 md:w-48 rounded-xl hidden md:block shadow-2xl border border-white/10" />
          <div className="flex-1">
            <h1 className="font-display text-3xl md:text-5xl font-black leading-tight">{movie.title}</h1>
            <div className="flex gap-2 text-sm text-zinc-300 mt-2"><span className="text-emerald-400 font-bold">{movie.vote_average?.toFixed(1)} ★</span><span>{movie.release_date?.slice(0,4)}</span><span>{movie.runtime} min</span></div>
            <p className="text-[13px] md:text-[14px] text-zinc-300 mt-3 max-w-2xl line-clamp-3">{movie.overview?.slice(0,200)}...</p>
            
            <div className="flex gap-3 mt-6 flex-wrap">
              <button onClick={()=>setPlayerMode('movie')} className="bg-white text-black px-8 py-4 rounded-full font-black text-[18px] hover:bg-zinc-200 shadow-[0_0_40px_rgba(255,255,255,0.4)] flex items-center gap-2">
                ▶ WATCH NOW
              </button>
              <button onClick={handleDownload} className="bg-emerald-500 text-black px-8 py-4 rounded-full font-bold text-[16px] hover:bg-emerald-400 flex items-center gap-2">
                ⬇ DOWNLOAD
              </button>
              {trailer && (
                <button onClick={()=>setPlayerMode('trailer')} className="bg-white/10 backdrop-blur text-white px-6 py-4 rounded-full font-bold border border-white/20 hover:bg-white/20">▶ Trailer</button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 md:px-10 py-4 bg-zinc-900/50 border-y border-white/10 flex gap-3">
        <button onClick={()=>setPlayerMode('movie')} className="bg-white text-black px-6 py-3 rounded-full font-bold">▶ Watch</button>
        <button onClick={handleDownload} className="bg-emerald-500 text-black px-6 py-3 rounded-full font-bold">⬇ Download</button>
        <span className="text-[11px] text-zinc-500 self-center ml-2">No sandbox - normal iframe - should play</span>
      </div>

      <SecurePlayer 
        mode={playerMode} 
        youtubeKey={trailer?.key} 
        tmdbId={movie.id} 
        movieMeta={movie}
        onClose={()=>setPlayerMode('none')} 
      />
    </>
  );
}
