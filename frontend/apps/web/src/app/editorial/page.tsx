'use client';

import Link from 'next/link';
import { Clock, ChevronRight } from 'lucide-react';
import { ARTICLES } from '@/lib/articles';

export default function EditorialPage() {
  const pieces = ARTICLES.filter((a) => a.product === 'Editorial' && a.author === 'Shashidhar');
  const [featured, ...rest] = pieces;

  return (
    <main>
      {/* Masthead — minimalist personal column header */}
      <div className="bg-[#0a0a0a] py-14">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
          <div className="w-5 h-[2px] bg-[#C9A84C] mx-auto mb-6" />
          <p className="text-[9px] tracking-[0.6em] text-[#C9A84C] uppercase [font-family:var(--ff-sans)] font-semibold mb-4">
            Editorial
          </p>
          <h1 className="text-[36px] sm:text-[48px] font-bold text-white [font-family:var(--ff-display)] leading-tight mb-3">
            Shashidhar
          </h1>
          <p className="text-white/45 text-[13px] [font-family:var(--ff-sans)] tracking-wide">
            Founder & CEO, Finbytes &nbsp;·&nbsp; Published every Monday
          </p>
        </div>
      </div>

      {/* Featured piece — wide, editorial-magazine treatment */}
      {featured && (
        <Link
          href={`/article/${featured.slug}`}
          className="max-w-3xl mx-auto px-4 sm:px-6 py-12 block group border-b border-border"
        >
          <div className="relative aspect-[16/8] overflow-hidden mb-7">
            <img
              src={featured.image}
              alt={featured.title}
              className="w-full h-full object-cover group-hover:scale-[102%] transition-transform duration-700"
            />
          </div>
          <p className="text-[9px] tracking-[0.4em] text-[#C9A84C] uppercase [font-family:var(--ff-sans)] font-semibold mb-4">
            Latest Column &nbsp;·&nbsp; {featured.date}
          </p>
          <h2 className="text-[26px] sm:text-[34px] font-bold text-foreground [font-family:var(--ff-display)] leading-[1.15] group-hover:text-[#C9A84C] transition-colors mb-4">
            {featured.title}
          </h2>
          {featured.subtitle && (
            <p className="text-[16px] text-muted-foreground [font-family:var(--ff-reading)] font-light leading-relaxed mb-5">
              {featured.subtitle}
            </p>
          )}
          <p className="text-[14px] text-muted-foreground [font-family:var(--ff-sans)] leading-relaxed mb-6 line-clamp-2">
            {featured.excerpt}
          </p>
          <div className="flex items-center gap-2 text-[12px] text-muted-foreground [font-family:var(--ff-sans)]">
            <Clock size={12} />{featured.readTime}
          </div>
        </Link>
      )}

      {/* Archive — clean linear list */}
      {rest.length > 0 && (
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
          <p className="text-[9px] tracking-[0.5em] text-[#C9A84C] uppercase [font-family:var(--ff-sans)] font-semibold mb-7">
            Previous Columns
          </p>
          <div className="flex flex-col gap-0">
            {rest.map((piece, i) => (
              <Link
                key={piece.id}
                href={`/article/${piece.slug}`}
                className={`group flex gap-5 py-6 hover:bg-secondary/30 transition-colors -mx-4 px-4 ${i < rest.length - 1 ? 'border-b border-border' : ''}`}
              >
                {/* Issue number */}
                <div className="flex-shrink-0 w-10 text-right">
                  <span className="text-[20px] font-bold text-[#C9A84C]/25 [font-family:var(--ff-display)] leading-none">
                    {String(i + 2).padStart(2, '0')}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] tracking-[0.3em] text-muted-foreground uppercase [font-family:var(--ff-sans)] mb-2">
                    {piece.date}
                  </p>
                  <h3 className="text-[17px] font-bold text-foreground [font-family:var(--ff-display)] leading-snug group-hover:text-[#C9A84C] transition-colors mb-1 line-clamp-2">
                    {piece.title}
                  </h3>
                  <p className="text-[13px] text-muted-foreground [font-family:var(--ff-sans)] line-clamp-1">{piece.excerpt}</p>
                </div>
                <div className="flex-shrink-0 self-center">
                  <ChevronRight size={16} className="text-muted-foreground/40 group-hover:text-[#C9A84C] transition-colors" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </main>
  );
}