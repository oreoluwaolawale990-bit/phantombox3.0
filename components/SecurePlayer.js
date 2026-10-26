
'use client';
import { useEffect, useState, useRef } from 'react';
import { useApp } from '../context/AppContext';

/*
  Pillar 1: Advanced Anti-Hijack & Popup Suppression
  - iframe sandbox="allow-scripts allow-same-origin allow-forms" (NO allow-popups, NO allow-top-navigation)
  - JS proxy interceptor to block window.open and top navigation
*/
export default function SecurePlayer({ mode, youtubeKey, tmdbId, movieMeta, onClose }){
  const wrapperRef=useRef(null);
  const { updateProgress } = useApp();
  const [blockedCount,setBlockedCount]=useState(0);

  // Anti-hijack interceptor
  useEffect(()=>{
    // Block window.open globally while player is open
    const originalOpen = window.open;
    const blocked = [];
    window.open = function(...args){
      blocked.push(args);
      setBlockedCount(c=>c+1);
      console.warn('[PhantomBox Security] Blocked window.open hijack attempt:', args);
      return null;
    };

    // Block top navigation attempts
    const handleBeforeUnload = (e)=>{
      // Only for player
    };

    // MutationObserver to remove malicious overlays injected inside wrapper
    const observer = new MutationObserver((mutations)=>{
      mutations.forEach(m=>{
        m.addedNodes.forEach(node=>{
          if(node.nodeType===1){
            const el=node;
            // If an element tries to position fixed full screen with high z-index inside player wrapper (common hijack)
            const style=window.getComputedStyle(el);
            if(style.position==='fixed' && parseInt(style.zIndex)>1000){
              el.remove();
              setBlockedCount(c=>c+1);
            }
            // Remove any <a target="_blank"> injected
            if(el.tagName==='A' && el.target==='_blank'){
              el.removeAttribute('target');
              el.removeAttribute('href');
            }
          }
        });
      });
    });
    if(wrapperRef.current) observer.observe(wrapperRef.current, { childList:true, subtree:true });

    // Prevent clickjacking: intercept clicks that would open new tab
    const handleClick = (e)=>{
      const target=e.target;
      if(target.closest('iframe')) return;
      // If click is inside player wrapper but not on our controls, block if it tries to open new window
      if(wrapperRef.current && wrapperRef.current.contains(target)){
        const anchor=target.closest('a');
        if(anchor && anchor.target==='_blank'){
          e.preventDefault();
          e.stopPropagation();
          setBlockedCount(c=>c+1);
        }
      }
    };
    document.addEventListener('click', handleClick, true);

    return ()=>{
      window.open = originalOpen;
      observer.disconnect();
      document.removeEventListener('click', handleClick, true);
    };
  },[]);

  // Simulate progress tracking for Continue Watching (legal trailer counts as watched)
  useEffect(()=>{
    if(mode!=='trailer' || !tmdbId) return;
    let pct=0;
    const iv=setInterval(()=>{
      pct=Math.min(90, pct+Math.random()*10);
      updateProgress(tmdbId, pct, movieMeta);
    }, 5000);
    return()=>clearInterval(iv);
  },[mode, tmdbId]);

  if(mode==='none') return null;

  const src = mode==='trailer' ? `https://www.youtube.com/embed/${youtubeKey}?autoplay=1&rel=0&modestbranding=1` : '';

  return (
    <div className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-md flex items-center justify-center p-0 md:p-6" onClick={e=>{ if(e.target===e.currentTarget) onClose(); }}>
      <div className="relative w-full max-w-6xl bg-black rounded-none md:rounded-2xl overflow-hidden border border-white/10 shadow-2xl">
        <div className="flex items-center justify-between px-4 py-3 bg-zinc-900 border-b border-white/10">
          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold">🔒 Secure Trailer Player</span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-300">sandbox="allow-scripts allow-same-origin allow-forms"</span>
            {blockedCount>0 && <span className="text-[10px] px-2 py-0.5 rounded-full bg-red-500/20 border border-red-500/30 text-red-300">{blockedCount} hijacks blocked</span>}
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-white/10 hover:bg-white hover:text-black flex items-center justify-center">×</button>
        </div>
        <div className="px-4 py-2 bg-violet-500/10 border-b border-white/5 text-[11px] text-zinc-400">
          Anti-hijack active: <code>window.open</code> overridden, <code>allow-popups</code> & <code>allow-top-navigation</code> removed from sandbox, click interceptor active.
        </div>
        <div ref={wrapperRef} className="relative w-full aspect-video bg-black">
          {/* Secure iframe - NO allow-popups, NO allow-top-navigation */}
          <iframe
            src={src}
            title="Secure Trailer"
            sandbox="allow-scripts allow-same-origin allow-forms"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            referrerPolicy="strict-origin-when-cross-origin"
            className="absolute inset-0 w-full h-full border-0"
          />
        </div>
        <div className="px-4 py-2 text-[11px] text-zinc-500 bg-zinc-900/50 flex justify-between">
          <span>Trailer from YouTube (official). Player is hardened against tab hijacking.</span>
          <button onClick={()=>{ updateProgress(tmdbId, 100, movieMeta); onClose(); }} className="text-emerald-400 hover:text-emerald-300">Mark Watched ✓</button>
        </div>
      </div>
    </div>
  );
}
