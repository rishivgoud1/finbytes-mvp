'use client';

import { useEffect, useState } from 'react';
import { getArticleBySlug, byId, type Article } from '@/lib/articles';
import { publicAPI } from '@/lib/api';
import { publicToArticle } from '@/lib/useArticles';
import { ArticleView } from '@/components/ArticleView';

export default function ArticleRoute({ params }: { params: { id: string } }) {
  // Built-in content resolves instantly; database articles are fetched.
  const local = getArticleBySlug(params.id) ?? byId(params.id);

  const [article, setArticle] = useState<Article | undefined>(local);
  const [loading, setLoading] = useState(!local);

  useEffect(() => {
    if (local) return;

    let cancelled = false;
    publicAPI
      .article(params.id)
      .then((res) => {
        if (cancelled) return;
        if (res.success && res.data) setArticle(publicToArticle(res.data));
      })
      .catch(() => {
        /* fall through to not-found */
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [params.id, local]);

  if (loading) {
    return <div className="max-w-3xl mx-auto px-4 py-16 text-muted-foreground">Loading…</div>;
  }

  if (!article) {
    return <div className="max-w-3xl mx-auto px-4 py-16">Article not found</div>;
  }

  return <ArticleView article={article} />;
}
