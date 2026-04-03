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
    if (!form.slug || !form.name) { alert('Slug and name required'); return; }
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
      if (!res.ok) { alert('Failed to save'); return; }
      router.push('/dashboard');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="empty-state">Loading...</div>;

  return (
    <div style={{ maxWidth: 720, margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
        <a href="/dashboard" style={{ color: 'var(--muted)', textDecoration: 'none', fontSize: '0.9rem' }}>← Dashboard</a>
        <span style={{ color: 'var(--border)' }}>|</span>
        <span style={{ fontSize: '0.9rem' }}>Edit Profile</span>
      </div>

      <form onSubmit={handleSave}>
        <div className="card" style={{ marginBottom: '1rem' }}>
          <h2 style={{ fontSize: '1rem', marginBottom: '1rem' }}>Basic Info</h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Slug * <span style={{ fontWeight: 400 }}>(URL: co11ab.com/p/slug)</span></label>
              <input className="form-input" value={form.slug} onChange={set('slug')} />
            </div>
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Name *</label>
              <input className="form-input" value={form.name} onChange={set('name')} />
            </div>
          </div>
          <div className="form-group" style={{ marginTop: '0.75rem' }}>
            <label className="form-label">Tagline</label>
            <input className="form-input" placeholder="One-liner about you" value={form.tagline} onChange={set('tagline')} />
          </div>
        </div>

        <div className="card" style={{ marginBottom: '1rem' }}>
          <h2 style={{ fontSize: '1rem', marginBottom: '1rem' }}>Socials</h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.75rem' }}>
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">X (Twitter)</label>
              <input className="form-input" placeholder="https://x.com/..." value={form.x} onChange={set('x')} />
            </div>
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Instagram</label>
              <input className="form-input" placeholder="https://instagram.com/..." value={form.instagram} onChange={set('instagram')} />
            </div>
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">LinkedIn</label>
              <input className="form-input" placeholder="https://linkedin.com/in/..." value={form.linkedin} onChange={set('linkedin')} />
            </div>
          </div>
        </div>

        <div className="card" style={{ marginBottom: '1rem' }}>
          <h2 style={{ fontSize: '1rem', marginBottom: '1rem' }}>Notes</h2>
          <div>
            <label className="form-label">Strengths</label>
            <textarea className="form-textarea" placeholder="What you're great at..." value={form.strengths} onChange={set('strengths')} rows={3} />
          </div>
          <div style={{ marginTop: '0.75rem' }}>
            <label className="form-label">Thought Patterns</label>
            <textarea className="form-textarea" placeholder="How you think and process..." value={form.thoughtPatterns} onChange={set('thoughtPatterns')} rows={3} />
          </div>
          <div style={{ marginTop: '0.75rem' }}>
            <label className="form-label">Passions</label>
            <textarea className="form-textarea" placeholder="What you're obsessed with..." value={form.passions} onChange={set('passions')} rows={3} />
          </div>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <button type="submit" className="btn" disabled={saving}>{saving ? 'Saving...' : 'Save Changes'}</button>
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.875rem', cursor: 'pointer' }}>
            <input type="checkbox" checked={form.public} onChange={e => setForm(p => ({ ...p, public: e.target.checked }))} style={{ accentColor: 'var(--accent)' }} />
            Public profile (visible at /p/{form.slug})
          </label>
        </div>
      </form>
    </div>
  );
}
