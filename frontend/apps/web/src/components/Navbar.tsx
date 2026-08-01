'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Search, Menu, X } from 'lucide-react';
import { useAuth } from '@/lib/useAuth';

const AUTHOR_ROLES = ['CONTRIBUTOR_RESEARCHER', 'CONTRIBUTOR_EDITOR', 'ADMIN'];

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
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchValue, setSearchValue] = useState('');
  const [today, setToday] = useState('');
  const { user, logout } = useAuth();
  const canAuthor = user?.roles?.some((r) => AUTHOR_ROLES.includes(r));
  // Logic: Gold if hovering OR on the homepage ('/'), otherwise White
  const isLogoGold = isLogoHovered || pathname === '/';

  // Show the current date in Indian Standard Time, updating each day.
  useEffect(() => {
    const formatIST = () =>
      new Date().toLocaleDateString('en-US', {
        timeZone: 'Asia/Kolkata',
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    setToday(formatIST());
    // Refresh at the next midnight IST so it stays current if the tab stays open.
    const id = setInterval(() => setToday(formatIST()), 60 * 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <header className="bg-[#0a0a0a] border-b border-white/10">
      <div className="max-w-[1440px] mx-auto px-6 h-9 flex items-center justify-between">
        <span className="text-[10px] tracking-[0.2em] text-white/50 uppercase font-medium">
          {today}
        </span>
        <div className="flex items-center gap-5">
          {canAuthor && (
            <button
              onClick={() => router.push('/studio')}
              className="text-[10px] tracking-[0.2em] text-white/70 uppercase font-semibold hover:text-white"
            >
              Studio
            </button>
          )}

          {user ? (
            <button
              onClick={() => {
                logout();
                router.push('/');
              }}
              className="text-[10px] tracking-[0.2em] text-white/70 uppercase font-semibold hover:text-white"
            >
              Sign out
            </button>
          ) : (
            <button
              onClick={() => router.push('/login')}
              className="text-[10px] tracking-[0.2em] text-white/70 uppercase font-semibold hover:text-white"
            >
              Sign in
            </button>
          )}

          <button
            onClick={() => {
              document.getElementById('subscribe-section')?.scrollIntoView({ behavior: 'smooth' });
            }}
            className="text-[10px] tracking-[0.2em] text-[#C9A84C] uppercase font-semibold hover:opacity-80"
          >
            SUBSCRIBE &rarr;
          </button>
        </div>
      </div>

      <div className="max-w-[1440px] mx-auto px-6 h-16 md:h-20 flex items-center justify-between relative">
        {/* Desktop: left link group */}
        <div className="hidden md:flex items-center gap-8">
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

        {/* Mobile: hamburger button (left) */}
        <button
          className="md:hidden text-white/80 hover:text-white"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          aria-label="Toggle menu"
        >
          {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>

       {/* Logo with Hover State */}
        <div
          className="absolute left-1/2 -translate-x-1/2 flex items-center gap-2 md:gap-3 cursor-pointer transition-colors duration-300"
          onClick={() => router.push('/')}
          onMouseEnter={() => setIsLogoHovered(true)}
          onMouseLeave={() => setIsLogoHovered(false)}
        >
          <span className={`text-[30px] md:text-[44px] font-serif font-bold transition-colors duration-300 ${isLogoGold ? "text-[#C9A84C]" : "text-white"}`}>
            Finbytes
          </span>

          {/* The vertical divider line */}
          <div className="w-[1px] h-6 md:h-8 bg-white/50" />

          {/* The corrected Media & Research tag */}
          <div className="flex flex-col justify-center text-white">
            <span className="text-[11px] md:text-[14px] leading-tight font-serif font-medium">Media &</span>
            <span className="text-[11px] md:text-[14px] leading-tight font-serif font-medium">Research</span>
          </div>
        </div>

        {/* Desktop: right link group */}
        <div className="hidden md:flex items-center gap-8">
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

        {/* Mobile: search icon (right) */}
        <Search
          size={20}
          className="md:hidden text-white/80 hover:text-white cursor-pointer"
          onClick={() => setIsSearchOpen(!isSearchOpen)}
        />
      </div>

      {/* Mobile dropdown menu */}
      {isMenuOpen && (
        <div className="md:hidden border-t border-white/10 px-6 py-2 animate-in slide-in-from-top-2 duration-200">
          {NAV_LINKS.map((link) => {
            const isActive = pathname === NAV_VIEW_MAP[link];
            return (
              <button
                key={link}
                onClick={() => {
                  router.push(NAV_VIEW_MAP[link]);
                  setIsMenuOpen(false);
                }}
                className={`block w-full text-left py-3 text-[12px] tracking-[0.15em] uppercase font-bold border-b border-white/5 transition-colors ${
                  isActive ? "text-[#C9A84C]" : "text-white/70 hover:text-white"
                }`}
              >
                {link}
              </button>
            );
          })}

          {canAuthor && (
            <button
              onClick={() => {
                router.push('/studio');
                setIsMenuOpen(false);
              }}
              className="block w-full text-left py-3 text-[12px] tracking-[0.15em] uppercase font-bold border-b border-white/5 text-white/70 hover:text-white"
            >
              Studio
            </button>
          )}

          <button
            onClick={() => {
              if (user) {
                logout();
                router.push('/');
              } else {
                router.push('/login');
              }
              setIsMenuOpen(false);
            }}
            className="block w-full text-left py-3 text-[12px] tracking-[0.15em] uppercase font-bold text-white/70 hover:text-white"
          >
            {user ? 'Sign out' : 'Sign in'}
          </button>
        </div>
      )}

      {/* Search block */}
      {isSearchOpen && (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            const term = searchValue.trim();
            if (term) {
              router.push(`/search?q=${encodeURIComponent(term)}`);
              setIsSearchOpen(false);
              setSearchValue('');
            }
          }}
          className="max-w-[1440px] mx-auto px-6 pb-6 animate-in slide-in-from-top-2 duration-200"
        >
          <input
            autoFocus
            type="text"
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            placeholder="Search Finbytes and press Enter…"
            className="w-full bg-transparent border-b border-[#C9A84C] text-white p-4 focus:outline-none placeholder:text-white/30"
          />
        </form>
      )}

    </header>
  );
}
