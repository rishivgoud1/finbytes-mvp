'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ClipboardList, FileText, Plus } from 'lucide-react';
import { manuscriptsAPI, type Manuscript, type ManuscriptStatus } from '@/lib/api';
import { useAuth } from '@/lib/useAuth';

const EDITOR_ROLES = ['CONTRIBUTOR_EDITOR', 'ADMIN'];

const STATUS_STYLE: Record<ManuscriptStatus, string> = {
  DRAFT: 'text-muted-foreground',
  AWAITING_REVIEW: 'text-[#C9A84C]',
  EDITOR_ASSIGNED: 'text-[#C9A84C]',
  APPROVED: 'text-emerald-600',
  PUBLISHED: 'text-emerald-600',
  REJECTED: 'text-red-600',
};

export default function StudioDashboard() {
  const [items, setItems] = useState<Manuscript[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { user } = useAuth();
  const isEditor = user?.roles?.some((r) => EDITOR_ROLES.includes(r));

  useEffect(() => {
    manuscriptsAPI.list().then((res) => {
      if (res.success && res.data) setItems(res.data);
      else setError(res.error || 'Could not load manuscripts');
      setLoading(false);
    });
  }, []);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
      <p className="text-[9px] tracking-[0.55em] text-[#C9A84C] uppercase font-semibold mb-2">
        Authoring Studio
      </p>

      <div className="flex items-center justify-between mb-8 gap-4 flex-wrap">
        <h1 className="text-[30px] sm:text-[38px] font-bold [font-family:var(--ff-display)] leading-tight">
          My Manuscripts
        </h1>
        <div className="flex items-center gap-3">
          {isEditor && (
            <Link
              href="/studio/review"
              className="inline-flex items-center gap-2 border border-border px-4 py-2 text-[11px] tracking-[0.15em] uppercase font-bold hover:border-[#C9A84C]"
            >
              <ClipboardList size={14} /> Review queue
            </Link>
          )}
          <Link
            href="/studio/new"
            className="inline-flex items-center gap-2 bg-[#C9A84C] text-black px-4 py-2 text-[11px] tracking-[0.15em] uppercase font-bold"
          >
            <Plus size={14} /> New manuscript
          </Link>
        </div>
      </div>

      {loading ? (
        <p className="text-muted-foreground">Loading…</p>
      ) : error ? (
        <p className="text-red-600 text-sm">{error}</p>
      ) : items.length === 0 ? (
        <div className="border border-border py-20 text-center">
          <FileText size={28} className="mx-auto mb-4 text-muted-foreground" />
          <p className="[font-family:var(--ff-display)] text-xl mb-2">
            No manuscripts yet
          </p>
          <p className="text-sm text-muted-foreground mb-6">
            Start your first draft — it stays private until you submit it for review.
          </p>
          <Link
            href="/studio/new"
            className="inline-block border border-[#C9A84C] text-[#C9A84C] px-6 py-2 text-[11px] tracking-[0.15em] uppercase font-bold hover:bg-[#C9A84C] hover:text-black transition-colors"
          >
            Create draft
          </Link>
        </div>
      ) : (
        <ul className="divide-y divide-border border-t border-b border-border">
          {items.map((m) => (
            <li key={m.id}>
              <Link
                href={`/studio/${m.id}`}
                className="flex items-center justify-between gap-4 py-4 group"
              >
                <div className="min-w-0">
                  <p className="font-bold [font-family:var(--ff-display)] text-[17px] truncate group-hover:text-[#C9A84C] transition-colors">
                    {m.title || 'Untitled'}
                  </p>
                  <p className="text-[11px] text-muted-foreground mt-1">
                    {m.category} · updated{' '}
                    {new Date(m.updatedAt).toLocaleDateString('en-US', {
                      timeZone: 'Asia/Kolkata',
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                    {m.assets?.length ? ` · ${m.assets.length} asset(s)` : ''}
                  </p>
                </div>
                <span
                  className={`shrink-0 text-[10px] tracking-[0.2em] uppercase font-bold ${
                    STATUS_STYLE[m.status] ?? 'text-muted-foreground'
                  }`}
                >
                  {m.status.replace(/_/g, ' ')}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
