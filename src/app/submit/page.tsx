'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

const SUBMISSION_TYPES = [
  { value: 'collaboration', label: 'Collaboration' },
  { value: 'project_idea', label: 'Project Idea' },
  { value: 'status_update', label: 'Status Update' },
  { value: 'general', label: 'General' },
];

const WORK_STATUSES = [
  { value: 'just_starting', label: 'Just starting' },
  { value: 'in_progress', label: 'In progress' },
  { value: 'near_completion', label: 'Near completion' },
  { value: 'stuck', label: 'Stuck' },
  { value: 'other', label: 'Other' },
];

export default function SubmitPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    name: '', contact: '', projectIdea: '',
    status: 'in_progress', helpNeeded: '', vision: '',
    submissionType: 'collaboration', profileSlug: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm(prev => ({ ...prev, [k]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.contact.trim() || !form.projectIdea.trim() || !form.helpNeeded.trim()) {
      setError('Please fill in all required fields.');
      return;
    }
    setError('');
    setSubmitting(true);
    try {
      const res = await fetch('/api/requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error();
      setSuccess(true);
      setTimeout(() => router.push('/'), 2000);
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ maxWidth: 760, margin: '0 auto' }}>
      <div className="page-header animate-fade-up">
        <h1>Submit a Request</h1>
        <p className="subtitle">Tell us what you're working on and what you need.</p>
      </div>

      <form onSubmit={handleSubmit} className="animate-fade-up stagger-1">

        {/* ── Identity ── */}
        <div className="card" style={{ marginBottom: '1.25rem' }}>
          <h3 style={{ marginBottom: '1.25rem', fontSize: '0.95rem', color: 'var(--fg-secondary)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Who you are</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Name <span>*</span></label>
              <input className="form-input" placeholder="Your name" value={form.name} onChange={set('name')} />
            </div>
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Contact <span>*</span></label>
              <input className="form-input" placeholder="@handle or email" value={form.contact} onChange={set('contact')} />
            </div>
          </div>
          {form.profileSlug && (
            <p style={{ fontSize: '0.8rem', color: 'var(--fg-muted)', marginTop: '0.75rem' }}>
              Linked to: <a href={`/p/${form.profileSlug}`} target="_blank" rel="noopener" style={{ color: 'var(--accent)' }}>co11abor8.com/p/{form.profileSlug}</a>
            </p>
          )}
        </div>

        {/* ── Request type ── */}
        <div className="card" style={{ marginBottom: '1.25rem' }}>
          <h3 style={{ marginBottom: '1.25rem', fontSize: '0.95rem', color: 'var(--fg-secondary)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Request type</h3>
          <div className="radio-group">
            {SUBMISSION_TYPES.map(t => (
              <label key={t.value} className="radio-label">
                <input type="radio" name="submissionType" value={t.value}
                  checked={form.submissionType === t.value} onChange={set('submissionType')} />
                {t.label}
              </label>
            ))}
          </div>
        </div>

        {/* ── Project ── */}
        <div className="card" style={{ marginBottom: '1.25rem' }}>
          <h3 style={{ marginBottom: '1.25rem', fontSize: '0.95rem', color: 'var(--fg-secondary)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Your project</h3>

          <div className="form-group">
            <label className="form-label">What are you working on? <span>*</span></label>
            <textarea className="form-textarea"
              placeholder="Describe your project or idea — the more context you give, the better we can help."
              value={form.projectIdea} onChange={set('projectIdea')} rows={4} />
          </div>

          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label">Current status</label>
            <select className="form-select" value={form.status} onChange={set('status')}>
              {WORK_STATUSES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
            </select>
          </div>
        </div>

        {/* ── What you need ── */}
        <div className="card" style={{ marginBottom: '1.25rem' }}>
          <h3 style={{ marginBottom: '1.25rem', fontSize: '0.95rem', color: 'var(--fg-secondary)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>What you need</h3>

          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label">What do you need? <span>*</span></label>
            <textarea className="form-textarea"
              placeholder="What are you blocked on? What do you need — feedback, resources, a partner, funding, visibility?"
              value={form.helpNeeded} onChange={set('helpNeeded')} rows={4} />
          </div>

          <div className="form-group" style={{ margin: 0, marginTop: '1.25rem' }}>
            <label className="form-label">Where do you see this going? <span style={{ fontWeight: 400 }}>(optional)</span></label>
            <textarea className="form-textarea"
              placeholder="Your vision for this project — even rough direction helps."
              value={form.vision} onChange={set('vision')} rows={3} />
          </div>
        </div>

        {/* ── Alerts ── */}
        {error && <div className="alert alert-error">{error}</div>}
        {success && (
          <div className="alert alert-success animate-fade-up">
            Request submitted successfully! Redirecting…
          </div>
        )}

        {/* ── Actions ── */}
        <div style={{ display: 'flex', gap: '0.875rem', flexWrap: 'wrap' }}>
          <button type="submit" className="btn" disabled={submitting} style={{ padding: '0.8rem 2rem' }}>
            {submitting ? 'Submitting…' : 'Submit Request'}
          </button>
          <a href="/" className="btn btn-outline">Cancel</a>
        </div>
      </form>
    </div>
  );
}
