<?php
declare(strict_types=1);

final class RankBoost_Sitemap
{
    private const QUERY_VAR = 'rankboost_sitemap';
    private const CACHE_KEY = 'rankboost_sitemap_xml';

    public static function register_rewrite(): void
    {
        add_rewrite_rule(
            '^rankboost-sitemap\\.xml$',
            'index.php?' . self::QUERY_VAR . '=1',
            'top'
        );
    }

    /** @param array<string, mixed> $vars */
    public static function query_vars(array $vars): array
    {
        $vars[] = self::QUERY_VAR;
        return $vars;
    }

    public static function invalidate_cache(): void
    {
        delete_transient(self::CACHE_KEY);
    }

    public static function serve(): void
    {
        if ((int) get_query_var(self::QUERY_VAR) !== 1) {
            return;
        }

        $xml = get_transient(self::CACHE_KEY);
        if (!is_string($xml) || $xml === '') {
            $xml = self::build();
            set_transient(self::CACHE_KEY, $xml, 12 * HOUR_IN_SECONDS);
        }

        status_header(200);
        header('Content-Type: application/xml; charset=UTF-8');
        header('X-Robots-Tag: noindex');
        echo $xml;
        exit;
    }

    private static function build(): string
    {
        $posts = get_posts([
            'post_type'      => ['post', 'page', 'product'],
            'post_status'    => 'publish',
            'posts_per_page' => 5000,
            'orderby'        => 'modified',
            'order'          => 'DESC',
            'no_found_rows'  => true,
        ]);

        $urls = '';
        foreach ($posts as $post) {
            $loc     = esc_url(get_permalink($post));
            $lastmod = esc_html(get_the_modified_date(DATE_W3C, $post));
            $urls   .= "  <url>\n    <loc>{$loc}</loc>\n    <lastmod>{$lastmod}</lastmod>\n  </url>\n";
        }

        return '<?xml version="1.0" encoding="UTF-8"?>' . "\n"
            . '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">' . "\n"
            . $urls
            . '</urlset>';
    }
}
