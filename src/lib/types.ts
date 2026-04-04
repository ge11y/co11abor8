// ─── Enums ───────────────────────────────────────────────────────────────────

export type SubmissionType = 'collaboration' | 'project_idea' | 'status_update' | 'general';
export type WorkStatus = 'just_starting' | 'in_progress' | 'near_completion' | 'stuck' | 'other';
export type AdminStatus = 'open' | 'in_review' | 'approved' | 'complete' | 'declined';

// ─── Socials ──────────────────────────────────────────────────────────────────

export interface Socials {
  x?: string;
  instagram?: string;
  linkedin?: string;
}

// ─── User (creator account) ────────────────────────────────────────────────────

export interface User {
  id: string;
  email: string;
  slug: string;
  name: string;
  passwordHash: string;
  bio: string;
  socials: Socials;
  /** URL to Calendly, Google Calendar embed, Google Meet, or any scheduling link */
  schedulingUrl: string;
  schedulingLabel: string;
  createdAt: string;
}

// ─── Request (inbound to a creator) ───────────────────────────────────────────

export interface Request {
  id: string;
  /** The creator's user ID this request is sent to */
  creatorId: string;
  /** Display name of the requester */
  requesterName: string;
  /** Contact (email or @handle) of the requester */
  requesterContact: string;
  projectIdea: string;
  status: WorkStatus;
  helpNeeded: string;
  vision: string;
  submissionType: SubmissionType;
  timeSlot?: string;
  submittedAt: string;
  reviewedAt?: string;
  adminStatus: AdminStatus;
  notes?: string;
}

// ─── Time Slot ────────────────────────────────────────────────────────────────

export interface TimeSlot {
  id: string;
  creatorId: string;
  startTime: string;
  endTime: string;
  bookedBy?: string;
  available: boolean;
}
