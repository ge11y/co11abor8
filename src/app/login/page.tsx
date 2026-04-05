'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Redirect if already logged in
  useEffect(() => {
    fetch('/api/auth/me').then(r => r.json()).then(d => {
      if (d.user) router.push('/dashboard');
    });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) { setError('Please enter your email and password.'); return; }
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || 'Login failed.'); return; }
      localStorage.setItem('co11ab_user', JSON.stringify(data.user));
      router.push('/dashboard');
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 400, margin: '0 auto', paddingTop: 'clamp(4rem, 10vh, 7rem)' }}>
      <div className="card animate-fade-up" style={{ padding: 'clamp(2rem, 5vw, 3rem)', border: '1px solid var(--border)' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h1 style={{ fontSize: '1.5rem', marginBottom: '0.4rem' }}>Sign in</h1>
          <p style={{ color: 'var(--fg-secondary)', fontSize: '0.875rem', margin: 0 }}>Access your dashboard and requests</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label">Email</label>
            <input
              type="email"
              className="form-input"
              placeholder="you@example.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              autoFocus
            />
          </div>
          <div className="form-group" style={{ margin: '1rem 0 0' }}>
            <label className="form-label">Password</label>
            <input
              type="password"
              className="form-input"
              placeholder="••••••••"
              value={password}
              onChange={e => setPassword(e.target.value)}
            />
          </div>

          {error && (
            <p style={{ color: 'var(--fg-secondary)', fontSize: '0.82rem', marginTop: '0.75rem', textAlign: 'center' }}>{error}</p>
          )}

          <button type="submit" className="btn" disabled={loading} style={{ width: '100%', marginTop: '1.5rem', justifyContent: 'center', padding: '0.85rem' }}>
            {loading ? 'Signing in…' : 'Sign in'}
          </button>
        </form>
      </div>

      <p style={{ textAlign: 'center', fontSize: '0.85rem', color: 'var(--fg-muted)', marginTop: '1.5rem' }}>
        Don't have an account?{' '}
        <a href="/submit" style={{ color: 'var(--fg-secondary)', textDecoration: 'none', fontWeight: 500 }}>Get my link</a>
      </p>
    </div>
  );
}
