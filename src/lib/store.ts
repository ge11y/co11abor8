import fs from 'fs';
import path from 'path';
import { Request, TimeSlot, Profile } from './types';

const DATA_DIR = path.join(process.cwd(), 'data');
const REQUESTS_FILE = path.join(DATA_DIR, 'requests.json');
const SLOTS_FILE = path.join(DATA_DIR, 'slots.json');
const PROFILES_FILE = path.join(DATA_DIR, 'profiles.json');

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
}

// ─── Profiles ─────────────────────────────────────────────────────────────────

export function getProfiles(): Profile[] {
  ensureDataDir();
  if (!fs.existsSync(PROFILES_FILE)) return [];
  return JSON.parse(fs.readFileSync(PROFILES_FILE, 'utf8'));
}

export function getPublicProfiles(): Profile[] {
  return getProfiles().filter(p => p.public);
}

export function getProfileBySlug(slug: string): Profile | null {
  return getProfiles().find(p => p.slug === slug) ?? null;
}

export function saveProfile(profile: Profile): void {
  ensureDataDir();
  const all = getProfiles();
  const idx = all.findIndex(p => p.id === profile.id);
  if (idx >= 0) all[idx] = profile;
  else all.push(profile);
  fs.writeFileSync(PROFILES_FILE, JSON.stringify(all, null, 2));
}

export function updateProfile(id: string, updates: Partial<Profile>): Profile | null {
  const all = getProfiles();
  const idx = all.findIndex(p => p.id === id);
  if (idx < 0) return null;
  all[idx] = { ...all[idx], ...updates };
  fs.writeFileSync(PROFILES_FILE, JSON.stringify(all, null, 2));
  return all[idx];
}

export function deleteProfile(id: string): void {
  const all = getProfiles().filter(p => p.id !== id);
  fs.writeFileSync(PROFILES_FILE, JSON.stringify(all, null, 2));
}

// ─── Requests ─────────────────────────────────────────────────────────────────

export function getRequests(): Request[] {
  ensureDataDir();
  if (!fs.existsSync(REQUESTS_FILE)) return [];
  return JSON.parse(fs.readFileSync(REQUESTS_FILE, 'utf8'));
}

export function saveRequest(req: Request): void {
  ensureDataDir();
  const all = getRequests();
  const idx = all.findIndex(r => r.id === req.id);
  if (idx >= 0) all[idx] = req;
  else all.unshift(req);
  fs.writeFileSync(REQUESTS_FILE, JSON.stringify(all, null, 2));
}

export function updateRequest(id: string, updates: Partial<Request>): Request | null {
  const all = getRequests();
  const idx = all.findIndex(r => r.id === id);
  if (idx < 0) return null;
  all[idx] = { ...all[idx], ...updates };
  fs.writeFileSync(REQUESTS_FILE, JSON.stringify(all, null, 2));
  return all[idx];
}

// ─── Time Slots ───────────────────────────────────────────────────────────────

export function getTimeSlots(): TimeSlot[] {
  ensureDataDir();
  if (!fs.existsSync(SLOTS_FILE)) return [];
  return JSON.parse(fs.readFileSync(SLOTS_FILE, 'utf8'));
}

export function saveTimeSlot(slot: TimeSlot): void {
  ensureDataDir();
  const all = getTimeSlots();
  const idx = all.findIndex(s => s.id === slot.id);
  if (idx >= 0) all[idx] = slot;
  else all.push(slot);
  fs.writeFileSync(SLOTS_FILE, JSON.stringify(all, null, 2));
}

export function updateSlot(id: string, updates: Partial<TimeSlot>): TimeSlot | null {
  const all = getTimeSlots();
  const idx = all.findIndex(s => s.id === id);
  if (idx < 0) return null;
  all[idx] = { ...all[idx], ...updates };
  fs.writeFileSync(SLOTS_FILE, JSON.stringify(all, null, 2));
  return all[idx];
}

// ─── Utils ────────────────────────────────────────────────────────────────────

export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}
