'use client';
import { useEffect, useState } from 'react';
import { Request } from '@/lib/types';

const STATUS_LABELS: Record<string, string> = {
  open: 'Open', in_review: 'In Review', approved: 'Approved',
  complete: 'Complete', declined: 'Declined',
};

export default function HomePage() {
  const [requests, setRequests] = useState<Request[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/requests').then(r => r.json()).then(data => {
      setRequests(data);
      setLoading(false);
    });
  }, []);

  const open = requests.filter(r => r.adminStatus === 'open').length;
  const inReview = requests.filter(r => r.adminStatus === 'in_review').length;
  const recent = requests.slice(0, 5);

  return (
    <div>

      {/* ── Hero ────────────────────────────────────────────── */}
      <div className="card card-glow animate-fade-up" style={{ textAlign: 'center', padding: 'clamp(3rem, 6vw, 5rem) clamp(1.5rem, 5vw, 4rem)', marginBottom: 'clamp(2.5rem, 5vw, 4rem)' }}>
        <p style={{ fontSize: '0.8rem', fontWeight: 600, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--accent)', marginBottom: '1rem' }}>
          Collaboration starts here
        </p>
        <h1 style={{ fontSize: 'clamp(2rem, 4vw, 3.25rem)', letterSpacing: '-0.03em', marginBottom: '1rem' }}>
          A calm space to<br className="hide-mobile" />
          <span style={{ color: 'var(--accent)' }}> share what you're building</span>
        </h1>
        <p className="subtitle" style={{ maxWidth: 540, margin: '0 auto 2rem', fontSize: 'clamp(0.95rem, 1.5vw, 1.1rem)' }}>
          Submit a request, share your profile, and connect with people who can help move your work forward.
        </p>
        <div style={{ display: 'flex', gap: '0.875rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <a href="/submit" className="btn" style={{ fontSize: '0.95rem', padding: '0.8rem 2rem' }}>
            Submit a Request
          </a>
          <a href="/requests" className="btn btn-outline" style={{ fontSize: '0.95rem', padding: '0.8rem 2rem' }}>
            Browse Requests
          </a>
        </div>
      </div>

      {/* ── Stats ───────────────────────────────────────────── */}
      {!loading && requests.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '1rem', marginBottom: 'clamp(2.5rem, 5vw, 4rem)' }} className="animate-fade-up stagger-1">
          <div className="stat-card" style={{ textAlign: 'center' }}>
            <div className="stat-number">{requests.length}</div>
            <div className="stat-label">Total Requests</div>
          </div>
          <div className="stat-card" style={{ textAlign: 'center' }}>
            <div className="stat-number" style={{ color: 'var(--status-open)' }}>{open}</div>
            <div className="stat-label">Open</div>
          </div>
          <div className="stat-card" style={{ textAlign: 'center' }}>
            <div className="stat-number" style={{ color: 'var(--status-review)' }}>{inReview}</div>
            <div className="stat-label">In Review</div>
          </div>
        </div>
      )}

      {/* ── Recent requests ──────────────────────────────────── */}
      <div className="animate-fade-up stagger-2">
        <div className="section-header">
          <div>
            <h2>Recent Requests</h2>
            <p className="subtitle" style={{ margin: 0, fontSize: '0.875rem' }}>See what's being worked on</p>
          </div>
          {requests.length > 5 && (
            <a href="/requests" className="btn btn-outline btn-sm hide-mobile">View all</a>
          )}
        </div>

        {loading ? (
          <div className="empty-state">
            <span className="empty-state-icon">◈</span>
            Loading requests…
          </div>
        ) : recent.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: '3.5rem 2rem' }}>
            <span className="empty-state-icon">◈</span>
            <p style={{ color: 'var(--fg-secondary)', marginBottom: '1.5rem' }}>No requests yet — be the first to submit one.</p>
            <a href="/submit" className="btn">Submit a Request</a>
          </div>
        ) : (
          <div>
            {recent.map((req, i) => (
              <div
                key={req.id}
                className="request-card animate-fade-up"
                style={{ animationDelay: `${i * 50}ms` }}
                onClick={() => window.location.href = '/requests'}
                role="button"
                tabIndex={0}
                onKeyDown={e => e.key === 'Enter' && (window.location.href = '/requests')}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem' }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '0.5rem' }}>
                      <h3>{req.name}</h3>
                      <span className={`badge badge-${req.adminStatus}`}>{STATUS_LABELS[req.adminStatus]}</span>
                    </div>
                    <p className="request-snippet">{req.projectIdea}</p>
                    <div className="request-meta" style={{ marginTop: '0.6rem' }}>
                      <span>{req.submissionType?.replace('_', ' ')}</span>
                      <span>·</span>
                      <span>{new Date(req.submittedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                    </div>
                  </div>
                  <span style={{ color: 'var(--fg-muted)', fontSize: '1.1rem', flexShrink: 0 }}>→</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
