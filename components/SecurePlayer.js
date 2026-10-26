
'use client';
import { useEffect, useState } from 'react';
import { useApp } from '../context/AppContext';
import { STREAM_PROVIDERS } from '../lib/constants';

export default function SecurePlayer({ mode, youtubeKey, tmdbId, movieMeta, onClose }){
  const { updateProgress } = useApp();
  const [providerIndex,setProviderIndex]=useState(0);
  const [src,setSrc]=useState('');

  useEffect(()=>{
    if(mode==='trailer' && youtubeKey){
      setSrc(`https://www.youtube.com/embed/${youtubeKey}?autoplay=1&rel=0&modestbranding=1`);
    } else if(mode==='movie' && tmdbId){
      const provider = STREAM_PROVIDERS[providerIndex] || STREAM_PROVIDERS[0];
      setSrc(provider.build(tmdbId));
    } else {
      setSrc('');
    }
  },[mode, youtubeKey, tmdbId, providerIndex]);

  useEffect(()=>{
    if((mode!=='trailer' && mode!=='movie') || !tmdbId) return;
    let pct=0;
    const iv=setInterval(()=>{
      pct=Math.min(90, pct+Math.random()*5);
      updateProgress(tmdbId, pct, movieMeta);
    }, 8000);
    return()=>clearInterval(iv);
  },[mode, tmdbId]);

  if(mode==='none') return null;

  return (
    <div className="fixed inset-0 z-[100] bg-black flex items-center justify-center p-0 md:p-4">
      <div className="relative w-full max-w-6xl bg-black rounded-none md:rounded-2xl overflow-hidden border border-white/10 shadow-2xl flex flex-col max-h-[100vh] md:max-h-[90vh]">
        <div className="flex items-center justify-between px-4 py-3 bg-zinc-900 border-b border-white/10">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-bold">{mode==='movie' ? '🎬 Movie Player - Normal Mode' : '▶ Trailer'}</span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/10 text-zinc-300">no sandbox - full playback</span>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-white text-black flex items-center justify-center font-bold">×</button>
        </div>

        {mode==='movie' && (
          <div className="px-4 py-2 bg-zinc-900 border-b border-white/10 flex gap-2 items-center overflow-x-auto">
            <span className="text-[11px] text-zinc-400 shrink-0">Servers:</span>
            {STREAM_PROVIDERS.map((p,i)=>(
              <button key={p.id} onClick={()=>setProviderIndex(i)} className={`text-[11px] px-3 py-1.5 rounded-full border transition ${i===providerIndex ? 'bg-white text-black border-white font-bold' : 'bg-white/10 text-zinc-300 border-white/10 hover:bg-white/20'}`}>{p.name}</button>
            ))}
          </div>
        )}

        <div className="relative w-full aspect-video bg-black">
          {/* NORMAL IFRAME - NO SANDBOX - WILL PLAY MOVIES */}
          <iframe
            key={src}
            src={src}
            title={mode==='movie' ? 'Movie Player' : 'Trailer'}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
            allowFullScreen
            referrerPolicy="no-referrer"
            className="absolute inset-0 w-full h-full border-0"
          />
        </div>

        <div className="px-4 py-3 bg-zinc-900 flex justify-between items-center gap-2">
          <div className="flex gap-2">
            <a href={src} target="_blank" rel="noopener noreferrer" className="text-[12px] px-4 py-2 bg-white/10 rounded-full hover:bg-white/20">Open in new tab ↗</a>
            {mode==='movie' && (
              <button onClick={()=>{ const a=document.createElement('a'); a.href=src; a.download=''; window.open(src,'_blank'); }} className="text-[12px] px-4 py-2 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-full hover:bg-emerald-500/30">Download / Save</button>
            )}
          </div>
          <button onClick={onClose} className="text-[12px] px-4 py-2 bg-white text-black rounded-full font-bold">Close</button>
        </div>
      </div>
    </div>
  );
}
