'use client';
import { useEffect, useState } from 'react';
import { Profile, Request } from '@/lib/types';

const ADMIN_PASSWORD = 'collab2026';

export default function DashboardPage() {
  const [authed, setAuthed] = useState(false);
  const [password, setPassword] = useState('');
  const [tab, setTab] = useState<'profiles' | 'requests'>('profiles');
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [requests, setRequests] = useState<Request[]>([]);
  const [loading, setLoading] = useState(false);

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
    if (password === ADMIN_PASSWORD) setAuthed(true);
    else alert('Incorrect password');
  };

  if (!authed) {
    return (
      <div style={{ maxWidth: 360, margin: '4rem auto', textAlign: 'center' }}>
        <h1>co11ab</h1>
        <p className="subtitle">Enter password to access dashboard</p>
        <form onSubmit={login}>
          <div className="form-group">
            <input type="password" className="form-input" placeholder="Password"
              value={password} onChange={e => setPassword(e.target.value)} autoFocus />
          </div>
          <button type="submit" className="btn" style={{ width: '100%' }}>Sign In</button>
        </form>
      </div>
    );
  }

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
        <div>
          <h1>Dashboard</h1>
          <p className="subtitle">Manage profiles and requests</p>
        </div>
        <button className="btn btn-outline btn-sm" onClick={() => setAuthed(false)}>Sign Out</button>
      </div>

      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' }}>
        <button className={`btn btn-sm ${tab === 'profiles' ? '' : 'btn-outline'}`} onClick={() => setTab('profiles')}>
          Profiles ({profiles.length})
        </button>
        <button className={`btn btn-sm ${tab === 'requests' ? '' : 'btn-outline'}`} onClick={() => setTab('requests')}>
          Requests ({requests.length})
        </button>
      </div>

      {loading ? (
        <div className="empty-state">Loading...</div>
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

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm(p => ({ ...p, [k]: e.target.value }));

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.slug || !form.name) { alert('Slug and name required'); return; }
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
      if (res.status === 409) { alert('Slug already taken'); return; }
      if (!res.ok) { alert('Failed to create profile'); return; }
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
    if (!confirm('Delete this profile?')) return;
    await fetch(`/api/profiles/${id}`, { method: 'DELETE' });
    onUpdate();
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <p style={{ color: 'var(--muted)', fontSize: '0.85rem' }}>{profiles.length} profile{profiles.length !== 1 ? 's' : ''}</p>
        <button className="btn btn-sm" onClick={() => setCreating(!creating)}>
          {creating ? 'Cancel' : '+ New Profile'}
        </button>
      </div>

      {creating && (
        <form onSubmit={handleCreate} className="card" style={{ marginBottom: '1rem', border: '2px solid var(--accent)' }}>
          <h2 style={{ fontSize: '1rem', marginBottom: '1rem' }}>Create Profile</h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Slug * <span style={{ fontWeight: 400 }}>(URL: /p/slug)</span></label>
              <input className="form-input" placeholder="yourname" value={form.slug} onChange={set('slug')} />
            </div>
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Name *</label>
              <input className="form-input" placeholder="Your Name" value={form.name} onChange={set('name')} />
            </div>
          </div>
          <div className="form-group" style={{ margin: '0.75rem 0' }}>
            <label className="form-label">Tagline</label>
            <input className="form-input" placeholder="One-liner about you" value={form.tagline} onChange={set('tagline')} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.75rem' }}>
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">X (Twitter) URL</label>
              <input className="form-input" placeholder="https://x.com/..." value={form.x} onChange={set('x')} />
            </div>
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Instagram URL</label>
              <input className="form-input" placeholder="https://instagram.com/..." value={form.instagram} onChange={set('instagram')} />
            </div>
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">LinkedIn URL</label>
              <input className="form-input" placeholder="https://linkedin.com/in/..." value={form.linkedin} onChange={set('linkedin')} />
            </div>
          </div>
          <div style={{ marginTop: '0.75rem' }}>
            <label className="form-label">Strengths</label>
            <textarea className="form-textarea" placeholder="What you're great at..." value={form.strengths} onChange={set('strengths')} rows={2} />
          </div>
          <div style={{ marginTop: '0.75rem' }}>
            <label className="form-label">Thought Patterns</label>
            <textarea className="form-textarea" placeholder="How you think and process..." value={form.thoughtPatterns} onChange={set('thoughtPatterns')} rows={2} />
          </div>
          <div style={{ marginTop: '0.75rem' }}>
            <label className="form-label">Passions</label>
            <textarea className="form-textarea" placeholder="What you're obsessed with..." value={form.passions} onChange={set('passions')} rows={2} />
          </div>
          <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
            <button type="submit" className="btn" disabled={saving}>{saving ? 'Saving...' : 'Create Profile'}</button>
          </div>
        </form>
      )}

      {profiles.length === 0 && !creating ? (
        <div className="empty-state">No profiles yet. Create one to get a shareable link.</div>
      ) : profiles.map(p => (
        <div key={p.id} className="request-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <h3 style={{ margin: 0 }}>{p.name}</h3>
                <span className={`badge ${p.public ? 'badge-approved' : 'badge-declined'}`}>
                  {p.public ? 'Public' : 'Private'}
                </span>
              </div>
              <div className="request-meta">
                <span>co11ab.com/p/{p.slug}</span>
              </div>
              {p.tagline && <p style={{ fontSize: '0.85rem', color: 'var(--muted)', marginTop: '0.3rem' }}>{p.tagline}</p>}
            </div>
            <div style={{ display: 'flex', gap: '0.4rem', flexShrink: 0 }}>
              <a href={`/dashboard/profile/${p.id}`} className="btn btn-sm btn-outline">Edit</a>
              <button className="btn btn-sm btn-outline" onClick={() => togglePublic(p)}>
                {p.public ? 'Make Private' : 'Make Public'}
              </button>
              <button className="btn btn-sm btn-outline" style={{ color: 'var(--status-declined)', borderColor: 'var(--status-declined)' }} onClick={() => deleteProfile(p.id)}>Delete</button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Requests Tab ──────────────────────────────────────────────────────────────

const STATUS_OPTIONS = ['open', 'in_review', 'approved', 'complete', 'declined'];
const STATUS_LABELS: Record<string, string> = {
  open: 'Open', in_review: 'In Review', approved: 'Approved',
  complete: 'Complete', declined: 'Declined',
};
const WORK_STATUS_LABELS: Record<string, string> = {
  just_starting: 'Just starting', in_progress: 'In progress',
  near_completion: 'Near completion', stuck: 'Stuck', other: 'Other',
};

function RequestsTab({ requests, onUpdate }: { requests: Request[]; onUpdate: () => void }) {
  const [expanded, setExpanded] = useState<string | null>(null);

  const updateStatus = async (id: string, adminStatus: string) => {
    await fetch(`/api/requests/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ adminStatus, reviewedAt: new Date().toISOString() }),
    });
    onUpdate();
  };

  const addNotes = async (id: string, notes: string) => {
    await fetch(`/api/requests/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ notes }),
    });
    onUpdate();
  };

  return (
    <div>
      <p style={{ color: 'var(--muted)', fontSize: '0.85rem', marginBottom: '1rem' }}>{requests.length} request{requests.length !== 1 ? 's' : ''}</p>
      {requests.length === 0 ? (
        <div className="empty-state">No requests yet</div>
      ) : requests.map(req => (
        <div key={req.id} className="request-card">
          <div style={{ cursor: 'pointer' }} onClick={() => setExpanded(expanded === req.id ? null : req.id)}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <h3 style={{ margin: 0 }}>{req.name}</h3>
                <div className="request-meta">
                  <span className={`badge badge-${req.adminStatus}`}>{STATUS_LABELS[req.adminStatus]}</span>
                  <span>{req.submissionType}</span>
                  <span>{WORK_STATUS_LABELS[req.status]}</span>
                  <span>{new Date(req.submittedAt).toLocaleDateString()}</span>
                </div>
              </div>
              <div style={{ color: 'var(--muted)', fontSize: '1.1rem' }}>{expanded === req.id ? '▲' : '▼'}</div>
            </div>
            <p className="request-snippet">{req.projectIdea}</p>
          </div>

          {expanded === req.id && (
            <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--border)' }}>
              <div className="detail-row"><span className="detail-label">Contact</span><span>{req.contact}</span></div>
              <div className="detail-row"><span className="detail-label">Help needed</span><span>{req.helpNeeded}</span></div>
              <div className="detail-row"><span className="detail-label">Vision</span><span>{req.vision || '—'}</span></div>
              {req.notes && <div className="detail-row"><span className="detail-label">Notes</span><span>{req.notes}</span></div>}

              <div style={{ marginTop: '1rem' }}>
                <div className="form-label" style={{ marginBottom: '0.5rem' }}>Update Status</div>
                <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                  {STATUS_OPTIONS.map(s => (
                    <button key={s} className={`btn btn-sm ${req.adminStatus === s ? '' : 'btn-outline'}`}
                      onClick={() => updateStatus(req.id, s)}>
                      {STATUS_LABELS[s]}
                    </button>
                  ))}
                </div>
              </div>

              <div style={{ marginTop: '1rem' }}>
                <NotesForm currentNotes={req.notes || ''} onSave={(notes) => addNotes(req.id, notes)} />
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

function NotesForm({ currentNotes, onSave }: { currentNotes: string; onSave: (n: string) => void }) {
  const [notes, setNotes] = useState(currentNotes);
  return (
    <div style={{ display: 'flex', gap: '0.5rem' }}>
      <input className="form-input" placeholder="Add a note..." value={notes}
        onChange={e => setNotes(e.target.value)} style={{ flex: 1 }} />
      <button className="btn btn-sm" onClick={() => onSave(notes)}>Save</button>
    </div>
  );
}
