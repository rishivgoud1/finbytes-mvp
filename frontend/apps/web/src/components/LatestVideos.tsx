'use client';

import { Play } from 'lucide-react';
import { LATEST_VIDEOS } from '@/lib/articles';

export function LatestVideos() {
  return (
    <div className="h-full px-6 py-4 flex flex-col">
      {/* Sidebar Header */}
      <div className="flex justify-between items-center mb-6 mt-2">
        <h2 className="text-[11px] font-bold tracking-[0.2em] uppercase text-black">
          Latest Videos
        </h2>
        <a href="/videos" className="text-[11px] font-bold tracking-[0.2em] uppercase text-black hover:text-[#C9A84C]">
          VIEW ALL {'>'}
        </a>
      </div>

      {/* Grid container - Changed to grid with 3 columns */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {/* Changed slice from (0, 1) to (0, 3) to show 3 videos */}
        {LATEST_VIDEOS.slice(0, 3).map((video) => (
          <a
            key={video.id}
            href={`https://www.youtube.com/watch?v=${video.videoId}`}
            target="_blank"
            rel="noopener noreferrer"
            className="group block"
          >
            {/* Thumbnail */}
            <div className="relative aspect-video bg-zinc-900 mb-4 overflow-hidden">
              <img
                src={video.thumbnail}
                alt={video.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-10 h-10 bg-white/90 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Play size={16} fill="#000" className="text-black ml-0.5" />
                </div>
              </div>
              <span className="absolute bottom-1.5 right-1.5 bg-black/80 text-white text-[10px] px-1 py-0.5">
                {video.duration}
              </span>
            </div>

            {/* Title & Meta */}
            <h3 className="text-[15px] font-bold text-black leading-snug mb-1 group-hover:text-[#C9A84C] transition-colors">
              {video.title}
            </h3>
            <p className="text-[11px] text-gray-500 uppercase tracking-widest">
              {video.category || "Analysis"}
            </p>
          </a>
        ))}
      </div>

      {/* Bottom line */}
      <div className="border-t border-black mt-12 pt-8" />
    </div>
  );
}