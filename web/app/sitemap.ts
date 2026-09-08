import type {MetadataRoute} from 'next';

export default function sitemap():MetadataRoute.Sitemap{
  const siteUrl=process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/,'');
  if(!siteUrl)return[];
  const now=new Date();
  return [
    {url:siteUrl,lastModified:now,changeFrequency:'weekly',priority:1},
    {url:`${siteUrl}/answers`,lastModified:now,changeFrequency:'monthly',priority:.9},
  ];
}
