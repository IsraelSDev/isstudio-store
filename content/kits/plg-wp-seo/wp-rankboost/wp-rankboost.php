<?php
/**
 * Plugin Name: WP RankBoost
 * Description: SEO técnico, schema JSON-LD e sitemaps inteligentes.
 * Version:     0.1.0
 * Author:      ISStudio
 * License:     Proprietary
 * Text Domain: wp-rankboost
 */

declare(strict_types=1);

if (!defined('ABSPATH')) {
    exit;
}

define('RANKBOOST_VERSION', '0.1.0');
define('RANKBOOST_PATH', plugin_dir_path(__FILE__));
define('RANKBOOST_URL', plugin_dir_url(__FILE__));

require_once RANKBOOST_PATH . 'includes/class-schema.php';
require_once RANKBOOST_PATH . 'includes/class-sitemap.php';

final class RankBoost_Plugin
{
    public static function boot(): void
    {
        add_action('wp_head', [RankBoost_Schema::class, 'print_json_ld'], 5);
        add_action('init', [RankBoost_Sitemap::class, 'register_rewrite']);
        add_action('save_post', [RankBoost_Sitemap::class, 'invalidate_cache']);
        add_filter('query_vars', [RankBoost_Sitemap::class, 'query_vars']);
        add_action('template_redirect', [RankBoost_Sitemap::class, 'serve']);
    }
}

add_action('plugins_loaded', [RankBoost_Plugin::class, 'boot']);
