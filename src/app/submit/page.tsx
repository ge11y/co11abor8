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
      setTimeout(() => router.push('/'), 1500);
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ maxWidth: 600, margin: '0 auto' }}>
      <h1>Submit a Request</h1>
      <p className="subtitle">Tell us what you're working on and how we can help</p>

      <form onSubmit={handleSubmit} className="card">
        {error && (
          <div style={{ background: '#fee2e2', color: '#991b1b', padding: '0.75rem 1rem', borderRadius: 6, marginBottom: '1rem', fontSize: '0.875rem' }}>
            {error}
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div className="form-group">
            <label className="form-label">Name <span>*</span></label>
            <input className="form-input" placeholder="Your name" value={form.name} onChange={set('name')} />
          </div>
          <div className="form-group">
            <label className="form-label">Contact <span>*</span></label>
            <input className="form-input" placeholder="@handle or email" value={form.contact} onChange={set('contact')} />
          </div>
        </div>

        {form.profileSlug && (
          <div className="form-group" style={{ marginTop: '-0.5rem' }}>
            <div style={{ fontSize: '0.8rem', color: 'var(--muted)' }}>
              Linking to: <a href={`/p/${form.profileSlug}`} target="_blank" rel="noopener">co11ab.com/p/{form.profileSlug}</a>
            </div>
          </div>
        )}

        <div className="form-group">
          <label className="form-label">Type</label>
          <div className="radio-group">
            {SUBMISSION_TYPES.map(t => (
              <label key={t.value} className="radio-label">
                <input type="radio" name="submissionType" value={t.value}
                  checked={form.submissionType === t.value} onChange={set('submissionType')}
                  style={{ accentColor: 'var(--accent)' }} />
                {t.label}
              </label>
            ))}
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">What are you working on? <span>*</span></label>
          <textarea className="form-textarea" placeholder="Describe your project or idea..."
            value={form.projectIdea} onChange={set('projectIdea')} rows={3} />
        </div>

        <div className="form-group">
          <label className="form-label">Status</label>
          <select className="form-select" value={form.status} onChange={set('status')}>
            {WORK_STATUSES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
          </select>
        </div>

        <div className="form-group">
          <label className="form-label">What do you need? <span>*</span></label>
          <textarea className="form-textarea" placeholder="What do you need, what's blocked, what are you looking for?"
            value={form.helpNeeded} onChange={set('helpNeeded')} rows={3} />
        </div>

        <div className="form-group">
          <label className="form-label">Where do you see this going?</label>
          <textarea className="form-textarea" placeholder="Your vision for this project..."
            value={form.vision} onChange={set('vision')} rows={2} />
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', paddingTop: '0.5rem' }}>
          <button type="submit" className="btn" disabled={submitting}>
            {submitting ? 'Submitting...' : 'Submit Request'}
          </button>
          <a href="/" className="btn btn-outline">Cancel</a>
        </div>
      </form>
    </div>
  );
}
