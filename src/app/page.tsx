'use client';
import { useEffect, useState } from 'react';

export default function HomePage() {
  const [user, setUser] = useState<any>(null);
  const [profiles, setProfiles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch('/api/auth/me').then(r => r.json()),
      fetch('/api/profile').then(r => r.json()),
    ]).then(([userData, profileData]) => {
      setUser(userData.user || null);
      setProfiles(Array.isArray(profileData) ? profileData : []);
      setLoading(false);
    });
  }, []);

  return (
    <div style={{ maxWidth: 900, margin: '0 auto' }}>

      {/* ── Hero ─────────────────────────────────────────────── */}
      <section style={{
        paddingTop: 'clamp(6rem, 18vh, 11rem)',
        paddingBottom: 'clamp(5rem, 12vh, 9rem)',
        textAlign: 'center',
      }}>
        <h1 className="animate-fade-up" style={{
          marginBottom: '1.75rem',
          fontStyle: 'italic',
          fontWeight: 400,
        }}>
          A quiet place to
          <br />
          <span style={{ fontStyle: 'normal', fontWeight: 300, letterSpacing: '-0.03em' }}>
            collaborate
          </span>
        </h1>

        <p className="animate-fade-up stagger-1" style={{
          color: 'var(--fg-secondary)',
          maxWidth: 380,
          margin: '0 auto 3rem',
          fontSize: 'clamp(0.95rem, 1.5vw, 1.05rem)',
          lineHeight: 1.75,
        }}>
          Share who you are. Find people worth working with.
          Submit a request. Get a response.
        </p>

        <div className="animate-fade-up stagger-2" style={{
          display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap'
        }}>
          <a href="/submit" className="btn" style={{ padding: '0.8rem 2.25rem', fontSize: '0.9rem' }}>
            Get my link →
          </a>
          {profiles.length > 0 && (
            <a href="#people" className="btn btn-outline" style={{ padding: '0.8rem 2.25rem', fontSize: '0.9rem' }}>
              Browse people
            </a>
          )}
        </div>
      </section>

      {/* ── Divider ─────────────────────────────────────────── */}
      <div className="animate-fade-up stagger-2" style={{
        maxWidth: 48, margin: '0 auto 5rem',
        borderTop: '1px solid var(--border)',
      }} />

      {/* ── How it works ────────────────────────────────────── */}
      <section className="animate-fade-up stagger-3" style={{ paddingBottom: 'clamp(5rem, 10vh, 8rem)' }}>
        <h2 style={{ textAlign: 'center', marginBottom: '3.5rem' }}>How it works</h2>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1px', background: 'var(--border)', borderRadius: 'var(--radius-card)', overflow: 'hidden' }}>
          {[
            {
              n: '01',
              title: 'Get your link',
              desc: 'Create a free profile and claim your co11abor8 link. Share it with anyone.',
            },
            {
              n: '02',
              title: 'Receive requests',
              desc: 'People submit requests through your link — project ideas, collaborations, status updates.',
            },
            {
              n: '03',
              title: 'Respond & connect',
              desc: 'Review and manage requests in your dashboard. Move things forward without noise.',
            },
          ].map((step) => (
            <div key={step.n} style={{
              background: 'var(--card)',
              padding: '2.5rem 2rem',
            }}>
              <div style={{
                fontSize: '0.68rem',
                fontWeight: 600,
                letterSpacing: '0.14em',
                color: 'var(--fg-muted)',
                marginBottom: '1.5rem',
                fontFamily: 'DM Sans, sans-serif',
              }}>
                {step.n}
              </div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 600, marginBottom: '0.6rem' }}>
                {step.title}
              </h3>
              <p style={{ fontSize: '0.875rem', color: 'var(--fg-secondary)', lineHeight: 1.7, margin: 0 }}>
                {step.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ── People on the platform ──────────────────────────── */}
      {profiles.length > 0 && (
        <section id="people" className="animate-fade-up" style={{ paddingBottom: 'clamp(5rem, 10vh, 8rem)' }}>
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: '2.5rem', gap: '1rem', flexWrap: 'wrap' }}>
            <h2 style={{ margin: 0 }}>People</h2>
            <a href="/requests" style={{ fontSize: '0.8rem', color: 'var(--fg-muted)', textDecoration: 'none' }}>
              View all →
            </a>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '1px', background: 'var(--border)', borderRadius: 'var(--radius-card)', overflow: 'hidden' }}>
            {profiles.slice(0, 6).map((p) => (
              <a key={p.id} href={`/p/${p.slug}`} style={{ textDecoration: 'none' }}>
                <div style={{
                  background: 'var(--card)',
                  textAlign: 'center',
                  padding: '2rem 1.25rem',
                  transition: 'background var(--t-mid) var(--ease-out)',
                }}
                onMouseEnter={e => (e.currentTarget.style.background = 'var(--card-hover)')}
                onMouseLeave={e => (e.currentTarget.style.background = 'var(--card)')}>
                  <div style={{
                    width: 52, height: 52, borderRadius: '50%',
                    border: '1px solid var(--border-hover)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '1.2rem', fontWeight: 600, color: 'var(--fg)',
                    margin: '0 auto 1rem', letterSpacing: '-0.01em',
                  }}>
                    {p.name?.[0]?.toUpperCase()}
                  </div>
                  <p style={{ fontWeight: 600, fontSize: '0.875rem', marginBottom: '0.25rem', color: 'var(--fg)' }}>
                    {p.name}
                  </p>
                  {p.bio && (
                    <p style={{ fontSize: '0.72rem', color: 'var(--fg-muted)', margin: 0, lineHeight: 1.5 }}>
                      {p.bio.slice(0, 55)}{p.bio.length > 55 ? '…' : ''}
                    </p>
                  )}
                </div>
              </a>
            ))}
          </div>
        </section>
      )}

      {/* ── CTA footer ──────────────────────────────────────── */}
      <section style={{ paddingBottom: 'clamp(4rem, 8vh, 6rem)' }}>
        <div style={{
          borderTop: '1px solid var(--border)',
          paddingTop: 'clamp(3.5rem, 7vh, 6rem)',
          textAlign: 'center',
        }}>
          <h2 style={{ marginBottom: '1rem' }}>Ready?</h2>
          <p style={{
            color: 'var(--fg-secondary)',
            fontSize: '0.95rem',
            maxWidth: 340,
            margin: '0 auto 2.5rem',
            lineHeight: 1.7,
          }}>
            {user
              ? <>Visit your <a href={`/p/${user.slug}`} style={{ color: 'var(--fg)', textDecoration: 'none', fontWeight: 600 }}>public profile</a> or <a href="/dashboard" style={{ color: 'var(--fg)', textDecoration: 'none', fontWeight: 600 }}>dashboard</a>.</>
              : <>Create your free link and start receiving thoughtful collaboration requests.</>
            }
          </p>
          {user ? (
            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap' }}>
              <a href={`/p/${user.slug}`} className="btn" style={{ padding: '0.8rem 2rem' }}>View my link</a>
              <a href="/dashboard" className="btn btn-outline" style={{ padding: '0.8rem 2rem' }}>Dashboard</a>
            </div>
          ) : (
            <a href="/submit" className="btn" style={{ padding: '0.85rem 2.5rem', fontSize: '0.9rem' }}>
              Get my link →
            </a>
          )}
        </div>
      </section>

    </div>
  );
}
