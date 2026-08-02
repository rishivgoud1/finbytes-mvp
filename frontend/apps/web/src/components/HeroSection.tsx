'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Play } from 'lucide-react'; // Essential import
import { type Article, LATEST_VIDEOS } from '@/lib/articles';
import { ProductBadge } from './ProductBadge';

interface HeroSectionProps {
  articles: Article[];
}

export function HeroSection({ articles }: HeroSectionProps) {
  const router = useRouter();
  const [currentIndex, setCurrentIndex] = useState(0);
  const slideArticles = articles.slice(0, 5);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % slideArticles.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [slideArticles.length]);

  const current = slideArticles[currentIndex];

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 py-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Left Slider Frame */}
      <div className="lg:col-span-2 relative min-h-[450px] bg-neutral-900 flex flex-col justify-end p-8 text-white group overflow-hidden">
        <img 
          src={current.image} 
          alt={current.title} 
          className="absolute inset-0 w-full h-full object-cover opacity-40 transition-transform duration-700 scale-100 group-hover:scale-105"
        />
        
        <div className="relative z-10 space-y-3 max-w-xl">
          <ProductBadge product={current.product} />
          <span className="block text-xs uppercase tracking-widest text-[#C9A84C] font-semibold">TODAY'S EDITION</span>
          <h2 className="text-3xl font-bold tracking-tight [font-family:var(--ff-display)]">{current.title}</h2>
          <p className="text-sm text-neutral-300 line-clamp-2">{current.excerpt}</p>
          
          <div className="pt-2 flex items-center gap-4">
            <button 
              onClick={() => router.push(`/article/${current.id}`)} 
              className="bg-[#C9A84C] text-[#0a0a0a] px-4 py-2 text-xs font-semibold rounded-none hover:bg-white transition-colors"
            >
              Read Full Edition
            </button>
            
            {/* Watch Video Button - Navigates to external URL */}
            <button 
              onClick={() => {
  if (current.videoId) {
    window.open(`https://www.youtube.com/watch?v=${current.videoId}`, '_blank');
  } else {
    console.warn("No videoId found for this article");
  }
}}
              className="flex items-center gap-2 border border-white text-white px-4 py-2 text-[12px] uppercase tracking-widest hover:bg-white hover:text-black transition-colors"
            >
              <Play size={12} fill="currentColor" />
              WATCH VIDEO
            </button>
          </div>
        </div>

        {/* Carousel Controls */}
        <div className="absolute bottom-8 right-8 z-10 flex items-center gap-2">
          {slideArticles.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentIndex(idx)}
              className={`h-1.5 transition-all rounded-full ${idx === currentIndex ? 'w-6 bg-[#C9A84C]' : 'w-1.5 bg-white/50'}`}
            />
          ))}
        </div>
      </div>

      {/* Right Sidebar - Latest Video */}
      <div className="bg-secondary p-6 flex flex-col border border-border">
        {/* Section label */}
        <div className="flex items-center justify-between mb-4 pb-2 border-b border-border">
          <h3 className="text-[10px] uppercase tracking-[0.25em] font-bold text-[#C9A84C]">
            Finbytes TV
          </h3>
          <Link
            href="/videos"
            className="text-[10px] uppercase tracking-[0.15em] font-bold text-muted-foreground hover:text-[#C9A84C] transition-colors"
          >
            View all
          </Link>
        </div>

        {/* Featured video */}
        <div
          className="relative w-full aspect-video bg-neutral-800 mb-3 group cursor-pointer overflow-hidden"
          onClick={() => router.push(`/article/${slideArticles[0].slug}`)}
        >
          <img
            src={LATEST_VIDEOS[0].thumbnail}
            alt={LATEST_VIDEOS[0].title}
            className="w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-[103%] transition-all duration-500"
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-12 h-12 rounded-full bg-[#0a0a0a]/80 flex items-center justify-center group-hover:scale-110 group-hover:bg-[#C9A84C] transition-all">
              <Play size={20} className="text-white fill-white ml-1" />
            </div>
          </div>
          <span className="absolute bottom-2 right-2 bg-black/85 text-white text-[10px] px-1.5 py-0.5 tabular-nums">
            {LATEST_VIDEOS[0].duration}
          </span>
        </div>

        <h4 className="text-sm font-bold leading-snug mb-1 [font-family:var(--ff-display)] hover:text-[#C9A84C] transition-colors cursor-pointer">
          {LATEST_VIDEOS[0].title}
        </h4>
        <p className="text-[11px] text-muted-foreground mb-5">
          Analysis &middot; {LATEST_VIDEOS[0].date}
        </p>

        {/* More episodes */}
        {LATEST_VIDEOS.length > 1 && (
          <div className="border-t border-border pt-4 space-y-3">
            <p className="text-[10px] uppercase tracking-[0.25em] font-bold text-muted-foreground">
              More episodes
            </p>
            {LATEST_VIDEOS.slice(1, 3).map((video) => (
              <div key={video.id} className="flex gap-3 group cursor-pointer">
                <div className="relative w-20 shrink-0 aspect-video bg-neutral-800 overflow-hidden">
                  <img
                    src={video.thumbnail}
                    alt={video.title}
                    className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"
                  />
                  <span className="absolute bottom-0.5 right-0.5 bg-black/85 text-white text-[9px] px-1 tabular-nums">
                    {video.duration}
                  </span>
                </div>
                <p className="text-[12px] leading-snug font-medium [font-family:var(--ff-display)] line-clamp-3 group-hover:text-[#C9A84C] transition-colors">
                  {video.title}
                </p>
              </div>
            ))}
          </div>
        )}

        {/* Current slide byline */}
        <div className="pt-4 border-t border-border mt-auto flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-[#C9A84C] text-black flex items-center justify-center text-[11px] font-bold shrink-0">
            {current.author
              .split(' ')
              .map((w) => w[0])
              .slice(0, 2)
              .join('')
              .toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="text-xs font-bold text-foreground truncate">{current.author}</p>
            <p className="text-[11px] text-muted-foreground truncate">{current.authorTitle}</p>
          </div>
        </div>
      </div>
    </section>
  );
}