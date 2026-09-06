<?php
if (!defined('WP_UNINSTALL_PLUGIN')) exit;
$settings=get_option('fdos_vls_launch_settings',[]);
if(empty($settings['remove_data_on_uninstall'])) return;
global $wpdb;
foreach(['fdos_intakes','fdos_evidence_events','fdos_experiments','fdos_qa_runs'] as $suffix){
    $table=$wpdb->prefix.$suffix;
    if(preg_match('/^[A-Za-z0-9_]+$/',$table)) $wpdb->query("DROP TABLE IF EXISTS `$table`");
}
foreach([
 'fdos_vls_db_version','fdos_vls_shopify_webhook_secret','fdos_vls_last_deployment_report',
 'fdos_vls_deployment_log','fdos_vls_expected_shopify_shop','fdos_vls_last_production_verification',
 'fdos_vls_launch_settings','fdos_vls_last_health_report'
] as $opt) delete_option($opt);
$role=get_role('administrator');
if($role) $role->remove_cap('fdos_manage');
