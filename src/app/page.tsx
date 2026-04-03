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

  const recent = requests.slice(0, 6);

  return (
    <div>
      {/* Hero */}
      <div style={{
        background: 'var(--card)', border: '1px solid var(--border)',
        borderRadius: 12, padding: '2.5rem', textAlign: 'center', marginBottom: '2rem',
      }}>
        <h1 style={{ marginBottom: '0.5rem' }}>Welcome to co11ab</h1>
        <p style={{ color: 'var(--muted)', marginBottom: '1.5rem' }}>
          Share your profile, submit requests, collaborate.
        </p>
        <a href="/submit" className="btn" style={{ fontSize: '1rem', padding: '0.75rem 2rem' }}>
          Submit a Request
        </a>
      </div>

      {/* Recent requests */}
      {loading ? (
        <div className="empty-state">Loading...</div>
      ) : recent.length === 0 ? (
        <div className="empty-state">No requests yet. Be the first to submit one.</div>
      ) : (
        <div>
          <div className="section-header" style={{ marginBottom: '1rem' }}>
            <h2>Recent Requests</h2>
            <a href="/requests" className="btn btn-sm btn-outline">View all</a>
          </div>
          <div style={{ display: 'grid', gap: '0.75rem' }}>
            {recent.map(req => (
              <div key={req.id} className="request-card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <h3 style={{ margin: 0, fontSize: '0.95rem' }}>{req.name}</h3>
                    <div className="request-meta">
                      <span className={`badge badge-${req.adminStatus}`}>{STATUS_LABELS[req.adminStatus]}</span>
                      <span>{new Date(req.submittedAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
                <p className="request-snippet" style={{ marginTop: '0.5rem' }}>{req.projectIdea}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
