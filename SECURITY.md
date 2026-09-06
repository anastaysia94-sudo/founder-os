# Security and Privacy Notes

- Public website retrieval uses WordPress safe HTTP APIs and rejects private/reserved hosts.
- Shopify webhook events require HMAC validation and dedupe keys.
- Public conversion endpoints enforce an allowlist and rate limits.
- Owner/deployment APIs require `fdos_manage` or administrator capability.
- Email is stored only as a SHA-256 hash.
- Public scanner rendering uses text nodes rather than injecting API-returned HTML.
- Destructive uninstall cleanup is opt-in.
- Retention deletion is disabled by default for browser events and intakes.
- Automatic restore does not overwrite production tables.
- Secrets must not be committed into the plugin package.
