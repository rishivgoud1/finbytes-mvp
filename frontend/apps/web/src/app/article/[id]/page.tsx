'use client';

import { getArticleBySlug, byId } from '@/lib/articles';
import { ArticleView } from '@/components/ArticleView';

export default function ArticleRoute({ params }: { params: { id: string } }) {
  // Links use the article slug; fall back to numeric id for older links.
  const article = getArticleBySlug(params.id) ?? byId(params.id);
  if (!article) return <div className="max-w-3xl mx-auto px-4 py-16">Article not found</div>;
  return <ArticleView article={article} />;
}
