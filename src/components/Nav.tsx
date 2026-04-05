'use client';
import { useEffect, useState } from 'react';

export default function Nav() {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    // Read from localStorage — fast, no network, no server errors
    const stored = localStorage.getItem('co11ab_user');
    setUser(stored ? JSON.parse(stored) : null);
  }, []);

  return (
    <nav className="nav">
      <div className="nav-inner">
        <a href="/" className="nav-logo">co11abor8</a>
        {user ? (
          <div className="nav-links">
            <a href="/requests">People</a>
            <a href="/dashboard">Dashboard</a>
            <a href={`/p/${user.slug}`} target="_blank" rel="noopener noreferrer">My link</a>
          </div>
        ) : (
          <div className="nav-links">
            <a href="/requests">People</a>
            <a href="/submit">Get my link</a>
            <a href="/login">Sign in</a>
          </div>
        )}
      </div>
    </nav>
  );
}
