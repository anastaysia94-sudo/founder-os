<?php
if (!defined('ABSPATH')) exit;

class FDOS_VLS_Production_Verification {
    public static function register(){add_action('admin_menu',[__CLASS__,'menu']);}
    public static function expected_shop(){return strtolower(trim((string)get_option('fdos_vls_expected_shopify_shop','')));}
    public static function public_proof(){return ['ok'=>true,'product'=>'Founder Dynasty OS','component'=>'Value Leak Scanner','plugin_version'=>FDOS_VLS_VERSION,'site_host'=>wp_parse_url(home_url('/'),PHP_URL_HOST),'https'=>is_ssl(),'rest_namespace'=>'fdos/v1','generated_at'=>current_time('mysql',true)];}
    private static function http_probe($url){$r=wp_safe_remote_get($url,['timeout'=>10,'redirection'=>3,'limit_response_size'=>131072]);if(is_wp_error($r))return ['ok'=>false,'error'=>$r->get_error_message()];$code=(int)wp_remote_retrieve_response_code($r);return ['ok'=>$code>=200&&$code<400,'status'=>$code,'body'=>wp_remote_retrieve_body($r)];}
    public static function verify(){
        $checks=[];$add=function($id,$status,$evidence,$detail)use(&$checks){$checks[]=['id'=>$id,'status'=>$status,'evidence_class'=>$evidence,'detail'=>$detail];};
        $p2=FDOS_VLS_Deployment::launch_gate();$add('p2_launch_gate',!empty($p2['ready_to_launch'])?'PASS':'FAIL','E4',$p2);
        $home=self::http_probe(home_url('/'));$add('homepage_http',!empty($home['ok'])?'PASS':'FAIL','E2',$home);
        $health=self::http_probe(rest_url('fdos/v1/health'));$health_ok=!empty($health['ok'])&&strpos((string)($health['body']??''),FDOS_VLS_VERSION)!==false;$add('health_http',$health_ok?'PASS':'FAIL','E2',$health);
        $proof=self::http_probe(rest_url('fdos/v1/production/public-proof'));$add('public_proof_http',!empty($proof['ok'])?'PASS':'FAIL','E2',$proof);
        $shop=self::expected_shop();$shop_ok=(bool)preg_match('/^[a-z0-9][a-z0-9-]*\.myshopify\.com$/',$shop);$add('expected_shop',$shop_ok?'PASS':'PENDING','E4',$shop?:'Not configured');
        $last=FDOS_VLS_DB::latest_shopify_webhook_event();$count=FDOS_VLS_DB::count_shopify_verified_webhooks();$add('verified_shopify_webhook',$count>0?'PASS':'PENDING',$count>0?'E2':'E4',$last?:'No HMAC-verified Shopify webhook stored yet.');
        if($shop_ok&&$last){$meta=(array)($last['metadata']??[]);$match=strtolower((string)($meta['shop_domain']??''))===$shop;$add('shop_identity_match',$match?'PASS':'FAIL','E2',$meta['shop_domain']??'');}
        $add('https_runtime',is_ssl()?'PASS':'FAIL','E2',is_ssl());$host=strtolower((string)wp_parse_url(home_url('/'),PHP_URL_HOST));$public=$host&&!in_array($host,['localhost','127.0.0.1','::1'],true)&&substr($host,-6)!=='.local';$add('public_hostname',$public?'PASS':'FAIL','E2',$host);
        $blocking=count(array_filter($checks,fn($c)=>$c['status']==='FAIL'));$pending=count(array_filter($checks,fn($c)=>$c['status']==='PENDING'));
        $r=['production_verified'=>$blocking===0&&$pending===0,'runtime_deployed'=>$public&&!empty($home['ok']),'blocking_count'=>$blocking,'pending_count'=>$pending,'checks'=>$checks,'shopify_verified_webhook_count'=>$count,'last_shopify_webhook'=>$last,'verified_at'=>current_time('mysql',true),'truth_boundary'=>'Production verification requires real HTTP and webhook evidence. Internal code tests cannot substitute for these external observations.'];update_option('fdos_vls_last_production_verification',$r,false);FDOS_VLS_Deployment::log('production_verify',$r);return $r;
    }
    public static function verify_response(){return new WP_REST_Response(self::verify(),200);}
    public static function settings_response(WP_REST_Request $r){$p=(array)$r->get_json_params();$shop=strtolower(trim((string)($p['shop']??'')));if($shop&&!preg_match('/^[a-z0-9][a-z0-9-]*\.myshopify\.com$/',$shop))return new WP_Error('fdos_shop','Shop must be a canonical *.myshopify.com domain.',['status'=>400]);update_option('fdos_vls_expected_shopify_shop',$shop,false);return ['shop'=>$shop];}
    public static function webhook_target(){return ['url'=>rest_url('fdos/v1/shopify/webhook'),'topics'=>FDOS_VLS_Shopify::ALLOWED_TOPICS,'secret_configured'=>(bool)FDOS_VLS_Shopify::secret(),'expected_shop'=>self::expected_shop(),'note'=>'A live PASS requires actual HMAC-verified delivery from the expected Shopify store.'];}
    public static function menu(){add_submenu_page('fdos-command-center','Production Verify','Production Verify','fdos_manage','fdos-production-verify',[__CLASS__,'page']);}
    public static function page(){if(!current_user_can('fdos_manage'))return;$last=(array)get_option('fdos_vls_last_production_verification',[]);?><div class="wrap"><h1>FDOS Production Proof</h1><p>Webhook target: <code><?php echo esc_html(rest_url('fdos/v1/shopify/webhook'));?></code></p><pre><?php echo esc_html(wp_json_encode($last,JSON_PRETTY_PRINT));?></pre></div><?php }
}
