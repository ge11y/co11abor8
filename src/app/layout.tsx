import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'co11abor8',
  description: 'A calm space to share who you are and what you\'re working on.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;1,9..40,400&display=swap" rel="stylesheet" />
        <link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>◈</text></svg>" />
      </head>
      <body>
        <nav className="nav">
          <div className="nav-inner">
            <a href="/" className="nav-logo">co11abor8</a>
            <div className="nav-links">
              <a href="/">Home</a>
              <a href="/requests">Requests</a>
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
