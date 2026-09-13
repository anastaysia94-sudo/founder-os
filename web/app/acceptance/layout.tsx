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
  return children;
}
