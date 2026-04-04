'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

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
      router.refresh();
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 400, margin: '0 auto', paddingTop: 'clamp(4rem, 10vh, 7rem)' }}>
      <div className="card card-glow animate-fade-up" style={{ padding: 'clamp(2rem, 5vw, 3rem)' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h1 style={{ fontSize: '1.5rem', marginBottom: '0.4rem' }}>Welcome back</h1>
          <p style={{ color: 'var(--fg-muted)', fontSize: '0.875rem', margin: 0 }}>Sign in to your account</p>
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

          {error && <p style={{ color: 'var(--status-declined)', fontSize: '0.82rem', marginTop: '0.75rem', textAlign: 'center' }}>{error}</p>}

          <button type="submit" className="btn" style={{ width: '100%', marginTop: '1.5rem', justifyContent: 'center', padding: '0.8rem' }} disabled={loading}>
            {loading ? 'Signing in…' : 'Sign in'}
          </button>
        </form>
      </div>

      <p style={{ textAlign: 'center', fontSize: '0.85rem', color: 'var(--fg-muted)', marginTop: '1.5rem' }}>
        Don't have an account?{' '}
        <a href="/register" style={{ color: 'var(--accent)', textDecoration: 'none' }}>Create one</a>
      </p>
    </div>
  );
}
