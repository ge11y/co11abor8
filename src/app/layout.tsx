import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'co11ab',
  description: 'Collaboration hub — share your profile and submit requests',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body>
        <nav className="nav">
          <div className="nav-inner">
            <span className="nav-logo">co11ab</span>
            <div className="nav-links">
              <a href="/">Requests</a>
              <a href="/submit">Submit</a>
              <a href="/dashboard">Dashboard</a>
            </div>
          </div>
        </nav>
        <main className="main">{children}</main>
      </body>
    </html>
  );
}
