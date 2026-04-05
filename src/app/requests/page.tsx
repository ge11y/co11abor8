'use client';
import { useEffect, useState } from 'react';

export default function RequestsPage() {
  const [profiles, setProfiles] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/profile').then(r => r.json()).then(d => {
      if (Array.isArray(d)) setProfiles(d);
      setLoading(false);
    });
  }, []);

  const filtered = profiles.filter(p => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return p.name?.toLowerCase().includes(q) || p.bio?.toLowerCase().includes(q) || p.slug?.toLowerCase().includes(q);
  });

  return (
    <div style={{ maxWidth: 900, margin: '0 auto' }}>

      {/* Header */}
      <div style={{ paddingTop: 'clamp(4rem, 10vh, 7rem)', marginBottom: '2.5rem' }} className="animate-fade-up">
        <h1 style={{ marginBottom: '0.5rem' }}>People</h1>
        <p style={{ color: 'var(--fg-secondary)', fontSize: '0.95rem', maxWidth: 420 }}>
          Browse people on co11abor8 and send them a request. No account needed to submit.
        </p>
      </div>

      {/* Search */}
      <div className="animate-fade-up stagger-1" style={{ marginBottom: '2.5rem' }}>
        <input
          className="form-input"
          type="search"
          placeholder="Search by name or keyword…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ maxWidth: 380 }}
        />
      </div>

      {/* Grid */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '4rem 0', color: 'var(--fg-muted)', fontSize: '0.875rem' }}>
          Loading…
        </div>
      ) : filtered.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '4rem 2rem' }}>
          <span style={{ fontSize: '2.5rem', opacity: 0.2, display: 'block', marginBottom: '1rem' }}>◎</span>
          <p style={{ color: 'var(--fg-secondary)', marginBottom: '0.5rem' }}>
            {search ? 'No results found.' : 'No one here yet.'}
          </p>
          {search && (
            <button className="btn btn-outline btn-sm" onClick={() => setSearch('')} style={{ marginTop: '0.5rem' }}>
              Clear search
            </button>
          )}
          {!search && (
            <p style={{ color: 'var(--fg-muted)', fontSize: '0.8rem' }}>
              <a href="/submit" style={{ color: 'var(--fg-secondary)', textDecoration: 'none' }}>Create a profile</a> to get started.
            </p>
          )}
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '1px', background: 'var(--border)', borderRadius: 'var(--radius-card)', overflow: 'hidden' }}>
          {filtered.map(p => (
            <a key={p.id} href={`/p/${p.slug}`} style={{ textDecoration: 'none' }}>
              <div style={{
                background: 'var(--card)',
                padding: '2rem 1.5rem',
                transition: 'background var(--t-mid) var(--ease-out)',
              }}
              onMouseEnter={e => (e.currentTarget.style.background = 'var(--card-hover)')}
              onMouseLeave={e => (e.currentTarget.style.background = 'var(--card)')}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem', marginBottom: p.bio ? '1rem' : '0' }}>
                  <div style={{
                    width: 48, height: 48, borderRadius: '50%',
                    border: '1px solid var(--border-hover)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '1.1rem', fontWeight: 600, color: 'var(--fg)',
                    flexShrink: 0, letterSpacing: '-0.01em',
                  }}>
                    {p.name?.[0]?.toUpperCase()}
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <p style={{ fontWeight: 600, fontSize: '0.95rem', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {p.name}
                    </p>
                    <p style={{ fontSize: '0.72rem', color: 'var(--fg-muted)', margin: 0 }}>
                      co11abor8.com/p/{p.slug}
                    </p>
                  </div>
                </div>
                {p.bio && (
                  <p style={{ fontSize: '0.82rem', color: 'var(--fg-secondary)', lineHeight: 1.6, margin: 0, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {p.bio}
                  </p>
                )}
                {p.socials?.x || p.socials?.instagram || p.socials?.linkedin ? (
                  <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.875rem', flexWrap: 'wrap' }}>
                    {p.socials?.x && <span style={{ fontSize: '0.68rem', color: 'var(--fg-muted)', background: 'var(--surface-1)', border: '1px solid var(--border)', borderRadius: 'var(--radius-badge)', padding: '0.15rem 0.5rem' }}>X</span>}
                    {p.socials?.instagram && <span style={{ fontSize: '0.68rem', color: 'var(--fg-muted)', background: 'var(--surface-1)', border: '1px solid var(--border)', borderRadius: 'var(--radius-badge)', padding: '0.15rem 0.5rem' }}>IG</span>}
                    {p.socials?.linkedin && <span style={{ fontSize: '0.68rem', color: 'var(--fg-muted)', background: 'var(--surface-1)', border: '1px solid var(--border)', borderRadius: 'var(--radius-badge)', padding: '0.15rem 0.5rem' }}>LI</span>}
                  </div>
                ) : null}
              </div>
            </a>
          ))}
        </div>
      )}

      {/* CTA */}
      {!loading && filtered.length > 0 && (
        <div style={{ textAlign: 'center', marginTop: '3rem', paddingBottom: '2rem' }}>
          <p style={{ fontSize: '0.8rem', color: 'var(--fg-muted)', marginBottom: '0.75rem' }}>
            Have something in mind?
          </p>
          <a href="/submit" className="btn btn-outline btn-sm">Get my own link</a>
        </div>
      )}

    </div>
  );
}
