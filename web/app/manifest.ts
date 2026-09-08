import type {MetadataRoute} from 'next';

export default function manifest():MetadataRoute.Manifest{
  return {
    name:'Founder Dynasty OS',
    short_name:'Dynasty OS',
    description:'Evidence-first business operating system from idea to growth.',
    start_url:'/',
    display:'standalone',
    background_color:'#08111f',
    theme_color:'#08111f',
    categories:['business','productivity','finance'],
  };
}
