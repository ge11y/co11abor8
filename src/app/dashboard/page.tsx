'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Profile, Request } from '@/lib/types';

const ADMIN_PASSWORD = 'collab2026';

// ─── Status config ─────────────────────────────────────────────────────────────

const STATUS_OPTIONS = ['open', 'in_review', 'approved', 'complete', 'declined'];
const STATUS_LABELS: Record<string, string> = {
  open: 'Open', in_review: 'In Review', approved: 'Approved',
  complete: 'Complete', declined: 'Declined',
};
const WORK_STATUS_LABELS: Record<string, string> = {
  just_starting: 'Just starting', in_progress: 'In progress',
  near_completion: 'Near completion', stuck: 'Stuck', other: 'Other',
};

// ─── Dashboard shell ────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const router = useRouter();
  const [authed, setAuthed] = useState(false);
  const [password, setPassword] = useState('');
  const [tab, setTab] = useState<'profiles' | 'requests'>('profiles');
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [requests, setRequests] = useState<Request[]>([]);
  const [loading, setLoading] = useState(false);
  const [loginError, setLoginError] = useState('');

  const load = () => {
    setLoading(true);
    Promise.all([
      fetch('/api/profiles').then(r => r.json()),
      fetch('/api/requests').then(r => r.json()),
    ]).then(([p, r]) => {
      setProfiles(p);
      setRequests(r);
      setLoading(false);
    });
  };

  useEffect(() => { if (authed) load(); }, [authed]);

  const login = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === ADMIN_PASSWORD) {
      setAuthed(true);
      setLoginError('');
    } else {
      setLoginError('Incorrect password.');
    }
  };

  if (!authed) {
    return (
      <div style={{ maxWidth: 400, margin: '0 auto', paddingTop: 'clamp(4rem, 10vh, 8rem)' }}>
        <div className="card card-glow animate-fade-up" style={{ padding: 'clamp(2rem, 5vw, 3rem)' }}>
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <div style={{ fontSize: '2rem', marginBottom: '0.75rem' }}>◈</div>
            <h1 style={{ fontSize: '1.5rem', marginBottom: '0.4rem' }}>Dashboard</h1>
            <p style={{ color: 'var(--fg-muted)', fontSize: '0.875rem', margin: 0 }}>Enter your password to continue</p>
          </div>
          <form onSubmit={login}>
            <div className="form-group" style={{ margin: 0 }}>
              <input
                type="password"
                className="form-input"
                placeholder="Password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                autoFocus
                style={{ textAlign: 'center' }}
              />
            </div>
            {loginError && <p style={{ color: 'var(--status-declined)', fontSize: '0.8rem', textAlign: 'center', marginTop: '0.75rem' }}>{loginError}</p>}
            <button type="submit" className="btn" style={{ width: '100%', marginTop: '1rem', justifyContent: 'center' }}>
              Sign In
            </button>
          </form>
        </div>
      </div>
    );
  }

  const openCount = requests.filter(r => r.adminStatus === 'open').length;
  const reviewCount = requests.filter(r => r.adminStatus === 'in_review').length;

  return (
    <div>
      {/* ── Top bar ────────────────────────────────────────────── */}
      <div className="animate-fade-up" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', marginBottom: '0.2rem' }}>Dashboard</h1>
          <p style={{ color: 'var(--fg-muted)', fontSize: '0.8rem', margin: 0 }}>{profiles.length} profiles · {requests.length} requests</p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <a href="/" className="btn btn-outline btn-sm">← Back to site</a>
          <button className="btn btn-ghost btn-sm" onClick={() => setAuthed(false)}>Sign out</button>
        </div>
      </div>

      {/* ── Quick stats ───────────────────────────────────────── */}
      <div className="animate-fade-up stagger-1" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '0.875rem', marginBottom: '2rem' }}>
        <div className="stat-card" style={{ padding: '1.25rem 1.5rem' }}>
          <div className="stat-number" style={{ color: 'var(--accent)' }}>{profiles.length}</div>
          <div className="stat-label">Profiles</div>
        </div>
        <div className="stat-card" style={{ padding: '1.25rem 1.5rem' }}>
          <div className="stat-number" style={{ color: 'var(--status-open)' }}>{openCount}</div>
          <div className="stat-label">Open</div>
        </div>
        <div className="stat-card" style={{ padding: '1.25rem 1.5rem' }}>
          <div className="stat-number" style={{ color: 'var(--status-review)' }}>{reviewCount}</div>
          <div className="stat-label">In Review</div>
        </div>
        <div className="stat-card" style={{ padding: '1.25rem 1.5rem' }}>
          <div className="stat-number">{requests.length}</div>
          <div className="stat-label">Total Requests</div>
        </div>
      </div>

      {/* ── Tabs ──────────────────────────────────────────────── */}
      <div className="animate-fade-up stagger-2" style={{ marginBottom: '1.75rem' }}>
        <div className="tabs">
          <button className={`tab-btn ${tab === 'profiles' ? 'active' : ''}`} onClick={() => setTab('profiles')}>
            Profiles
          </button>
          <button className={`tab-btn ${tab === 'requests' ? 'active' : ''}`} onClick={() => setTab('requests')}>
            Requests
          </button>
        </div>
      </div>

      {loading ? (
        <div className="empty-state">Loading…</div>
      ) : tab === 'profiles' ? (
        <ProfilesTab profiles={profiles} onUpdate={load} />
      ) : (
        <RequestsTab requests={requests} onUpdate={load} />
      )}
    </div>
  );
}

