const base = process.argv[2] || process.env.STOREFRONT_URL;

if (!base) {
  console.error('Usage: node tools/build-campaign-links.mjs https://your-storefront.example');
  process.exit(1);
}

const campaign = 'four_offer_launch_2026_09_16';
const routes = [
  ['facebook_profile', 'social'],
  ['facebook_story', 'social'],
  ['instagram_story', 'social'],
  ['instagram_profile', 'social'],
  ['tiktok_profile', 'social'],
  ['whatsapp_status', 'messaging'],
  ['whatsapp_direct_relevant', 'messaging'],
  ['telegram_solofounders', 'community'],
  ['telegram_fusion42', 'community'],
  ['telegram_foundersglobal', 'community'],
  ['email_direct', 'email'],
];

const waves = [
  ['all_four_launch', routes],
  ['ai_handoff_wave2', routes.filter(([source]) => [
    'facebook_profile',
    'facebook_story',
    'instagram_story',
    'whatsapp_status',
    'telegram_solofounders',
    'telegram_fusion42',
    'email_direct'
  ].includes(source))]
];

const cleanBase = base.replace(/\/$/, '');

for (const [content, waveRoutes] of waves) {
  for (const [source, medium] of waveRoutes) {
    const url = new URL(cleanBase + '/');
    url.searchParams.set('utm_source', source);
    url.searchParams.set('utm_medium', medium);
    url.searchParams.set('utm_campaign', campaign);
    url.searchParams.set('utm_content', content);
    console.log(`${content.padEnd(20)} ${source.padEnd(28)} ${url.toString()}`);
  }
}
