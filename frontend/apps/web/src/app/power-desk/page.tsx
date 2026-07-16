'use client';

import Link from 'next/link';
import { Clock } from 'lucide-react';
import { ARTICLES } from '@/lib/articles';

export default function PowerDeskPage() {
  const ceoArticles = ARTICLES.filter((a) => a.product === 'Power Desk' && a.authorTitle === 'Chief Executive Officer');

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
      <p className="text-[9px] tracking-[0.55em] text-[#C9A84C] uppercase [font-family:var(--ff-sans)] font-semibold mb-2">
        Power Desk &nbsp;·&nbsp; CEO Features
      </p>
      <h1 className="text-[30px] sm:text-[38px] font-bold text-foreground [font-family:var(--ff-display)] leading-tight mb-10">
        Executive Perspectives
      </h1>

      <div className="flex flex-col gap-0">
        {ceoArticles.map((article, idx) => {
          const isEven = idx % 2 === 0;
          return (
            <Link
              key={article.id}
              href={`/article/${article.slug}`}
              className={`group block border-t border-border last:border-b py-0 ${idx === 0 ? 'border-b' : ''}`}
            >
              {/* Alternating full-bleed strips with generous padding */}
              <div
                className={`grid grid-cols-1 lg:grid-cols-2 min-h-[340px] ${isEven ? '' : 'bg-[#0a0a0a]'}`}
              >
                {/* Image panel — alternates side */}
                <div
                  className={`relative overflow-hidden min-h-[240px] lg:min-h-0 ${isEven ? 'lg:order-1' : 'lg:order-2'}`}
                >
                  <img
                    src={article.image}
                    alt={article.title}
                    className={`absolute inset-0 w-full h-full object-cover group-hover:scale-[103%] transition-transform duration-700 ${isEven ? '' : 'opacity-70'}`}
                  />
                  {isEven && <div className="absolute inset-0 bg-black/10 group-hover:bg-black/0 transition-colors" />}
                  {!isEven && <div className="absolute inset-0 bg-gradient-to-l from-transparent to-black/50" />}
                </div>

                {/* Text panel */}
                <div
                  className={`flex flex-col justify-center px-10 sm:px-14 py-12 ${
                    isEven ? 'lg:order-2 bg-background' : 'lg:order-1'
                  }`}
                >
                  {/* CEO badge */}
                  <div className="flex items-center gap-2 mb-5">
                    <span className="text-[9px] tracking-[0.4em] text-[#C9A84C] uppercase [font-family:var(--ff-sans)] font-semibold">
                      CEO Feature
                    </span>
                    <span className={`w-12 h-px ${isEven ? 'bg-[#C9A84C]/40' : 'bg-[#C9A84C]/30'}`} />
                  </div>

                  {/* Article title — prominent serif */}
                  <h2
                    className={`text-[22px] sm:text-[26px] lg:text-[30px] font-bold [font-family:var(--ff-display)] leading-[1.15] mb-4 group-hover:text-[#C9A84C] transition-colors ${
                      isEven ? 'text-foreground' : 'text-white'
                    }`}
                  >
                    {article.title}
                  </h2>

                  {article.subtitle && (
                    <p className={`text-[14px] leading-relaxed mb-5 [font-family:var(--ff-sans)] ${isEven ? 'text-muted-foreground' : 'text-white/60'}`}>
                      {article.subtitle}
                    </p>
                  )}

                  {/* Author — executive prestige treatment */}
                  <div className={`border-t pt-5 mt-2 ${isEven ? 'border-border' : 'border-white/15'}`}>
                    <p className={`text-[13px] font-bold [font-family:var(--ff-sans)] ${isEven ? 'text-foreground' : 'text-white'}`}>
                      {article.author}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`text-[10px] [font-family:var(--ff-sans)] ${isEven ? 'text-muted-foreground' : 'text-white/40'}`}>
                        {article.date}
                      </span>
                      <span className={isEven ? 'text-muted-foreground/30' : 'text-white/20'}>&middot;</span>
                      <span className={`text-[10px] [font-family:var(--ff-sans)] flex items-center gap-1 ${isEven ? 'text-muted-foreground' : 'text-white/40'}`}>
                        <Clock size={9} />{article.readTime}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}