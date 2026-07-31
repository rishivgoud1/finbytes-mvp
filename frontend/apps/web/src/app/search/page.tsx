'use client';

import { Suspense, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Clock, SlidersHorizontal } from 'lucide-react';
import {
  searchArticles,
  getAllAuthors,
  type Product,
} from '@/lib/articles';
import { ProductBadge } from '@/components/ProductBadge';
import { FilterSidebar, type Filters } from '@/components/FilterSidebar';

function SearchInner() {
  const router = useRouter();
  const params = useSearchParams();

  const authors = useMemo(() => getAllAuthors(), []);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const [filters, setFilters] = useState<Filters>({
    q: params.get('q') ?? '',
    product: (params.get('category') as Product) ?? '',
    author: params.get('author') ?? '',
    dateFrom: params.get('dateFrom') ?? '',
    dateTo: params.get('dateTo') ?? '',
    sort: (params.get('sort') as 'relevance' | 'newest') ?? 'relevance',
  });

  const results = useMemo(
    () =>
      searchArticles({
        q: filters.q,
        product: filters.product,
        author: filters.author,
        dateFrom: filters.dateFrom,
        dateTo: filters.dateTo,
        sort: filters.sort,
      }),
    [filters]
  );

  // Keep the URL in sync so searches are shareable.
  const update = (next: Filters) => {
    setFilters(next);
    const qs = new URLSearchParams();
    if (next.q) qs.set('q', next.q);
    if (next.product) qs.set('category', next.product);
    if (next.author) qs.set('author', next.author);
    if (next.dateFrom) qs.set('dateFrom', next.dateFrom);
    if (next.dateTo) qs.set('dateTo', next.dateTo);
    if (next.sort) qs.set('sort', next.sort);
    router.replace(`/search?${qs.toString()}`, { scroll: false });
  };

  const reset = () =>
    update({
      q: '',
      product: '',
      author: '',
      dateFrom: '',
      dateTo: '',
      sort: 'relevance',
    });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
      <p className="text-[9px] tracking-[0.55em] text-[#C9A84C] uppercase [font-family:var(--ff-sans)] font-semibold mb-2">
        Search
      </p>
      <h1 className="text-[30px] sm:text-[38px] font-bold text-foreground [font-family:var(--ff-display)] leading-tight mb-2">
        {filters.q ? `Results for “${filters.q}”` : 'Browse & Filter'}
      </h1>
      <p className="text-sm text-muted-foreground mb-6">
        {results.length} result{results.length === 1 ? '' : 's'}
      </p>

      {/* Mobile filter toggle */}
      <button
        onClick={() => setDrawerOpen(!drawerOpen)}
        className="md:hidden flex items-center gap-2 border border-border px-4 py-2 text-sm mb-6"
      >
        <SlidersHorizontal size={16} /> Filters
      </button>

      <div className="flex flex-col md:flex-row gap-10">
        <div className={drawerOpen ? 'block' : 'hidden md:block'}>
          <FilterSidebar
            filters={filters}
            authors={authors}
            onChange={update}
            onReset={reset}
          />
        </div>

        <div className="flex-1">
          {results.length === 0 ? (
            <div className="py-20 text-center">
              <p className="text-foreground [font-family:var(--ff-display)] text-xl mb-2">
                No results found
              </p>
              <p className="text-sm text-muted-foreground">
                Try a different search term or reset your filters.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {results.map((article) => (
                <Link
                  key={article.id}
                  href={`/article/${article.slug}`}
                  className="group flex flex-col"
                >
                  <div className="relative overflow-hidden bg-zinc-100 aspect-[3/2] mb-4">
                    <img
                      src={article.image}
                      alt={article.title}
                      className="w-full h-full object-cover group-hover:scale-[104%] transition-transform duration-500"
                    />
                  </div>
                  <ProductBadge product={article.product} small />
                  <h3 className="mt-2 text-[17px] font-bold leading-snug text-foreground [font-family:var(--ff-display)] group-hover:text-[#C9A84C] transition-colors mb-2 line-clamp-2">
                    {article.title}
                  </h3>
                  <p className="text-[13px] text-muted-foreground [font-family:var(--ff-sans)] leading-relaxed line-clamp-2 mb-3 flex-1">
                    {article.excerpt}
                  </p>
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
          )}
        </div>
      </div>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="max-w-7xl mx-auto px-4 py-16">Loading…</div>}>
      <SearchInner />
    </Suspense>
  );
}
