'use client';

import { useRouter } from 'next/navigation';
import { type Article } from '@/lib/articles';
import { ProductBadge } from './ProductBadge';

export function LatestFromFinbytes({ articles }: { articles: Article[] }) {
  const router = useRouter();

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      <div className="flex items-center gap-4 mb-6">
        <div className="w-[3px] h-5 bg-[#C9A84C]" />
        <h2 className="text-xl font-bold text-foreground [font-family:var(--ff-display)] tracking-tight">
          Latest From Finbytes
        </h2>
        <div className="flex-1 border-b border-border" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {articles.map((article) => (
          <article
            key={article.id}
            onClick={() => router.push(`/article/${article.id}`)}
            className="group cursor-pointer flex flex-col"
          >
            <div className="relative overflow-hidden bg-zinc-100 aspect-[3/2] mb-3">
              <img
                src={article.image}
                alt={article.title}
                className="w-full h-full object-cover group-hover:scale-[1.04] transition-transform duration-500"
              />
            </div>
            <ProductBadge product={article.product} small />
            <h3 className="mt-2 text-[16px] font-bold leading-snug text-foreground [font-family:var(--ff-display)] group-hover:text-[#C9A84C] transition-colors mb-2 line-clamp-2">
              {article.title}
            </h3>
            <p className="text-[13px] text-muted-foreground [font-family:var(--ff-sans)] leading-relaxed line-clamp-2 mb-3 flex-1">
              {article.excerpt}
            </p>
            <div className="flex items-center justify-between pt-3 border-t border-border mt-auto">
              <span className="text-[11px] text-muted-foreground [font-family:var(--ff-sans)]">
                {article.author} &middot; {article.date}
              </span>
              <span className="text-[11px] text-muted-foreground [font-family:var(--ff-sans)]">{article.readTime}</span>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}