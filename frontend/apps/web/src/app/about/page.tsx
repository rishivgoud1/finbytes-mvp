'use client';

import Link from 'next/link';
import { ChevronRight } from 'lucide-react';

export default function AboutPage() {
  const metrics = [
    { value: "2.4M", label: "Daily Readers" },
    { value: "5 min", label: "Avg Read Time" },
    { value: "2019", label: "Founded" },
    { value: "48", label: "Countries Reached" },
  ];

  const products = [
    { name: "Finbytes of the Day", href: "/fotd", desc: "The five-minute morning brief delivering market intelligence, context, and the insight that reframes the day." },
    { name: "Decode", href: "/decode", desc: "Long-form investigation. We go three layers deeper on the stories that define business and technology." },
    { name: "Strategy Room", href: "/strategy-room", desc: "Inside the decisions of great companies. Frameworks that actually work at scale, from the leaders who use them." },
  ];

  return (
    <main>
      <div className="bg-[#0a0a0a] py-20 sm:py-28">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <div className="w-5 h-[2px] bg-[#C9A84C] mx-auto mb-8" />
          <h1
            className="font-bold text-white [font-family:var(--ff-display)] leading-[1.1] mb-0"
            style={{ fontSize: "clamp(28px, 5vw, 60px)" }}
          >
            Business intelligence{" "}
            <span className="text-[#C9A84C]">for ambitious professionals.</span>
          </h1>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-14">
        {/* Metrics Grid */}
        <div className="grid grid-cols-2 border border-border mb-14">
          {metrics.map((m, i) => (
            <div
              key={m.label}
              className={`px-10 py-10 sm:py-12 ${i % 2 === 0 ? "border-r border-border" : ""} ${i < 2 ? "border-b border-border" : ""}`}
            >
              <div className="text-[52px] sm:text-[64px] font-bold text-foreground [font-family:var(--ff-display)] leading-none mb-3">{m.value}</div>
              <div className="text-[10px] tracking-[0.35em] text-muted-foreground uppercase [font-family:var(--ff-sans)]">{m.label}</div>
            </div>
          ))}
        </div>

        {/* Core Platform Tiers */}
        <p className="text-[9px] tracking-[0.55em] text-[#C9A84C] uppercase [font-family:var(--ff-sans)] font-semibold mb-7">Core Platform Tiers</p>
        <div className="grid grid-cols-1 sm:grid-cols-3 border border-border mb-10">
          {products.map((p, i) => (
            <Link 
              key={p.name} 
              href={p.href} 
              className={`group text-left px-8 py-10 hover:bg-secondary/50 transition-colors ${i < 2 ? "border-r border-border" : ""}`}
            >
              <div className="flex items-start justify-between gap-3 mb-4">
                <p className="text-[10px] tracking-[0.3em] text-[#C9A84C] uppercase [font-family:var(--ff-sans)] font-semibold leading-snug">{p.name}</p>
                <ChevronRight size={13} className="text-[#C9A84C] flex-shrink-0 mt-0.5 group-hover:translate-x-1 transition-transform" />
              </div>
              <p className="text-[13px] text-muted-foreground [font-family:var(--ff-sans)] leading-relaxed">{p.desc}</p>
            </Link>
          ))}
        </div>

        {/* Contact Section */}
        <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto] items-center gap-6 border border-border px-8 sm:px-10 py-8">
          <div>
            <h3 className="text-[18px] font-bold text-foreground [font-family:var(--ff-display)] mb-1">Get in Touch</h3>
            <p className="text-[13px] text-muted-foreground [font-family:var(--ff-sans)]">Research partnerships, editorial collaborations, and advertising enquiries.</p>
          </div>
          <div className="flex gap-3 flex-wrap">
            <a href="mailto:editorial@finbytes.com" className="px-6 py-3 bg-[#C9A84C] text-[#0a0a0a] text-[10px] font-black tracking-[0.22em] uppercase [font-family:var(--ff-sans)] hover:bg-[#dbc06a] transition-colors whitespace-nowrap">Editorial</a>
            <a href="mailto:ads@finbytes.com" className="px-6 py-3 border border-border text-[10px] font-semibold tracking-[0.22em] uppercase [font-family:var(--ff-sans)] hover:border-[#C9A84C] hover:text-[#C9A84C] transition-colors whitespace-nowrap">Advertise</a>
          </div>
        </div>
      </div>
    </main>
  );
}