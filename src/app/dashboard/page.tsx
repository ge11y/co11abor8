'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

const STATUS_OPTIONS = ['open', 'in_review', 'approved', 'complete', 'declined'];
const STATUS_LABELS: Record<string, string> = {
  open: 'Open', in_review: 'In Review', approved: 'Approved',
  complete: 'Complete', declined: 'Declined',
};
const WORK_STATUS_LABELS: Record<string, string> = {
  just_starting: 'Just starting', in_progress: 'In progress',
  near_completion: 'Near completion', stuck: 'Stuck', other: 'Other',
};

// ─── Types ─────────────────────────────────────────────────────────────────────

interface User {
  id: string; email: string; slug: string; name: string; bio: string;
  socials: { x?: string; instagram?: string; linkedin?: string };
  schedulingUrl: string; schedulingLabel: string;
}

interface Request {
  id: string; creatorId: string; requesterName: string; requesterContact: string;
  projectIdea: string; status: string; helpNeeded: string; vision: string;
  submissionType: string; timeSlot?: string; submittedAt: string;
  reviewedAt?: string; adminStatus: string; notes?: string;
}

// ─── Dashboard ────────────────────────────────────────────────────────────────

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
      fetch('/api/requests').then(r => r.json()),
      fetch('/api/profile').then(r => r.json()),
    ]).then(([reqData, profileData]) => {
      setRequests(Array.isArray(reqData) ? reqData : []);
      setProfiles(Array.isArray(profileData) ? profileData : []);
      setLoading(false);
    });
  }, []);

  const inbound = requests.filter(r => r.creatorId === user?.id);
  const outbound = requests.filter(r => r.requesterContact === user?.email);
  const openCount = inbound.filter(r => r.adminStatus === 'open').length;
  const reviewCount = inbound.filter(r => r.adminStatus === 'in_review').length;

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    localStorage.removeItem('co11ab_user');
    router.push('/');
    router.refresh();
  };

  if (loading) return (
    <div style={{ textAlign: 'center', paddingTop: '4rem' }}>
      <div style={{ color: 'var(--fg-muted)', fontSize: '0.875rem' }}>Loading…</div>
    </div>
  );

  if (!user) return null;

  return (
    <div>
      {/* ── Top bar ─────────────────────────────────────────── */}
      <div className="animate-fade-up" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '1.4rem', marginBottom: '0.2rem' }}>Hey, {user.name}</h1>
          <p style={{ color: 'var(--fg-muted)', fontSize: '0.8rem', margin: 0 }}>
            {user.slug ? `co11abor8.com/p/${user.slug}` : ''}
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <a href={`/p/${user.slug}`} target="_blank" className="btn btn-outline btn-sm">View my link</a>
          <button className="btn btn-ghost btn-sm" onClick={handleLogout}>Sign out</button>
        </div>
      </div>

      {/* ── Stats ─────────────────────────────────────────── */}
      <div className="animate-fade-up stagger-1" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '0.875rem', marginBottom: '2rem' }}>
        <div className="stat-card" style={{ padding: '1.25rem 1.5rem' }}>
          <div className="stat-number" style={{ color: 'var(--status-open)' }}>{openCount}</div>
          <div className="stat-label">Open requests</div>
        </div>
        <div className="stat-card" style={{ padding: '1.25rem 1.5rem' }}>
          <div className="stat-number" style={{ color: 'var(--status-review)' }}>{reviewCount}</div>
          <div className="stat-label">In review</div>
        </div>
        <div className="stat-card" style={{ padding: '1.25rem 1.5rem' }}>
          <div className="stat-number">{inbound.length}</div>
          <div className="stat-label">Total inbound</div>
        </div>
        <div className="stat-card" style={{ padding: '1.25rem 1.5rem' }}>
          <div className="stat-number">{outbound.length}</div>
          <div className="stat-label">Sent by you</div>
        </div>
      </div>

      {/* ── Tabs ───────────────────────────────────────────── */}
      <div className="animate-fade-up stagger-2" style={{ marginBottom: '1.5rem' }}>
        <div className="tabs">
          <button className={`tab-btn ${tab === 'inbound' ? 'active' : ''}`} onClick={() => setTab('inbound')}>
            Inbound ({inbound.length})
          </button>
          <button className={`tab-btn ${tab === 'outbound' ? 'active' : ''}`} onClick={() => setTab('outbound')}>
            Sent ({outbound.length})
          </button>
          <button className={`tab-btn ${tab === 'profile' ? 'active' : ''}`} onClick={() => setTab('profile')}>
            My Profile
          </button>
        </div>
      </div>

      {tab === 'inbound' && <InboundTab requests={inbound} userId={user.id} onUpdate={() => {
        fetch('/api/requests').then(r => r.json()).then(d => setRequests(Array.isArray(d) ? d : []));
      }} />}
      {tab === 'outbound' && <OutboundTab requests={outbound} profiles={profiles} onSubmit={() => {
        fetch('/api/requests').then(r => r.json()).then(d => setRequests(Array.isArray(d) ? d : []));
      }} />}
      {tab === 'profile' && <ProfileTab user={user} onUpdate={(u) => { setUser(u); localStorage.setItem('co11ab_user', JSON.stringify(u)); }} />}
    </div>
  );
}

