'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface PublicProfile {
  id: string;
  slug: string;
  name: string;
  bio: string;
  socials: { x?: string; instagram?: string; linkedin?: string };
  schedulingUrl: string;
  schedulingLabel: string;
}

export default function HomePage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [search, setSearch] = useState('');
  const [profiles, setProfiles] = useState<PublicProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchFocused, setSearchFocused] = useState(false);

  useEffect(() => {
    fetch('/api/auth/me').then(r => r.json()).then(data => {
      setUser(data.user);
      setLoading(false);
    });
    fetch('/api/profile').then(r => r.json()).then(data => {
      setProfiles(Array.isArray(data) ? data : []);
    });
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!search.trim()) return;
    const found = profiles.find(p =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.slug.toLowerCase().includes(search.toLowerCase())
    );
    if (found) {
      router.push(`/p/${found.slug}`);
    } else {
      alert('No profile found for that name. Check the link or ask them to create one.');
    }
  };

  const suggested = profiles.slice(0, 4);

  return (
    <div style={{ maxWidth: 680, margin: '0 auto', textAlign: 'center' }}>

      {/* ── Hero ──────────────────────────────────────────────── */}
      <div style={{ paddingTop: 'clamp(4rem, 12vh, 8rem)', paddingBottom: '3rem' }} className="animate-fade-up">
        <h1 style={{ fontSize: 'clamp(2.25rem, 5vw, 3.5rem)', letterSpacing: '-0.03em', marginBottom: '1.25rem', lineHeight: 1.1 }}>
          Collaborate with<br />
          <span style={{ color: 'var(--accent)' }}>people worth knowing</span>
        </h1>
        <p style={{ color: 'var(--fg-secondary)', fontSize: 'clamp(1rem, 2vw, 1.15rem)', maxWidth: 480, margin: '0 auto 2.5rem', lineHeight: 1.65 }}>
          Find someone, send a request, and start working together. No noise, no friction.
        </p>
      </div>

      {/* ── Search ────────────────────────────────────────────── */}
      <form onSubmit={handleSearch} className="animate-fade-up stagger-1" style={{ marginBottom: '4rem', position: 'relative' }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: '0.75rem',
          background: searchFocused ? 'var(--surface-2)' : 'var(--surface-1)',
          border: `1.5px solid ${searchFocused ? 'var(--accent)' : 'var(--border)'}`,
          borderRadius: 'var(--radius-badge)', padding: '0.875rem 1.25rem',
          boxShadow: searchFocused ? '0 0 0 4px var(--accent-dim)' : 'none',
          transition: 'all var(--t-mid) var(--ease-out)',
          maxWidth: 520, margin: '0 auto',
        }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--fg-muted)', flexShrink: 0 }}>
            <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
          </svg>
          <input
            type="text"
            placeholder="Search for someone by name or link…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setSearchFocused(false)}
            style={{
              flex: 1, background: 'transparent', border: 'none', outline: 'none',
              color: 'var(--fg)', fontSize: '0.95rem', fontFamily: 'inherit',
            }}
          />
          <button type="submit" style={{
            background: 'var(--accent)', color: '#fff', border: 'none',
            borderRadius: '6px', padding: '0.4rem 0.9rem', fontSize: '0.8rem',
            fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
            flexShrink: 0,
          }}>
            Find
          </button>
        </div>
        <p style={{ fontSize: '0.78rem', color: 'var(--fg-muted)', marginTop: '0.75rem' }}>
          Or share your link so others can find you
        </p>
      </form>

      {/* ── Auth CTAs ──────────────────────────────────────────── */}
      {!loading && !user && (
        <div className="animate-fade-up stagger-2" style={{ display: 'flex', gap: '0.875rem', justifyContent: 'center', flexWrap: 'wrap', marginBottom: '4rem' }}>
          <a href="/login" className="btn" style={{ padding: '0.8rem 2rem' }}>Sign in</a>
          <a href="/register" className="btn btn-outline" style={{ padding: '0.8rem 2rem' }}>Create your link</a>
        </div>
      )}
      {!loading && user && (
        <div className="animate-fade-up stagger-2" style={{ display: 'flex', gap: '0.875rem', justifyContent: 'center', flexWrap: 'wrap', marginBottom: '4rem' }}>
          <a href="/dashboard" className="btn" style={{ padding: '0.8rem 2rem' }}>My Dashboard</a>
          <a href={`/p/${user.slug}`} className="btn btn-outline" style={{ padding: '0.8rem 2rem' }}>View my link</a>
        </div>
      )}

      {/* ── Divider ─────────────────────────────────────────────── */}
      {profiles.length > 0 && (
        <>
          <div className="divider" />
          <div className="animate-fade-up stagger-3" style={{ textAlign: 'left', marginBottom: '1.5rem' }}>
            <p style={{ fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--fg-muted)', fontWeight: 600, margin: 0 }}>
              People on co11abor8
            </p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '0.875rem' }} className="animate-fade-up stagger-4">
            {suggested.map(p => (
              <a key={p.id} href={`/p/${p.slug}`} style={{ textDecoration: 'none' }}>
                <div className="card" style={{ textAlign: 'center', padding: '1.5rem 1.25rem', cursor: 'pointer' }}>
                  <div style={{
                    width: 52, height: 52, borderRadius: '50%', background: 'linear-gradient(135deg, var(--accent), rgba(139,124,246,0.4))',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '1.25rem', fontWeight: 700, color: '#fff', margin: '0 auto 0.875rem',
                  }}>
                    {p.name?.[0]?.toUpperCase()}
                  </div>
                  <p style={{ fontWeight: 600, fontSize: '0.9rem', marginBottom: '0.2rem', color: 'var(--fg)' }}>{p.name}</p>
                  <p style={{ fontSize: '0.75rem', color: 'var(--fg-muted)', margin: 0 }}>{p.bio?.slice(0, 50) || 'co11abor8 member'}</p>
                </div>
              </a>
            ))}
          </div>
        </>
      )}

      {/* ── Footer note ────────────────────────────────────────── */}
      <div style={{ marginTop: '5rem', paddingBottom: '2rem' }}>
        <p style={{ fontSize: '0.78rem', color: 'var(--fg-muted)', margin: 0 }}>
          co11abor8 — a quiet place to connect and build
        </p>
      </div>
    </div>
  );
}
