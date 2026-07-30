# WP RankBoost

Plugin WordPress para SEO técnico, schema JSON-LD e sitemaps inteligentes.

**Stack:** PHP 8.1+ · WordPress 6.x

## Instalação

1. Copie a pasta `wp-rankboost` para `wp-content/plugins/`.
2. Ative em Plugins → WP RankBoost.
3. Configure em Ajustes → RankBoost.

## Estrutura

```
wp-rankboost.php           Bootstrap do plugin
includes/class-schema.php  Schema JSON-LD por tipo de post
includes/class-sitemap.php Sitemap XML com cache
```

## Por onde começar

1. **Estenda o schema** em `class-schema.php` para CPT do seu tema.
2. **WooCommerce.** Implemente `Product` schema com preço e disponibilidade.
3. **Sitemap.** O cache é invalidado em `save_post`. Se usar Cloudflare/LiteSpeed,
   purge `/rankboost-sitemap.xml` no mesmo gancho.

## Decisões do kit

- Sem Composer no runtime — instala em qualquer shared hosting.
- Schema montado como array e só no final `wp_json_encode` — evita XSS.
