
'use client';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';

export default function Navbar({ onSearch, searchValue, genres }){
  const [scrolled,setScrolled]=useState(false);
  const [menuOpen,setMenuOpen]=useState(false);
  const pathname=usePathname();
  useEffect(()=>{
    const onScroll=()=>setScrolled(window.scrollY>10);
    window.addEventListener('scroll',onScroll);
    return()=>window.removeEventListener('scroll',onScroll);
  },[]);
  useEffect(()=>{
    const onKey=(e)=>{ if(e.key==='/' && document.activeElement.tagName!=='INPUT'){ e.preventDefault(); document.getElementById('global-search')?.focus(); } };
    window.addEventListener('keydown',onKey);
    return()=>window.removeEventListener('keydown',onKey);
  },[]);
  const linkClass=(href)=>`hover:text-white transition ${pathname===href?'text-white font-semibold':''}`;
  return (
    <header className={`fixed top-0 inset-x-0 z-50 h-[64px] flex items-center px-4 md:px-10 transition-all ${scrolled?'glass-nav':'bg-gradient-to-b from-black/60 to-transparent'}`}>
      <div className="flex items-center gap-8">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center font-bold">P</div>
          <span className="font-display font-bold text-xl hidden sm:block">PHANTOMBOX</span>
          <span className="text-[9px] bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 px-1.5 py-0.5 rounded-full">LEGAL</span>
        </Link>
        <nav className="hidden lg:flex items-center gap-6 text-[13px] text-zinc-400 font-medium">
          <Link href="/" className={linkClass('/')}>Home</Link>
          <Link href="/trending" className={linkClass('/trending')}>Trending</Link>
          <Link href="/top-rated" className={linkClass('/top-rated')}>Top Rated</Link>
          <Link href="/upcoming" className={linkClass('/upcoming')}>Upcoming</Link>
          <Link href="/now-playing" className={linkClass('/now-playing')}>Now Playing</Link>
          <Link href="/browse" className={linkClass('/browse')}>Browse</Link>
        </nav>
      </div>
      <div className="flex items-center gap-3 flex-1 justify-end max-w-2xl">
        <div className="relative w-full max-w-[300px] hidden md:flex items-center glass rounded-full px-3 h-10">
          <svg className="w-4 h-4 text-zinc-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M17 11a6 6 0 11-12 0 6 6 0 0112 0z"/></svg>
          <input id="global-search" value={searchValue||''} onChange={e=>onSearch?.(e.target.value)} placeholder="Search ( / )" className="bg-transparent outline-none text-[13px] w-full placeholder-zinc-500" />
        </div>
        <Link href="/mylist" className="hidden md:block text-[13px] text-zinc-400 hover:text-white">My List</Link>
        <Link href="/history" className="hidden md:block text-[13px] text-zinc-400 hover:text-white">History</Link>
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center text-xs font-bold">G</div>
      </div>
    </header>
  );
}
