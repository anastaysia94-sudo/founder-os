import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Portfolio / Business Registry',
  robots: { index: false, follow: false },
};

export default function PortfolioLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return children;
}
