'use client';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';

export default function PublicProfile() {
  const { slug } = useParams<{ slug: string }>();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const [form, setForm] = useState({ name: '', contact: '', projectIdea: '', helpNeeded: '', vision: '' });

  useEffect(() => {
    fetch(`/api/profile?slug=${slug}`).then(r => r.json()).then(data => {
      if (data.error) { setNotFound(true); }
      else { setProfile(data); }
      setLoading(false);
    });
  }, [slug]);

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm(p => ({ ...p, [k]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.contact || !form.projectIdea || !form.helpNeeded) {
      setError('Please fill in all required fields.');
      return;
    }
    setError('');
    setSubmitting(true);
    try {
      const res = await fetch('/api/requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          creatorId: profile.id,
          requesterName: form.name,
          requesterContact: form.contact,
          projectIdea: form.projectIdea,
          helpNeeded: form.helpNeeded,
          vision: form.vision,
          status: 'in_progress',
          submissionType: 'collaboration',
        }),
      });
      if (!res.ok) throw new Error();
      setSubmitted(true);
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return (
    <div style={{ maxWidth: 640, margin: '0 auto', paddingTop: 'clamp(3rem, 8vh, 6rem)' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ width: 20, height: 20, border: '2px solid var(--border)', borderTopColor: 'var(--accent)', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 1rem' }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        <p style={{ color: 'var(--fg-muted)', fontSize: '0.875rem' }}>Loading…</p>
      </div>
    </div>
  );

  if (notFound || !profile) return (
    <div style={{ maxWidth: 480, margin: '0 auto', paddingTop: 'clamp(4rem, 10vh, 8rem)', textAlign: 'center' }}>
      <div className="card" style={{ padding: '3rem 2rem' }}>
        <span style={{ fontSize: '2.5rem', opacity: 0.3, display: 'block', marginBottom: '1rem' }}>◎</span>
        <h2 style={{ marginBottom: '0.5rem' }}>Profile not found</h2>
        <p style={{ color: 'var(--fg-muted)', fontSize: '0.875rem' }}>This link doesn't exist yet.</p>
        <a href="/" style={{ display: 'inline-block', marginTop: '1.5rem', color: 'var(--accent)', textDecoration: 'none', fontSize: '0.875rem' }}>← Go home</a>
      </div>
    </div>
  );

  const socials = [
    profile.socials?.x && { label: 'X', href: profile.socials.x },
    profile.socials?.instagram && { label: 'Instagram', href: profile.socials.instagram },
    profile.socials?.linkedin && { label: 'LinkedIn', href: profile.socials.linkedin },
  ].filter(Boolean) as { label: string; href: string }[];

  return (
    <div style={{ maxWidth: 680, margin: '0 auto' }}>
      {/* Ambient glow */}
      <div style={{
        position: 'fixed', top: 0, left: '50%', transform: 'translateX(-50%)',
        width: '55vw', height: '35vh',
        background: 'radial-gradient(ellipse 70% 50% at 50% -10%, rgba(255,255,255,0.04) 0%, transparent 70%)',
        pointerEvents: 'none', zIndex: 0,
      }} />

      {/* ── Profile card ─────────────────────────────────────── */}
      <div className="card card-glow animate-fade-up" style={{ position: 'relative', zIndex: 1, textAlign: 'center', padding: 'clamp(2.5rem, 5vw, 4rem) clamp(1.5rem, 5vw, 3.5rem)', marginBottom: '1.5rem' }}>
        <div style={{
          width: 88, height: 88, borderRadius: '50%',
          background: 'linear-gradient(135deg, #ffffff 0%, rgba(255,255,255,0.12) 100%)',
          border: '1px solid rgba(255,255,255,0.2)',
          boxShadow: '0 0 40px rgba(255,255,255,0.1)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '2.25rem', fontWeight: 700, color: '#fff',
          margin: '0 auto 1.5rem', letterSpacing: '-0.02em',
        }}>
          {profile.name?.[0]?.toUpperCase()}
        </div>

        <h1 style={{ fontSize: 'clamp(1.6rem, 3vw, 2.1rem)', letterSpacing: '-0.02em', marginBottom: '0.4rem' }}>
          {profile.name}
        </h1>
        {profile.bio && (
          <p style={{ color: 'var(--fg-secondary)', fontSize: '1rem', maxWidth: 440, margin: '0 auto 1.5rem', lineHeight: 1.65 }}>
            {profile.bio}
          </p>
        )}

        {socials.length > 0 && (
          <div style={{ display: 'flex', gap: '0.6rem', justifyContent: 'center', flexWrap: 'wrap', marginBottom: '1.25rem' }}>
            {socials.map(s => (
              <a key={s.label} href={s.href} target="_blank" rel="noopener noreferrer"
                style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', padding: '0.4rem 0.9rem', borderRadius: 'var(--radius-badge)', border: '1px solid var(--border)', background: 'var(--surface-1)', color: 'var(--fg-secondary)', fontSize: '0.8rem', textDecoration: 'none', transition: 'all var(--t-fast)' }}>
                {s.label}
              </a>
            ))}
          </div>
        )}

        {profile.schedulingUrl && (
          <a href={profile.schedulingUrl} target="_blank" rel="noopener noreferrer"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.2)', color: 'var(--accent)', borderRadius: 'var(--radius-badge)', padding: '0.5rem 1.1rem', fontSize: '0.85rem', fontWeight: 600, textDecoration: 'none', marginTop: '0.5rem' }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
            {profile.schedulingLabel || 'Book a time'}
          </a>
        )}
      </div>

      {/* ── Submit request ──────────────────────────────────── */}
      <div id="submit" className="card animate-fade-up stagger-2" style={{ position: 'relative', zIndex: 1 }}>
        {submitted ? (
          <div style={{ textAlign: 'center', padding: '2.5rem 1rem' }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>✓</div>
            <h2 style={{ marginBottom: '0.5rem' }}>Request sent</h2>
            <p style={{ color: 'var(--fg-secondary)', fontSize: '0.9rem' }}>Your request has been sent to {profile.name}. They'll be in touch soon.</p>
          </div>
        ) : (
          <>
            <h2 style={{ marginBottom: '1.5rem', fontSize: '1.1rem' }}>Send a request</h2>

            {error && <div className="alert alert-error">{error}</div>}

            <form onSubmit={handleSubmit}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.875rem' }}>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Your name <span>*</span></label>
                  <input className="form-input" placeholder="Jane Smith" value={form.name} onChange={set('name')} />
                </div>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Contact <span>*</span></label>
                  <input className="form-input" placeholder="jane@… or @handle" value={form.contact} onChange={set('contact')} />
                </div>
              </div>

              <div className="form-group" style={{ marginTop: '1rem' }}>
                <label className="form-label">What are you working on? <span>*</span></label>
                <textarea className="form-textarea" placeholder="Describe your project or idea…"
                  value={form.projectIdea} onChange={set('projectIdea')} rows={3} style={{ minHeight: 90 }} />
              </div>

              <div className="form-group" style={{ marginTop: '1rem' }}>
                <label className="form-label">What do you need? <span>*</span></label>
                <textarea className="form-textarea" placeholder="Feedback, a partner, resources, visibility…"
                  value={form.helpNeeded} onChange={set('helpNeeded')} rows={3} style={{ minHeight: 90 }} />
              </div>

              <div className="form-group" style={{ marginTop: '1rem' }}>
                <label className="form-label">Where do you see this going? <span style={{ color: 'var(--fg-muted)', fontWeight: 400 }}>(optional)</span></label>
                <textarea className="form-textarea" placeholder="Your vision…"
                  value={form.vision} onChange={set('vision')} rows={2} />
              </div>

              <button type="submit" className="btn" disabled={submitting} style={{ width: '100%', marginTop: '1.5rem', justifyContent: 'center', padding: '0.85rem' }}>
                {submitting ? 'Sending…' : `Send to ${profile.name}`}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
