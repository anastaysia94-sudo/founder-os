<?php
if (!defined('ABSPATH')) exit;

class FDOS_VLS_Launch {
    const CRON='fdos_vls_daily_maintenance';
    public static function register(){add_action(self::CRON,[__CLASS__,'maintenance']);add_action('admin_menu',[__CLASS__,'menu']);}
    public static function activate(){self::ensure_cap();self::ensure_defaults();self::ensure_cron();}
    public static function deactivate(){$ts=wp_next_scheduled(self::CRON);if($ts)wp_unschedule_event($ts,self::CRON);}
    public static function maybe_bootstrap(){self::ensure_cap();self::ensure_defaults();self::ensure_cron();}
    private static function ensure_cap(){$r=get_role('administrator');if($r&&!$r->has_cap('fdos_manage'))$r->add_cap('fdos_manage');}
    private static function ensure_defaults(){if(get_option('fdos_vls_launch_settings',null)===null)update_option('fdos_vls_launch_settings',['browser_event_retention_days'=>0,'intake_retention_days'=>0,'qa_retention_days'=>180,'remove_data_on_uninstall'=>false,'health_check_enabled'=>true],false);}
    private static function ensure_cron(){if(!wp_next_scheduled(self::CRON))wp_schedule_event(time()+HOUR_IN_SECONDS,'daily',self::CRON);}
    public static function settings(){return wp_parse_args((array)get_option('fdos_vls_launch_settings',[]),['browser_event_retention_days'=>0,'intake_retention_days'=>0,'qa_retention_days'=>180,'remove_data_on_uninstall'=>false,'health_check_enabled'=>true]);}
    public static function settings_response(WP_REST_Request $r){if($r->get_method()==='GET')return self::settings();$p=(array)$r->get_json_params();$s=self::settings();foreach(['browser_event_retention_days','intake_retention_days','qa_retention_days'] as $k)if(isset($p[$k]))$s[$k]=max(0,(int)$p[$k]);foreach(['remove_data_on_uninstall','health_check_enabled'] as $k)if(isset($p[$k]))$s[$k]=(bool)$p[$k];update_option('fdos_vls_launch_settings',$s,false);return $s;}
    public static function maintenance(){$s=self::settings();$ret=FDOS_VLS_DB::retention_cleanup($s['browser_event_retention_days'],$s['intake_retention_days'],$s['qa_retention_days']);$health=$s['health_check_enabled']?self::health_report():null;FDOS_VLS_Deployment::log('maintenance',['retention'=>$ret,'health'=>$health]);}
    public static function health_report(){$latest=FDOS_VLS_DB::latest_qa_run();$p3=(array)get_option('fdos_vls_last_production_verification',[]);$r=['plugin_version'=>FDOS_VLS_VERSION,'db_version'=>FDOS_VLS_DB::DB_VERSION,'p1_internal_pass'=>!empty($latest)&&$latest['internal_status']==='PASS','p2_runtime_ready'=>!empty(FDOS_VLS_Deployment::diagnostics()['ready']),'p3_production_verified'=>!empty($p3['production_verified']),'shopify_secret_configured'=>(bool)FDOS_VLS_Shopify::secret(),'shopify_verified_webhook_count'=>FDOS_VLS_DB::count_shopify_verified_webhooks(),'scheduled_maintenance'=>(bool)wp_next_scheduled(self::CRON),'retention'=>self::settings(),'generated_at'=>current_time('mysql',true),'truth_boundary'=>'Health status is operational evidence, not proof of product-market fit or financial results.'];update_option('fdos_vls_last_health_report',$r,false);return $r;}
    public static function menu(){add_submenu_page('fdos-command-center','Launch Settings','Launch Settings','fdos_manage','fdos-launch-settings',[__CLASS__,'page']);}
    public static function page(){if(!current_user_can('fdos_manage'))return;$s=self::settings();?><div class="wrap"><h1>FDOS Launch Settings</h1><p>Retention values of 0 disable automatic deletion.</p><pre><?php echo esc_html(wp_json_encode($s,JSON_PRETTY_PRINT));?></pre><p>Use the authenticated REST endpoint <code>/wp-json/fdos/v1/launch/settings</code> to change settings and <code>/wp-json/fdos/v1/launch/health</code> to inspect health.</p></div><?php }
}
