'use client';

import Link from 'next/link';
import { ChevronRight, Clock } from 'lucide-react';
import { ARTICLES } from '@/lib/articles';

export default function FinbytesOfTheDayPage() {
  const edition = ARTICLES.find((a) => a.product === 'Finbytes of the Day') ?? ARTICLES[0];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
      <p className="text-[9px] tracking-[0.55em] text-[#C9A84C] uppercase [font-family:var(--ff-sans)] font-semibold mb-10 text-center">
        Finbytes of the Day &nbsp;·&nbsp; {edition.date}
      </p>

      {/* Centered hero — scaled to max-w-3xl for graceful framing */}
      <div className="max-w-3xl mx-auto">
        <Link 
          href={`/article/${edition.slug}`}
          className="relative block overflow-hidden bg-[#0a0a0a] aspect-[16/9] group"
        >
          <img
            src={edition.image}
            alt={edition.title}
            className="absolute inset-0 w-full h-full object-cover opacity-55 group-hover:opacity-70 group-hover:scale-[1.025] transition-all duration-700"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/45 to-transparent" />
          <div className="absolute top-6 left-6">
            <span className="px-3 py-1 bg-[#C9A84C] text-[#0a0a0a] text-[8px] font-black tracking-[0.35em] [font-family:var(--ff-sans)] uppercase">
              TODAY
            </span>
          </div>
          <div className="absolute bottom-0 left-0 right-0 p-8 sm:p-10">
            <h1 className="text-[24px] sm:text-[32px] font-bold text-white [font-family:var(--ff-display)] leading-[1.13] mb-4 group-hover:text-[#e8d8a0] transition-colors">
              {edition.title}
            </h1>
            <p className="text-white/60 text-[14px] [font-family:var(--ff-sans)] leading-relaxed mb-6 line-clamp-2">
              {edition.excerpt}
            </p>
            <div className="inline-flex items-center gap-2 px-6 py-3 bg-[#C9A84C] text-[#0a0a0a] text-[10px] font-black tracking-[0.25em] uppercase [font-family:var(--ff-sans)] hover:bg-[#dbc06a] transition-colors">
              Read Full Edition <ChevronRight size={12} />
            </div>
          </div>
        </Link>

        {/* Metadata strip below hero */}
        <div className="flex items-center gap-4 mt-5 pb-1 border-b border-border">
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <Clock size={11} />
            <span className="text-[12px] [font-family:var(--ff-sans)]">{edition.readTime}</span>
          </div>
          <span className="text-muted-foreground/30">&middot;</span>
          <span className="text-[12px] text-muted-foreground [font-family:var(--ff-sans)]">{edition.author}</span>
        </div>
      </div>
    </div>
  );
}