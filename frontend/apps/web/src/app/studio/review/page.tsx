'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, ClipboardList, History } from 'lucide-react';
import { useAuth } from '@/lib/useAuth';
import {
  editorialAPI,
  type AuditEntry,
  type Manuscript,
  type ManuscriptStatus,
} from '@/lib/api';
import { renderMarkdown } from '@/components/MarkdownEditor';

const EDITOR_ROLES = ['CONTRIBUTOR_EDITOR', 'ADMIN'];

const STATUS_STYLE: Record<string, string> = {
  AWAITING_REVIEW: 'text-[#C9A84C]',
  EDITOR_ASSIGNED: 'text-[#C9A84C]',
  APPROVED: 'text-emerald-600',
  PUBLISHED: 'text-emerald-600',
  REJECTED: 'text-red-600',
  DRAFT: 'text-muted-foreground',
};

const FILTERS: { label: string; value?: ManuscriptStatus }[] = [
  { label: 'Active queue', value: undefined },
  { label: 'Awaiting review', value: 'AWAITING_REVIEW' },
  { label: 'Assigned', value: 'EDITOR_ASSIGNED' },
  { label: 'Approved', value: 'APPROVED' },
  { label: 'Published', value: 'PUBLISHED' },
  { label: 'Rejected', value: 'REJECTED' },
];

