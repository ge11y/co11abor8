'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

const STATUS_OPTIONS = ['open', 'in_review', 'approved', 'complete', 'declined'];
const STATUS_LABELS: Record<string, string> = {
  open: 'Open', in_review: 'In Review', approved: 'Approved',
  complete: 'Complete', declined: 'Declined',
};
const TYPE_LABELS: Record<string, string> = {
  collaboration: 'Collaboration', project_idea: 'Project Idea',
  status_update: 'Status Update', general: 'General',
};
const STAGE_LABELS: Record<string, string> = {
  just_starting: 'Just starting', in_progress: 'In progress',
  near_completion: 'Near completion', stuck: 'Stuck', other: 'Other',
};

interface User {
  id: string; email: string; slug: string; name: string; bio: string;
  socials: { x?: string; instagram?: string; linkedin?: string };
  schedulingUrl: string; schedulingLabel: string;
}

interface Request {
  id: string; creatorId: string; requesterName: string; requesterContact: string;
  projectIdea: string; status: string; helpNeeded: string; vision: string;
  submissionType: string; timeSlot?: string; submittedAt: string;
  reviewedAt?: string; adminStatus: string; notes?: string; sharedNotes?: string;
}

// ─── Dashboard ─────────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [requests, setRequests] = useState<Request[]>([]);
  const [profiles, setProfiles] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<'inbound' | 'outbound' | 'profile'>('inbound');

  useEffect(() => {
    const stored = localStorage.getItem('co11ab_user');
    if (!stored) { router.push('/login'); return; }
    setUser(JSON.parse(stored));

    Promise.all([
      (() => {
        const token = localStorage.getItem('co11ab_token') || '';
        const headers: Record<string, string> = {};
        if (token) headers['Authorization'] = `Bearer ${token}`;
        return fetch('/api/requests', { headers, credentials: 'include' }).then(r => r.ok ? r.json() : { requests: [], authenticated: false });
      })(),
      fetch('/api/profile').then(r => r.ok ? r.json() : []),
    ]).then(([reqData, profileData]) => {
      setRequests(Array.isArray(reqData) ? reqData : (reqData.requests || []));
      setProfiles(Array.isArray(profileData) ? profileData : []);
      setLoading(false);
    });
  }, []);

  const inbound = requests.filter(r => r.creatorId === user?.id);
  const outbound = requests.filter(r => r.requesterContact === user?.email);
  const openCount = inbound.filter(r => r.adminStatus === 'open').length;
  const reviewCount = inbound.filter(r => r.adminStatus === 'in_review').length;
  const approvedCount = inbound.filter(r => r.adminStatus === 'approved').length;

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    localStorage.removeItem('co11ab_user');
    router.push('/');
  };

  if (loading) return (
    <div style={{ textAlign: 'center', paddingTop: '5rem' }}>
      <div style={{ color: 'var(--fg-muted)', fontSize: '0.875rem' }}>Loading…</div>
    </div>
  );

  if (!user) return null;

  return (
    <div style={{ maxWidth: 960, margin: '0 auto' }}>

      {/* ── Header ─────────────────────────────── */}
      <div className="animate-fade-up" style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        flexWrap: 'wrap', gap: '1rem', paddingTop: 'clamp(3.5rem, 8vh, 6rem)',
        marginBottom: '2.5rem',
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.4rem' }}>
            <div style={{
              width: 40, height: 40, borderRadius: '50%',
              background: 'linear-gradient(135deg, #ffffff, rgba(255,255,255,0.1))',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '0.9rem', fontWeight: 700, color: '#fff',
            }}>
              {user.name?.[0]?.toUpperCase()}
            </div>
            <div>
              <h1 style={{ fontSize: '1.3rem', fontWeight: 700, letterSpacing: '-0.01em', margin: 0 }}>
                {user.name}
              </h1>
              <p style={{ color: 'var(--fg-muted)', fontSize: '0.78rem', margin: 0 }}>
                co11abor8.com/p/{user.slug}
              </p>
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '0.625rem', alignItems: 'center' }}>
          <a href={`/p/${user.slug}`} target="_blank" rel="noopener noreferrer"
            className="btn btn-outline btn-sm">
            View public link
          </a>
          <button className="btn btn-ghost btn-sm" onClick={handleLogout}>Sign out</button>
        </div>
      </div>

      {/* ── Stats ───────────────────────────────── */}
      <div className="animate-fade-up stagger-1" style={{
        display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
        gap: '0.75rem', marginBottom: '2.5rem',
      }}>
        {[
          { label: 'Open', value: openCount, color: 'var(--status-open)' },
          { label: 'In Review', value: reviewCount, color: 'var(--status-review)' },
          { label: 'Approved', value: approvedCount, color: 'var(--status-approved)' },
          { label: 'Total Inbound', value: inbound.length, color: 'var(--fg)' },
          { label: 'Sent by You', value: outbound.length, color: 'var(--fg)' },
        ].map(stat => (
          <div key={stat.label} className="stat-card" style={{ padding: '1.25rem 1.25rem' }}>
            <div className="stat-number" style={{ color: stat.color }}>{stat.value}</div>
            <div className="stat-label">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* ── Tabs ────────────────────────────────── */}
      <div className="animate-fade-up stagger-2" style={{ marginBottom: '1.5rem' }}>
        <div className="tabs">
          <button className={`tab-btn ${tab === 'inbound' ? 'active' : ''}`} onClick={() => setTab('inbound')}>
            Inbound <span style={{ marginLeft: '0.4rem', fontSize: '0.72rem', opacity: 0.6 }}>({inbound.length})</span>
          </button>
          <button className={`tab-btn ${tab === 'outbound' ? 'active' : ''}`} onClick={() => setTab('outbound')}>
            Sent <span style={{ marginLeft: '0.4rem', fontSize: '0.72rem', opacity: 0.6 }}>({outbound.length})</span>
          </button>
          <button className={`tab-btn ${tab === 'profile' ? 'active' : ''}`} onClick={() => setTab('profile')}>
            My Profile
          </button>
        </div>
      </div>

      {tab === 'inbound' && <InboundTab requests={inbound}      onUpdate={() => {
        const token = localStorage.getItem('co11ab_token') || '';
        const headers: Record<string, string> = {};
        if (token) headers['Authorization'] = `Bearer ${token}`;
        fetch('/api/requests', { headers, credentials: 'include' }).then(r => r.ok ? r.json() : []).then(d => setRequests(Array.isArray(d) ? d : []));
      }} />}
      {tab === 'outbound' && <OutboundTab requests={outbound} profiles={profiles} onSubmit={() => {
        const token = localStorage.getItem('co11ab_token') || '';
        const headers: Record<string, string> = {};
        if (token) headers['Authorization'] = `Bearer ${token}`;
        fetch('/api/requests', { headers, credentials: 'include' }).then(r => r.ok ? r.json() : []).then(d => setRequests(Array.isArray(d) ? d : []));
      }} />}
      {tab === 'profile' && <ProfileTab user={user} onUpdate={(u) => {
        setUser(u); localStorage.setItem('co11ab_user', JSON.stringify(u));
      }} />}
    </div>
  );
}

