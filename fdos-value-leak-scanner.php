<?php
/**
 * Plugin Name: FDOS Value Leak Scanner
 * Description: Founder Dynasty OS 10.0 Value Leak Scanner, evidence engine, experiment system, Shopify evidence adapter, and launch verification tooling.
 * Version: 1.0.1
 * Requires at least: 6.0
 * Requires PHP: 7.4
 */

if (!defined('ABSPATH')) { exit; }

define('FDOS_VLS_VERSION', '1.0.1');
define('FDOS_VLS_FILE', __FILE__);
define('FDOS_VLS_DIR', plugin_dir_path(__FILE__));
define('FDOS_VLS_URL', plugin_dir_url(__FILE__));

require_once FDOS_VLS_DIR . 'includes/class-fdos-vls-db.php';
require_once FDOS_VLS_DIR . 'includes/class-fdos-vls-engine.php';
require_once FDOS_VLS_DIR . 'includes/class-fdos-vls-live-evidence.php';
require_once FDOS_VLS_DIR . 'includes/class-fdos-vls-experiments.php';
require_once FDOS_VLS_DIR . 'includes/class-fdos-vls-conversion.php';
require_once FDOS_VLS_DIR . 'includes/class-fdos-vls-shopify.php';
require_once FDOS_VLS_DIR . 'includes/class-fdos-vls-deployment.php';
require_once FDOS_VLS_DIR . 'includes/class-fdos-vls-production-verification.php';
require_once FDOS_VLS_DIR . 'includes/class-fdos-vls-qa.php';
require_once FDOS_VLS_DIR . 'includes/class-fdos-vls-command-center.php';
require_once FDOS_VLS_DIR . 'includes/class-fdos-vls-launch.php';
require_once FDOS_VLS_DIR . 'includes/class-fdos-vls-rest.php';
require_once FDOS_VLS_DIR . 'includes/class-fdos-vls-shortcode.php';

register_activation_hook(__FILE__, array('FDOS_VLS_DB', 'activate'));
register_activation_hook(__FILE__, array('FDOS_VLS_Launch', 'activate'));
register_deactivation_hook(__FILE__, array('FDOS_VLS_Launch', 'deactivate'));

add_action('plugins_loaded', array('FDOS_VLS_DB', 'maybe_upgrade'));
add_action('plugins_loaded', array('FDOS_VLS_Launch', 'maybe_bootstrap'));

FDOS_VLS_REST::register();
FDOS_VLS_Shortcode::register();
FDOS_VLS_Command_Center::register();
FDOS_VLS_Deployment::register();
FDOS_VLS_Production_Verification::register();
FDOS_VLS_Launch::register();
