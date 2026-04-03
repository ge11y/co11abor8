'use client';
import { useEffect, useState } from 'react';
import { Request } from '@/lib/types';

const TYPE_LABELS: Record<string, string> = {
  collaboration: 'Collab', project_idea: 'Idea',
  status_update: 'Status', general: 'General',
};
const STATUS_LABELS: Record<string, string> = {
  open: 'Open', in_review: 'In Review', approved: 'Approved',
  complete: 'Complete', declined: 'Declined',
};
const WORK_STATUS_LABELS: Record<string, string> = {
  just_starting: 'Just starting', in_progress: 'In progress',
  near_completion: 'Near completion', stuck: 'Stuck', other: 'Other',
};

export default function RequestsPage() {
  const [requests, setRequests] = useState<Request[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [search, setSearch] = useState('');
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/requests').then(r => r.json()).then(data => {
      setRequests(data);
      setLoading(false);
    });
  }, []);

  const filtered = requests.filter(r => {
    if (filterType && r.submissionType !== filterType) return false;
    if (filterStatus && r.adminStatus !== filterStatus) return false;
    if (search) {
      const q = search.toLowerCase();
      return r.name.toLowerCase().includes(q) || r.projectIdea.toLowerCase().includes(q) || r.contact.toLowerCase().includes(q);
    }
    return true;
  });

  const total = requests.length;

  return (
    <div>
      {/* ── Header ── */}
      <div className="page-header animate-fade-up" style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1>Requests</h1>
          <p className="subtitle" style={{ margin: 0 }}>
            {loading ? '…' : `${filtered.length}${total !== filtered.length ? ` of ${total}` : ''} request${total !== 1 ? 's' : ''}`}
          </p>
        </div>
        <a href="/submit" className="btn btn-sm">
          + New Request
        </a>
      </div>

      {/* ── Filters ── */}
      <div className="filter-bar animate-fade-up stagger-1">
        <input
          className="form-input search-input"
          placeholder="Search by name, project, or contact…"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <select className="form-select" style={{ width: 'auto', minWidth: 150 }} value={filterType} onChange={e => setFilterType(e.target.value)}>
          <option value="">All Types</option>
          <option value="collaboration">Collaboration</option>
          <option value="project_idea">Project Idea</option>
          <option value="status_update">Status Update</option>
          <option value="general">General</option>
        </select>
        <select className="form-select" style={{ width: 'auto', minWidth: 150 }} value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
          <option value="">All Statuses</option>
          <option value="open">Open</option>
          <option value="in_review">In Review</option>
          <option value="approved">Approved</option>
          <option value="complete">Complete</option>
          <option value="declined">Declined</option>
        </select>
        {(filterType || filterStatus || search) && (
          <button
            className="btn btn-ghost btn-sm"
            onClick={() => { setSearch(''); setFilterType(''); setFilterStatus(''); }}
          >
            Clear
          </button>
        )}
      </div>

      {/* ── Cards ── */}
      {loading ? (
        <div className="empty-state">
          <span className="empty-state-icon">◈</span>
          Loading requests…
        </div>
      ) : filtered.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '4rem 2rem' }}>
          <span className="empty-state-icon">◎</span>
          <p style={{ color: 'var(--fg-secondary)', marginBottom: '1.5rem' }}>
            {total === 0 ? 'No requests yet.' : 'No requests match your filters.'}
          </p>
          {total === 0 && <a href="/submit" className="btn">Submit the first one</a>}
        </div>
      ) : (
        <div>
          {filtered.map((req, i) => (
            <div
              key={req.id}
              className="request-card animate-fade-up"
              style={{ animationDelay: `${i * 40}ms` }}
              onClick={() => setExpanded(expanded === req.id ? null : req.id)}
            >
              {/* Card header — always visible */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem' }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem', flexWrap: 'wrap', marginBottom: '0.5rem' }}>
                    <h3>{req.name}</h3>
                    <span className={`badge badge-${req.adminStatus}`}>{STATUS_LABELS[req.adminStatus]}</span>
                    <span style={{
                      fontSize: '0.7rem', fontWeight: 600, padding: '0.2rem 0.6rem',
                      borderRadius: 'var(--radius-badge)', background: 'var(--surface-2)',
                      color: 'var(--fg-muted)', border: '1px solid var(--border)',
                    }}>
                      {TYPE_LABELS[req.submissionType]}
                    </span>
                  </div>
                  <p className="request-snippet">{req.projectIdea}</p>
                  <div className="request-meta" style={{ marginTop: '0.7rem' }}>
                    <span>{WORK_STATUS_LABELS[req.status]}</span>
                    <span>·</span>
                    <span>{req.contact}</span>
                    <span>·</span>
                    <span>{new Date(req.submittedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                  </div>
                </div>
                <div style={{
                  width: 28, height: 28, borderRadius: '50%', background: 'var(--surface-2)',
                  border: '1px solid var(--border)', display: 'flex', alignItems: 'center',
                  justifyContent: 'center', fontSize: '0.7rem', color: 'var(--fg-muted)',
                  flexShrink: 0, transition: 'transform var(--t-mid) var(--ease-out)',
                  transform: expanded === req.id ? 'rotate(180deg)' : 'none',
                }}>
                  ↓
                </div>
              </div>

              {/* Expanded detail */}
              {expanded === req.id && (
                <div style={{ marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '1px solid var(--border)' }}>
                  <div className="detail-row">
                    <span className="detail-label">Contact</span>
                    <span>{req.contact}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Project</span>
                    <span>{req.projectIdea}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Status</span>
                    <span>{WORK_STATUS_LABELS[req.status]}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Help needed</span>
                    <span>{req.helpNeeded}</span>
                  </div>
                  {req.vision && (
                    <div className="detail-row">
                      <span className="detail-label">Vision</span>
                      <span>{req.vision}</span>
                    </div>
                  )}
                  {req.notes && (
                    <div className="detail-row">
                      <span className="detail-label">Notes</span>
                      <span>{req.notes}</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
