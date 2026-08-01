'use client';

import Link from 'next/link';
import { useAuth } from '@/lib/useAuth';

const AUTHOR_ROLES = ['CONTRIBUTOR_RESEARCHER', 'CONTRIBUTOR_EDITOR', 'ADMIN'];

export default function StudioLayout({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-20 text-muted-foreground">
        Loading…
      </div>
    );
  }

  const canAuthor = user?.roles?.some((r) => AUTHOR_ROLES.includes(r));

  if (!canAuthor) {
    return (
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-24 text-center">
        <p className="text-[9px] tracking-[0.55em] text-[#C9A84C] uppercase font-semibold mb-3">
          Authoring Studio
        </p>
        <h1 className="text-[28px] font-bold [font-family:var(--ff-display)] mb-3">
          Contributor access required
        </h1>
        <p className="text-sm text-muted-foreground mb-6">
          {user
            ? 'Your account does not have a contributor role. Contact an administrator for access.'
            : 'Sign in with a Researcher or Editor account to write and submit manuscripts.'}
        </p>
        {!user && (
          <Link
            href="/login"
            className="inline-block bg-[#C9A84C] text-black px-6 py-2 text-[11px] tracking-[0.15em] uppercase font-bold"
          >
            Sign in
          </Link>
        )}
      </div>
    );
  }

  return <>{children}</>;
}
