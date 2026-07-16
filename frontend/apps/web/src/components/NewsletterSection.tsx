'use client';

import { useState } from 'react';
import { Mail } from 'lucide-react';

export function NewsletterSection() {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) setSubscribed(true);
  };

  return (
    <section id="subscribe-section" className="bg-[#0a0a0a] py-8 sm:py-10">
      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-5">
          {/* Left: label + headline */}
          <div className="flex-shrink-0">
            <p className="text-[9px] tracking-[0.4em] text-[#C9A84C] uppercase [font-family:var(--ff-sans)] mb-1">
              Daily Intelligence
            </p>
            <h2 className="text-[22px] sm:text-[26px] font-bold text-white [font-family:var(--ff-display)] leading-tight">
              Finbytes. <span className="text-[#C9A84C]">Every morning.</span>
            </h2>
          </div>

          {/* Right: form */}
          <div className="flex-1 sm:max-w-sm">
            {!subscribed ? (
              <form onSubmit={handleSubmit} className="flex gap-0">
                <div className="relative flex-1">
                  <Mail size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your@email.com"
                    className="w-full pl-9 pr-3 py-3 bg-white/5 border border-white/10 border-r-0 text-white placeholder-white/25 text-sm [font-family:var(--ff-sans)] focus:outline-none focus:border-[#C9A84C] transition-colors"
                    required
                  />
                </div>
                <button
                  type="submit"
                  className="px-5 py-3 bg-[#C9A84C] text-[#0a0a0a] text-[10px] font-black tracking-[0.18em] uppercase [font-family:var(--ff-sans)] hover:bg-[#dbc06a] transition-colors whitespace-nowrap flex-shrink-0"
                >
                  Subscribe
                </button>
              </form>
            ) : (
              <div className="py-3 text-[#C9A84C] [font-family:var(--ff-display)] text-base italic">
                Welcome aboard. Check your inbox.
              </div>
            )}
            <p className="mt-2 text-[10px] text-white/20 [font-family:var(--ff-sans)]">
              No spam. Unsubscribe at any time.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}