<?php
if (!defined('ABSPATH')) exit;

class FDOS_VLS_Shortcode {
    public static function register() {
        add_shortcode('fdos_value_leak_scanner',[__CLASS__,'render']);
        add_action('wp_enqueue_scripts',[__CLASS__,'register_assets']);
    }
    public static function register_assets() {
        wp_register_style('fdos-vls-public',plugins_url('../assets/public.css',__FILE__),[],FDOS_VLS_VERSION);
        wp_register_script('fdos-vls-public',plugins_url('../assets/public.js',__FILE__),[],FDOS_VLS_VERSION,true);
    }
    public static function render() {
        wp_enqueue_style('fdos-vls-public');
        wp_enqueue_script('fdos-vls-public');
        $endpoint=esc_url(rest_url('fdos/v1/intakes'));
        $conversion=esc_url(rest_url('fdos/v1/conversions'));
        ob_start(); ?>
        <div class="fdos-vls" data-fdos-scanner data-endpoint="<?php echo esc_attr($endpoint);?>" data-conversion-endpoint="<?php echo esc_attr($conversion);?>">
          <h2>FDOS Value Leak Scanner</h2>
          <p>Submit a website, Facebook business page, or business idea. FDOS labels what it observes, what it infers, and what should be tested next.</p>
          <form>
            <p><label>Website URL<br><input name="website_url" type="url" inputmode="url" autocomplete="url"></label></p>
            <p><label>Facebook Business URL<br><input name="facebook_url" type="url" inputmode="url"></label></p>
            <p><label>Business idea / description<br><textarea name="business_idea" rows="5"></textarea></label></p>
            <p><button type="submit">Find My Highest-Priority Value Leak</button></p>
          </form>
          <div data-fdos-result aria-live="polite" aria-atomic="true"></div>
        </div>
        <?php return ob_get_clean();
    }
}
