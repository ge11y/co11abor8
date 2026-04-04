import fs from 'fs';
import path from 'path';
import { Request, TimeSlot, User } from './types';

const DATA_DIR = path.join(process.cwd(), 'data');
const USERS_FILE    = path.join(DATA_DIR, 'users.json');
const REQUESTS_FILE = path.join(DATA_DIR, 'requests.json');
const SLOTS_FILE    = path.join(DATA_DIR, 'slots.json');

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
}

// ─── Users ─────────────────────────────────────────────────────────────────────

export function getUsers(): User[] {
  ensureDataDir();
  if (!fs.existsSync(USERS_FILE)) return [];
  return JSON.parse(fs.readFileSync(USERS_FILE, 'utf8'));
}

export function getUserById(id: string): User | null {
  return getUsers().find(u => u.id === id) ?? null;
}

export function getUserByEmail(email: string): User | null {
  return getUsers().find(u => u.email.toLowerCase() === email.toLowerCase()) ?? null;
}

export function getUserBySlug(slug: string): User | null {
  return getUsers().find(u => u.slug === slug) ?? null;
}

export function saveUser(user: User): void {
  ensureDataDir();
  const all = getUsers();
  const idx = all.findIndex(u => u.id === user.id);
  if (idx >= 0) all[idx] = user;
  else all.push(user);
  fs.writeFileSync(USERS_FILE, JSON.stringify(all, null, 2));
}

export function updateUser(id: string, updates: Partial<User>): User | null {
  const all = getUsers();
  const idx = all.findIndex(u => u.id === id);
  if (idx < 0) return null;
  all[idx] = { ...all[idx], ...updates };
  fs.writeFileSync(USERS_FILE, JSON.stringify(all, null, 2));
  return all[idx];
}

// ─── Requests ─────────────────────────────────────────────────────────────────

export function getRequests(): Request[] {
  ensureDataDir();
  if (!fs.existsSync(REQUESTS_FILE)) return [];
  return JSON.parse(fs.readFileSync(REQUESTS_FILE, 'utf8'));
}

export function getRequestsForCreator(creatorId: string): Request[] {
  return getRequests().filter(r => r.creatorId === creatorId);
}

export function getRequestsByRequester(requesterContact: string): Request[] {
  return getRequests().filter(r => r.requesterContact === requesterContact);
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

export function getSlotsForCreator(creatorId: string): TimeSlot[] {
  return getTimeSlots().filter(s => s.creatorId === creatorId);
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

// ─── Utils ───────────────────────────────────────────────────────────────────

export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}
