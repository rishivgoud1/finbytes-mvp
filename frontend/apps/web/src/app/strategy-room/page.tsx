'use client';

import Link from 'next/link';
import { ARTICLES } from '@/lib/articles';

const shorts = [
  { title: "Crisis Playbook: The 3-Step Reset", duration: "0:58", img: "https://images.unsplash.com/photo-1600896997793-b8ed3459a17f?w=400&h=700&fit=crop&auto=format" },
  { title: "Capital Allocation in 60 Seconds", duration: "0:47", img: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=400&h=700&fit=crop&auto=format" },
  { title: "Talent Architecture: The One Rule", duration: "1:02", img: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=700&fit=crop&auto=format" },
  { title: "What Is a Competitive Moat?", duration: "0:55", img: "https://images.unsplash.com/photo-1647510283846-ed174cc84a78?w=400&h=700&fit=crop&auto=format" },
  { title: "The First 72 Hours of Any Crisis", duration: "1:14", img: "https://images.unsplash.com/photo-1560221328-12fe60f83ab8?w=400&h=700&fit=crop&auto=format" },
];

export default function StrategyRoomPage() {
  const mainArticles = ARTICLES.filter((a) => a.product === "Strategy Room");

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
      <p className="text-[9px] tracking-[0.55em] text-[#C9A84C] uppercase [font-family:var(--ff-sans)] font-semibold mb-2">
        Strategy Room
      </p>
      <h1 className="text-[30px] sm:text-[38px] font-bold text-foreground [font-family:var(--ff-display)] leading-tight mb-8">
        Executive Playbooks
      </h1>

      {/* PRIMARY — 16:9 article grid */}
      <div className="flex items-center gap-3 mb-5">
        <div className="w-[3px] h-5 bg-[#C9A84C]" />
        <h2 className="text-[16px] font-bold text-foreground [font-family:var(--ff-display)]">Featured Articles</h2>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-12">
        {mainArticles.map((article) => (
          <Link
            key={article.id}
            href={`/article/${article.slug}`}
            className="group block flex flex-col"
          >
            <div className="relative aspect-video overflow-hidden bg-zinc-900 mb-3">
              <img
                src={article.image}
                alt={article.title}
                className="w-full h-full object-cover group-hover:scale-[104%] transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-black/15 group-hover:bg-black/0 transition-colors" />
              <div className="absolute bottom-2 right-2 bg-black/80 px-1.5 py-0.5">
                <span className="text-white text-[10px] [font-family:var(--ff-sans)]">{article.readTime}</span>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-zinc-200 flex-shrink-0 flex items-center justify-center text-zinc-600 text-[11px] font-bold [font-family:var(--ff-display)]">
                {article.author[0]}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-[14px] font-bold text-foreground [font-family:var(--ff-sans)] leading-snug line-clamp-2 group-hover:text-[#C9A84C] transition-colors mb-1">
                  {article.title}
                </h3>
                <p className="text-[11px] text-muted-foreground [font-family:var(--ff-sans)]">{article.author}</p>
                <p className="text-[11px] text-muted-foreground [font-family:var(--ff-sans)]">{article.date}</p>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* SECONDARY — 9:16 Shorts row */}
      <div className="flex items-center gap-3 mb-5">
        <div className="w-[3px] h-5 bg-[#C9A84C]" />
        <h2 className="text-[16px] font-bold text-foreground [font-family:var(--ff-display)]">Strategy Shorts</h2>
        <span className="text-[10px] tracking-wider text-muted-foreground uppercase [font-family:var(--ff-sans)] ml-1">Quick reads</span>
      </div>
      <div className="flex gap-4 overflow-x-auto pb-2" style={{ scrollbarWidth: "none" }}>
        {shorts.map((s, i) => (
          <div key={i} className="flex-shrink-0 w-[140px] sm:w-[160px] group cursor-pointer">
            <div className="relative overflow-hidden bg-zinc-900 rounded-[12px] mb-2" style={{ aspectRatio: "9/16" }}>
              <img
                src={s.img}
                alt={s.title}
                className="w-full h-full object-cover group-hover:scale-[104%] transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
              <div className="absolute bottom-3 left-3 right-3">
                <span className="text-white text-[11px] font-semibold [font-family:var(--ff-sans)] leading-snug line-clamp-2">
                  {s.title}
                </span>
              </div>
              <div className="absolute top-2 right-2 bg-black/70 px-1.5 py-0.5 rounded-sm">
                <span className="text-white text-[9px] [font-family:var(--ff-sans)]">{s.duration}</span>
              </div>
            </div>
            <p className="text-[11px] text-muted-foreground [font-family:var(--ff-sans)] truncate">Strategy Room</p>
          </div>
        ))}
      </div>
    </div>
  );
}