import './globals.css';
import './review.css';
import type {Metadata} from 'next';

const siteUrl=process.env.NEXT_PUBLIC_SITE_URL?.trim();

export const metadata:Metadata={
  title:{default:'Founder Dynasty OS | Business Operating System for Ideas to Growth',template:'%s | Founder Dynasty OS'},
  description:'Founder Dynasty OS is an evidence-first business operating system for founders, owners, solo operators, and people with only an idea. Prioritize problems, run measured experiments, and decide what to do next across strategy, product, operations, sales, finance, team, and risk.',
  applicationName:'Founder Dynasty OS',
  keywords:['business operating system','founder operating system','business idea validation','business decision support','evidence based business planning','startup operating system','small business operating system','business experiment tracking'],
  alternates:siteUrl?{canonical:siteUrl}:undefined,
  robots:{index:true,follow:true,googleBot:{index:true,follow:true,'max-image-preview':'large','max-snippet':-1,'max-video-preview':-1}},
  openGraph:{type:'website',siteName:'Founder Dynasty OS',title:'Founder Dynasty OS | Know What to Do Next and Why',description:'An evidence-first operating system for any business stage, from raw idea to operating company.',url:siteUrl||undefined},
  twitter:{card:'summary_large_image',title:'Founder Dynasty OS',description:'Evidence-first business decision support from idea to growth.'},
};

const structuredData={
  '@context':'https://schema.org','@type':'WebApplication',name:'Founder Dynasty OS',applicationCategory:'BusinessApplication',applicationSubCategory:'Business operating system and decision support',operatingSystem:'Web',description:'An evidence-first business operating system that helps people turn an idea, problem, or operating business into prioritized actions, measured experiments, and explicit KEEP / REVISE / REVERT decisions.',featureList:['idea validation','evidence classification','opportunity ranking','measured business experiments','operations planning','product decisions','sales execution','financial assumptions','team and hiring decisions','risk tracking','plain-English glossary'],publisher:{'@type':'Organization',name:'SmartPickShop Holdings'},...(siteUrl?{url:siteUrl}:{})};

export default function RootLayout({children}:Readonly<{children:React.ReactNode}>){return <html lang="en"><body><script type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify(structuredData)}}/>{children}</body></html>}
