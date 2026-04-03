'use client';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';

export default function PublicProfile() {
  const { slug } = useParams<{ slug: string }>();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    fetch(`/api/profiles`)
      .then(r => r.json())
      .then(profiles => {
        const found = profiles.find((p: any) => p.slug === slug && p.public);
        if (found) setProfile(found);
        else setNotFound(true);
        setLoading(false);
      });
  }, [slug]);

  if (loading) return (
    <div className="empty-state">
      <span className="empty-state-icon">◈</span>
      Loading…
    </div>
  );
  if (notFound || !profile) return (
    <div className="empty-state">
      <span className="empty-state-icon">◎</span>
      Profile not found.
    </div>
  );

  const socials = [
    profile.socials?.x && { label: 'X', href: profile.socials.x, icon: '𝕏' },
    profile.socials?.instagram && { label: 'Instagram', href: profile.socials.instagram, icon: '◎' },
    profile.socials?.linkedin && { label: 'LinkedIn', href: profile.socials.linkedin, icon: '⬡' },
  ].filter(Boolean) as { label: string; href: string; icon: string }[];

  return (
    <div style={{ maxWidth: 900, margin: '0 auto' }}>

      {/* ── Ambient glow ─────────────────────────────────────── */}
      <div style={{
        position: 'fixed', top: 0, left: '50%', transform: 'translateX(-50%)',
        width: '60vw', height: '40vh',
        background: 'radial-gradient(ellipse, rgba(139,124,246,0.07) 0%, transparent 70%)',
        pointerEvents: 'none', zIndex: 0,
      }} />

      {/* ── Profile card ─────────────────────────────────────── */}
      <div className="card card-glow animate-fade-up" style={{ position: 'relative', zIndex: 1, textAlign: 'center', padding: 'clamp(2.5rem, 5vw, 4.5rem) clamp(1.5rem, 5vw, 4rem)', marginBottom: '1.5rem' }}>

        {/* Avatar */}
        <div style={{
          width: 96, height: 96, borderRadius: '50%',
          background: 'linear-gradient(135deg, var(--accent) 0%, rgba(139,124,246,0.4) 100%)',
          border: '2px solid rgba(139,124,246,0.3)',
          boxShadow: '0 0 40px rgba(139,124,246,0.2), 0 0 80px rgba(139,124,246,0.08)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '2.5rem', fontWeight: 700, color: '#fff',
          margin: '0 auto 1.75rem', letterSpacing: '-0.02em',
        }}>
          {profile.name?.[0]?.toUpperCase()}
        </div>

        {/* Name + tagline */}
        <h1 style={{ fontSize: 'clamp(1.6rem, 3vw, 2.25rem)', letterSpacing: '-0.02em', marginBottom: '0.5rem' }}>
          {profile.name}
        </h1>
        {profile.tagline && (
          <p style={{ color: 'var(--fg-secondary)', fontSize: '1.05rem', maxWidth: 480, margin: '0 auto 1.5rem', lineHeight: 1.6 }}>
            {profile.tagline}
          </p>
        )}

        {/* Socials */}
        {socials.length > 0 && (
          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            {socials.map(s => (
              <a
                key={s.label}
                href={s.href}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
                  padding: '0.5rem 1rem', borderRadius: 'var(--radius-badge)',
                  border: '1px solid var(--border)', background: 'var(--surface-1)',
                  color: 'var(--fg-secondary)', fontSize: '0.85rem', fontWeight: 500,
                  textDecoration: 'none', transition: 'border-color var(--t-fast), color var(--t-fast), background var(--t-fast)',
                }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLAnchorElement).style.borderColor = 'rgba(139,124,246,0.4)';
                  (e.currentTarget as HTMLAnchorElement).style.color = 'var(--fg)';
                  (e.currentTarget as HTMLAnchorElement).style.background = 'var(--accent-dim)';
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLAnchorElement).style.borderColor = 'var(--border)';
                  (e.currentTarget as HTMLAnchorElement).style.color = 'var(--fg-secondary)';
                  (e.currentTarget as HTMLAnchorElement).style.background = 'var(--surface-1)';
                }}
              >
                <span style={{ fontSize: '0.9rem' }}>{s.icon}</span>
                {s.label}
              </a>
            ))}
          </div>
        )}
      </div>

      {/* ── Three trait cards ────────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
        {[
          { label: 'Strengths',   value: profile.strengths },
          { label: 'Thought Patterns', value: profile.thoughtPatterns },
          { label: 'Passions',   value: profile.passions },
        ].map((trait, i) => (
          <div
            key={trait.label}
            className="card animate-fade-up"
            style={{
              animationDelay: `${(i + 1) * 80}ms`,
              border: '1px solid var(--border)',
            }}
          >
            <div style={{
              fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.12em',
              textTransform: 'uppercase', color: 'var(--accent)', marginBottom: '0.875rem',
            }}>
              {trait.label}
            </div>
            <p style={{
              fontSize: '0.925rem', lineHeight: 1.7, color: 'var(--fg-secondary)',
              whiteSpace: 'pre-wrap', margin: 0,
            }}>
              {trait.value || '—'}
            </p>
          </div>
        ))}
      </div>

      {/* ── CTA ─────────────────────────────────────────────── */}
      <div style={{ textAlign: 'center' }}>
        <a href="/submit" className="btn" style={{ padding: '0.8rem 2.5rem' }}>
          Submit a Request
        </a>
      </div>
    </div>
  );
}
