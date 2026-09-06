<?php
if (!defined('ABSPATH')) exit;

class FDOS_VLS_Shopify {
    const ALLOWED_TOPICS = ['orders/create','orders/paid'];

    public static function secret() {
        if (defined('FDOS_VLS_SHOPIFY_WEBHOOK_SECRET') && FDOS_VLS_SHOPIFY_WEBHOOK_SECRET) {
            return (string)FDOS_VLS_SHOPIFY_WEBHOOK_SECRET;
        }
        return (string)get_option('fdos_vls_shopify_webhook_secret', '');
    }

    public static function verify_hmac($raw,$provided,$secret) {
        if(!$secret || !$provided) return false;
        $expected=base64_encode(hash_hmac('sha256',(string)$raw,(string)$secret,true));
        return hash_equals($expected,trim((string)$provided));
    }

    public static function handle(WP_REST_Request $req) {
        $secret = self::secret();
        if (!$secret) {
            return new WP_Error('fdos_shopify_not_configured', 'Shopify webhook secret is not configured.', ['status'=>503]);
        }

        $raw = $req->get_body();
        $provided = trim((string)$req->get_header('x-shopify-hmac-sha256'));
        if (!self::verify_hmac($raw, $provided, $secret)) {
            return new WP_Error('fdos_shopify_bad_hmac', 'Webhook signature verification failed.', ['status'=>401]);
        }

        $topic = strtolower(trim((string)$req->get_header('x-shopify-topic')));
        if (!in_array($topic, self::ALLOWED_TOPICS, true)) {
            return new WP_Error('fdos_shopify_topic', 'Unsupported Shopify webhook topic.', ['status'=>400]);
        }

        $shop = strtolower(trim((string)$req->get_header('x-shopify-shop-domain')));
        $webhook_id = trim((string)$req->get_header('x-shopify-webhook-id'));
        $event_id = trim((string)$req->get_header('x-shopify-event-id'));
        $dedupe_source = $event_id ?: $webhook_id;
        if (!$dedupe_source) {
            $dedupe_source = hash('sha256', $topic . '|' . $shop . '|' . $raw);
        }
        $dedupe_key = 'shopify:' . $topic . ':' . $dedupe_source;
        $existing = FDOS_VLS_DB::find_event_by_dedupe_key($dedupe_key);
        if ($existing) {
            return new WP_REST_Response(['accepted'=>true,'duplicate'=>true,'event_id'=>$existing], 200);
        }

        $payload = json_decode($raw, true);
        if (!is_array($payload)) {
            return new WP_Error('fdos_shopify_json', 'Webhook body is not valid JSON.', ['status'=>400]);
        }

        $mapped = self::map_order_event($topic, $payload, $shop, $dedupe_key, $webhook_id, $event_id);
        $stored = FDOS_VLS_DB::insert_event($mapped);
        if (!$stored) {
            return new WP_Error('fdos_shopify_store', 'Unable to store Shopify evidence event.', ['status'=>500]);
        }

        return new WP_REST_Response([
            'accepted'=>true,
            'duplicate'=>false,
            'event_id'=>$stored,
            'event_type'=>$mapped['event_type'],
            'evidence_class'=>$mapped['evidence_class'],
        ], 200);
    }

    private static function map_order_event($topic, array $p, $shop, $dedupe_key, $webhook_id, $event_id) {
        $is_paid = $topic === 'orders/paid';
        $currency = isset($p['currency']) ? substr(strtoupper(sanitize_text_field((string)$p['currency'])), 0, 3) : null;
        $amount = self::extract_amount($p, $is_paid);
        $order_id = isset($p['admin_graphql_api_id']) ? sanitize_text_field((string)$p['admin_graphql_api_id']) : (isset($p['id']) ? (string)$p['id'] : null);
        $occurred = !empty($p['updated_at']) ? self::mysql_utc($p['updated_at']) : (!empty($p['created_at']) ? self::mysql_utc($p['created_at']) : current_time('mysql', true));

        return [
            'dedupe_key'=>$dedupe_key,
            'intake_public_id'=>null,
            'event_type'=>$is_paid ? 'shopify_order_paid' : 'shopify_order_created',
            'project'=>'SmartPickShop Holdings',
            'channel'=>'shopify',
            'campaign'=>null,
            'numeric_value'=>$amount,
            'currency'=>$currency,
            'evidence_class'=>'E2',
            'confidence'=>100,
            'source_type'=>'shopify_verified_webhook',
            'source_ref'=>$shop ? 'https://' . $shop : null,
            'metadata'=>[
                'topic'=>$topic,
                'shop_domain'=>$shop,
                'order_id'=>$order_id,
                'webhook_id'=>$webhook_id ?: null,
                'external_event_id'=>$event_id ?: null,
                'financial_status'=>isset($p['financial_status']) ? sanitize_text_field((string)$p['financial_status']) : null,
                'test'=>!empty($p['test']),
                'note'=>'E2 verifies Shopify reported the event; it does not by itself prove profit, attribution, retention, or causality.',
            ],
            'occurred_at'=>$occurred,
        ];
    }

    private static function extract_amount(array $p, $is_paid) {
        $keys = ['current_total_price','total_price'];
        foreach ($keys as $key) {
            if (isset($p[$key]) && is_numeric($p[$key])) return (float)$p[$key];
        }
        return null;
    }

    private static function mysql_utc($value) {
        $ts = strtotime((string)$value);
        return $ts ? gmdate('Y-m-d H:i:s', $ts) : current_time('mysql', true);
    }
}
