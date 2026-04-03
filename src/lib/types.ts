export type SubmissionType = 'collaboration' | 'project_idea' | 'status_update' | 'general';
export type WorkStatus = 'just_starting' | 'in_progress' | 'near_completion' | 'stuck' | 'other';
export type AdminStatus = 'open' | 'in_review' | 'approved' | 'complete' | 'declined';

export interface Socials {
  x?: string;
  instagram?: string;
  linkedin?: string;
}

export interface Profile {
  id: string;
  slug: string;
  name: string;
  tagline: string;
  socials: Socials;
  strengths: string;
  thoughtPatterns: string;
  passions: string;
  public: boolean;
  createdAt: string;
}

export interface Request {
  id: string;
  profileId?: string;
  name: string;
  contact: string;
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

export interface TimeSlot {
  id: string;
  startTime: string;
  endTime: string;
  bookedBy?: string;
  available: boolean;
}
