'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Clock, Bookmark, Share2 } from 'lucide-react';
import { ARTICLES, type Article } from '@/lib/articles';
import { ProductBadge } from './ProductBadge';

export function ArticleView({ article }: { article: Article }) {
  const router = useRouter();
  const [progress, setProgress] = useState(0);
  const [bookmarked, setBookmarked] = useState(false);
  const articleRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      const el = articleRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const total = rect.height - window.innerHeight;
      const scrolled = -rect.top;
      setProgress(Math.max(0, Math.min(100, (scrolled / total) * 100)));
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const sameProduct = ARTICLES.filter((a) => a.id !== article.id && a.product === article.product);
  const others = ARTICLES.filter((a) => a.id !== article.id && a.product !== article.product);
  const related = [...sameProduct, ...others].slice(0, 3);

  return (
    <div ref={articleRef}>
      <div className="fixed top-0 left-0 right-0 z-[60] h-[2px] bg-white/10 pointer-events-none">
        <div className="h-full bg-[#C9A84C] transition-[width] duration-75" style={{ width: `${progress}%` }} />
      </div>

      {/* Header Section */}
      <div className="max-w-[760px] mx-auto px-4 sm:px-6 pt-8 pb-5">
        <button onClick={() => router.push('/')} className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-8 [font-family:var(--ff-sans)] text-[12px] tracking-wide">
          <ArrowLeft size={14} /> Back to Finbytes
        </button>

        <div className="flex items-center gap-3 mb-4">
          <ProductBadge product={article.product} />
          {article.tag && (
            <span className="px-2 py-0.5 bg-[#C9A84C] text-[#0a0a0a] text-[9px] font-black tracking-widest [font-family:var(--ff-sans)] uppercase">
              {article.tag}
            </span>
          )}
        </div>

        <h1 className="text-[34px] sm:text-[42px] lg:text-[48px] font-black text-foreground [font-family:var(--ff-display)] leading-[1.1] mb-5 w-full">
          {article.title}
        </h1>

        {article.subtitle && (
          <p className="text-[18px] sm:text-[20px] text-muted-foreground [font-family:var(--ff-reading)] font-light leading-[1.65] mb-6">
            {article.subtitle}
          </p>
        )}

        {/* Byline Section */}
        <div className="border-t border-[#C9A84C]/20 border-b border-border pt-4 pb-4 flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-zinc-200 flex items-center justify-center text-zinc-600 text-sm font-bold [font-family:var(--ff-display)] flex-shrink-0">
              {article.author[0]}
            </div>
            <div>
              <div className="text-[12px] font-semibold text-foreground [font-family:var(--ff-sans)]">{article.author}</div>
              <div className="text-[10px] text-muted-foreground [font-family:var(--ff-sans)]">{article.authorTitle}</div>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <Clock size={11} />
              <span className="text-[11px] [font-family:var(--ff-sans)]">{article.readTime}</span>
            </div>
            <span className="text-[11px] text-muted-foreground [font-family:var(--ff-sans)]">{article.date}</span>
            <button onClick={() => setBookmarked(!bookmarked)} className={`p-1.5 transition-colors ${bookmarked ? "text-[#C9A84C]" : "text-muted-foreground hover:text-foreground"}`}>
              <Bookmark size={14} fill={bookmarked ? "#C9A84C" : "none"} />
            </button>
            <button className="p-1.5 text-muted-foreground hover:text-foreground transition-colors">
              <Share2 size={14} />
            </button>
          </div>
        </div>
      </div>

      {/* Article Body Content */}
      <div className="max-w-[760px] mx-auto px-4 sm:px-6 mb-16 mt-8">
        
        {/* Main Article Image */}
        {article.image && (
          <img src={article.image} alt={article.title} className="w-full mb-8 rounded-sm" />
        )}

        {/* Body Text */}
        <div className="text-[18px] sm:text-[20px] text-foreground [font-family:var(--ff-reading)] font-light leading-[1.85] space-y-6">
          {article.body.map((item: any, index: number) => {
            if (typeof item === 'string') return <p key={index}>{item}</p>;
            if (typeof item === 'object' && item.type === 'pullquote') {
              return (
                <blockquote key={index} className="border-l-4 border-[#C9A84C] pl-6 my-10 italic text-[24px] font-medium text-foreground/90">
                  {item.text}
                </blockquote>
              );
            }
            return null;
          })}
        </div>

        {/* Video Thumbnail Link */}
        <a href="/video" className="relative block mt-12 cursor-pointer w-full overflow-hidden group">
          <img 
            src="/path-to-your-actual-image.jpg" 
            alt="Video Thumbnail" 
            className="w-full h-auto block transition-transform duration-500 group-hover:scale-105" 
          />
          
          {/* Play Button Overlay */}
          <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/40 transition-colors">
            <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center border border-white/50">
              <div className="w-0 h-0 border-t-[10px] border-t-transparent border-l-[20px] border-l-white border-b-[10px] border-b-transparent ml-1" />
            </div>
          </div>
        </a>
      </div> 
      {/* END OF BODY CONTENT - Delete everything between here and the 'Continue Reading' section */}
      {/* Continue Reading Section */}
{related.length > 0 && (
  <section className="max-w-[1200px] mx-auto px-4 sm:px-6 py-12 border-t border-border">
    <h2 className="text-[20px] font-bold [font-family:var(--ff-display)] mb-8 flex items-center gap-2">
      <span className="w-1 h-5 bg-[#C9A84C]" />
      Continue Reading
    </h2>
    
    {/* Changed to max 3 columns on medium/large screens and adjusted gap */}
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {related.map((a) => (
        <div key={a.id} className="cursor-pointer group" onClick={() => router.push(`/article/${a.id}`)}>
          {/* Maintained object-cover and aspect ratios for the clean look */}
          <img src={a.image} alt={a.title} className="w-full h-48 object-cover mb-4 rounded-sm" />
          <p className="text-[12px] font-bold text-[#C9A84C] uppercase tracking-widest mb-2">{a.product}</p>
          <h3 className="text-[18px] font-bold leading-tight group-hover:text-[#C9A84C] transition-colors">{a.title}</h3>
          <p className="text-[14px] text-muted-foreground mt-2">{a.author} · {a.date}</p>
        </div>
      ))}
    </div>
  </section>
)}
    </div>
  );
}