# Same-Day Customer Growth Pack — Android/Web Sales OS

Mobile-first PWA for the live prospecting workflow.

## Core screens
- Today: ranked best leads + next best action
- Lead detail: evidence, source, copy pitch, email/call, pipeline stage
- Scripts: initial, follow-ups, objections, close
- Pipeline: local stage tracking on Android/browser
- Daily Status: explains the ChatGPT update contract

## ChatGPT daily-status / prospect-search update contract
Every refresh must update BOTH:
1. `sales-engine-app/data/leads.json` — live app feed
2. `sales-engine/Same-Day-Customer-Growth-Pack-Live-CRM.xlsx` — canonical CRM workbook

Rules:
- Reverify current higher-ticket service leads.
- Keep source URL, verification date, and evidence-based opportunity.
- Never invent contact details, promotions, outreach, replies, payments, customers, or revenue.
- Preserve actual pipeline history.
- Initial cold outreach + at most two respectful follow-ups; stop on opt-out.

## Android installation
Deploy over HTTPS, open in Android Chrome, then choose **Install app** or **Add to Home screen**.

## Hosting
Plain static HTML/CSS/JS. Works on Vercel, Netlify, Cloudflare Pages, GitHub Pages, or any HTTPS static host.
