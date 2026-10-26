
'use client';
import { useState } from 'react';
import Link from 'next/link';
import SecurePlayer from '../../../components/SecurePlayer';

export default function MovieClient({ movie, backdrop, poster, trailer }){
  const [playerMode,setPlayerMode]=useState('none');
  const movieMeta = { id: movie.id, title: movie.title, poster_path: movie.poster_path, backdrop_path: movie.backdrop_path, vote_average: movie.vote_average };

  return (
    <>
      <div className="relative h-[75vh] overflow-hidden">
        <img src={backdrop} alt={movie.title} className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#050507] via-[#050507]/60 to-[#050507]/20" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#050507]/80 via-transparent to-transparent" />
        <div className="absolute bottom-0 p-4 md:p-10 flex gap-6 items-end w-full max-w-7xl">
          <img src={poster} alt="" className="w-32 md:w-48 rounded-xl hidden md:block shadow-2xl border border-white/10" />
          <div className="flex-1">
            <h1 className="font-display text-3xl md:text-5xl font-bold leading-tight">{movie.title}</h1>
            <div className="flex gap-3 text-sm text-zinc-300 mt-3 items-center"><span className="text-emerald-400 font-semibold">{movie.vote_average?.toFixed(1)} ★</span><span>{movie.release_date?.slice(0,4)}</span><span>{movie.runtime}m</span><span className="px-2 py-0.5 bg-white/10 rounded text-[11px]">{movie.vote_count} votes</span></div>
            <p className="text-[14px] text-zinc-300 mt-3 max-w-2xl line-clamp-2 md:line-clamp-3">{movie.overview}</p>
            
            <div className="flex gap-3 mt-6 flex-wrap">
              <button onClick={()=>setPlayerMode('movie')} className="inline-flex items-center gap-2 bg-white text-black px-6 md:px-8 py-3 rounded-full font-bold text-[14px] md:text-[15px] hover:bg-zinc-200 transition shadow-lg">
                <span className="text-lg">▶</span> Play Movie
              </button>
              {trailer ? (
                <button onClick={()=>setPlayerMode('trailer')} className="inline-flex items-center gap-2 bg-white/10 backdrop-blur text-white px-6 py-3 rounded-full font-semibold text-[14px] hover:bg-white/20 transition border border-white/10">▶ Play Trailer</button>
              ) : null}
              <Link href="/" className="inline-flex items-center gap-2 bg-transparent text-white px-6 py-3 rounded-full font-semibold text-[14px] border border-white/20 hover:bg-white/10">+ My List</Link>
            </div>
            <p className="text-[11px] text-zinc-500 mt-3">Ads/popups are blocked by secure player. If video fails, try other server.</p>
          </div>
        </div>
      </div>

      <SecurePlayer 
        mode={playerMode} 
        youtubeKey={trailer?.key} 
        tmdbId={movie.id} 
        movieMeta={movieMeta}
        onClose={()=>setPlayerMode('none')} 
      />
    </>
  );
}
