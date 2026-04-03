'use client';
import { useEffect, useState } from 'react';
import { Request } from '@/lib/types';

const TYPE_LABELS: Record<string, string> = {
  collaboration: 'Collab',
  project_idea: 'Idea',
  status_update: 'Status',
  general: 'General',
};
const STATUS_LABELS: Record<string, string> = {
  open: 'Open',
  in_review: 'In Review',
  approved: 'Approved',
  complete: 'Complete',
  declined: 'Declined',
};
const WORK_STATUS_LABELS: Record<string, string> = {
  just_starting: 'Just starting',
  in_progress: 'In progress',
  near_completion: 'Near completion',
  stuck: 'Stuck',
  other: 'Other',
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

  const formatSlot = (iso: string) => {
    if (!iso) return '—';
    return new Date(iso).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });
  };

  return (
    <div>
      <h1>Requests</h1>
      <p className="subtitle">{filtered.length} request{filtered.length !== 1 ? 's' : ''}</p>

      <div className="filter-bar">
        <input
          className="form-input search-input"
          placeholder="Search by name or project..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <select className="form-select" style={{ width: 'auto' }} value={filterType} onChange={e => setFilterType(e.target.value)}>
          <option value="">All Types</option>
          <option value="collaboration">Collaboration</option>
          <option value="project_idea">Project Idea</option>
          <option value="status_update">Status Update</option>
          <option value="general">General</option>
        </select>
        <select className="form-select" style={{ width: 'auto' }} value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
          <option value="">All Statuses</option>
          <option value="open">Open</option>
          <option value="in_review">In Review</option>
          <option value="approved">Approved</option>
          <option value="complete">Complete</option>
          <option value="declined">Declined</option>
        </select>
      </div>

      {loading ? (
        <div className="empty-state">Loading...</div>
      ) : filtered.length === 0 ? (
        <div className="empty-state">No requests match your filters</div>
      ) : (
        filtered.map(req => (
          <div key={req.id} className="request-card" style={{ cursor: 'pointer' }} onClick={() => setExpanded(expanded === req.id ? null : req.id)}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <h3>{req.name}</h3>
                <div className="request-meta">
                  <span className={`badge badge-${req.adminStatus}`}>{STATUS_LABELS[req.adminStatus]}</span>
                  <span style={{ fontWeight: 500 }}>{TYPE_LABELS[req.submissionType]}</span>
                  <span>{WORK_STATUS_LABELS[req.status]}</span>
                  <span>{new Date(req.submittedAt).toLocaleDateString()}</span>
                  {req.timeSlot && <span>Slot: {formatSlot(req.timeSlot)}</span>}
                </div>
              </div>
              <div style={{ fontSize: '1.25rem', color: 'var(--muted)', transition: 'transform 0.2s' }}>{expanded === req.id ? '▲' : '▼'}</div>
            </div>

            <p className="request-snippet">{req.projectIdea}</p>

            {expanded === req.id && (
              <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--border)' }}>
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
                <div className="detail-row">
                  <span className="detail-label">Vision</span>
                  <span>{req.vision || '—'}</span>
                </div>
                {req.timeSlot && (
                  <div className="detail-row">
                    <span className="detail-label">Requested slot</span>
                    <span>{formatSlot(req.timeSlot)}</span>
                  </div>
                )}
                {req.notes && (
                  <div className="detail-row">
                    <span className="detail-label">Notes</span>
                    <span>{req.notes}</span>
                  </div>
                )}
                <div style={{ marginTop: '1rem', display: 'flex', gap: '0.5rem' }}>
                  <a href="/admin" className="btn btn-sm btn-outline">Manage</a>
                  <a href="/submit" className="btn btn-sm btn-outline">New Submit</a>
                </div>
              </div>
            )}
          </div>
        ))
      )}
    </div>
  );
}
