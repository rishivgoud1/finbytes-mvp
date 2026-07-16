'use client';

import { useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Search } from 'lucide-react';

const NAV_LINKS = ["Finbytes of the Day", "Decode", "Strategy Room", "Power Desk", "Editorial", "About"] as const;

const NAV_VIEW_MAP: Record<string, string> = {
  "Finbytes of the Day": "/fotd",
  "Decode": "/decode",
  "Strategy Room": "/strategy-room",
  "Power Desk": "/power-desk",
  "Editorial": "/editorial",
  "About": "/about",
};

export function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const [isLogoHovered, setIsLogoHovered] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  // Logic: Gold if hovering OR on the homepage ('/'), otherwise White
  const isLogoGold = isLogoHovered || pathname === '/';

  return (
    <header className="bg-[#0a0a0a] border-b border-white/10">
      <div className="max-w-[1440px] mx-auto px-6 h-9 flex items-center justify-between">
        <span className="text-[10px] tracking-[0.2em] text-white/50 uppercase font-medium">
          Monday, June 9, 2026
        </span>
        <button 
  onClick={() => {
    document.getElementById('subscribe-section')?.scrollIntoView({ behavior: 'smooth' });
  }}
  className="text-[10px] tracking-[0.2em] text-[#C9A84C] uppercase font-semibold hover:opacity-80"
>
  SUBSCRIBE &rarr;
</button>
      </div>

      <div className="max-w-[1440px] mx-auto px-6 h-20 flex items-center justify-between relative">
        <div className="flex items-center gap-8">
          {NAV_LINKS.slice(0, 3).map((link) => {
            const isActive = pathname === NAV_VIEW_MAP[link];
            return (
              <button
                key={link}
                onClick={() => router.push(NAV_VIEW_MAP[link])}
                className={`relative h-20 flex items-center text-[11px] tracking-[0.15em] uppercase font-bold transition-colors ${
                  isActive ? "text-[#C9A84C]" : "text-white/60 hover:text-white"
                }`}
              >
                {link}
                {isActive && <span className="absolute bottom-0 left-0 w-full h-[3px] bg-[#C9A84C]" />}
              </button>
            );
          })}
        </div>

       {/* Logo with Hover State */}
        <div 
          className="absolute left-1/2 -translate-x-1/2 flex items-center gap-3 cursor-pointer transition-colors duration-300"
          onClick={() => router.push('/')}
          onMouseEnter={() => setIsLogoHovered(true)}
          onMouseLeave={() => setIsLogoHovered(false)}
        >
          <span className={`text-[32px] font-serif font-bold transition-colors duration-300 ${isLogoGold ? "text-[#C9A84C]" : "text-white"}`}>
            Finbytes
          </span>
          
          {/* The vertical divider line */}
          <div className="w-[1px] h-8 bg-white/50" />
          
          {/* The corrected Media & Research tag */}
          <div className="flex flex-col justify-center text-white">
            <span className="text-[14px] leading-tight font-serif font-medium">Media &</span>
            <span className="text-[14px] leading-tight font-serif font-medium">Research</span>
          </div>
        </div>

        <div className="flex items-center gap-8">
          {NAV_LINKS.slice(3).map((link) => {
            const isActive = pathname === NAV_VIEW_MAP[link];
            return (
              <button
                key={link}
                onClick={() => router.push(NAV_VIEW_MAP[link])}
                className={`relative h-20 flex items-center text-[11px] tracking-[0.15em] uppercase font-bold transition-colors ${
                  isActive ? "text-[#C9A84C]" : "text-white/60 hover:text-white"
                }`}
              >
                {link}
                {isActive && <span className="absolute bottom-0 left-0 w-full h-[3px] bg-[#C9A84C]" />}
              </button>
            );
          })}
          <Search 
            size={16} 
            className="text-white/60 hover:text-white cursor-pointer ml-2" 
            onClick={() => setIsSearchOpen(!isSearchOpen)} 
          />
        </div>
      </div>

      {/* ADD THE SEARCH BLOCK HERE */}
      {isSearchOpen && (
        <div className="max-w-[1440px] mx-auto px-6 pb-6 animate-in slide-in-from-top-2 duration-200">
          <input
            autoFocus
            type="text"
            placeholder="Search Finbytes..."
            className="w-full bg-transparent border-b border-[#C9A84C] text-white p-4 focus:outline-none placeholder:text-white/30"
          />
        </div>
      )}

    </header> 
  );
}