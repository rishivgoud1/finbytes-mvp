'use client';

import Link from 'next/link';
import { Clock } from 'lucide-react';
import { ARTICLES } from '@/lib/articles';
import { ProductBadge } from '@/components/ProductBadge'; // Ensure this path is correct

export default function DecodePage() {
  const articles = ARTICLES.filter((a) => a.product === 'Decode');

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
      <p className="text-[9px] tracking-[0.55em] text-[#C9A84C] uppercase [font-family:var(--ff-sans)] font-semibold mb-2">
        Decode
      </p>
      <h1 className="text-[30px] sm:text-[38px] font-bold text-foreground [font-family:var(--ff-display)] leading-tight mb-8">
        Deep-Dive Analysis
      </h1>

      {/* 3-column grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {articles.map((article) => (
          <Link
            key={article.id}
            href={`/article/${article.slug}`}
            className="group block flex flex-col"
          >
            {/* Sharp rectangular thumbnail */}
            <div className="relative overflow-hidden bg-zinc-100 aspect-[3/2] mb-4">
              <img
                src={article.image}
                alt={article.title}
                className="w-full h-full object-cover group-hover:scale-[104%] transition-transform duration-500"
              />
            </div>
            
            {/* Gold category tag */}
            <ProductBadge product={article.product} small />
            
            {/* Bold headline */}
            <h3 className="mt-2 text-[17px] font-bold leading-snug text-foreground [font-family:var(--ff-display)] group-hover:text-[#C9A84C] transition-colors mb-2 line-clamp-2">
              {article.title}
            </h3>
            <p className="text-[13px] text-muted-foreground [font-family:var(--ff-sans)] leading-relaxed line-clamp-2 mb-3 flex-1">
              {article.excerpt}
            </p>
            
            {/* Uniform meta row */}
            <div className="flex items-center justify-between pt-3 border-t border-border mt-auto">
              <span className="text-[11px] text-muted-foreground [font-family:var(--ff-sans)]">
                {article.author} &middot; {article.date}
              </span>
              <span className="text-[11px] text-muted-foreground [font-family:var(--ff-sans)] flex items-center gap-1">
                <Clock size={10} />
                {article.readTime}
              </span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}