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
};

const PROVIDERS = [
  { id:'vidsrc-cc', name:'VidSrc CC', build:(id)=>`https://vidsrc.cc/v2/embed/movie/${id}` },
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
  const [trailerSrc,setTrailerSrc]=useState('');
  const [downloading,setDownloading]=useState(false);

  useEffect(()=>{
    if(!id) return;
    const key = process.env.NEXT_PUBLIC_TMDB_API_KEY;
    fetch(`https://api.themoviedb.org/3/movie/${id}?api_key=${key}&append_to_response=videos`)
      .then(r=>r.json()).then(data=>{ setMovie(data); setLoading(false); }).catch(()=>setLoading(false));
  },[id]);

  useEffect(()=>{
    if(playerMode==='trailer' && movie){
      const t = movie?.videos?.results?.find(v=>v.site==='YouTube' && (v.type==='Trailer'||v.type==='Teaser'));
      if(t) setTrailerSrc(`https://www.youtube.com/embed/${t.key}?autoplay=1`);
    }
  },[playerMode, movie]);

  const handleWatchNow = () => {
    const url = PROVIDERS[providerIdx].build(id);
    window.open(url, '_blank');
  };

  const handleDownload = async () => {
    setDownloading(true);
    try{
      // OPTION 1: If you host your own movies (RECOMMENDED - works 100%)
      // Put your mp4 in public/videos or R2 bucket, then use this:
      // const ownVideoUrl = `/videos/${id}.mp4` or `https://your-bucket.r2.dev/${id}.mp4`
      // const a = document.createElement('a'); a.href = ownVideoUrl; a.download = `${movie.title}.mp4`; a.click();
      
      // OPTION 2: For now, try to download from provider via proxy (will open new tab if blocked)
      // Since providers block direct download, we open download page that has download button
      // You can replace this with your own download server later
      
      // Try direct download via a download API (moviesapi has download option)
      const downloadUrl = `https://moviesapi.club/movie/${id}`; // This site has download button inside
      // Alternative: use y2mate-like approach - for now open in new tab where user can use extension
      window.open(downloadUrl, '_blank');
      
      // Show instruction
      setTimeout(()=>{
        alert(`Download started in new tab.\n\nIf you host your own mp4 at /videos/${id}.mp4, this button will directly download ${movie.title}.mp4 without new tab.\n\nFor now it opens download page where you can click Download.`);
        setDownloading(false);
      }, 800);
    }catch(e){
      setDownloading(false);
      // Fallback: open provider in new tab
      window.open(PROVIDERS[providerIdx].build(id), '_blank');
    }
  };

  const handleRealDownload = () => {
    // THIS IS THE REAL WORKING DOWNLOAD - for your own hosted files
    // Example: if you have /public/videos/550.mp4 it will download directly
    const ownPath = `/videos/${id}.mp4`;
    // Check if file exists, if not, fallback to provider page
    fetch(ownPath, { method: 'HEAD' }).then(res=>{
      if(res.ok){
        const a = document.createElement('a');
        a.href = ownPath;
        a.download = `${movie?.title || id}.mp4`;
        document.body.appendChild(a);
        a.click();
        a.remove();
      } else {
        // No own file yet, open download page
        handleDownload();
      }
    }).catch(()=>handleDownload());
  };

  if(loading) return <div className="min-h-screen bg-[#050507] grid place-items-center text-white">Loading...</div>;
  if(!movie) return <div className="min-h-screen bg-[#050507] grid place-items-center text-white">Not found</div>;

  const backdrop = movie.backdrop_path ? `${IMG.backdrop}${movie.backdrop_path}` : '';
  const poster = movie.poster_path ? `${IMG.poster}${movie.poster_path}` : IMG.placeholder;
  const trailer = movie.videos?.results?.find(v=>v.site==='YouTube');

  return (
    <div className="min-h-screen bg-[#050507] text-white">
      <Navbar />
      <div className="relative min-h-[80vh] overflow-hidden">
        {backdrop && <img src={backdrop} alt={movie.title} className="absolute inset-0 w-full h-full object-cover" />}
        <div className="absolute inset-0 bg-gradient-to-t from-[#050507] via-[#050507]/70 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#050507]/90 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-4 md:p-10 max-w-7xl">
          <div className="flex gap-6 items-end">
            <img src={poster} alt="" className="w-28 md:w-48 rounded-xl hidden md:block border border-white/10" />
            <div className="flex-1">
              <div className="inline-block px-3 py-1 bg-emerald-500 text-black text-[10px] font-black rounded-full mb-2">v4.4 WORKING DOWNLOAD</div>
              <h1 className="text-3xl md:text-5xl font-black">{movie.title}</h1>
              <div className="flex gap-2 text-sm mt-2 text-zinc-300"><span className="text-emerald-400 font-bold">{movie.vote_average?.toFixed(1)} ★</span><span>{movie.release_date?.slice(0,4)}</span></div>
              <div className="flex flex-wrap gap-3 mt-6">
                <button onClick={handleWatchNow} className="bg-white text-black px-8 py-4 rounded-full font-black text-[18px] shadow-[0_0_30px_white]">▶ WATCH NOW</button>
                <button onClick={handleRealDownload} disabled={downloading} className="bg-emerald-400 text-black px-8 py-4 rounded-full font-black text-[16px] hover:bg-emerald-300 disabled:opacity-50 flex items-center gap-2">
                  {downloading ? '⏳ Preparing...' : '⬇ DOWNLOAD'}
                </button>
                {trailer && <button onClick={()=>setPlayerMode('trailer')} className="bg-white/10 border border-white/20 text-white px-6 py-4 rounded-full font-bold">▶ Trailer</button>}
              </div>
              <div className="flex gap-2 mt-4">
                {PROVIDERS.map((p,i)=>(
                  <button key={p.id} onClick={()=>setProviderIdx(i)} className={`text-[11px] px-3 py-1.5 rounded-full border ${i===providerIdx ? 'bg-white text-black font-bold' : 'bg-white/10 text-zinc-300 border-white/10'}`}>{p.name}</button>
                ))}
              </div>
              <p className="text-[11px] text-zinc-400 mt-2">Watch = opens new tab (plays). Download = tries /videos/ID.mp4 first, else opens download page. Put your mp4 in public/videos to make download instant.</p>
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 md:px-10 py-8 max-w-7xl mx-auto">
        <p className="text-zinc-200 max-w-3xl">{movie.overview}</p>
        <div className="mt-6 p-4 bg-zinc-900 border border-white/10 rounded-xl">
          <h4 className="font-bold text-sm mb-2">How to make Download 100% working:</h4>
          <p className="text-[12px] text-zinc-400">1. Create folder <code className="bg-white/10 px-1 rounded">public/videos</code> in your project<br/>2. Put movie as <code className="bg-white/10 px-1 rounded">{id}.mp4</code> (e.g. 550.mp4)<br/>3. Redeploy. Then Download button will directly download without new tab.<br/><br/>For now without own files, it opens moviesapi.club which has download button inside player.</p>
        </div>
        <Link href="/" className="inline-block mt-6 bg-white text-black px-6 py-3 rounded-full font-bold">← Back Home</Link>
      </div>

      {playerMode==='trailer' && (
        <div className="fixed inset-0 z-[9999] bg-black flex flex-col">
          <div className="flex justify-between px-4 py-3 bg-zinc-900"><span>Trailer</span><button onClick={()=>setPlayerMode('none')} className="w-10 h-10 bg-white text-black rounded-full font-black">×</button></div>
          <div className="flex-1 relative"><iframe src={trailerSrc} className="absolute inset-0 w-full h-full border-0" allowFullScreen /></div>
        </div>
      )}

      <Footer />
    </div>
  );
}
