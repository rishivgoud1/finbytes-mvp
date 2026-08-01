'use client';

import { useEffect, useState } from 'react';
import { ARTICLES, type Article, type Product } from './articles';
import { publicAPI, type PublicArticle } from './api';

/**
 * Converts a published manuscript from the API into the Article shape the
 * site's components already expect, so DB content and the original local
 * content can be rendered by the same cards and pages.
 */
export function publicToArticle(p: PublicArticle): Article {
  return {
    id: -Math.abs(hashId(p.id)), // negative ids avoid clashing with local ones
    slug: p.slug,
    product: (p.product as Product) ?? 'Decode',
    title: p.title,
    subtitle: p.subtitle,
    excerpt: p.excerpt || '',
    author: p.author,
    authorTitle: p.authorTitle || 'Contributor',
    date: p.date,
    readTime: p.readTime || '5 min read',
    image: p.image || '',
    // Markdown body is split into paragraphs for the existing renderer.
    body: (p.bodyMarkdown || '')
      .split(/\n{2,}/)
      .map((s) => s.trim())
      .filter(Boolean),
  };
}

function hashId(id: string): number {
  let h = 0;
  for (let i = 0; i < id.length; i += 1) {
    h = (h << 5) - h + id.charCodeAt(i);
    h |= 0;
  }
  return h || 1;
}

/**
 * Returns published database articles merged ahead of the built-in ones.
 * Falls back silently to local content if the API is unavailable, so the
 * site never breaks because the backend is down.
 */
export function useArticles(category?: Product) {
  const [articles, setArticles] = useState<Article[]>(
    category ? ARTICLES.filter((a) => a.product === category) : ARTICLES
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    publicAPI
      .articles(category)
      .then((res) => {
        if (cancelled) return;
        const local = category
          ? ARTICLES.filter((a) => a.product === category)
          : ARTICLES;

        if (res.success && res.data && res.data.length > 0) {
          const fromDb = res.data.map(publicToArticle);
          setArticles([...fromDb, ...local]);
        } else {
          setArticles(local);
        }
      })
      .catch(() => {
        /* keep local content */
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [category]);

  return { articles, loading };
}
