'use client';
import { useEffect, useState } from 'react';
import { TimeSlot } from '@/lib/types';

function getWeekDays(base: Date) {
  const days: Date[] = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(base);
    d.setDate(base.getDate() - base.getDay() + i);
    days.push(d);
  }
  return days;
}

function formatHour(h: number) {
  if (h === 0) return '12 AM';
  if (h < 12) return `${h} AM`;
  if (h === 12) return '12 PM';
  return `${h - 12} PM`;
}

function slotColor(slot: TimeSlot, now: Date) {
  if (!slot.available && !slot.bookedBy) return 'var(--border)';
  if (new Date(slot.startTime) < now) return '#d1d5db';
  if (slot.available) return '#dcfce7';
  return '#fef9c3';
}

export default function SchedulePage() {
  const [slots, setSlots] = useState<TimeSlot[]>([]);
  const [loading, setLoading] = useState(true);
  const [weekStart, setWeekStart] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() - d.getDay());
    d.setHours(0, 0, 0, 0);
    return d;
  });

  useEffect(() => {
    fetch('/api/schedule').then(r => r.json()).then(data => {
      setSlots(data);
      setLoading(false);
    });
  }, []);

  const weekDays = getWeekDays(weekStart);
  const hours = Array.from({ length: 14 }, (_, i) => i + 8); // 8 AM to 9 PM

  const getSlotsForCell = (day: Date, hour: number) => {
    return slots.filter(s => {
      const start = new Date(s.startTime);
      return start.getFullYear() === day.getFullYear() &&
        start.getMonth() === day.getMonth() &&
        start.getDate() === day.getDate() &&
        start.getHours() === hour;
    });
  };

  const prevWeek = () => {
    const d = new Date(weekStart);
    d.setDate(d.getDate() - 7);
    setWeekStart(d);
  };
  const nextWeek = () => {
    const d = new Date(weekStart);
    d.setDate(d.getDate() + 7);
    setWeekStart(d);
  };
  const thisWeek = () => {
    const d = new Date();
    d.setDate(d.getDate() - d.getDay());
    d.setHours(0, 0, 0, 0);
    setWeekStart(d);
  };

  const now = new Date();

  return (
    <div>
      <h1>Schedule</h1>
      <p className="subtitle">Book and manage your available time slots</p>

      <div className="actions-row">
        <a href="/admin" className="btn btn-sm btn-outline">Manage Slots (Admin)</a>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
        <button className="btn btn-outline btn-sm" onClick={prevWeek}>← Prev</button>
        <span style={{ fontWeight: 600 }}>
          {weekDays[0].toLocaleDateString('en-US', { month: 'long', day: 'numeric' })} — {weekDays[6].toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
        </span>
        <button className="btn btn-outline btn-sm" onClick={nextWeek}>Next →</button>
      </div>

      {loading ? (
        <div className="empty-state">Loading...</div>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem', minWidth: 700 }}>
            <thead>
              <tr>
                <th style={{ width: 60, padding: '0.5rem 0.25rem' }}></th>
                {weekDays.map(day => (
                  <th key={day.toISOString()} style={{ padding: '0.5rem 0.25rem', textAlign: 'center', fontWeight: 600 }}>
                    <div>{day.toLocaleDateString('en-US', { weekday: 'short' })}</div>
                    <div style={{ color: 'var(--muted)', fontWeight: 400 }}>{day.getDate()}</div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {hours.map(hour => (
                <tr key={hour}>
                  <td style={{ padding: '0.4rem 0.5rem', fontWeight: 500, color: 'var(--muted)', textAlign: 'right', whiteSpace: 'nowrap' }}>
                    {formatHour(hour)}
                  </td>
                  {weekDays.map(day => {
                    const cellSlots = getSlotsForCell(day, hour);
                    return (
                      <td key={day.toISOString()} style={{ padding: '0.25rem', verticalAlign: 'top' }}>
                        {cellSlots.map(slot => (
                          <div
                            key={slot.id}
                            style={{
                              background: slotColor(slot, now),
                              border: '1px solid var(--border)',
                              borderRadius: 4,
                              padding: '0.3rem 0.4rem',
                              fontSize: '0.72rem',
                              lineHeight: 1.3,
                              marginBottom: '0.2rem',
                            }}
                          >
                            <div style={{ fontWeight: 600 }}>
                              {slot.available ? 'AVAILABLE' : slot.bookedBy ? 'BOOKED' : 'BLOCKED'}
                            </div>
                            <div style={{ color: 'var(--muted)' }}>
                              {formatHour(new Date(slot.startTime).getHours())} – {formatHour(new Date(slot.endTime).getHours())}
                            </div>
                          </div>
                        ))}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <hr className="divider" />

      <h2>All Slots</h2>
      {slots.length === 0 ? (
        <div className="empty-state">No slots created yet</div>
      ) : (
        <div>
          {slots
            .sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime())
            .map(slot => (
              <div key={slot.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem 0', borderBottom: '1px solid var(--border)' }}>
                <div>
                  <div style={{ fontWeight: 600 }}>
                    {new Date(slot.startTime).toLocaleString('en-US', { weekday: 'short', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}
                    {' – '}
                    {new Date(slot.endTime).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--muted)' }}>
                    {slot.available ? 'Available' : slot.bookedBy ? `Booked by ${slot.bookedBy}` : 'Blocked'}
                  </div>
                </div>
                <div>
                  {slot.available && (
                    <a href={`/admin?book=${slot.id}`} className="btn btn-sm btn-outline">Book</a>
                  )}
                </div>
              </div>
            ))}
        </div>
      )}
    </div>
  );
}
