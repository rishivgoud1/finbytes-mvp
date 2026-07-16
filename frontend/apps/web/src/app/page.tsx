'use client';

import { HeroSection } from '@/components/HeroSection';
import { LatestFromFinbytes } from '@/components/LatestFromFinbytes';
import { FeaturedAnalysis } from '@/components/FeaturedAnalysis';
import { LatestVideos } from '@/components/LatestVideos';
import { NewsletterSection } from '@/components/NewsletterSection';
import { ARTICLES } from '@/lib/articles';

export default function HomePage() {
  // Logic from your provided code to filter data locally
  const latestArticles = ARTICLES.filter((a) => a.product !== 'Finbytes of the Day').slice(0, 6);
  const featuredArticle = ARTICLES.find((a) => a.product === 'Decode' || a.product === 'Editorial') ?? ARTICLES[1];

  return (
    <>
      {/* Removed onArticleClick prop; ensure HeroSection uses <Link> internally */}
      <HeroSection articles={ARTICLES} />

      {/* Thin divider */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="border-b border-border" />
      </div>

      {/* Removed onArticleClick prop; ensure these use <Link> internally */}
      <LatestFromFinbytes articles={latestArticles} />
      <FeaturedAnalysis article={featuredArticle} />
      
      <LatestVideos />
      <NewsletterSection />
    </>
  );
}