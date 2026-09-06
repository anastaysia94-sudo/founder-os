<?php
if (!defined('ABSPATH')) exit;

class FDOS_VLS_REST {
    public static function register(){add_action('rest_api_init',[__CLASS__,'routes']);}
    public static function routes(){
        register_rest_route('fdos/v1','/health',['methods'=>'GET','callback'=>fn()=>['ok'=>true,'version'=>FDOS_VLS_VERSION],'permission_callback'=>'__return_true']);
        register_rest_route('fdos/v1','/intakes',['methods'=>'POST','callback',[__CLASS__,'intake'],'permission_callback'=>'__return_true']);
        register_rest_route('fdos/v1','/events',['methods'=>'POST','callback',[__CLASS__,'event'],'permission_callback',[__CLASS__,'can_record_event']]);
        register_rest_route('fdos/v1','/conversions',['methods'=>'POST','callback',['FDOS_VLS_Conversion','handle'],'permission_callback'=>'__return_true']);
        register_rest_route('fdos/v1','/shopify/webhook',['methods'=>'POST','callback',['FDOS_VLS_Shopify','handle'],'permission_callback'=>'__return_true']);
        register_rest_route('fdos/v1','/funnel',['methods'=>'GET','callback'=>fn()=>FDOS_VLS_DB::funnel_summary(),'permission_callback',[__CLASS__,'can_record_event']]);
        register_rest_route('fdos/v1','/command-center',['methods'=>'GET','callback'=>fn()=>FDOS_VLS_DB::command_center_snapshot(),'permission_callback',[__CLASS__,'can_record_event']]);
        register_rest_route('fdos/v1','/experiments',['methods'=>['GET','POST'],'callback'=>function($r){return $r->get_method()==='GET'?FDOS_VLS_Experiments::listing($r):FDOS_VLS_Experiments::create($r);},'permission_callback',[__CLASS__,'can_record_event']]);
        register_rest_route('fdos/v1','/experiments/(?P<id>[a-f0-9-]+)',['methods'=>['GET','POST','PATCH'],'callback'=>function($r){return $r->get_method()==='GET'?FDOS_VLS_Experiments::get($r):FDOS_VLS_Experiments::update($r);},'permission_callback',[__CLASS__,'can_record_event']]);
        register_rest_route('fdos/v1','/experiments/(?P<id>[a-f0-9-]+)/start',['methods'=>'POST','callback',['FDOS_VLS_Experiments','start'],'permission_callback',[__CLASS__,'can_record_event']]);
        register_rest_route('fdos/v1','/experiments/(?P<id>[a-f0-9-]+)/report',['methods'=>'GET','callback',['FDOS_VLS_Experiments','report'],'permission_callback',[__CLASS__,'can_record_event']]);
        register_rest_route('fdos/v1','/qa/run',['methods'=>'POST','callback',['FDOS_VLS_QA','run'],'permission_callback',[__CLASS__,'can_manage']]);
        register_rest_route('fdos/v1','/deployment/diagnostics',['methods'=>'GET','callback',['FDOS_VLS_Deployment','diagnostics_response'],'permission_callback',[__CLASS__,'can_manage']]);
        register_rest_route('fdos/v1','/deployment/smoke-test',['methods'=>'POST','callback',['FDOS_VLS_Deployment','smoke_response'],'permission_callback',[__CLASS__,'can_manage']]);
        register_rest_route('fdos/v1','/deployment/launch-gate',['methods'=>'POST','callback',['FDOS_VLS_Deployment','launch_gate_response'],'permission_callback',[__CLASS__,'can_manage']]);
        register_rest_route('fdos/v1','/deployment/backup-manifest',['methods'=>'GET','callback'=>fn()=>FDOS_VLS_Deployment::backup_manifest(),'permission_callback',[__CLASS__,'can_manage']]);
        register_rest_route('fdos/v1','/production/public-proof',['methods'=>'GET','callback',['FDOS_VLS_Production_Verification','public_proof'],'permission_callback'=>'__return_true']);
        register_rest_route('fdos/v1','/production/verify',['methods'=>'POST','callback',['FDOS_VLS_Production_Verification','verify_response'],'permission_callback',[__CLASS__,'can_manage']]);
        register_rest_route('fdos/v1','/production/settings',['methods'=>'POST','callback',['FDOS_VLS_Production_Verification','settings_response'],'permission_callback',[__CLASS__,'can_manage']]);
        register_rest_route('fdos/v1','/production/webhook-target',['methods'=>'GET','callback'=>fn()=>FDOS_VLS_Production_Verification::webhook_target(),'permission_callback',[__CLASS__,'can_manage']]);
        register_rest_route('fdos/v1','/production/last-report',['methods'=>'GET','callback'=>fn()=>get_option('fdos_vls_last_production_verification',[]),'permission_callback',[__CLASS__,'can_manage']]);
        register_rest_route('fdos/v1','/launch/settings',['methods'=>['GET','POST'],'callback',['FDOS_VLS_Launch','settings_response'],'permission_callback',[__CLASS__,'can_manage']]);
        register_rest_route('fdos/v1','/launch/export',['methods'=>'GET','callback'=>fn()=>FDOS_VLS_DB::export_snapshot(),'permission_callback',[__CLASS__,'can_manage']]);
        register_rest_route('fdos/v1','/launch/health',['methods'=>'GET','callback'=>fn()=>FDOS_VLS_Launch::health_report(),'permission_callback',[__CLASS__,'can_manage']]);
    }
    public static function can_record_event(){return current_user_can('fdos_manage')||current_user_can('edit_posts');}
    public static function can_manage(){return current_user_can('fdos_manage')||current_user_can('manage_options');}
    public static function intake(WP_REST_Request $req){
        $p=(array)$req->get_json_params();$website=esc_url_raw($p['website_url']??'');$facebook=esc_url_raw($p['facebook_url']??'');$idea=sanitize_textarea_field($p['business_idea']??'');$email=sanitize_email($p['email']??'');
        $findings=FDOS_VLS_Engine::analyze(['website_url'=>$website,'facebook_url'=>$facebook,'business_idea'=>$idea]);
        $id=FDOS_VLS_DB::insert_intake(['website_url'=>$website,'facebook_url'=>$facebook,'business_idea'=>$idea,'email_hash'=>$email?hash('sha256',strtolower($email)):null,'findings'=>$findings]);
        FDOS_VLS_DB::insert_event(['dedupe_key'=>'scanner_completed:'.$id,'intake_public_id'=>$id,'event_type'=>'scanner_completed','project'=>'Founder Dynasty OS','channel'=>'web','evidence_class'=>'E1','confidence'=>100,'source_type'=>'first_party_server_event','metadata'=>['note'=>'Server verified intake completion; this is not proof of a unique person or commercial outcome.'],'occurred_at'=>current_time('mysql',true)]);
        return new WP_REST_Response(['intake_id'=>$id,'findings'=>$findings,'evidence_policy'=>'FDOS separates verified facts, external evidence, customer evidence, internal observations, hypotheses, assumptions, forecasts, and examples.'],201);
    }
    public static function event(WP_REST_Request $req){
        $p=(array)$req->get_json_params();$class=strtoupper(sanitize_text_field($p['evidence_class']??'E4'));if(!array_key_exists($class,FDOS_VLS_Engine::EVIDENCE_CLASSES))return new WP_Error('fdos_evidence','Invalid evidence class.',['status'=>400]);$exp=sanitize_text_field($p['experiment_id']??'');if($exp&&!FDOS_VLS_DB::get_experiment($exp))return new WP_Error('fdos_experiment','Unknown experiment ID.',['status'=>400]);
        $id=FDOS_VLS_DB::insert_event(['dedupe_key'=>sanitize_text_field($p['dedupe_key']??'')?:null,'intake_public_id'=>sanitize_text_field($p['intake_public_id']??'')?:null,'experiment_id'=>$exp?:null,'event_type'=>sanitize_key($p['event_type']??'event'),'project'=>sanitize_text_field($p['project']??'Founder Dynasty OS'),'channel'=>sanitize_text_field($p['channel']??''),'campaign'=>sanitize_text_field($p['campaign']??''),'numeric_value'=>isset($p['numeric_value'])&&is_numeric($p['numeric_value'])?(float)$p['numeric_value']:null,'currency'=>sanitize_text_field($p['currency']??''),'evidence_class'=>$class,'confidence'=>max(0,min(100,(int)($p['confidence']??0))),'source_type'=>sanitize_key($p['source_type']??'manual'),'source_ref'=>esc_url_raw($p['source_ref']??''),'metadata'=>(array)($p['metadata']??[]),'occurred_at'=>current_time('mysql',true)]);
        return $id?new WP_REST_Response(['event_id'=>$id],201):new WP_Error('fdos_event_store','Unable to store event.',['status'=>500]);
    }
}
