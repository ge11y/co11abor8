'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({ name: '', email: '', slug: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(p => ({ ...p, [k]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.slug || !form.password) {
      setError('Please fill in all fields.');
      return;
    }
    if (form.password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || 'Registration failed.'); return; }
      localStorage.setItem('co11ab_user', JSON.stringify(data.user));
      router.push('/dashboard');
      router.refresh();
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const slugHint = form.name
    ? form.name.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '')
    : '';

  return (
    <div style={{ maxWidth: 440, margin: '0 auto', paddingTop: 'clamp(3rem, 8vh, 6rem)' }}>
      <div className="card card-glow animate-fade-up" style={{ padding: 'clamp(2rem, 5vw, 3rem)' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h1 style={{ fontSize: '1.5rem', marginBottom: '0.4rem' }}>Create your link</h1>
          <p style={{ color: 'var(--fg-muted)', fontSize: '0.875rem', margin: 0 }}>Your collaborators will use this to find you</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label">Your name</label>
            <input className="form-input" placeholder="Jane Smith" value={form.name} onChange={set('name')} autoFocus />
          </div>
          <div className="form-group" style={{ margin: '0.875rem 0 0' }}>
            <label className="form-label">Email</label>
            <input type="email" className="form-input" placeholder="jane@example.com" value={form.email} onChange={set('email')} />
          </div>
          <div className="form-group" style={{ margin: '0.875rem 0 0' }}>
            <label className="form-label">Your link</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0', background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 'var(--radius-input)', overflow: 'hidden' }}>
              <span style={{ padding: '0.75rem 0.75rem 0.75rem 1rem', fontSize: '0.85rem', color: 'var(--fg-muted)', whiteSpace: 'nowrap', borderRight: '1px solid var(--border)' }}>co11abor8.com/p/</span>
              <input
                className="form-input"
                style={{ border: 'none', borderRadius: 0, background: 'transparent', boxShadow: 'none', paddingLeft: '0.75rem' }}
                placeholder="jane-smith"
                value={form.slug}
                onChange={e => setForm(p => ({ ...p, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-') }))}
              />
            </div>
            {slugHint && !form.slug && (
              <p style={{ fontSize: '0.75rem', color: 'var(--fg-muted)', marginTop: '0.4rem' }}>Suggested: {slugHint}</p>
            )}
          </div>
          <div className="form-group" style={{ margin: '0.875rem 0 0' }}>
            <label className="form-label">Password</label>
            <input type="password" className="form-input" placeholder="At least 6 characters" value={form.password} onChange={set('password')} />
          </div>

          {error && <p style={{ color: 'var(--status-declined)', fontSize: '0.82rem', marginTop: '0.75rem', textAlign: 'center' }}>{error}</p>}

          <button type="submit" className="btn" style={{ width: '100%', marginTop: '1.5rem', justifyContent: 'center', padding: '0.8rem' }} disabled={loading}>
            {loading ? 'Creating account…' : 'Create my link'}
          </button>
        </form>
      </div>

      <p style={{ textAlign: 'center', fontSize: '0.85rem', color: 'var(--fg-muted)', marginTop: '1.5rem' }}>
        Already have an account?{' '}
        <a href="/login" style={{ color: 'var(--accent)', textDecoration: 'none' }}>Sign in</a>
      </p>
    </div>
  );
}
