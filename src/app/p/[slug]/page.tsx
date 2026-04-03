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

  if (loading) return <div className="empty-state">Loading...</div>;
  if (notFound || !profile) return <div className="empty-state">Profile not found</div>;

  const socialIcons: Record<string, string> = {
    x: '𝕏',
    instagram: '📷',
    linkedin: '🔗',
  };

  return (
    <div style={{ maxWidth: 680, margin: '0 auto', padding: '2.5rem 1.5rem' }}>
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
        <div style={{
          width: 80, height: 80, borderRadius: '50%', background: 'var(--accent)',
          color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '2rem', fontWeight: 700, margin: '0 auto 1rem', overflow: 'hidden',
        }}>
          {profile.name?.[0]?.toUpperCase()}
        </div>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 700, marginBottom: '0.25rem' }}>{profile.name}</h1>
        {profile.tagline && <p style={{ color: 'var(--muted)', fontSize: '1rem' }}>{profile.tagline}</p>}

        {/* Socials */}
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', marginTop: '1rem' }}>
          {profile.socials?.x && (
            <a href={profile.socials.x} target="_blank" rel="noopener noreferrer"
              style={{ color: 'var(--muted)', textDecoration: 'none', fontSize: '0.9rem' }}>
              {socialIcons.x} X
            </a>
          )}
          {profile.socials?.instagram && (
            <a href={profile.socials.instagram} target="_blank" rel="noopener noreferrer"
              style={{ color: 'var(--muted)', textDecoration: 'none', fontSize: '0.9rem' }}>
              {socialIcons.instagram} IG
            </a>
          )}
          {profile.socials?.linkedin && (
            <a href={profile.socials.linkedin} target="_blank" rel="noopener noreferrer"
              style={{ color: 'var(--muted)', textDecoration: 'none', fontSize: '0.9rem' }}>
              {socialIcons.linkedin} LinkedIn
            </a>
          )}
        </div>
      </div>

      {/* Three columns */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
        <div className="card">
          <div style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--muted)', fontWeight: 600, marginBottom: '0.5rem' }}>Strengths</div>
          <p style={{ fontSize: '0.875rem', lineHeight: 1.6, whiteSpace: 'pre-wrap', margin: 0 }}>
            {profile.strengths || '—'}
          </p>
        </div>
        <div className="card">
          <div style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--muted)', fontWeight: 600, marginBottom: '0.5rem' }}>Thought Patterns</div>
          <p style={{ fontSize: '0.875rem', lineHeight: 1.6, whiteSpace: 'pre-wrap', margin: 0 }}>
            {profile.thoughtPatterns || '—'}
          </p>
        </div>
        <div className="card">
          <div style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--muted)', fontWeight: 600, marginBottom: '0.5rem' }}>Passions</div>
          <p style={{ fontSize: '0.875rem', lineHeight: 1.6, whiteSpace: 'pre-wrap', margin: 0 }}>
            {profile.passions || '—'}
          </p>
        </div>
      </div>

      <div style={{ textAlign: 'center' }}>
        <a href="/submit" className="btn">Submit a Request</a>
      </div>
    </div>
  );
}
