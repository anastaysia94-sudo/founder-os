import './globals.css';
import './review.css';
import navStyles from './module-nav.module.css';
import type { Metadata } from 'next';
import AuthPrivacyGuard from './auth-privacy-guard';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim();
const salesUrl = process.env.NEXT_PUBLIC_SALES_OS_URL?.trim() || '/sales-engine-app/';

export const metadata: Metadata = {
  title: {
    default: 'Founder Dynasty OS | Business Operating System for Ideas to Growth',
    template: '%s | Founder Dynasty OS',
  },
  description: 'Founder Dynasty OS is an evidence-first business operating system for founders, owners, solo operators, and people with only an idea.',
  applicationName: 'Founder Dynasty OS',
  keywords: ['business operating system', 'founder operating system', 'business idea validation', 'business decision support', 'business experiment tracking'],
  alternates: siteUrl ? { canonical: siteUrl } : undefined,
  robots: { index: true, follow: true },
  openGraph: {
    type: 'website',
    siteName: 'Founder Dynasty OS',
    title: 'Founder Dynasty OS | Know What to Do Next and Why',
    description: 'An evidence-first operating system for any business stage, from raw idea to operating company.',
    url: siteUrl || undefined,
  },
};

const structuredData = {
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  name: 'Founder Dynasty OS',
  applicationCategory: 'BusinessApplication',
  operatingSystem: 'Web',
  description: 'An evidence-first business operating system that connects Business DNA, Business X-Ray, Idea Lab, Value Sprints, finance, offers, operations, customer intelligence, distribution, assets, scenarios, founder attention, portfolio strategy, decisions, risks, evidence and business memory.',
  featureList: ['Plain-English Glossary', 'Idea Lab', 'Business X-Ray', 'What Am I Missing intelligence', 'Value Sprints', 'Finance Center', 'Product and Offer Lab', 'Operations and Execution', 'Business Model Lab', 'Customer Intelligence', 'Marketing and Distribution', 'Asset Map', 'Scenario Lab', 'Founder Attention', 'Portfolio and Dynasty Mode', 'evidence classification', 'opportunity ranking', 'risk tracking'],
  publisher: { '@type': 'Organization', name: 'SmartPickShop Holdings' },
  ...(siteUrl ? { url: siteUrl } : {}),
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <AuthPrivacyGuard />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />
        <nav className={navStyles.dock} aria-label="Founder Dynasty OS modules">
          <a className={navStyles.brand} href="/">FOUNDER DYNASTY OS</a>
          <div className={navStyles.links}>
            <a href="/">Command Center</a>
            <a className={navStyles.featured} href="/intelligence">Idea Lab · X-Ray · Value Sprints</a>
            <a href="/workbench">Finance · Offer · Operations</a>
            <a href="/strategy">Strategy · Customers · Assets · Dynasty</a>
            <a href="/glossary">Plain-English Glossary</a>
            <a href={salesUrl}>Customers & Growth · Sales OS</a>
          </div>
        </nav>
        {children}
      </body>
    </html>
  );
}