// ─── Profiles Tab ──────────────────────────────────────────────────────────────

function ProfilesTab({ profiles, onUpdate }: { profiles: Profile[]; onUpdate: () => void }) {
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({
    slug: '', name: '', tagline: '',
    x: '', instagram: '', linkedin: '',
    strengths: '', thoughtPatterns: '', passions: '',
  });
  const [saving, setSaving] = useState(false);
  const [createdId, setCreatedId] = useState<string | null>(null);

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm(p => ({ ...p, [k]: e.target.value }));

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.slug || !form.name) { alert('Slug and name are required.'); return; }
    setSaving(true);
    try {
      const res = await fetch('/api/profiles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          slug: form.slug,
          name: form.name,
          tagline: form.tagline,
          socials: { x: form.x, instagram: form.instagram, linkedin: form.linkedin },
          strengths: form.strengths,
          thoughtPatterns: form.thoughtPatterns,
          passions: form.passions,
        }),
      });
      if (res.status === 409) { alert('That slug is already taken.'); return; }
      if (!res.ok) { alert('Failed to create profile.'); return; }
      const p = await res.json();
      setCreatedId(p.id);
      setCreating(false);
      setForm({ slug: '', name: '', tagline: '', x: '', instagram: '', linkedin: '', strengths: '', thoughtPatterns: '', passions: '' });
      onUpdate();
    } finally {
      setSaving(false);
    }
  };

  const togglePublic = async (profile: Profile) => {
    await fetch(`/api/profiles/${profile.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ public: !profile.public }),
    });
    onUpdate();
  };

  const deleteProfile = async (id: string) => {
    if (!confirm('Delete this profile? This cannot be undone.')) return;
    await fetch(`/api/profiles/${id}`, { method: 'DELETE' });
    onUpdate();
  };

  return (
    <div>
      <div className="section-header">
        <p style={{ color: 'var(--fg-muted)', fontSize: '0.85rem', margin: 0 }}>
          {profiles.length} profile{profiles.length !== 1 ? 's' : ''}
        </p>
        <button className="btn btn-sm" onClick={() => setCreating(!creating)}>
          {creating ? 'Cancel' : '+ New Profile'}
        </button>
      </div>

      {creating && (
        <form onSubmit={handleCreate} className="card card-glow animate-fade-up" style={{ marginBottom: '1.5rem', border: '1px solid rgba(139,124,246,0.2)' }}>
          <h3 style={{ marginBottom: '1.5rem', fontSize: '0.9rem', color: 'var(--fg-secondary)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>New Profile</h3>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Slug * <span style={{ color: 'var(--fg-faint)', fontWeight: 400 }}>URL: co11abor8.com/p/slug</span></label>
              <input className="form-input" placeholder="yourname" value={form.slug} onChange={set('slug')} />
            </div>
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Name *</label>
              <input className="form-input" placeholder="Your Name" value={form.name} onChange={set('name')} />
            </div>
          </div>

          <div className="form-group" style={{ marginTop: '1rem', marginBottom: 0 }}>
            <label className="form-label">Tagline</label>
            <input className="form-input" placeholder="One-liner about what you do" value={form.tagline} onChange={set('tagline')} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.875rem', marginTop: '1rem' }}>
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

          <div style={{ marginTop: '1rem' }}>
            <label className="form-label">Strengths</label>
            <textarea className="form-textarea" placeholder="What you're great at…" value={form.strengths} onChange={set('strengths')} rows={2} style={{ minHeight: 80 }} />
          </div>
          <div style={{ marginTop: '1rem' }}>
            <label className="form-label">Thought Patterns</label>
            <textarea className="form-textarea" placeholder="How you think and process…" value={form.thoughtPatterns} onChange={set('thoughtPatterns')} rows={2} style={{ minHeight: 80 }} />
          </div>
          <div style={{ marginTop: '1rem' }}>
            <label className="form-label">Passions</label>
            <textarea className="form-textarea" placeholder="What you're obsessed with…" value={form.passions} onChange={set('passions')} rows={2} style={{ minHeight: 80 }} />
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem' }}>
            <button type="submit" className="btn" disabled={saving}>{saving ? 'Creating…' : 'Create Profile'}</button>
            <button type="button" className="btn btn-outline" onClick={() => setCreating(false)}>Cancel</button>
          </div>
        </form>
      )}

      {profiles.length === 0 && !creating ? (
        <div className="card" style={{ textAlign: 'center', padding: '3.5rem 2rem' }}>
          <span className="empty-state-icon">◎</span>
          <p style={{ color: 'var(--fg-secondary)', marginBottom: '1.5rem' }}>No profiles yet. Create one to get a shareable link.</p>
          <button className="btn" onClick={() => setCreating(true)}>+ Create first profile</button>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: '0.875rem' }}>
          {profiles.map(p => (
            <div key={p.id} className="request-card" style={{ cursor: 'default' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem' }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem', flexWrap: 'wrap', marginBottom: '0.4rem' }}>
                    <h3 style={{ margin: 0 }}>{p.name}</h3>
                    <span className={`badge ${p.public ? 'badge-open' : 'badge-declined'}`}>
                      {p.public ? 'Public' : 'Private'}
                    </span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--fg-muted)' }}>
                      co11abor8.com/p/{p.slug}
                    </span>
                  </div>
                  {p.tagline && (
                    <p style={{ fontSize: '0.875rem', color: 'var(--fg-muted)', margin: '0.3rem 0 0' }}>{p.tagline}</p>
                  )}
                </div>
                <div style={{ display: 'flex', gap: '0.5rem', flexShrink: 0 }}>
                  <a href={`/p/${p.slug}`} target="_blank" rel="noopener" className="btn btn-outline btn-sm">View</a>
                  <a href={`/dashboard/profile/${p.id}`} className="btn btn-outline btn-sm">Edit</a>
                  <button className="btn btn-outline btn-sm" onClick={() => togglePublic(p)}>
                    {p.public ? 'Make Private' : 'Make Public'}
                  </button>
                  <button
                    className="btn btn-outline btn-sm"
                    style={{ color: 'var(--status-declined)', borderColor: 'rgba(248,113,113,0.3)' }}
                    onClick={() => deleteProfile(p.id)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Requests Tab ──────────────────────────────────────────────────────────────

function RequestsTab({ requests, onUpdate }: { requests: Request[]; onUpdate: () => void }) {
  const [expanded, setExpanded] = useState<string | null>(null);
  const [savingNotes, setSavingNotes] = useState<string | null>(null);

  const updateStatus = async (id: string, adminStatus: string) => {
    await fetch(`/api/requests/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ adminStatus, reviewedAt: new Date().toISOString() }),
    });
    onUpdate();
  };

  const saveNotes = async (id: string, notes: string) => {
    setSavingNotes(id);
    await fetch(`/api/requests/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ notes }),
    });
    setSavingNotes(null);
    onUpdate();
  };

  return (
    <div>
      <p style={{ color: 'var(--fg-muted)', fontSize: '0.85rem', marginBottom: '1.25rem' }}>
        {requests.length} request{requests.length !== 1 ? 's' : ''}
      </p>

      {requests.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '3.5rem 2rem' }}>
          <span className="empty-state-icon">◎</span>
          <p style={{ color: 'var(--fg-secondary)', marginBottom: '1.5rem' }}>No requests yet.</p>
          <a href="/submit" className="btn">View submit page</a>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: '0.875rem' }}>
          {requests.map(req => (
            <div key={req.id} className="request-card">
              {/* Click header */}
              <div
                style={{ cursor: 'pointer' }}
                onClick={() => setExpanded(expanded === req.id ? null : req.id)}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem' }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem', flexWrap: 'wrap', marginBottom: '0.4rem' }}>
                      <h3 style={{ margin: 0 }}>{req.name}</h3>
                      <span className={`badge badge-${req.adminStatus}`}>{STATUS_LABELS[req.adminStatus]}</span>
                      <span style={{ fontSize: '0.7rem', fontWeight: 600, padding: '0.2rem 0.6rem', borderRadius: 'var(--radius-badge)', background: 'var(--surface-2)', color: 'var(--fg-muted)', border: '1px solid var(--border)' }}>
                        {req.submissionType?.replace('_', ' ')}
                      </span>
                    </div>
                    <p className="request-snippet">{req.projectIdea}</p>
                    <div className="request-meta" style={{ marginTop: '0.6rem' }}>
                      <span>{req.contact}</span>
                      <span>·</span>
                      <span>{WORK_STATUS_LABELS[req.status]}</span>
                      <span>·</span>
                      <span>{new Date(req.submittedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                    </div>
                  </div>
                  <div style={{
                    width: 26, height: 26, borderRadius: '50%', background: 'var(--surface-2)',
                    border: '1px solid var(--border)', display: 'flex', alignItems: 'center',
                    justifyContent: 'center', fontSize: '0.65rem', color: 'var(--fg-muted)',
                    flexShrink: 0, transition: 'transform var(--t-mid)',
                    transform: expanded === req.id ? 'rotate(180deg)' : 'none',
                  }}>
                    ↓
                  </div>
                </div>
              </div>

              {/* Expanded body */}
              {expanded === req.id && (
                <div style={{ marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '1px solid var(--border)' }}>
                  <div className="detail-row">
                    <span className="detail-label">Contact</span>
                    <span>{req.contact}</span>
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

                  {/* Status update */}
                  <div style={{ marginTop: '1.5rem' }}>
                    <p style={{ fontSize: '0.78rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--fg-muted)', marginBottom: '0.75rem' }}>Update Status</p>
                    <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                      {STATUS_OPTIONS.map(s => (
                        <button
                          key={s}
                          className={`btn btn-sm ${req.adminStatus === s ? '' : 'btn-outline'}`}
                          onClick={() => updateStatus(req.id, s)}
                          style={req.adminStatus === s ? {} : {}}
                        >
                          {STATUS_LABELS[s]}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Notes */}
                  <div style={{ marginTop: '1.25rem' }}>
                    <p style={{ fontSize: '0.78rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--fg-muted)', marginBottom: '0.6rem' }}>Add Note</p>
                    <NotesField currentNotes={req.notes || ''} saving={savingNotes === req.id} onSave={(notes) => saveNotes(req.id, notes)} />
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function NotesField({ currentNotes, saving, onSave }: { currentNotes: string; saving: boolean; onSave: (n: string) => void }) {
  const [notes, setNotes] = useState(currentNotes);
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    onSave(notes);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div>
      <textarea
        className="form-textarea"
        placeholder="Add a private note about this request…"
        value={notes}
        onChange={e => setNotes(e.target.value)}
        rows={3}
        style={{ minHeight: 90, marginBottom: '0.75rem' }}
      />
      <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
        <button className="btn btn-sm" onClick={handleSave} disabled={saving}>
          {saving ? 'Saving…' : saved ? 'Saved ✓' : 'Save Note'}
        </button>
        {saved && <span style={{ fontSize: '0.8rem', color: 'var(--status-open)' }}>Changes saved.</span>}
      </div>
    </div>
  );
}