// ─── Inbound Tab ────────────────────────────────────────────────────────────────

function InboundTab({ requests, userId, onUpdate }: { requests: Request[]; userId: string; onUpdate: () => void }) {
  const [expanded, setExpanded] = useState<string | null>(null);
  const [savingNotes, setSavingNotes] = useState<string | null>(null);

  const updateStatus = async (id: string, adminStatus: string) => {
    await fetch(`/api/requests/${id}`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ adminStatus }),
    });
    onUpdate();
  };

  const saveNotes = async (id: string, notes: string) => {
    setSavingNotes(id);
    await fetch(`/api/requests/${id}`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ notes }),
    });
    setSavingNotes(null);
    onUpdate();
  };

  if (requests.length === 0) return (
    <div className="card" style={{ textAlign: 'center', padding: '3.5rem 2rem' }}>
      <span className="empty-state-icon">◎</span>
      <p style={{ color: 'var(--fg-secondary)', marginBottom: '0.5rem' }}>No inbound requests yet.</p>
      <p style={{ color: 'var(--fg-muted)', fontSize: '0.8rem' }}>Share your link to start receiving requests.</p>
    </div>
  );

  return (
    <div style={{ display: 'grid', gap: '0.875rem' }}>
      {requests.map(req => (
        <div key={req.id} className="request-card">
          <div style={{ cursor: 'pointer' }} onClick={() => setExpanded(expanded === req.id ? null : req.id)}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem' }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '0.4rem' }}>
                  <h3>{req.requesterName}</h3>
                  <span className={`badge badge-${req.adminStatus}`}>{STATUS_LABELS[req.adminStatus]}</span>
                  <span style={{ fontSize: '0.7rem', padding: '0.2rem 0.6rem', borderRadius: 'var(--radius-badge)', background: 'var(--surface-2)', color: 'var(--fg-muted)', border: '1px solid var(--border)' }}>
                    {req.submissionType?.replace('_', ' ')}
                  </span>
                </div>
                <p className="request-snippet">{req.projectIdea}</p>
                <div className="request-meta" style={{ marginTop: '0.6rem' }}>
                  <span>{req.requesterContact}</span>
                  <span>·</span>
                  <span>{new Date(req.submittedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                </div>
              </div>
              <div style={{ width: 26, height: 26, borderRadius: '50%', background: 'var(--surface-2)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.65rem', color: 'var(--fg-muted)', flexShrink: 0, transition: 'transform var(--t-mid)', transform: expanded === req.id ? 'rotate(180deg)' : 'none' }}>
                ↓
              </div>
            </div>
          </div>

          {expanded === req.id && (
            <div style={{ marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '1px solid var(--border)' }}>
              <div className="detail-row"><span className="detail-label">Contact</span><span>{req.requesterContact}</span></div>
              <div className="detail-row"><span className="detail-label">Project</span><span>{req.projectIdea}</span></div>
              <div className="detail-row"><span className="detail-label">Help needed</span><span>{req.helpNeeded}</span></div>
              {req.vision && <div className="detail-row"><span className="detail-label">Vision</span><span>{req.vision}</span></div>}
              {req.notes && <div className="detail-row"><span className="detail-label">Your notes</span><span>{req.notes}</span></div>}

              <div style={{ marginTop: '1.5rem' }}>
                <p style={{ fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--fg-muted)', marginBottom: '0.75rem' }}>Update status</p>
                <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                  {STATUS_OPTIONS.map(s => (
                    <button key={s} className={`btn btn-sm ${req.adminStatus === s ? '' : 'btn-outline'}`} onClick={() => updateStatus(req.id, s)}>
                      {STATUS_LABELS[s]}
                    </button>
                  ))}
                </div>
              </div>

              <div style={{ marginTop: '1.25rem' }}>
                <p style={{ fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--fg-muted)', marginBottom: '0.6rem' }}>Your notes</p>
                <NotesField currentNotes={req.notes || ''} saving={savingNotes === req.id} onSave={(notes) => saveNotes(req.id, notes)} />
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

// ─── Outbound Tab ──────────────────────────────────────────────────────────────

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
      const res = await fetch('/api/requests', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, status: 'in_progress', submissionType: 'collaboration' }),
      });
      if (!res.ok) throw new Error();
      setSuccess(true);
      setForm({ creatorId: '', requesterName: '', requesterContact: '', projectIdea: '', helpNeeded: '', vision: '' });
      onSubmit();
      setTimeout(() => { setSuccess(false); setShowForm(false); }, 2000);
    } catch {
      setError('Something went wrong.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <div className="section-header" style={{ marginBottom: '1.25rem' }}>
        <p style={{ color: 'var(--fg-muted)', fontSize: '0.85rem', margin: 0 }}>Requests you've sent to others</p>
        <button className="btn btn-sm" onClick={() => setShowForm(!showForm)}>
          {showForm ? 'Cancel' : '+ New Request'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="card card-glow" style={{ marginBottom: '1.5rem', border: '1px solid rgba(139,124,246,0.2)' }}>
          <h3 style={{ marginBottom: '1.25rem', fontSize: '0.9rem', color: 'var(--fg-secondary)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>New Request</h3>

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
          <div className="form-group" style={{ marginTop: '1rem' }}>
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
        <div className="card" style={{ textAlign: 'center', padding: '3.5rem 2rem' }}>
          <span className="empty-state-icon">◎</span>
          <p style={{ color: 'var(--fg-secondary)', marginBottom: '0.5rem' }}>No requests sent yet.</p>
          <button className="btn" onClick={() => setShowForm(true)} style={{ marginTop: '0.5rem' }}>Send your first request</button>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: '0.875rem' }}>
          {requests.map(req => (
            <div key={req.id} className="request-card" style={{ cursor: 'default' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '0.4rem' }}>
                    <h3>{req.requesterName || 'You'}</h3>
                    <span className={`badge badge-${req.adminStatus}`}>{STATUS_LABELS[req.adminStatus]}</span>
                  </div>
                  <p className="request-snippet">{req.projectIdea}</p>
                  <div className="request-meta" style={{ marginTop: '0.6rem' }}>
                    <span>To: {profiles.find(p => p.id === req.creatorId)?.name || req.creatorId}</span>
                    <span>·</span>
                    <span>{new Date(req.submittedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Profile Tab ────────────────────────────────────────────────────────────────

function ProfileTab({ user, onUpdate }: { user: User; onUpdate: (u: User) => void }) {
  const [form, setForm] = useState({
    name: user.name, slug: user.slug, bio: user.bio || '',
    x: user.socials?.x || '', instagram: user.socials?.instagram || '', linkedin: user.socials?.linkedin || '',
    schedulingUrl: user.schedulingUrl || '', schedulingLabel: user.schedulingLabel || 'Book a time',
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm(p => ({ ...p, [k]: e.target.value }));

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.slug) { alert('Name and link are required.'); return; }
    setSaving(true);
    try {
      const res = await fetch('/api/profile', {
        method: 'PATCH', headers: { 'Content-Type': 'application/json' },
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
      <div className="card animate-fade-up" style={{ marginBottom: '1.25rem' }}>
        <h3 style={{ marginBottom: '1.25rem', fontSize: '0.9rem', color: 'var(--fg-secondary)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Basic Info</h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.875rem' }}>
          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label">Your name *</label>
            <input className="form-input" value={form.name} onChange={set('name')} />
          </div>
          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label">Your link *</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: 0, background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 'var(--radius-input)', overflow: 'hidden' }}>
              <span style={{ padding: '0.75rem 0.5rem 0.75rem 0.875rem', fontSize: '0.8rem', color: 'var(--fg-muted)', whiteSpace: 'nowrap', borderRight: '1px solid var(--border)' }}>co11abor8.com/p/</span>
              <input className="form-input" style={{ border: 'none', borderRadius: 0, background: 'transparent', boxShadow: 'none', paddingLeft: '0.75rem' }} value={form.slug} onChange={set('slug')} />
            </div>
          </div>
        </div>
        <div className="form-group" style={{ marginTop: '1rem', marginBottom: 0 }}>
          <label className="form-label">Bio</label>
          <textarea className="form-textarea" value={form.bio} onChange={set('bio')} rows={3} placeholder="A short description of what you do…" style={{ minHeight: 80 }} />
        </div>
      </div>

      <div className="card animate-fade-up stagger-1" style={{ marginBottom: '1.25rem' }}>
        <h3 style={{ marginBottom: '1.25rem', fontSize: '0.9rem', color: 'var(--fg-secondary)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Socials</h3>
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
        <h3 style={{ marginBottom: '1.25rem', fontSize: '0.9rem', color: 'var(--fg-secondary)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Scheduling</h3>
        <p style={{ fontSize: '0.8rem', color: 'var(--fg-muted)', marginBottom: '1rem' }}>
          Add a link to Google Calendar, Calendly, Google Meet, or any scheduling tool. It will appear on your profile.
        </p>
        <div className="form-group" style={{ margin: 0 }}>
          <label className="form-label">Scheduling link</label>
          <input className="form-input" placeholder="https://calendar.app.google.com/… or https://calendly.com/…" value={form.schedulingUrl} onChange={set('schedulingUrl')} />
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

// ─── Notes field ───────────────────────────────────────────────────────────────

function NotesField({ currentNotes, saving, onSave }: { currentNotes: string; saving: boolean; onSave: (n: string) => void }) {
  const [notes, setNotes] = useState(currentNotes);
  const [saved, setSaved] = useState(false);
  const handleSave = () => { onSave(notes); setSaved(true); setTimeout(() => setSaved(false), 2000); };
  return (
    <div>
      <textarea className="form-textarea" value={notes} onChange={e => setNotes(e.target.value)} rows={3} style={{ minHeight: 80, marginBottom: '0.75rem' }} placeholder="Private notes about this request…" />
      <button className="btn btn-sm" onClick={handleSave} disabled={saving}>
        {saving ? 'Saving…' : saved ? 'Saved ✓' : 'Save Note'}
      </button>
    </div>
  );
}
