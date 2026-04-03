'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Profile } from '@/lib/types';

export default function EditProfilePage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [form, setForm] = useState({
    slug: '', name: '', tagline: '',
    x: '', instagram: '', linkedin: '',
    strengths: '', thoughtPatterns: '', passions: '',
    public: true,
  });

  useEffect(() => {
    fetch('/api/profiles')
      .then(r => r.json())
      .then((profiles: Profile[]) => {
        const found = profiles.find(p => p.id === id);
        if (!found) { router.push('/dashboard'); return; }
        setProfile(found);
        setForm({
          slug: found.slug,
          name: found.name,
          tagline: found.tagline,
          x: found.socials?.x || '',
          instagram: found.socials?.instagram || '',
          linkedin: found.socials?.linkedin || '',
          strengths: found.strengths,
          thoughtPatterns: found.thoughtPatterns,
          passions: found.passions,
          public: found.public,
        });
        setLoading(false);
      });
  }, [id]);

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm(p => ({ ...p, [k]: e.target.value }));

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.slug || !form.name) { alert('Slug and name are required.'); return; }
    setSaving(true);
    try {
      const res = await fetch(`/api/profiles/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          slug: form.slug,
          name: form.name,
          tagline: form.tagline,
          socials: { x: form.x, instagram: form.instagram, linkedin: form.linkedin },
          strengths: form.strengths,
          thoughtPatterns: form.thoughtPatterns,
          passions: form.passions,
          public: form.public,
        }),
      });
      if (!res.ok) { alert('Failed to save changes.'); return; }
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <div className="empty-state">
      <span className="empty-state-icon">◈</span>
      Loading…
    </div>
  );

  return (
    <div style={{ maxWidth: 800, margin: '0 auto' }}>
      {/* ── Back nav ── */}
      <div className="animate-fade-up" style={{ marginBottom: '2rem' }}>
        <a href="/dashboard" style={{
          display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
          color: 'var(--fg-muted)', textDecoration: 'none', fontSize: '0.85rem',
          transition: 'color var(--t-fast)',
        }}
          onMouseEnter={e => (e.currentTarget.style.color = 'var(--fg)')}
          onMouseLeave={e => (e.currentTarget.style.color = 'var(--fg-muted)')}
        >
          ← Dashboard
        </a>
      </div>

      <form onSubmit={handleSave}>
        <div className="animate-fade-up" style={{ marginBottom: '1.25rem' }}>
          <h1 style={{ fontSize: '1.5rem', marginBottom: '0.2rem' }}>Edit Profile</h1>
          <p className="subtitle" style={{ fontSize: '0.85rem', margin: 0 }}>co11abor8.com/p/{form.slug}</p>
        </div>

        {/* Basic info */}
        <div className="card animate-fade-up stagger-1" style={{ marginBottom: '1.25rem' }}>
          <h3 style={{ marginBottom: '1.5rem', fontSize: '0.9rem', color: 'var(--fg-secondary)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Basic Info</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Slug * <span style={{ color: 'var(--fg-faint)', fontWeight: 400 }}>URL: co11abor8.com/p/slug</span></label>
              <input className="form-input" value={form.slug} onChange={set('slug')} />
            </div>
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Name *</label>
              <input className="form-input" value={form.name} onChange={set('name')} />
            </div>
          </div>
          <div className="form-group" style={{ marginTop: '1rem', marginBottom: 0 }}>
            <label className="form-label">Tagline</label>
            <input className="form-input" placeholder="One-liner about what you do" value={form.tagline} onChange={set('tagline')} />
          </div>
        </div>

        {/* Socials */}
        <div className="card animate-fade-up stagger-2" style={{ marginBottom: '1.25rem' }}>
          <h3 style={{ marginBottom: '1.5rem', fontSize: '0.9rem', color: 'var(--fg-secondary)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Socials</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.875rem' }}>
            {[
              { k: 'x', label: 'X (Twitter)', p: 'https://x.com/…' },
              { k: 'instagram', label: 'Instagram', p: 'https://instagram.com/…' },
              { k: 'linkedin', label: 'LinkedIn', p: 'https://linkedin.com/in/…' },
            ].map(f => (
              <div key={f.k} className="form-group" style={{ margin: 0 }}>
                <label className="form-label">{f.label}</label>
                <input className="form-input" placeholder={f.p} value={(form as any)[f.k]} onChange={set(f.k)} />
              </div>
            ))}
          </div>
        </div>

        {/* Notes */}
        <div className="card animate-fade-up stagger-3" style={{ marginBottom: '1.25rem' }}>
          <h3 style={{ marginBottom: '1.5rem', fontSize: '0.9rem', color: 'var(--fg-secondary)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Notes</h3>
          <div>
            <label className="form-label">Strengths</label>
            <textarea className="form-textarea" placeholder="What you're great at…" value={form.strengths} onChange={set('strengths')} rows={3} />
          </div>
          <div style={{ marginTop: '1rem' }}>
            <label className="form-label">Thought Patterns</label>
            <textarea className="form-textarea" placeholder="How you think and process…" value={form.thoughtPatterns} onChange={set('thoughtPatterns')} rows={3} />
          </div>
          <div style={{ marginTop: '1rem' }}>
            <label className="form-label">Passions</label>
            <textarea className="form-textarea" placeholder="What you're obsessed with…" value={form.passions} onChange={set('passions')} rows={3} />
          </div>
        </div>

        {/* Visibility */}
        <div className="card animate-fade-up stagger-4" style={{ marginBottom: '1.5rem' }}>
          <label className="toggle">
            <input
              type="checkbox"
              checked={form.public}
              onChange={e => setForm(p => ({ ...p, public: e.target.checked }))}
            />
            <span className="toggle-track" />
            <span>{form.public ? 'Public — profile is visible' : 'Private — profile is hidden'}</span>
          </label>
          <p style={{ fontSize: '0.78rem', color: 'var(--fg-muted)', marginTop: '0.75rem' }}>
            {form.public
              ? `Your profile will be live at co11abor8.com/p/${form.slug}`
              : 'Your profile will not be visible to the public.'}
          </p>
        </div>

        {/* Actions */}
        <div className="animate-fade-up stagger-5" style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <button type="submit" className="btn" disabled={saving} style={{ padding: '0.75rem 2rem' }}>
            {saving ? 'Saving…' : 'Save Changes'}
          </button>
          {saved && (
            <span style={{ fontSize: '0.875rem', color: 'var(--status-open)' }}>
              Changes saved ✓
            </span>
          )}
          <a href="/dashboard" className="btn btn-outline">Discard</a>
        </div>
      </form>
    </div>
  );
}