export default function ReviewQueuePage() {
  const { user, isLoading } = useAuth();
  const isEditor = user?.roles?.some((r) => EDITOR_ROLES.includes(r));

  const [filter, setFilter] = useState<ManuscriptStatus | undefined>(undefined);
  const [items, setItems] = useState<Manuscript[]>([]);
  const [selected, setSelected] = useState<Manuscript | null>(null);
  const [audit, setAudit] = useState<AuditEntry[]>([]);
  const [note, setNote] = useState('');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const res = await editorialAPI.queue(filter);
    if (res.success && res.data) setItems(res.data);
    else setMessage(res.error || 'Could not load queue');
    setLoading(false);
  }, [filter]);

  useEffect(() => {
    if (isEditor) load();
  }, [isEditor, load]);

  const openManuscript = async (m: Manuscript) => {
    setSelected(m);
    setNote('');
    setMessage('');
    const res = await editorialAPI.audit(m.id);
    if (res.success && res.data) setAudit(res.data);
  };

  const act = async (
    fn: () => Promise<{ success: boolean; data?: Manuscript; error?: string }>,
    successMsg: string
  ) => {
    setBusy(true);
    setMessage('');
    const res = await fn();
    setBusy(false);

    if (res.success && res.data) {
      setMessage(successMsg);
      setSelected(res.data);
      await load();
      const a = await editorialAPI.audit(res.data.id);
      if (a.success && a.data) setAudit(a.data);
    } else {
      setMessage(res.error || 'Action failed');
    }
  };

  if (isLoading) {
    return <div className="max-w-6xl mx-auto px-4 py-20 text-muted-foreground">Loading…</div>;
  }

  if (!isEditor) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-24 text-center">
        <h1 className="text-[28px] font-bold [font-family:var(--ff-display)] mb-3">
          Editor access required
        </h1>
        <p className="text-sm text-muted-foreground">
          The review queue is available to Editor and Admin accounts.
        </p>
      </div>
    );
  }

  const btn =
    'px-3 py-2 text-[10px] tracking-[0.15em] uppercase font-bold border border-border hover:border-[#C9A84C] disabled:opacity-40';

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
      <Link
        href="/studio"
        className="inline-flex items-center gap-2 text-[11px] tracking-[0.15em] uppercase font-bold text-muted-foreground hover:text-[#C9A84C] mb-6"
      >
        <ArrowLeft size={14} /> Studio
      </Link>

      <p className="text-[9px] tracking-[0.55em] text-[#C9A84C] uppercase font-semibold mb-2">
        Editorial
      </p>
      <h1 className="text-[30px] sm:text-[38px] font-bold [font-family:var(--ff-display)] leading-tight mb-6">
        Review Queue
      </h1>

      <div className="flex flex-wrap gap-2 mb-8">
        {FILTERS.map((f) => (
          <button
            key={f.label}
            onClick={() => {
              setFilter(f.value);
              setSelected(null);
            }}
            className={`px-3 py-1 text-[10px] tracking-[0.15em] uppercase font-bold border transition-colors ${
              filter === f.value
                ? 'border-[#C9A84C] text-[#C9A84C]'
                : 'border-border text-muted-foreground hover:text-foreground'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-8">
        {/* Queue list */}
        <div>
          {loading ? (
            <p className="text-muted-foreground text-sm">Loading…</p>
          ) : items.length === 0 ? (
            <div className="border border-border py-12 text-center">
              <ClipboardList size={24} className="mx-auto mb-3 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">Nothing here right now.</p>
            </div>
          ) : (
            <ul className="border-t border-border">
              {items.map((m) => (
                <li key={m.id}>
                  <button
                    onClick={() => openManuscript(m)}
                    className={`w-full text-left py-3 border-b border-border ${
                      selected?.id === m.id ? 'bg-secondary/50' : ''
                    }`}
                  >
                    <p className="font-bold [font-family:var(--ff-display)] text-[15px] leading-snug">
                      {m.title}
                    </p>
                    <p className="text-[11px] text-muted-foreground mt-1">
                      {m.category} · {m.author?.displayName || m.author?.email}
                    </p>
                    <span
                      className={`text-[10px] tracking-[0.2em] uppercase font-bold ${
                        STATUS_STYLE[m.status] ?? ''
                      }`}
                    >
                      {m.status.replace(/_/g, ' ')}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Detail pane */}
        <div>
          {!selected ? (
            <p className="text-muted-foreground text-sm">
              Select a manuscript to review it.
            </p>
          ) : (
            <div>
              <div className="flex items-start justify-between gap-4 flex-wrap mb-4">
                <div>
                  <span
                    className={`text-[10px] tracking-[0.2em] uppercase font-bold ${
                      STATUS_STYLE[selected.status] ?? ''
                    }`}
                  >
                    {selected.status.replace(/_/g, ' ')}
                  </span>
                  <h2 className="text-[24px] font-bold [font-family:var(--ff-display)] leading-tight mt-1">
                    {selected.title}
                  </h2>
                  {selected.subtitle && (
                    <p className="text-muted-foreground italic [font-family:var(--ff-reading)]">
                      {selected.subtitle}
                    </p>
                  )}
                  <p className="text-[11px] text-muted-foreground mt-2">
                    {selected.category} ·{' '}
                    {selected.author?.displayName || selected.author?.email}
                    {selected.assets?.length
                      ? ` · ${selected.assets.length} asset(s)`
                      : ''}
                  </p>
                </div>
                {message && (
                  <span className="text-[11px] text-muted-foreground">{message}</span>
                )}
              </div>

              {/* Actions */}
              <div className="flex flex-wrap gap-2 mb-4">
                <button
                  disabled={busy || selected.status !== 'AWAITING_REVIEW'}
                  onClick={() => act(() => editorialAPI.assign(selected.id), 'Assigned to you')}
                  className={btn}
                >
                  Assign to me
                </button>
                <button
                  disabled={
                    busy ||
                    !['AWAITING_REVIEW', 'EDITOR_ASSIGNED'].includes(selected.status)
                  }
                  onClick={() => act(() => editorialAPI.approve(selected.id, note), 'Approved')}
                  className={btn}
                >
                  Approve
                </button>
                <button
                  disabled={
                    busy ||
                    !['APPROVED', 'EDITOR_ASSIGNED'].includes(selected.status)
                  }
                  onClick={() => act(() => editorialAPI.publish(selected.id), 'Published live')}
                  className="px-3 py-2 text-[10px] tracking-[0.15em] uppercase font-bold bg-[#C9A84C] text-black disabled:opacity-40"
                >
                  Publish
                </button>
                <button
                  disabled={busy || selected.status !== 'PUBLISHED'}
                  onClick={() => act(() => editorialAPI.unpublish(selected.id), 'Unpublished')}
                  className={btn}
                >
                  Unpublish
                </button>
                <button
                  disabled={busy || !note.trim() || selected.status === 'PUBLISHED'}
                  onClick={() => act(() => editorialAPI.reject(selected.id, note), 'Sent back to author')}
                  className="px-3 py-2 text-[10px] tracking-[0.15em] uppercase font-bold border border-red-300 text-red-600 hover:bg-red-50 disabled:opacity-40"
                >
                  Reject
                </button>
              </div>

              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Editorial note (required to reject, optional to approve)…"
                className="w-full border border-border p-3 text-sm bg-transparent focus:outline-none focus:border-[#C9A84C] mb-6"
                rows={2}
              />

              {selected.reviewNote && (
                <p className="border-l-2 border-[#C9A84C] pl-3 text-sm italic text-muted-foreground mb-6">
                  Last note: {selected.reviewNote}
                </p>
              )}

              {/* Manuscript body */}
              <div className="border border-border p-5 mb-8">
                <div
                  className="[font-family:var(--ff-reading)] text-[15px]"
                  dangerouslySetInnerHTML={{
                    __html: renderMarkdown(selected.bodyMarkdown || '_No content._'),
                  }}
                />
              </div>

              {/* Audit trail */}
              <div>
                <p className="flex items-center gap-2 text-[10px] tracking-[0.2em] uppercase font-bold text-[#C9A84C] mb-3">
                  <History size={12} /> Audit trail
                </p>
                {audit.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No actions recorded yet.</p>
                ) : (
                  <ul className="border-t border-border">
                    {audit.map((a) => (
                      <li key={a.id} className="border-b border-border py-2">
                        <p className="text-[13px]">
                          <strong className="uppercase tracking-[0.1em] text-[11px]">
                            {a.action}
                          </strong>{' '}
                          {a.fromStatus && a.toStatus && (
                            <span className="text-muted-foreground">
                              {a.fromStatus.replace(/_/g, ' ')} → {a.toStatus.replace(/_/g, ' ')}
                            </span>
                          )}
                        </p>
                        <p className="text-[11px] text-muted-foreground">
                          {a.actor?.displayName || a.actor?.email || 'system'} ·{' '}
                          {new Date(a.createdAt).toLocaleString('en-US', {
                            timeZone: 'Asia/Kolkata',
                          })}
                        </p>
                        {a.note && (
                          <p className="text-[12px] italic text-muted-foreground mt-1">
                            “{a.note}”
                          </p>
                        )}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
