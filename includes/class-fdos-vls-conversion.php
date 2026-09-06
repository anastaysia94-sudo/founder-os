<?php
if (!defined('ABSPATH')) exit;

class FDOS_VLS_Conversion {
    const ALLOWED = ['scanner_result_viewed','value_sprint_cta_clicked','lead_cta_clicked','shopify_outbound_clicked'];

    public static function handle(WP_REST_Request $req) {
        $p=(array)$req->get_json_params();
        $event=sanitize_key($p['event_type']??'');
        if(!in_array($event,self::ALLOWED,true)) return new WP_Error('fdos_conversion_event','Unsupported conversion event.',['status'=>400]);
        $exp=sanitize_text_field($p['experiment_id']??'');
        if($exp && !FDOS_VLS_DB::get_experiment($exp)) return new WP_Error('fdos_experiment','Unknown experiment ID.',['status'=>400]);
        $client=sanitize_text_field($p['client_event_id']??'');
        $dedupe=$client?'browser:'.hash('sha256',$client):null;
        $id=FDOS_VLS_DB::insert_event([
            'dedupe_key'=>$dedupe,
            'intake_public_id'=>sanitize_text_field($p['intake_public_id']??''),
            'experiment_id'=>$exp?:null,
            'event_type'=>$event,
            'project'=>'Founder Dynasty OS',
            'channel'=>'web',
            'campaign'=>sanitize_text_field($p['campaign']??''),
            'numeric_value'=>null,
            'currency'=>null,
            'evidence_class'=>'E1',
            'confidence'=>90,
            'source_type'=>'first_party_browser_event',
            'source_ref'=>esc_url_raw($p['destination']??''),
            'metadata'=>['note'=>'Server receipt verifies an allowlisted browser event was received; it does not prove a unique human, purchase, revenue, attribution, or causality.'],
            'occurred_at'=>current_time('mysql',true),
        ]);
        if(!$id) return new WP_Error('fdos_conversion_store','Unable to store event.',['status'=>500]);
        return new WP_REST_Response(['accepted'=>true,'event_id'=>$id],201);
    }
}
