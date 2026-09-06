<?php
// FDOS production configuration fragment for wp-config.php.
// IMPORTANT: For Shopify HTTPS webhooks, use the CLIENT SECRET of the Shopify app
// that owns the webhook subscriptions. Do not invent a separate webhook password.
// Never commit the real client secret to source control.
define('FDOS_VLS_SHOPIFY_WEBHOOK_SECRET', 'REPLACE_WITH_SHOPIFY_APP_CLIENT_SECRET');

// Recommended production posture (adapt to your host):
define('WP_DEBUG', false);
define('WP_DEBUG_DISPLAY', false);

// FORCE_SSL_ADMIN should only be enabled when HTTPS is correctly configured.
define('FORCE_SSL_ADMIN', true);
