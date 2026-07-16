'use client';

import { useRouter } from 'next/navigation';
import { ChevronRight } from 'lucide-react';
import { type Article } from '@/lib/articles';
import { ProductBadge } from './ProductBadge';

export function FeaturedAnalysis({ article }: { article: Article }) {
  const router = useRouter();

  const handleArticleClick = () => {
    router.push(`/article/${article.id}`);
  };

  return (
    <section className="bg-[#0a0a0a] py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-[3px] h-5 bg-[#C9A84C]" />
          <h2 className="text-xl font-bold text-white [font-family:var(--ff-display)] tracking-tight">
            Featured Analysis
          </h2>
          <div className="flex-1 border-b border-white/10" />
        </div>

        <div
          className="grid grid-cols-1 lg:grid-cols-2 gap-8 group cursor-pointer"
          onClick={handleArticleClick}
        >
          <div className="relative overflow-hidden bg-zinc-900 aspect-[4/3] lg:aspect-auto">
            <img
              src={article.image}
              alt={article.title}
              className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-700"
            />
            <div className="absolute inset-0 bg-black/20" />
          </div>
          <div className="flex flex-col justify-center py-2 lg:py-6">
            <div className="flex items-center gap-3 mb-5">
              <ProductBadge product={article.product} dark />
              <div className="w-px h-4 bg-[#C9A84C]/40" />
              <span className="text-[10px] tracking-[0.3em] text-white/50 uppercase [font-family:var(--ff-sans)]">
                In-Depth
              </span>
            </div>
            <h2 className="text-[28px] sm:text-[34px] lg:text-[40px] font-bold text-white [font-family:var(--ff-display)] leading-[1.12] mb-4 group-hover:text-[#e8d8a0] transition-colors">
              {article.title}
            </h2>
            {article.subtitle && (
              <p className="text-white/60 [font-family:var(--ff-sans)] text-base leading-relaxed mb-6">
                {article.subtitle}
              </p>
            )}
            <p className="text-white/50 [font-family:var(--ff-sans)] text-sm leading-relaxed mb-8 line-clamp-3">
              {article.excerpt}
            </p>
            <div className="flex items-center gap-4">
              <button
                onClick={(e) => { e.stopPropagation(); handleArticleClick(); }}
                className="inline-flex items-center gap-2 px-6 py-3 bg-[#C9A84C] text-[#0a0a0a] text-[11px] font-black tracking-[0.2em] uppercase [font-family:var(--ff-sans)] hover:bg-[#dbc06a] transition-colors"
              >
                Read the Analysis
                <ChevronRight size={14} />
              </button>
              <span className="text-white/40 text-[12px] [font-family:var(--ff-sans)]">
                {article.author} &middot; {article.readTime}
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}