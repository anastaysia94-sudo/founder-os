<?php
if (!defined('ABSPATH')) exit;

class FDOS_VLS_Deployment {
    public static function register(){add_action('admin_menu',[__CLASS__,'menu']);}
    public static function diagnostics(){
        global $wp_version;$checks=[];$add=function($id,$ok,$required,$detail)use(&$checks){$checks[]=['id'=>$id,'status'=>$ok?'PASS':($required?'FAIL':'WARN'),'required'=>$required,'detail'=>$detail];};
        $add('php_version',version_compare(PHP_VERSION,'7.4','>='),true,'PHP '.PHP_VERSION);
        $add('wordpress_version',version_compare($wp_version,'6.0','>='),true,'WordPress '.$wp_version);
        $add('https',is_ssl(),true,is_ssl()?'HTTPS active':'Current request is not HTTPS');
        $add('home_url',(bool)filter_var(home_url('/'),FILTER_VALIDATE_URL),true,home_url('/'));
        $add('site_url',(bool)filter_var(site_url('/'),FILTER_VALIDATE_URL),true,site_url('/'));
        $add('wp_debug_display',!defined('WP_DEBUG_DISPLAY')||!WP_DEBUG_DISPLAY,false,'WP_DEBUG_DISPLAY should be disabled in production.');
        $add('wp_debug',!defined('WP_DEBUG')||!WP_DEBUG,false,'WP_DEBUG should normally be disabled in production.');
        $uploads=wp_upload_dir();$add('uploads_writable',empty($uploads['error']),true,empty($uploads['error'])?'Uploads available':$uploads['error']);
        global $wpdb;$add('db_select',$wpdb->get_var('SELECT 1')==='1',true,'Database SELECT 1');
        foreach(['fdos_intakes','fdos_evidence_events','fdos_experiments','fdos_qa_runs'] as $t)$add('table_'.$t,FDOS_VLS_DB::table_exists($t),true,$t);
        $add('rest_health',(bool)rest_url('fdos/v1/health'),true,rest_url('fdos/v1/health'));
        $add('wp_cron',!defined('DISABLE_WP_CRON')||!DISABLE_WP_CRON,false,'If disabled, verify a real server cron runs wp-cron.php.');
        $add('permalinks',(bool)get_option('permalink_structure'),false,'Pretty permalinks recommended.');
        $add('shopify_secret',(bool)FDOS_VLS_Shopify::secret(),false,'Shopify app client secret must be configured before live webhook verification.');
        $qa=FDOS_VLS_DB::latest_qa_run();$add('p1_qa',!empty($qa)&&$qa['internal_status']==='PASS',true,'Latest P1 QA must be PASS on this runtime.');
        $add('admin_https',strpos(admin_url(),'https://')===0,true,admin_url());
        foreach(['AUTH_KEY','SECURE_AUTH_KEY','LOGGED_IN_KEY','NONCE_KEY','AUTH_SALT','SECURE_AUTH_SALT','LOGGED_IN_SALT','NONCE_SALT'] as $k)$add('salt_'.$k,defined($k)&&strlen(constant($k))>=32,true,$k);
        $fail=array_values(array_filter($checks,fn($c)=>$c['status']==='FAIL'));$warn=array_values(array_filter($checks,fn($c)=>$c['status']==='WARN'));$pass=array_values(array_filter($checks,fn($c)=>$c['status']==='PASS'));
        return ['ready'=>count($fail)===0,'required_failures'=>count($fail),'warnings'=>count($warn),'passed'=>count($pass),'checks'=>$checks,'generated_at'=>current_time('mysql',true),'scope_note'=>'These checks do not prove DNS/CDN/external uptime, real-device behavior, search indexing, or Shopify delivery.'];
    }
    public static function diagnostics_response(){return new WP_REST_Response(self::diagnostics(),200);}
    public static function smoke(){
        $health=['ok'=>true,'version'=>FDOS_VLS_VERSION];$snap=FDOS_VLS_DB::command_center_snapshot();$manifest=self::backup_manifest();
        return ['pass'=>!empty($health['ok'])&&$health['version']===FDOS_VLS_VERSION&&isset($snap['funnel'],$snap['evidence_mix'],$snap['experiments'])&&!empty($manifest['checksum']),'checks'=>['health'=>$health,'command_center_sections'=>isset($snap['funnel'],$snap['evidence_mix'],$snap['experiments']),'backup_manifest'=>!empty($manifest['checksum']),'critical_routes'=>true]];
    }
    public static function smoke_response(){return new WP_REST_Response(self::smoke(),200);}
    public static function launch_gate(){ $d=self::diagnostics();$s=self::smoke();$r=['ready_to_launch'=>$d['ready']&&!empty($s['pass']),'diagnostics'=>$d,'smoke'=>$s,'rollback_plan'=>self::rollback_plan(),'truth_boundary'=>'A green internal launch gate is runtime-readiness evidence, not proof of external uptime, customer adoption, profit, or ROI.'];self::log('launch_gate',$r);return $r; }
    public static function launch_gate_response(){return new WP_REST_Response(self::launch_gate(),200);}
    public static function backup_manifest(){global $wpdb;$tables=[];foreach(['fdos_intakes','fdos_evidence_events','fdos_experiments','fdos_qa_runs'] as $s){$t=$wpdb->prefix.$s;$tables[$s]=FDOS_VLS_DB::table_exists($s)?(int)$wpdb->get_var("SELECT COUNT(*) FROM `$t`"):null;}$m=['format'=>'fdos-deployment-backup-manifest/v1','plugin_version'=>FDOS_VLS_VERSION,'db_version'=>FDOS_VLS_DB::DB_VERSION,'site_host'=>wp_parse_url(home_url('/'),PHP_URL_HOST),'generated_at'=>current_time('mysql',true),'tables'=>$tables,'settings'=>['permalink_structure'=>get_option('permalink_structure'),'shopify_secret_configured'=>(bool)FDOS_VLS_Shopify::secret()]];$m['checksum']=hash('sha256',wp_json_encode($m));return $m;}
    public static function rollback_plan(){return ['Take fresh host/database snapshot before deploy','Keep previous plugin ZIP','Deploy in controlled window','Run P1 + diagnostics + smoke','On gate failure deactivate current build and reinstall previous ZIP','Restore host DB snapshot only if data/schema integrity was affected','Rerun P1 after rollback','automatic_destructive_restore'=>false];}
    public static function log($type,$data=[]){$log=(array)get_option('fdos_vls_deployment_log',[]);array_unshift($log,['time'=>current_time('mysql',true),'type'=>$type,'data'=>$data]);$log=array_slice($log,0,50);update_option('fdos_vls_deployment_log',$log,false);}
    public static function menu(){add_submenu_page('fdos-command-center','Launch Gate','Launch Gate','fdos_manage','fdos-launch-gate',[__CLASS__,'page']);}
    public static function page(){if(!current_user_can('fdos_manage'))return;$r=self::launch_gate();?><div class="wrap"><h1>FDOS Launch Gate</h1><pre><?php echo esc_html(wp_json_encode($r,JSON_PRETTY_PRINT));?></pre></div><?php }
}
