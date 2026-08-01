'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Paperclip, Trash2 } from 'lucide-react';
import {
  manuscriptsAPI,
  uploadsAPI,
  uploadFile,
  type AssetRecord,
  type ManuscriptStatus,
} from '@/lib/api';
import { MarkdownEditor } from '@/components/MarkdownEditor';

const CATEGORIES = [
  'Finbytes of the Day',
  'Decode',
  'Strategy Room',
  'Power Desk',
  'Editorial',
];

export default function StudioEditorPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const id = params.id;
  const isNew = id === 'new';

  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [coverImage, setCoverImage] = useState('');
  const [readTime, setReadTime] = useState('');
  const [category, setCategory] = useState('Decode');
  const [body, setBody] = useState('');
  const [status, setStatus] = useState<ManuscriptStatus>('DRAFT');
  const [assets, setAssets] = useState<AssetRecord[]>([]);

  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  const editable = status === 'DRAFT' || status === 'REJECTED';

  useEffect(() => {
    if (isNew) return;
    manuscriptsAPI.get(id).then((res) => {
      if (res.success && res.data) {
        const m = res.data;
        setTitle(m.title);
        setSubtitle(m.subtitle ?? '');
        setExcerpt(m.excerpt ?? '');
        setCoverImage(m.coverImage ?? '');
        setReadTime(m.readTime ?? '');
        setCategory(m.category);
        setBody(m.bodyMarkdown ?? '');
        setStatus(m.status);
        setAssets(m.assets ?? []);
      } else {
        setMessage(res.error || 'Could not load manuscript');
      }
      setLoading(false);
    });
  }, [id, isNew]);

  const save = useCallback(async () => {
    if (!title.trim()) {
      setMessage('A headline is required');
      return;
    }
    setSaving(true);
    setMessage('');

    const payload = {
      title,
      subtitle,
      excerpt,
      coverImage,
      readTime,
      category,
      bodyMarkdown: body,
    };
    const res = isNew
      ? await manuscriptsAPI.create(payload)
      : await manuscriptsAPI.update(id, payload);

    setSaving(false);

    if (res.success && res.data) {
      setMessage('Saved');
      if (isNew) router.replace(`/studio/${res.data.id}`);
    } else {
      setMessage(res.error || 'Save failed');
    }
  }, [isNew, id, title, subtitle, excerpt, coverImage, readTime, category, body, router]);

  const submit = async () => {
    if (isNew) {
      setMessage('Save the draft before submitting');
      return;
    }
    const res = await manuscriptsAPI.submit(id);
    if (res.success && res.data) {
      setStatus(res.data.status);
      setMessage('Submitted for editorial review');
    } else {
      setMessage(res.error || 'Submit failed');
    }
  };

  const onFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (isNew) {
      setMessage('Save the draft before attaching files');
      return;
    }

    setMessage(`Uploading ${file.name}…`);
    const result = await uploadFile(file, id);

    if (result.ok) {
      setMessage('Uploaded');
      const list = await uploadsAPI.forManuscript(id);
      if (list.success && list.data) setAssets(list.data);
    } else {
      setMessage(result.error || 'Upload failed');
    }
    if (fileRef.current) fileRef.current.value = '';
  };

  const removeAsset = async (assetId: string) => {
    const res = await uploadsAPI.remove(assetId);
    if (res.success) setAssets((prev) => prev.filter((a) => a.id !== assetId));
    else setMessage(res.error || 'Could not remove asset');
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-20 text-muted-foreground">
        Loading…
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
      <Link
        href="/studio"
        className="inline-flex items-center gap-2 text-[11px] tracking-[0.15em] uppercase font-bold text-muted-foreground hover:text-[#C9A84C] mb-6"
      >
        <ArrowLeft size={14} /> My manuscripts
      </Link>

      <div className="flex items-center justify-between gap-4 flex-wrap mb-6">
        <span className="text-[10px] tracking-[0.2em] uppercase font-bold text-[#C9A84C]">
          {isNew ? 'New draft' : status.replace(/_/g, ' ')}
        </span>

        <div className="flex items-center gap-3">
          {message && (
            <span className="text-[11px] text-muted-foreground">{message}</span>
          )}
          <button
            onClick={save}
            disabled={saving || !editable}
            className="border border-border px-4 py-2 text-[11px] tracking-[0.15em] uppercase font-bold hover:border-[#C9A84C] disabled:opacity-40"
          >
            {saving ? 'Saving…' : 'Save draft'}
          </button>
          <button
            onClick={submit}
            disabled={isNew || !editable}
            className="bg-[#C9A84C] text-black px-4 py-2 text-[11px] tracking-[0.15em] uppercase font-bold disabled:opacity-40"
          >
            Submit for review
          </button>
        </div>
      </div>

      {!editable && (
        <p className="border border-border bg-secondary/40 p-3 text-[13px] text-muted-foreground mb-6">
          This manuscript is in <strong>{status.replace(/_/g, ' ')}</strong> state and is
          locked for editing while an editor reviews it.
        </p>
      )}

      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        disabled={!editable}
        placeholder="Headline"
        className="w-full text-[26px] sm:text-[32px] font-bold [font-family:var(--ff-display)] leading-tight border-b border-border pb-3 mb-4 bg-transparent focus:outline-none focus:border-[#C9A84C] disabled:opacity-60"
      />

      <input
        value={subtitle}
        onChange={(e) => setSubtitle(e.target.value)}
        disabled={!editable}
        placeholder="Subtitle or deck (optional)"
        className="w-full text-[17px] italic text-muted-foreground [font-family:var(--ff-reading)] border-b border-border pb-2 mb-6 bg-transparent focus:outline-none focus:border-[#C9A84C] disabled:opacity-60"
      />

      <textarea
        value={excerpt}
        onChange={(e) => setExcerpt(e.target.value)}
        disabled={!editable}
        rows={2}
        placeholder="Excerpt — the summary shown on article cards"
        className="w-full text-[14px] text-muted-foreground [font-family:var(--ff-sans)] border border-border p-3 mb-4 bg-transparent focus:outline-none focus:border-[#C9A84C] disabled:opacity-60"
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        <input
          value={coverImage}
          onChange={(e) => setCoverImage(e.target.value)}
          disabled={!editable}
          placeholder="Cover image URL"
          className="border border-border p-2 text-sm bg-transparent focus:outline-none focus:border-[#C9A84C] disabled:opacity-60"
        />
        <input
          value={readTime}
          onChange={(e) => setReadTime(e.target.value)}
          disabled={!editable}
          placeholder="Read time (e.g. 8 min read)"
          className="border border-border p-2 text-sm bg-transparent focus:outline-none focus:border-[#C9A84C] disabled:opacity-60"
        />
      </div>

      <div className="flex items-center gap-4 flex-wrap mb-6">
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          disabled={!editable}
          className="border border-border p-2 text-sm bg-transparent focus:outline-none focus:border-[#C9A84C] disabled:opacity-60"
        >
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>

        <label
          className={`inline-flex items-center gap-2 border border-border px-4 py-2 text-[11px] tracking-[0.15em] uppercase font-bold ${
            editable && !isNew
              ? 'cursor-pointer hover:border-[#C9A84C]'
              : 'opacity-40 cursor-not-allowed'
          }`}
        >
          <Paperclip size={14} />
          Attach PDF / WebP / CSV
          <input
            ref={fileRef}
            type="file"
            accept="application/pdf,image/webp,text/csv,.pdf,.webp,.csv"
            onChange={onFile}
            disabled={!editable || isNew}
            className="hidden"
          />
        </label>
      </div>

      <MarkdownEditor value={body} onChange={setBody} />

      {assets.length > 0 && (
        <div className="mt-8">
          <p className="text-[10px] tracking-[0.2em] uppercase font-bold text-[#C9A84C] mb-3">
            Attached assets
          </p>
          <ul className="border-t border-border">
            {assets.map((a) => (
              <li
                key={a.id}
                className="flex items-center justify-between gap-4 border-b border-border py-3"
              >
                <div className="min-w-0">
                  {a.publicUrl ? (
                    <a
                      href={a.publicUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm truncate hover:text-[#C9A84C] underline"
                    >
                      {a.filename}
                    </a>
                  ) : (
                    <span className="text-sm truncate">{a.filename}</span>
                  )}
                  <p className="text-[11px] text-muted-foreground">
                    {a.mimeType} · {(a.sizeBytes / 1024).toFixed(0)} KB
                  </p>
                </div>
                {editable && (
                  <button
                    onClick={() => removeAsset(a.id)}
                    className="text-muted-foreground hover:text-red-600 shrink-0"
                    aria-label={`Remove ${a.filename}`}
                  >
                    <Trash2 size={16} />
                  </button>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
