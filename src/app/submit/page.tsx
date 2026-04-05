'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function SubmitPage() {
  const [step, setStep] = useState<'choose' | 'create' | 'success'>('choose');
  const [existingUser, setExistingUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const [form, setForm] = useState({
    email: '',
    password: '',
    name: '',
    slug: '',
    bio: '',
    x: '',
    instagram: '',
    linkedin: '',
    schedulingUrl: '',
    schedulingLabel: 'Book a time',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [loginError, setLoginError] = useState('');
  const [loggingIn, setLoggingIn] = useState(false);

  useEffect(() => {
    fetch('/api/auth/me').then(r => r.json()).then(d => {
      if (d.user) {
        setExistingUser(d.user);
        setStep('success');
      }
      setLoading(false);
    });
  }, []);

  const set = (key: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm(p => ({ ...p, [key]: e.target.value }));
    if (errors[key]) setErrors(p => ({ ...p, [key]: '' }));
  };

  // ── Step: choose ────────────────────────────────────────────────────────
  if (step === 'choose' && !loading) {
    return (
      <div style={{ maxWidth: 540, margin: '0 auto', paddingTop: 'clamp(5rem, 14vh, 9rem)' }}>
        <div className="animate-fade-up" style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <h1 style={{ marginBottom: '1rem' }}>Get your link</h1>
          <p style={{ color: 'var(--fg-secondary)', maxWidth: 380, margin: '0 auto', lineHeight: 1.7 }}>
            Create a free profile and get a shareable link. Start receiving thoughtful collaboration requests.
          </p>
        </div>

        <div className="animate-fade-up stagger-1" style={{ display: 'grid', gap: '0.75rem' }}>
          <button className="card" style={{ width: '100%', textAlign: 'left', cursor: 'pointer', border: '1px solid var(--border)', padding: '1.5rem', background: 'var(--card)', display: 'flex', alignItems: 'center', gap: '1rem' }}
            onClick={() => setStep('create')}>
            <div style={{ width: 44, height: 44, borderRadius: '50%', border: '1px solid var(--border-hover)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem', fontWeight: 600, flexShrink: 0 }}>
              →
            </div>
            <div>
              <p style={{ fontWeight: 600, fontSize: '0.95rem', marginBottom: '0.15rem' }}>Create a new profile</p>
              <p style={{ fontSize: '0.78rem', color: 'var(--fg-muted)', margin: 0 }}>Set up your name, bio, and social links</p>
            </div>
          </button>

          <div style={{ textAlign: 'center', padding: '1.5rem 0 0.5rem' }}>
            <p style={{ fontSize: '0.8rem', color: 'var(--fg-muted)', marginBottom: '0.75rem' }}>Already have an account?</p>
            <form onSubmit={async (e) => {
              e.preventDefault();
              setLoginError('');
              setLoggingIn(true);
              try {
                const res = await fetch('/api/auth/login', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ email: form.email, password: form.password }),
                });
                const data = await res.json();
                if (!res.ok) { setLoginError(data.error || 'Login failed.'); return; }
                window.location.href = '/dashboard';
              } finally {
                setLoggingIn(false);
              }
            }}>
              <div style={{ display: 'grid', gap: '0.75rem' }}>
                <input className="form-input" type="email" placeholder="Email" value={form.email} onChange={set('email')} style={{ textAlign: 'center' }} />
                <input className="form-input" type="password" placeholder="Password" value={form.password} onChange={set('password')} style={{ textAlign: 'center' }} />
                {loginError && <p style={{ color: 'var(--fg-secondary)', fontSize: '0.82rem', textAlign: 'center' }}>{loginError}</p>}
                <button type="submit" className="btn btn-outline" disabled={loggingIn} style={{ width: '100%' }}>
                  {loggingIn ? 'Signing in…' : 'Sign in to my account'}
                </button>
              </div>
            </form>
          </div>
        </div>

        <div style={{ textAlign: 'center', marginTop: '2rem' }}>
          <p style={{ fontSize: '0.8rem', color: 'var(--fg-muted)' }}>
            Want to send a request?{' '}
            <a href="/requests" style={{ color: 'var(--fg-secondary)', textDecoration: 'none' }}>Browse people</a>
            {' '}first — no account needed.
          </p>
        </div>
      </div>
    );
  }

  // ── Step: success ───────────────────────────────────────────────────────
  if (step === 'success') {
    return (
      <div style={{ maxWidth: 560, margin: '0 auto', paddingTop: 'clamp(5rem, 14vh, 9rem)' }}>
        <div className="card card-glow animate-fade-up" style={{ textAlign: 'center', padding: 'clamp(3rem, 6vw, 5rem) clamp(1.5rem, 5vw, 3rem)' }}>
          <div style={{
            width: 64, height: 64, borderRadius: '50%',
            border: '1px solid var(--border-hover)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '1.8rem', margin: '0 auto 1.75rem',
          }}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>

          {existingUser ? (
            <>
              <h1 style={{ fontSize: 'clamp(1.5rem, 3vw, 2rem)', marginBottom: '0.75rem' }}>You're all set</h1>
              <p style={{ color: 'var(--fg-secondary)', maxWidth: 360, margin: '0 auto 2rem', lineHeight: 1.65 }}>
                Here's your public link. Share it anywhere — people can use it to learn about you and send requests.
              </p>
              <div style={{
                background: 'var(--surface-1)', border: '1px solid var(--border)',
                borderRadius: 'var(--radius-input)', padding: '1rem 1.5rem',
                fontSize: '0.9rem', color: 'var(--fg-secondary)',
                marginBottom: '2rem', wordBreak: 'break-all',
              }}>
                co11abor8.com/p/{existingUser.slug}
              </div>
              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                <a href={`/p/${existingUser.slug}`} className="btn btn-outline" target="_blank" rel="noopener noreferrer" style={{ padding: '0.7rem 1.5rem' }}>
                  Preview my link
                </a>
                <a href="/dashboard" className="btn" style={{ padding: '0.7rem 1.5rem' }}>
                  Go to dashboard
                </a>
              </div>
            </>
          ) : (
            <>
              <h1 style={{ fontSize: 'clamp(1.5rem, 3vw, 2rem)', marginBottom: '0.75rem' }}>Profile created</h1>
              <p style={{ color: 'var(--fg-secondary)', maxWidth: 360, margin: '0 auto 2rem', lineHeight: 1.65 }}>
                Your profile is ready. You can now update your info and manage requests from your dashboard.
              </p>
              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                <a href="/dashboard" className="btn" style={{ padding: '0.75rem 2rem' }}>Go to dashboard</a>
              </div>
            </>
          )}
        </div>
      </div>
    );
  }

  // ── Step: create ───────────────────────────────────────────────────────
  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.name.trim()) e.name = 'Your name is required.';
    if (!form.slug.trim()) e.slug = 'A link slug is required.';
    else if (!/^[a-z0-9-]+$/.test(form.slug)) e.slug = 'Only lowercase letters, numbers, and hyphens.';
    if (!form.email.trim()) e.email = 'Email is required.';
    if (!form.password || form.password.length < 8) e.password = 'Password must be at least 8 characters.';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    setSubmitError('');
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: form.email,
          password: form.password,
          name: form.name,
          slug: form.slug,
          bio: form.bio,
          socials: { x: form.x, instagram: form.instagram, linkedin: form.linkedin },
          schedulingUrl: form.schedulingUrl,
          schedulingLabel: form.schedulingLabel,
        }),
      });
      const data = await res.json();
      if (!res.ok) { setSubmitError(data.error || 'Registration failed.'); return; }
      // Auto-login and store in localStorage
      const loginRes = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: form.email, password: form.password }),
      });
      const loginData = await loginRes.json();
      if (loginRes.ok && loginData.user) {
        localStorage.setItem('co11ab_user', JSON.stringify(loginData.user));
        window.location.href = '/dashboard';
        return;
      }
      // Fallback: show success even if login redirect fails
      setExistingUser(data.user || { slug: form.slug });
      setStep('success');
    } catch {
      setSubmitError('Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const FieldError = ({ name }: { name: string }) =>
    errors[name] ? <p style={{ color: 'var(--fg-muted)', fontSize: '0.75rem', marginTop: '0.35rem' }}>{errors[name]}</p> : null;

  return (
    <div style={{ maxWidth: 600, margin: '0 auto', paddingTop: 'clamp(3.5rem, 8vh, 6rem)', paddingBottom: 'clamp(4rem, 8vh, 7rem)' }}>

      {/* Header */}
      <div className="animate-fade-up" style={{ marginBottom: '2.5rem' }}>
        <button onClick={() => setStep('choose')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--fg-muted)', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '1.5rem', padding: 0, fontFamily: 'inherit' }}>
          ← Back
        </button>
        <h1 style={{ fontSize: 'clamp(1.6rem, 3.5vw, 2.25rem)', marginBottom: '0.5rem' }}>Create your link</h1>
        <p style={{ color: 'var(--fg-secondary)', fontSize: '0.95rem' }}>
          Set up your public profile in under 2 minutes.
        </p>
      </div>

      <form onSubmit={handleCreate} noValidate>

        {/* Account */}
        <div className="animate-fade-up stagger-1 card" style={{ marginBottom: '1rem', border: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
            <div style={{ width: 28, height: 28, borderRadius: '50%', border: '1px solid var(--border-hover)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', fontWeight: 700, flexShrink: 0 }}>1</div>
            <h2 style={{ fontSize: '0.9rem', fontWeight: 600, margin: 0 }}>Account</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Your name <span style={{ color: 'var(--fg-muted)' }}>*</span></label>
              <input className="form-input" placeholder="Jane Smith" value={form.name} onChange={set('name')} style={errors.name ? { borderColor: 'rgba(255,255,255,0.2)' } : {}} />
              <FieldError name="name" />
            </div>
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Your link <span style={{ color: 'var(--fg-muted)' }}>*</span></label>
              <div style={{ display: 'flex', alignItems: 'center', background: 'var(--surface-1)', border: '1px solid var(--border)', borderRadius: 'var(--radius-input)', overflow: 'hidden' }}>
                <span style={{ padding: '0.75rem 0.5rem 0.75rem 0.875rem', fontSize: '0.75rem', color: 'var(--fg-muted)', whiteSpace: 'nowrap', borderRight: '1px solid var(--border)' }}>co11abor8.com/p/</span>
                <input className="form-input" style={{ border: 'none', borderRadius: 0, background: 'transparent', boxShadow: 'none', paddingLeft: '0.75rem' }} placeholder="jane-smith" value={form.slug} onChange={(e) => { set('slug')(e); setErrors(p => ({ ...p, slug: '' })); }} />
              </div>
              {errors.slug ? <FieldError name="slug" /> : <p className="form-hint">Lowercase, numbers, hyphens only</p>}
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '1rem' }}>
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Email <span style={{ color: 'var(--fg-muted)' }}>*</span></label>
              <input className="form-input" type="email" placeholder="jane@domain.com" value={form.email} onChange={set('email')} style={errors.email ? { borderColor: 'rgba(255,255,255,0.2)' } : {}} />
              <FieldError name="email" />
            </div>
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Password <span style={{ color: 'var(--fg-muted)' }}>*</span></label>
              <input className="form-input" type="password" placeholder="Min. 8 characters" value={form.password} onChange={set('password')} style={errors.password ? { borderColor: 'rgba(255,255,255,0.2)' } : {}} />
              <FieldError name="password" />
            </div>
          </div>
        </div>

        {/* Profile */}
        <div className="animate-fade-up stagger-2 card" style={{ marginBottom: '1rem', border: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
            <div style={{ width: 28, height: 28, borderRadius: '50%', border: '1px solid var(--border-hover)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', fontWeight: 700, flexShrink: 0 }}>2</div>
            <h2 style={{ fontSize: '0.9rem', fontWeight: 600, margin: 0 }}>Profile</h2>
          </div>
          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label">Bio</label>
            <textarea className="form-textarea" placeholder="A short description of what you do and what you're open to…" value={form.bio} onChange={set('bio')} rows={3} style={{ minHeight: 90 }} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.875rem', marginTop: '1rem' }}>
            {[{ k: 'x', label: 'X / Twitter', p: 'https://x.com/…' }, { k: 'instagram', label: 'Instagram', p: 'https://instagram.com/…' }, { k: 'linkedin', label: 'LinkedIn', p: 'https://linkedin.com/in/…' }].map(f => (
              <div key={f.k} className="form-group" style={{ margin: 0 }}>
                <label className="form-label">{f.label}</label>
                <input className="form-input" placeholder={f.p} value={(form as any)[f.k]} onChange={set(f.k)} />
              </div>
            ))}
          </div>
        </div>

        {/* Scheduling */}
        <div className="animate-fade-up stagger-3 card" style={{ marginBottom: '1rem', border: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
            <div style={{ width: 28, height: 28, borderRadius: '50%', border: '1px solid var(--border-hover)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', fontWeight: 700, flexShrink: 0 }}>3</div>
            <h2 style={{ fontSize: '0.9rem', fontWeight: 600, margin: 0 }}>Scheduling <span style={{ color: 'var(--fg-muted)', fontWeight: 400 }}>(optional)</span></h2>
          </div>
          <p style={{ fontSize: '0.78rem', color: 'var(--fg-muted)', marginBottom: '1rem', lineHeight: 1.6 }}>
            Add a Calendly or Google Calendar link. A "Book a time" button will appear on your public profile.
          </p>
          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label">Scheduling link</label>
            <input className="form-input" placeholder="https://calendly.com/… or https://calendar.app.google.com/…" value={form.schedulingUrl} onChange={set('schedulingUrl')} />
          </div>
          <div className="form-group" style={{ marginTop: '0.875rem', marginBottom: 0 }}>
            <label className="form-label">Button label</label>
            <input className="form-input" placeholder="Book a time" value={form.schedulingLabel} onChange={set('schedulingLabel')} />
          </div>
        </div>

        {/* Submit */}
        <div className="animate-fade-up stagger-4">
          {submitError && <div className="alert alert-error" style={{ marginBottom: '1rem' }}>{submitError}</div>}
          <button type="submit" className="btn" disabled={submitting} style={{ width: '100%', padding: '0.9rem', fontSize: '0.9rem', justifyContent: 'center' }}>
            {submitting ? 'Creating profile…' : 'Create my link →'}
          </button>
          <p style={{ textAlign: 'center', fontSize: '0.75rem', color: 'var(--fg-muted)', marginTop: '1rem', lineHeight: 1.6 }}>
            Free forever. No spam. No payment required.
          </p>
        </div>
      </form>
    </div>
  );
}
