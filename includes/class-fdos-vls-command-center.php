<?php
if (!defined('ABSPATH')) exit;

class FDOS_VLS_Command_Center {
    public static function register(){add_action('admin_menu',[__CLASS__,'menu']);}
    public static function menu(){add_menu_page('Founder Command Center','Founder OS','fdos_manage','fdos-command-center',[__CLASS__,'page'],'dashicons-chart-area',3);}
    public static function page(){
        if(!current_user_can('fdos_manage')) return;
        $s=FDOS_VLS_DB::command_center_snapshot();
        $f=$s['funnel'];$mix=$s['evidence_mix'];$next=$s['next_ranked_action'];
        echo '<div class="wrap"><h1>Founder Command Center</h1><p><strong>SmartPickShop Holdings // Founder Dynasty OS 10.0</strong></p><p>Observe → prove → prioritize → act → measure → learn → compound.</p>';
        echo '<h2>Commercial Signals</h2><ul>';
        echo '<li>Scans: '.esc_html($s['intakes']).'</li>';
        echo '<li>Scanner result views: '.esc_html($f['scanner_result_viewed']['count']??0).'</li>';
        echo '<li>Shopify paid-order events: '.esc_html($f['shopify_order_paid']['count']??0).'</li>';
        echo '<li>Shopify-reported paid value: '.esc_html($f['shopify_order_paid']['value']??0).' <em>(not profit)</em></li></ul>';
        echo '<h2>Next Best Action</h2><pre>'.esc_html(wp_json_encode($next,JSON_PRETTY_PRINT)).'</pre>';
        echo '<h2>Evidence Vault</h2><pre>'.esc_html(wp_json_encode($mix,JSON_PRETTY_PRINT)).'</pre>';
        echo '<h2>Value Sprint Board</h2><pre>'.esc_html(wp_json_encode($s['experiments'],JSON_PRETTY_PRINT)).'</pre>';
        echo '<h2>Evidence Feed</h2><pre>'.esc_html(wp_json_encode($s['recent_events'],JSON_PRETTY_PRINT)).'</pre>';
        echo '<p><strong>Research & Evidence Integrity:</strong> E1–E8 classifications remain mandatory. Commercial signals are evidence receipts, not automatic proof of attribution, profit, ROI, or causality.</p></div>';
    }
}
