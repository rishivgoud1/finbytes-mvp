'use client';

import { type Product } from '@/lib/articles';

export interface Filters {
  q: string;
  product: Product | '';
  author: string;
  dateFrom: string;
  dateTo: string;
  sort: 'relevance' | 'newest';
}

const CATEGORIES: Product[] = [
  'Finbytes of the Day',
  'Decode',
  'Strategy Room',
  'Power Desk',
  'Editorial',
];

const label =
  'block text-[10px] tracking-[0.2em] uppercase font-semibold text-[#C9A84C] mb-3';
const field =
  'w-full border border-border p-2 text-sm bg-transparent focus:outline-none focus:border-[#C9A84C]';

export function FilterSidebar({
  filters,
  authors,
  onChange,
  onReset,
}: {
  filters: Filters;
  authors: string[];
  onChange: (next: Filters) => void;
  onReset: () => void;
}) {
  const set = (patch: Partial<Filters>) => onChange({ ...filters, ...patch });

  return (
    <aside className="w-full md:w-64 shrink-0 space-y-8">
      {/* Search */}
      <div>
        <label className={label}>Search</label>
        <input
          value={filters.q}
          onChange={(e) => set({ q: e.target.value })}
          placeholder="Search articles…"
          className={field}
        />
      </div>

      {/* Category */}
      <div>
        <p className={label}>Category</p>
        <div className="space-y-2">
          {CATEGORIES.map((c) => (
            <label key={c} className="flex items-center gap-2 text-sm cursor-pointer">
              <input
                type="radio"
                name="category"
                checked={filters.product === c}
                onChange={() => set({ product: c })}
                className="accent-[#C9A84C]"
              />
              {c}
            </label>
          ))}
          {filters.product && (
            <button
              onClick={() => set({ product: '' })}
              className="text-xs text-muted-foreground underline mt-1"
            >
              Clear category
            </button>
          )}
        </div>
      </div>

      {/* Author */}
      <div>
        <p className={label}>Author</p>
        <select
          value={filters.author}
          onChange={(e) => set({ author: e.target.value })}
          className={field}
        >
          <option value="">All authors</option>
          {authors.map((a) => (
            <option key={a} value={a}>
              {a}
            </option>
          ))}
        </select>
      </div>

      {/* Date range */}
      <div>
        <p className={label}>Date Range</p>
        <div className="space-y-2">
          <input
            type="date"
            value={filters.dateFrom}
            onChange={(e) => set({ dateFrom: e.target.value })}
            className={field}
          />
          <input
            type="date"
            value={filters.dateTo}
            onChange={(e) => set({ dateTo: e.target.value })}
            className={field}
          />
        </div>
      </div>

      {/* Sort */}
      <div>
        <p className={label}>Sort By</p>
        <select
          value={filters.sort}
          onChange={(e) => set({ sort: e.target.value as 'relevance' | 'newest' })}
          className={field}
        >
          <option value="relevance">Relevance</option>
          <option value="newest">Newest</option>
        </select>
      </div>

      <button
        onClick={onReset}
        className="w-full border border-[#C9A84C] text-[#C9A84C] text-[11px] tracking-[0.15em] uppercase font-semibold py-2 hover:bg-[#C9A84C] hover:text-black transition-colors"
      >
        Reset all filters
      </button>
    </aside>
  );
}
