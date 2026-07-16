'use client';

import Link from 'next/link';

export function Footer() {
  return (
    <footer className="bg-[#0a0a0a] pt-12 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-8 pb-10 border-b border-white/10">
          
          {/* Brand */}
          <div className="col-span-2 sm:col-span-1">
            <Link href="/about" className="mb-4 flex items-center gap-2 group w-fit">
              <span className="text-[16px] font-bold text-white [font-family:var(--ff-display)] group-hover:text-[#C9A84C] transition-colors">
                Finbytes
              </span>
              <div className="w-px h-5 bg-white/30" />
              <div className="flex flex-col leading-tight">
                <span className="text-[8px] text-white/90 [font-family:var(--ff-sans)] font-semibold">Media &</span>
                <span className="text-[8px] text-white/90 [font-family:var(--ff-sans)] font-semibold">Research</span>
              </div>
            </Link>
            <p className="text-[12px] text-white/35 [font-family:var(--ff-sans)] leading-relaxed mt-1">
              Finbytes is a media and research platform delivering business intelligence, analysis, and editorial insights for ambitious professionals.
            </p>
          </div>

          {/* Company */}
          <div>
            <h4 className="text-[10px] tracking-[0.35em] text-[#C9A84C] uppercase [font-family:var(--ff-sans)] mb-4">
              Company
            </h4>
            <ul className="space-y-2.5">
              <li>
                <Link href="/about" className="text-[12px] text-white/40 hover:text-white [font-family:var(--ff-sans)] transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-[12px] text-white/40 hover:text-white [font-family:var(--ff-sans)] transition-colors">
                  Contact
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-[12px] text-white/40 hover:text-white [font-family:var(--ff-sans)] transition-colors">
                  Advertise
                </Link>
              </li>
            </ul>
          </div>

          {/* Subscribe */}
          <div>
            <h4 className="text-[10px] tracking-[0.35em] text-[#C9A84C] uppercase [font-family:var(--ff-sans)] mb-4">
              Subscribe
            </h4>
            <ul className="space-y-2.5">
              <li>
                <Link href="/about" className="text-[12px] text-white/40 hover:text-white [font-family:var(--ff-sans)] transition-colors">
                  Newsletter
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="text-[10px] tracking-[0.35em] text-[#C9A84C] uppercase [font-family:var(--ff-sans)] mb-4">
              Legal
            </h4>
            <ul className="space-y-2.5">
              <li>
                <Link href="/about" className="text-[12px] text-white/40 hover:text-white [font-family:var(--ff-sans)] transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-[12px] text-white/40 hover:text-white [font-family:var(--ff-sans)] transition-colors">
                  Terms & Conditions
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-5 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-[11px] text-white/20 [font-family:var(--ff-sans)]">
            &copy; 2026 Finbytes Media & Research. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}