// ─── Inbound Tab ─────────────────────────────────────────────────────────────────

function InboundTab({ requests, onUpdate }: { requests: Request[]; onUpdate: () => void }) {
  const [expanded, setExpanded] = useState<string | null>(null);
  const [savingNotes, setSavingNotes] = useState<string | null>(null);
  const [statusSaving, setStatusSaving] = useState<string | null>(null);

  const updateStatus = async (id: string, adminStatus: string) => {
    const token = localStorage.getItem('co11ab_token') || '';
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;
    setStatusSaving(id);
    await fetch('/api/requests/' + id, {
      method: 'PATCH', headers, credentials: 'include',
      body: JSON.stringify({ adminStatus }),
    });
    setStatusSaving(null);
    onUpdate();
  };

  const saveNotes = async (id: string, notes: string, isShared: boolean) => {
    const token = localStorage.getItem('co11ab_token') || '';
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;
    setSavingNotes(id + (isShared ? '_shared' : '_private'));
    await fetch('/api/requests/' + id, {
      method: 'PATCH', headers, credentials: 'include',
      body: JSON.stringify(isShared ? { sharedNotes: notes } : { notes }),
    });
    setSavingNotes(null);
    onUpdate();
  };

  if (requests.length === 0) return (
    <div className="card" style={{ textAlign: 'center', padding: '4rem 2rem' }}>
      <span style={{ fontSize: '2.5rem', opacity: 0.2, display: 'block', marginBottom: '1rem' }}>◎</span>
      <p style={{ color: 'var(--fg-secondary)', marginBottom: '0.5rem' }}>No inbound requests yet.</p>
      <p style={{ color: 'var(--fg-muted)', fontSize: '0.8rem' }}>
        Share your link at <strong style={{ color: 'var(--fg-secondary)' }}>co11abor8.com/p/your-slug</strong>
      </p>
    </div>
  );

  return (
    <div style={{ display: 'grid', gap: '0.75rem' }}>
      {requests.map(req => (
        <div key={req.id} className="card" style={{ padding: '1.375rem 1.5rem' }}>
          {/* Header row */}
          <div style={{ cursor: 'pointer' }} onClick={() => setExpanded(expanded === req.id ? null : req.id)}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem' }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', flexWrap: 'wrap', marginBottom: '0.4rem' }}>
                  <h3 style={{ fontSize: '0.95rem', fontWeight: 600, margin: 0 }}>{req.projectIdea}</h3>
                  <span className={`badge badge-${req.adminStatus}`}>{STATUS_LABELS[req.adminStatus]}</span>
                  <span style={{ fontSize: '0.7rem', padding: '0.2rem 0.55rem', borderRadius: 'var(--radius-badge)', background: 'var(--surface-2)', color: 'var(--fg-muted)', border: '1px solid var(--border)' }}>
                    {TYPE_LABELS[req.submissionType] || req.submissionType}
                  </span>
                </div>
                <p style={{
                  fontSize: '0.875rem', color: 'var(--fg-secondary)', lineHeight: 1.55,
                  display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
                  overflow: 'hidden', margin: '0 0 0.75rem',
                }}>
                  {req.helpNeeded}
                </p>
                <div style={{ display: 'flex', gap: '0.625rem', alignItems: 'center', flexWrap: 'wrap', fontSize: '0.72rem', color: 'var(--fg-muted)' }}>
                  <span>{req.requesterName}</span>
                  <span>·</span>
                  <span>{STAGE_LABELS[req.status] || req.status}</span>
                  <span>·</span>
                  <span>{new Date(req.submittedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                </div>
              </div>
              <div style={{
                width: 28, height: 28, borderRadius: '50%',
                background: 'var(--surface-2)', border: '1px solid var(--border)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '0.7rem', color: 'var(--fg-muted)', flexShrink: 0,
                transition: 'transform var(--t-mid)',
                transform: expanded === req.id ? 'rotate(180deg)' : 'none',
              }}>
                ↓
              </div>
            </div>
          </div>

          {/* Expanded detail */}
          {expanded === req.id && (
            <div style={{ marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '1px solid var(--border)' }}>
              <div className="detail-row">
                <span className="detail-label">Contact</span>
                <a href={`mailto:${req.requesterContact}`} style={{ color: 'var(--accent)', textDecoration: 'none' }}>{req.requesterContact}</a>
              </div>
              <div className="detail-row">
                <span className="detail-label">Project</span>
                <span>{req.projectIdea}</span>
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
                  <span className="detail-label">Your notes</span>
                  <span style={{ color: 'var(--accent)' }}>{req.notes}</span>
                </div>
              )}

              {/* Status controls */}
              <div style={{ marginTop: '1.5rem' }}>
                <p style={{ fontSize: '0.72rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--fg-muted)', marginBottom: '0.75rem' }}>
                  Update status {statusSaving === req.id && <span style={{ opacity: 0.6 }}>· saving…</span>}
                </p>
                <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                  {STATUS_OPTIONS.map(s => (
                    <button
                      key={s}
                      onClick={() => updateStatus(req.id, s)}
                      className={`btn btn-sm ${req.adminStatus === s ? '' : 'btn-outline'}`}
                      disabled={statusSaving === req.id}
                    >
                      {STATUS_LABELS[s]}
                    </button>
                  ))}
                </div>
              </div>

              {/* Notes — side by side */}
              <div style={{ marginTop: '1.25rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <p style={{ fontSize: '0.72rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--fg-muted)', marginBottom: '0.6rem' }}>
                      Private notes
                    </p>
                    <NotesField
                      currentNotes={req.notes || ''}
                      saving={savingNotes === req.id + '_private'}
                      onSave={(notes) => saveNotes(req.id, notes, false)}
                      label="Private notes"
                    />
                  </div>
                  <div>
                    <p style={{ fontSize: '0.72rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--fg-muted)', marginBottom: '0.6rem' }}>
                      Shared notes
                    </p>
                    <NotesField
                      currentNotes={req.sharedNotes || ''}
                      saving={savingNotes === req.id + '_shared'}
                      onSave={(notes) => saveNotes(req.id, notes, true)}
                      label="Shared notes"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

// ─── Outbound Tab ─────────────────────────────────────────────────────────────────

function OutboundTab({ requests, profiles, onSubmit }: { requests: Request[]; profiles: User[]; onSubmit: () => void }) {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ creatorId: '', requesterName: '', requesterContact: '', projectIdea: '', helpNeeded: '', vision: '' });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm(p => ({ ...p, [k]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.creatorId || !form.requesterName || !form.requesterContact || !form.projectIdea || !form.helpNeeded) {
      setError('Please fill in all required fields.');
      return;
    }
    setError('');
    setSubmitting(true);
    try {
      const token = localStorage.getItem('co11ab_token') || '';
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;
      const res = await fetch('/api/requests', {
        method: 'POST', headers,
        credentials: 'include',
        body: JSON.stringify({ ...form, status: 'in_progress', submissionType: 'collaboration' }),
      });
      if (!res.ok) throw new Error();
      setSuccess(true);
      setForm({ creatorId: '', requesterName: '', requesterContact: '', projectIdea: '', helpNeeded: '', vision: '' });
      onSubmit();
      setTimeout(() => { setSuccess(false); setShowForm(false); }, 2500);
    } catch {
      setError('Something went wrong.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <div className="section-header" style={{ marginBottom: '1.25rem' }}>
        <p style={{ color: 'var(--fg-muted)', fontSize: '0.85rem', margin: 0 }}>
          Requests you've sent
        </p>
        <button className="btn btn-sm" onClick={() => setShowForm(!showForm)}>
          {showForm ? 'Cancel' : '+ New Request'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="card" style={{ marginBottom: '1.5rem', border: '1px solid rgba(255,255,255,0.15)' }}>
          <h3 style={{ marginBottom: '1.25rem', fontSize: '0.85rem', color: 'var(--fg-secondary)', textTransform: 'uppercase', letterSpacing: '0.07em', fontWeight: 600 }}>New Request</h3>
          {error && <div className="alert alert-error">{error}</div>}
          {success && <div className="alert alert-success">Request sent! ✓</div>}

          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label">Send to *</label>
            <select className="form-select" value={form.creatorId} onChange={set('creatorId')}>
              <option value="">Select a creator…</option>
              {profiles.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.875rem', marginTop: '1rem' }}>
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Your name *</label>
              <input className="form-input" value={form.requesterName} onChange={set('requesterName')} placeholder="Jane Smith" />
            </div>
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Your contact *</label>
              <input className="form-input" value={form.requesterContact} onChange={set('requesterContact')} placeholder="jane@… or @handle" />
            </div>
          </div>
          <div className="form-group" style={{ marginTop: '1rem' }}>
            <label className="form-label">What are you working on? *</label>
            <textarea className="form-textarea" value={form.projectIdea} onChange={set('projectIdea')} rows={3} placeholder="Describe your project…" />
          </div>
          <div className="form-group" style={{ marginTop: '1rem' }}>
            <label className="form-label">What do you need? *</label>
            <textarea className="form-textarea" value={form.helpNeeded} onChange={set('helpNeeded')} rows={3} placeholder="What you need from them…" />
          </div>
          <div className="form-group" style={{ marginTop: '1rem', marginBottom: 0 }}>
            <label className="form-label">Vision <span style={{ color: 'var(--fg-muted)', fontWeight: 400 }}>(optional)</span></label>
            <textarea className="form-textarea" value={form.vision} onChange={set('vision')} rows={2} placeholder="Where you see this going…" />
          </div>
          <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem' }}>
            <button type="submit" className="btn" disabled={submitting}>{submitting ? 'Sending…' : 'Send Request'}</button>
            <button type="button" className="btn btn-outline" onClick={() => setShowForm(false)}>Cancel</button>
          </div>
        </form>
      )}

      {requests.length === 0 && !showForm ? (
        <div className="card" style={{ textAlign: 'center', padding: '4rem 2rem' }}>
          <span style={{ fontSize: '2.5rem', opacity: 0.2, display: 'block', marginBottom: '1rem' }}>◎</span>
          <p style={{ color: 'var(--fg-secondary)', marginBottom: '0.5rem' }}>No requests sent yet.</p>
          <button className="btn" onClick={() => setShowForm(true)} style={{ marginTop: '0.5rem' }}>Send your first request</button>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: '0.75rem' }}>
          {requests.map(req => {
            const creator = profiles.find(p => p.id === req.creatorId);
            return (
              <div key={req.id} className="card" style={{ padding: '1.25rem 1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', flexWrap: 'wrap', marginBottom: '0.35rem' }}>
                      <h3 style={{ fontSize: '0.95rem', fontWeight: 600, margin: 0 }}>{req.projectIdea}</h3>
                      <span className={`badge badge-${req.adminStatus}`}>{STATUS_LABELS[req.adminStatus]}</span>
                    </div>
                    <p style={{ fontSize: '0.875rem', color: 'var(--fg-secondary)', lineHeight: 1.55, margin: '0 0 0.75rem' }}>
                      {req.helpNeeded}
                    </p>
                    <div style={{ display: 'flex', gap: '0.625rem', alignItems: 'center', flexWrap: 'wrap', fontSize: '0.72rem', color: 'var(--fg-muted)' }}>
                      <span>To: {creator ? creator.name : req.creatorId}</span>
                      <span>·</span>
                      <span>{new Date(req.submittedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                    </div>
                  </div>
                  {creator && (
                    <a href={`/p/${creator.slug}`} target="_blank" rel="noopener noreferrer"
                      className="btn btn-outline btn-sm" style={{ flexShrink: 0, textDecoration: 'none' }}>
                      View
                    </a>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─── Profile Tab ─────────────────────────────────────────────────────────────────

function ProfileTab({ user, onUpdate }: { user: User; onUpdate: (u: User) => void }) {
  const [form, setForm] = useState({
    name: user.name, slug: user.slug, bio: user.bio || '',
    x: user.socials?.x || '', instagram: user.socials?.instagram || '', linkedin: user.socials?.linkedin || '',
    schedulingUrl: user.schedulingUrl || '', schedulingLabel: user.schedulingLabel || 'Book a time',
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [slugError, setSlugError] = useState('');

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm(p => ({ ...p, [k]: e.target.value }));

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.slug) { alert('Name and link are required.'); return; }
    if (!/^[a-z0-9-]+$/.test(form.slug)) {
      setSlugError('Only lowercase letters, numbers, and hyphens allowed.');
      return;
    }
    setSlugError('');
    setSaving(true);
    try {
      const token = localStorage.getItem('co11ab_token') || '';
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;
      const res = await fetch('/api/profile', {
        method: 'PATCH',
        headers,
        credentials: 'include',
        body: JSON.stringify({
          name: form.name, slug: form.slug, bio: form.bio,
          socials: { x: form.x, instagram: form.instagram, linkedin: form.linkedin },
          schedulingUrl: form.schedulingUrl, schedulingLabel: form.schedulingLabel,
        }),
      });
      if (!res.ok) { const d = await res.json(); alert(d.error || 'Failed to save.'); return; }
      const updated = { ...user, ...form };
      onUpdate(updated);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSave}>
      <div className="card animate-fade-up" style={{ marginBottom: '1rem' }}>
        <h3 style={{ marginBottom: '1.25rem', fontSize: '0.85rem', color: 'var(--fg-secondary)', textTransform: 'uppercase', letterSpacing: '0.07em', fontWeight: 600 }}>Basic Info</h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.875rem' }}>
          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label">Your name *</label>
            <input className="form-input" value={form.name} onChange={set('name')} />
          </div>
          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label">Your link *</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: 0, background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 'var(--radius-input)', overflow: 'hidden' }}>
              <span style={{ padding: '0.75rem 0.5rem 0.75rem 0.875rem', fontSize: '0.78rem', color: 'var(--fg-muted)', whiteSpace: 'nowrap', borderRight: '1px solid var(--border)' }}>co11abor8.com/p/</span>
              <input
                className="form-input"
                style={{ border: 'none', borderRadius: 0, background: 'transparent', boxShadow: 'none', paddingLeft: '0.75rem' }}
                value={form.slug}
                onChange={(e) => { set('slug')(e); setSlugError(''); }}
              />
            </div>
            {slugError && <p style={{ color: 'var(--status-declined)', fontSize: '0.75rem', marginTop: '0.35rem' }}>{slugError}</p>}
            <p className="form-hint">Only lowercase letters, numbers, hyphens</p>
          </div>
        </div>
        <div className="form-group" style={{ marginTop: '1rem', marginBottom: 0 }}>
          <label className="form-label">Bio</label>
          <textarea className="form-textarea" value={form.bio} onChange={set('bio')} rows={3}
            placeholder="A short description of what you do and what you're open to collaborating on…"
            style={{ minHeight: 80 }} />
        </div>
      </div>

      <div className="card animate-fade-up stagger-1" style={{ marginBottom: '1rem' }}>
        <h3 style={{ marginBottom: '1.25rem', fontSize: '0.85rem', color: 'var(--fg-secondary)', textTransform: 'uppercase', letterSpacing: '0.07em', fontWeight: 600 }}>Socials</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.875rem' }}>
          {[
            { k: 'x', label: 'X (Twitter)', p: 'https://x.com/…' },
            { k: 'instagram', label: 'Instagram', p: 'https://instagram.com/…' },
            { k: 'linkedin', label: 'LinkedIn', p: 'https://linkedin.com/in/…' },
          ].map(f => (
            <div key={f.k} className="form-group" style={{ margin: 0 }}>
              <label className="form-label">{f.label}</label>
              <input className="form-input" placeholder={f.p} value={(form as any)[f.k]} onChange={set(f.k)} />
            </div>
          ))}
        </div>
      </div>

      <div className="card animate-fade-up stagger-2" style={{ marginBottom: '1.5rem' }}>
        <h3 style={{ marginBottom: '0.5rem', fontSize: '0.85rem', color: 'var(--fg-secondary)', textTransform: 'uppercase', letterSpacing: '0.07em', fontWeight: 600 }}>Scheduling</h3>
        <p style={{ fontSize: '0.78rem', color: 'var(--fg-muted)', marginBottom: '1rem', lineHeight: 1.6 }}>
          Add a Calendly, Google Calendar, or Google Meet link. It appears on your public profile.
        </p>
        <div className="form-group" style={{ margin: 0 }}>
          <label className="form-label">Scheduling link</label>
          <input className="form-input" placeholder="https://calendly.com/… or https://calendar.app.google.com/…" value={form.schedulingUrl} onChange={set('schedulingUrl')} />
        </div>
        <div className="form-group" style={{ marginTop: '0.875rem', marginBottom: 0 }}>
          <label className="form-label">Button label</label>
          <input className="form-input" placeholder="Book a time" value={form.schedulingLabel} onChange={set('schedulingLabel')} />
        </div>
      </div>

      <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
        <button type="submit" className="btn" disabled={saving} style={{ padding: '0.75rem 2rem' }}>
          {saving ? 'Saving…' : 'Save Changes'}
        </button>
        {saved && <span style={{ fontSize: '0.875rem', color: 'var(--status-open)' }}>Saved ✓</span>}
      </div>
    </form>
  );
}

// ─── Notes field ─────────────────────────────────────────────────────────────────

function NotesField({ currentNotes, saving, onSave, label }: { currentNotes: string; saving: boolean; onSave: (n: string) => void; label: string }) {
  const [notes, setNotes] = useState(currentNotes);
  const [saved, setSaved] = useState(false);
  const handleSave = () => { onSave(notes); setSaved(true); setTimeout(() => setSaved(false), 2000); };
  return (
    <div>
      <textarea
        className="form-textarea"
        value={notes}
        onChange={e => setNotes(e.target.value)}
        rows={3}
        style={{ minHeight: 80, marginBottom: '0.75rem' }}
        placeholder={label === 'Shared notes' ? 'Notes visible to both parties…' : 'Private notes — only you can see these…'}
      />
      <button className="btn btn-sm" onClick={handleSave} disabled={saving}>
        {saving ? 'Saving…' : saved ? 'Saved ✓' : 'Save Note'}
      </button>
    </div>
  );
}
