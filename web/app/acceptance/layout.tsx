import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Production Acceptance Diagnostics | Founder Dynasty OS',
  description: 'Owner-facing production acceptance diagnostics for Founder Dynasty OS.',
  robots: {
    index: false,
    follow: false,
    nocache: true,
  },
};

export default function AcceptanceLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <>
      <nav
        aria-label="Production acceptance"
        style={{
          maxWidth: 1120,
          margin: '0 auto',
          padding: '18px 20px 0',
          display: 'flex',
          gap: 14,
          flexWrap: 'wrap',
          fontSize: 14,
        }}
      >
        <a href="/acceptance">Diagnostics</a>
        <a href="/acceptance/restore">Sign-out → restore proof</a>
        <a href="/">Founder Command Center</a>
      </nav>
      {children}
    </>
  );
}
