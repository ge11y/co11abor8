'use client';
import { useEffect, useState } from 'react';
import { Request, TimeSlot } from '@/lib/types';

const ADMIN_PASSWORD = 'collab2026'; // Change this

const STATUS_OPTIONS = ['open', 'in_review', 'approved', 'complete', 'declined'];
const STATUS_LABELS: Record<string, string> = {
  open: 'Open', in_review: 'In Review', approved: 'Approved',
  complete: 'Complete', declined: 'Declined',
};
const WORK_STATUS_LABELS: Record<string, string> = {
  just_starting: 'Just starting', in_progress: 'In progress',
  near_completion: 'Near completion', stuck: 'Stuck', other: 'Other',
};

export default function AdminPage() {
  const [authed, setAuthed] = useState(false);
  const [password, setPassword] = useState('');
  const [requests, setRequests] = useState<Request[]>([]);
  const [slots, setSlots] = useState<TimeSlot[]>([]);
  const [tab, setTab] = useState<'requests' | 'slots'>('requests');
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [newSlot, setNewSlot] = useState({ date: '', startHour: '9', endHour: '10' });

  const load = () => {
    setLoading(true);
    Promise.all([
      fetch('/api/requests').then(r => r.json()),
      fetch('/api/schedule').then(r => r.json()),
    ]).then(([reqs, slts]) => {
      setRequests(reqs);
      setSlots(slts);
      setLoading(false);
    });
  };

  const login = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === ADMIN_PASSWORD) setAuthed(true);
    else alert('Incorrect password');
  };

  const updateStatus = async (id: string, adminStatus: string) => {
    await fetch(`/api/requests/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ adminStatus, reviewedAt: new Date().toISOString() }),
    });
    load();
  };

  const addNotes = async (id: string, notes: string) => {
    await fetch(`/api/requests/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ notes }),
    });
    setExpanded(null);
    load();
  };

  const createSlot = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSlot.date) return;
    const startTime = new Date(`${newSlot.date}T${newSlot.startHour}:00`).toISOString();
    const endTime = new Date(`${newSlot.date}T${newSlot.endHour}:00`).toISOString();
    await fetch('/api/schedule', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ startTime, endTime, available: true }),
    });
    setNewSlot({ date: '', startHour: '9', endHour: '10' });
    load();
  };

  const toggleSlot = async (slot: TimeSlot) => {
    await fetch(`/api/schedule/${slot.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ available: !slot.available, bookedBy: slot.available ? undefined : slot.bookedBy }),
    });
    load();
  };

  const deleteSlot = async (id: string) => {
    await fetch(`/api/schedule/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ available: false, bookedBy: undefined }),
    });
    load();
  };

  if (!authed) {
    return (
      <div style={{ maxWidth: 360, margin: '4rem auto', textAlign: 'center' }}>
        <h1>Admin</h1>
        <p className="subtitle">Enter password to continue</p>
        <form onSubmit={login}>
          <div className="form-group">
            <input
              type="password"
              className="form-input"
              placeholder="Password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              autoFocus
            />
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
          <h1>Admin</h1>
          <p className="subtitle">Manage requests and time slots</p>
        </div>
        <button className="btn btn-outline btn-sm" onClick={() => setAuthed(false)}>Sign Out</button>
      </div>

      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' }}>
        <button className={`btn btn-sm ${tab === 'requests' ? '' : 'btn-outline'}`} onClick={() => setTab('requests')}>
          Requests ({requests.length})
        </button>
        <button className={`btn btn-sm ${tab === 'slots' ? '' : 'btn-outline'}`} onClick={() => setTab('slots')}>
          Time Slots ({slots.length})
        </button>
      </div>

      {loading ? (
        <div className="empty-state">Loading...</div>
      ) : tab === 'requests' ? (
        <>
          <div style={{ marginBottom: '1rem', fontSize: '0.85rem', color: 'var(--muted)' }}>
            {requests.length} total requests
          </div>
          {requests.length === 0 ? (
            <div className="empty-state">No requests yet</div>
          ) : requests.map(req => (
            <div key={req.id} className="request-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', cursor: 'pointer' }} onClick={() => setExpanded(expanded === req.id ? null : req.id)}>
                <div>
                  <h3>{req.name}</h3>
                  <div className="request-meta">
                    <span className={`badge badge-${req.adminStatus}`}>{STATUS_LABELS[req.adminStatus]}</span>
                    <span>{req.submissionType}</span>
                    <span>{WORK_STATUS_LABELS[req.status]}</span>
                    <span>{new Date(req.submittedAt).toLocaleDateString()}</span>
                  </div>
                  <p className="request-snippet" style={{ marginTop: '0.4rem' }}>{req.projectIdea}</p>
                </div>
                <div style={{ color: 'var(--muted)', fontSize: '1.1rem', marginLeft: '1rem', flexShrink: 0 }}>{expanded === req.id ? '▲' : '▼'}</div>
              </div>

              {expanded === req.id && (
                <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--border)' }}>
                  <div className="detail-row"><span className="detail-label">Contact</span><span>{req.contact}</span></div>
                  <div className="detail-row"><span className="detail-label">Help needed</span><span>{req.helpNeeded}</span></div>
                  <div className="detail-row"><span className="detail-label">Vision</span><span>{req.vision || '—'}</span></div>
                  {req.timeSlot && <div className="detail-row"><span className="detail-label">Requested slot</span><span>{new Date(req.timeSlot).toLocaleString()}</span></div>}
                  {req.notes && <div className="detail-row"><span className="detail-label">Notes</span><span>{req.notes}</span></div>}

                  <div style={{ marginTop: '1rem' }}>
                    <div className="form-label" style={{ marginBottom: '0.5rem' }}>Update Status</div>
                    <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                      {STATUS_OPTIONS.map(s => (
                        <button
                          key={s}
                          className={`btn btn-sm ${req.adminStatus === s ? '' : 'btn-outline'}`}
                          onClick={() => updateStatus(req.id, s)}
                        >
                          {STATUS_LABELS[s]}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div style={{ marginTop: '1rem' }}>
                    <AddNotesForm
                      currentNotes={req.notes || ''}
                      onSave={(notes) => addNotes(req.id, notes)}
                    />
                  </div>
                </div>
              )}
            </div>
          ))}
        </>
      ) : (
        <>
          <div className="card" style={{ marginBottom: '1.5rem' }}>
            <h2 style={{ fontSize: '1rem', marginBottom: '1rem' }}>Add Time Slot</h2>
            <form onSubmit={createSlot} style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'flex-end' }}>
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Date</label>
                <input type="date" className="form-input" value={newSlot.date} onChange={e => setNewSlot(p => ({ ...p, date: e.target.value }))} style={{ width: 'auto' }} />
              </div>
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Start</label>
                <select className="form-select" value={newSlot.startHour} onChange={e => setNewSlot(p => ({ ...p, startHour: e.target.value }))} style={{ width: 'auto' }}>
                  {Array.from({ length: 14 }, (_, i) => i + 8).map(h => (
                    <option key={h} value={String(h).padStart(2, '0')}>{h}:00</option>
                  ))}
                </select>
              </div>
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">End</label>
                <select className="form-select" value={newSlot.endHour} onChange={e => setNewSlot(p => ({ ...p, endHour: e.target.value }))} style={{ width: 'auto' }}>
                  {Array.from({ length: 14 }, (_, i) => i + 8).map(h => (
                    <option key={h} value={String(h).padStart(2, '0')}>{h}:00</option>
                  ))}
                </select>
              </div>
              <button type="submit" className="btn">Add Slot</button>
            </form>
          </div>

          <div style={{ fontSize: '0.85rem', color: 'var(--muted)', marginBottom: '1rem' }}>
            {slots.length} slots total
          </div>
          {slots.length === 0 ? (
            <div className="empty-state">No slots yet</div>
          ) : slots.sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime()).map(slot => (
            <div key={slot.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.8rem 0', borderBottom: '1px solid var(--border)' }}>
              <div>
                <div style={{ fontWeight: 600 }}>
                  {new Date(slot.startTime).toLocaleString('en-US', { weekday: 'short', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}
                  {' – '}
                  {new Date(slot.endTime).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
                </div>
                <div style={{ fontSize: '0.78rem', color: 'var(--muted)' }}>
                  {slot.available ? 'Available' : slot.bookedBy ? `Booked` : 'Blocked'}
                </div>
              </div>
              <div style={{ display: 'flex', gap: '0.4rem' }}>
                <button className={`btn btn-sm ${slot.available ? 'btn-outline' : ''}`} onClick={() => toggleSlot(slot)}>
                  {slot.available ? 'Block' : 'Unblock'}
                </button>
                <button className="btn btn-sm btn-outline" style={{ color: 'var(--status-declined)', borderColor: 'var(--status-declined)' }} onClick={() => deleteSlot(slot.id)}>
                  Delete
                </button>
              </div>
            </div>
          ))}
        </>
      )}

      <div style={{ marginTop: '2rem', padding: '1rem', background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 8, fontSize: '0.8rem', color: 'var(--muted)' }}>
        <strong>Admin password:</strong> collab2026 — change this in <code>src/app/admin/page.tsx</code>
      </div>
    </div>
  );
}

function AddNotesForm({ currentNotes, onSave }: { currentNotes: string; onSave: (n: string) => void }) {
  const [notes, setNotes] = useState(currentNotes);
  return (
    <div style={{ display: 'flex', gap: '0.5rem' }}>
      <input
        className="form-input"
        placeholder="Add a note..."
        value={notes}
        onChange={e => setNotes(e.target.value)}
        style={{ flex: 1 }}
      />
      <button className="btn btn-sm" onClick={() => onSave(notes)}>Save</button>
    </div>
  );
}
