<?php
declare(strict_types=1);

final class RankBoost_Schema
{
    public static function print_json_ld(): void
    {
        $graph = self::build_graph();
        if ($graph === []) {
            return;
        }

        $payload = wp_json_encode(
            [
                '@context' => 'https://schema.org',
                '@graph'   => $graph,
            ],
            JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE
        );

        if ($payload === false) {
            return;
        }

        echo '<script type="application/ld+json">' . $payload . '</script>' . "\n";
    }

    /** @return array<int, array<string, mixed>> */
    private static function build_graph(): array
    {
        $graph = [self::organization(), self::website()];

        if (is_singular('post')) {
            $graph[] = self::article(get_post());
        }

        if (is_singular('product') && function_exists('wc_get_product')) {
            $graph[] = self::product(get_the_ID());
        }

        return array_values(array_filter($graph));
    }

    /** @return array<string, mixed> */
    private static function organization(): array
    {
        return [
            '@type' => 'Organization',
            '@id'   => home_url('/#organization'),
            'name'  => get_bloginfo('name'),
            'url'   => home_url('/'),
        ];
    }

    /** @return array<string, mixed> */
    private static function website(): array
    {
        return [
            '@type'     => 'WebSite',
            '@id'       => home_url('/#website'),
            'url'       => home_url('/'),
            'name'      => get_bloginfo('name'),
            'publisher' => ['@id' => home_url('/#organization')],
        ];
    }

    /** @return array<string, mixed>|null */
    private static function article(?WP_Post $post): ?array
    {
        if (!$post instanceof WP_Post) {
            return null;
        }

        return [
            '@type'            => 'Article',
            '@id'              => get_permalink($post) . '#article',
            'headline'         => get_the_title($post),
            'datePublished'    => get_the_date(DATE_W3C, $post),
            'dateModified'     => get_the_modified_date(DATE_W3C, $post),
            'mainEntityOfPage' => get_permalink($post),
            'author'           => [
                '@type' => 'Person',
                'name'  => get_the_author_meta('display_name', (int) $post->post_author),
            ],
            'publisher'        => ['@id' => home_url('/#organization')],
        ];
    }

    /** @return array<string, mixed>|null */
    private static function product(int $product_id): ?array
    {
        $product = wc_get_product($product_id);
        if (!$product) {
            return null;
        }

        return [
            '@type'  => 'Product',
            'name'   => $product->get_name(),
            'sku'    => $product->get_sku() ?: null,
            'offers' => [
                '@type'         => 'Offer',
                'priceCurrency' => get_woocommerce_currency(),
                'price'         => $product->get_price(),
                'availability'  => $product->is_in_stock()
                    ? 'https://schema.org/InStock'
                    : 'https://schema.org/OutOfStock',
                'url'           => get_permalink($product_id),
            ],
        ];
    }
}
