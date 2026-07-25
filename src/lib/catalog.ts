import type { Category, CategorySlug, Product } from "./types";

export const categories: Category[] = [
  {
    slug: "sistemas",
    name: "Sistemas",
    short: "ERP, CRM e plataformas sob medida",
    description:
      "Sistemas completos prontos para operação: gestão, CRM, e-commerce e painéis administrativos com código-fonte e documentação.",
    accent: "#8b72ff",
    icon: "layers",
  },
  {
    slug: "apis",
    name: "APIs",
    short: "Integrações e serviços prontos",
    description:
      "APIs REST e GraphQL documentadas, com autenticação, rate limit e SDKs para acelerar produtos digitais.",
    accent: "#35e0d6",
    icon: "webhook",
  },
  {
    slug: "templates",
    name: "Templates",
    short: "UI kits e landing pages premium",
    description:
      "Templates de alta conversão para Next.js, React e dashboards — design system incluso e fácil de customizar.",
    accent: "#ff7eb6",
    icon: "layout-template",
  },
  {
    slug: "plugins",
    name: "Plugins",
    short: "Extensões para seu stack",
    description:
      "Plugins e módulos para WordPress, Shopify, Discord, Notion e mais — instale e comece a vender ou operar.",
    accent: "#ffb347",
    icon: "puzzle",
  },
  {
    slug: "licencas",
    name: "Licenças",
    short: "Software e ferramentas licenciadas",
    description:
      "Licenças comerciais de ferramentas, assets e softwares com ativação rápida e suporte ISStudio.",
    accent: "#6ee7b7",
    icon: "key-round",
  },
  {
    slug: "saas",
    name: "SaaS",
    short: "Produtos cloud multi-tenant",
    description:
      "Soluções SaaS white-ready: billing, tenants, dashboard e onboarding já resolvidos para você lançar rápido.",
    accent: "#60a5fa",
    icon: "cloud",
  },
  {
    slug: "ia",
    name: "IA",
    short: "Agentes, chatbots e automação",
    description:
      "Assistentes de IA, RAG, automação de atendimento e agentes de vendas prontos para integrar no seu negócio.",
    accent: "#c084fc",
    icon: "sparkles",
  },
  {
    slug: "white-label",
    name: "White Label",
    short: "Revenda com sua marca",
    description:
      "Produtos white label com painel de revenda, branding próprio e margem recorrente para agências e consultores.",
    accent: "#f472b6",
    icon: "badge-check",
  },
  {
    slug: "hospedagem",
    name: "Hospedagem",
    short: "Infra gerenciada e deploy",
    description:
      "Planos de hospedagem otimizados para Next.js, Node e bancos — SSL, CDN, backups e monitoramento inclusos.",
    accent: "#34d399",
    icon: "server",
  },
  {
    slug: "assinaturas",
    name: "Assinaturas",
    short: "Acesso contínuo e clubes",
    description:
      "Planos mensais e anuais com atualizações, suporte prioritário, créditos de API e acesso a novos lançamentos.",
    accent: "#fbbf24",
    icon: "crown",
  },
];

export const products: Product[] = [
  {
    id: "sys-crm-pulse",
    slug: "crm-pulse",
    name: "CRM Pulse",
    tagline: "CRM comercial completo com pipeline e automações",
    description:
      "Gerencie leads, pipeline Kanban, follow-ups e metas com um CRM pronto para times de vendas.",
    longDescription:
      "O CRM Pulse é um sistema web completo para gestão comercial. Inclui funil visual, scoring de leads, tarefas, e-mails transacionais, relatórios e API aberta. Entrega com código-fonte Next.js + Prisma e painel admin.",
    category: "sistemas",
    price: 2490,
    compareAt: 3490,
    pricingModel: "one-time",
    badge: "destaque",
    featured: true,
    features: [
      "Pipeline Kanban ilimitado",
      "Automações de follow-up",
      "Relatórios e metas",
      "Código-fonte incluso",
      "Documentação técnica",
    ],
    includes: ["Código-fonte", "Licença comercial", "3 meses de suporte", "Deploy guide"],
    stack: ["Next.js", "Prisma", "PostgreSQL", "Tailwind"],
    delivery: "Acesso imediato via download + repositório",
    rating: 4.9,
    reviews: 128,
  },
  {
    id: "sys-erp-core",
    slug: "erp-core",
    name: "ERP Core",
    tagline: "Gestão financeira, estoque e NF-e",
    description:
      "ERP modular para PMEs: financeiro, estoque, pedidos e emissão de documentos fiscais.",
    longDescription:
      "ERP Core cobre o essencial da operação de uma PME. Módulos de contas a pagar/receber, estoque, pedidos e integração fiscal. Arquitetura modular — ative só o que precisa.",
    category: "sistemas",
    price: 4990,
    pricingModel: "one-time",
    badge: "enterprise",
    features: ["Financeiro completo", "Estoque multi-depósito", "Pedidos e PDV", "Módulos ativáveis"],
    includes: ["Código-fonte", "Licença comercial", "Onboarding 1:1 (2h)"],
    stack: ["Next.js", "NestJS", "PostgreSQL"],
    delivery: "Repositório privado + sessão de onboarding",
    rating: 4.8,
    reviews: 64,
  },
  {
    id: "api-payments",
    slug: "payments-gateway-api",
    name: "Payments Gateway API",
    tagline: "Abstração unificada Asaas + MP + PayPal",
    description:
      "Uma única API para cobrar via Asaas, Mercado Pago e PayPal com webhooks normalizados.",
    longDescription:
      "Evite reinventar integrações de pagamento. Esta API unifica Pix, cartão e boleto entre provedores brasileiros e PayPal, com SDKs TypeScript e Python.",
    category: "apis",
    price: 890,
    compareAt: 1290,
    pricingModel: "one-time",
    badge: "popular",
    featured: true,
    features: ["Pix, cartão e boleto", "Webhooks unificados", "SDKs TS + Python", "Sandbox incluso"],
    includes: ["OpenAPI Spec", "SDK", "Exemplos Next.js"],
    stack: ["Node.js", "OpenAPI", "Redis"],
    delivery: "Chave de API + docs em minutos",
    rating: 5.0,
    reviews: 210,
  },
  {
    id: "api-identity",
    slug: "identity-kit-api",
    name: "Identity Kit API",
    tagline: "Auth, SSO e MFA prontos",
    description: "Camada de identidade com JWT, OAuth social, MFA e gestão de sessões.",
    longDescription:
      "Identity Kit entrega autenticação pronta: e-mail/senha, Google, GitHub, MFA TOTP e painel de usuários. Ideal para SaaS multi-tenant.",
    category: "apis",
    price: 690,
    pricingModel: "one-time",
    features: ["OAuth social", "MFA TOTP", "Sessões revogáveis", "RBAC básico"],
    includes: ["API + SDK", "UI de login pronta"],
    stack: ["Node.js", "Redis", "PostgreSQL"],
    delivery: "Acesso via dashboard ISStudio",
    rating: 4.7,
    reviews: 89,
  },
  {
    id: "tpl-aurora",
    slug: "aurora-saas-kit",
    name: "Aurora SaaS Kit",
    tagline: "Template de SaaS dark premium",
    description:
      "Landing, pricing, dashboard, settings e auth — tudo em Next.js App Router.",
    longDescription:
      "Aurora é o kit visual que usamos internamente. Componentes, tokens e páginas prontas para lançar um SaaS em dias, não meses.",
    category: "templates",
    price: 249,
    compareAt: 399,
    pricingModel: "one-time",
    badge: "destaque",
    featured: true,
    features: ["12 páginas prontas", "Design tokens", "Dark mode", "Componentes Radix"],
    includes: ["Figma", "Código Next.js", "Licença comercial"],
    stack: ["Next.js", "Tailwind", "Radix"],
    delivery: "Download imediato",
    rating: 4.9,
    reviews: 312,
  },
  {
    id: "tpl-storefront",
    slug: "storefront-commerce",
    name: "Storefront Commerce",
    tagline: "E-commerce headless de alta conversão",
    description: "Loja virtual Next.js com carrinho, checkout e catálogo otimizado para SEO.",
    longDescription:
      "Template de e-commerce com SSR, filtros, wishlist e checkout multi-gateway. Pensado para marcas digitais brasileiras.",
    category: "templates",
    price: 349,
    pricingModel: "one-time",
    badge: "novo",
    features: ["Catálogo + filtros", "Carrinho persistente", "SEO avançado", "Checkout multi-gateway"],
    includes: ["Código-fonte", "Guia de deploy Vercel"],
    stack: ["Next.js", "Zustand", "Stripe-ready"],
    delivery: "Download imediato",
    rating: 4.8,
    reviews: 97,
  },
  {
    id: "plg-wp-seo",
    slug: "wp-rankboost",
    name: "WP RankBoost",
    tagline: "Plugin SEO + schema + sitemap",
    description: "Plugin WordPress para SEO técnico, schema JSON-LD e sitemaps inteligentes.",
    longDescription:
      "RankBoost adiciona metadados, schema de produtos/artigos, sitemaps e análise on-page no painel do WordPress.",
    category: "plugins",
    price: 149,
    pricingModel: "one-time",
    features: ["Schema JSON-LD", "Sitemap XML", "Análise on-page", "Compatível WooCommerce"],
    includes: ["Licença vitalícia", "Atualizações 1 ano"],
    stack: ["PHP", "WordPress"],
    delivery: "ZIP + chave de ativação",
    rating: 4.6,
    reviews: 154,
  },
  {
    id: "plg-shopify-upsell",
    slug: "shopify-upsell-pro",
    name: "Shopify Upsell Pro",
    tagline: "Upsell e cross-sell no checkout",
    description: "App Shopify para ofertas pós-add-to-cart e no thank-you page.",
    longDescription:
      "Aumente o ticket médio com funis de upsell sem código. Templates A/B, analytics e regras por coleção.",
    category: "plugins",
    price: 79,
    pricingModel: "subscription",
    billingPeriod: "month",
    badge: "popular",
    features: ["Upsell pós-carrinho", "A/B testing", "Analytics", "Regras por coleção"],
    includes: ["Instalação guiada", "Suporte por chat"],
    stack: ["Shopify App", "React"],
    delivery: "Instalação via Shopify App Store",
    rating: 4.7,
    reviews: 203,
  },
  {
    id: "lic-figma-pro",
    slug: "design-pack-pro",
    name: "Design Pack Pro",
    tagline: "Biblioteca de 400+ assets licenciados",
    description: "Ícones, ilustrações e mockups com licença comercial para produtos digitais.",
    longDescription:
      "Pacote com 400+ assets vetoriais, ícones e mockups de device. Licença comercial para uso em clientes.",
    category: "licencas",
    price: 199,
    pricingModel: "one-time",
    features: ["400+ assets", "Licença comercial", "SVG + PNG", "Atualizações trimestrais"],
    includes: ["Download ZIP", "Licença PDF"],
    stack: ["Figma", "SVG"],
    delivery: "Download imediato",
    rating: 4.8,
    reviews: 441,
  },
  {
    id: "saas-inbox",
    slug: "inbox-studio",
    name: "Inbox Studio",
    tagline: "Inbox unificada para times de suporte",
    description: "SaaS de atendimento omnichannel: e-mail, WhatsApp e chat no mesmo painel.",
    longDescription:
      "Inbox Studio centraliza canais, filas e SLAs. Multi-tenant, billing pronto e white-label disponível.",
    category: "saas",
    price: 197,
    pricingModel: "subscription",
    billingPeriod: "month",
    badge: "destaque",
    featured: true,
    features: ["WhatsApp + e-mail + chat", "Filas e SLA", "Multi-agente", "API aberta"],
    includes: ["Trial 14 dias", "Onboarding", "Suporte prioritário"],
    stack: ["Next.js", "Redis", "WebSocket"],
    delivery: "Acesso SaaS imediato",
    rating: 4.9,
    reviews: 176,
  },
  {
    id: "saas-analytics",
    slug: "pulse-analytics",
    name: "Pulse Analytics",
    tagline: "Product analytics privacy-first",
    description: "Métricas de produto sem cookies invasivos — funis, cohorts e heatmaps leves.",
    longDescription:
      "Analytics leve e LGPD-friendly. SDK de 2kb, funis, retention e dashboards compartilháveis.",
    category: "saas",
    price: 99,
    pricingModel: "subscription",
    billingPeriod: "month",
    features: ["Funis e cohorts", "SDK 2kb", "LGPD-ready", "Dashboards shareable"],
    includes: ["Trial 14 dias", "Docs SDK"],
    stack: ["ClickHouse", "Go", "React"],
    delivery: "Acesso SaaS imediato",
    rating: 4.7,
    reviews: 88,
  },
  {
    id: "ia-agent-sales",
    slug: "agente-vendas-ia",
    name: "Agente de Vendas IA",
    tagline: "SDR virtual que qualifica e agenda",
    description:
      "Agente conversacional que qualifica leads no WhatsApp/web e agenda reuniões no seu calendário.",
    longDescription:
      "Treine o agente com seu playbook comercial. Ele responde 24/7, qualifica BANT e cria eventos no Google Calendar / Calendly.",
    category: "ia",
    price: 497,
    compareAt: 697,
    pricingModel: "subscription",
    billingPeriod: "month",
    badge: "novo",
    featured: true,
    features: ["WhatsApp + Web chat", "Qualificação BANT", "Agenda automática", "Handoff humano"],
    includes: ["Setup assistido", "Créditos de tokens", "Playbook template"],
    stack: ["LLM", "RAG", "WhatsApp Cloud API"],
    delivery: "Ativação em até 48h úteis",
    rating: 4.9,
    reviews: 52,
  },
  {
    id: "ia-rag-kit",
    slug: "rag-knowledge-kit",
    name: "RAG Knowledge Kit",
    tagline: "Chat com seus documentos em minutos",
    description: "Kit self-hosted para indexar PDFs/Notion e responder com citações.",
    longDescription:
      "Pipeline RAG completo: ingestão, embeddings, retrieval e UI de chat com citações. Deploy via Docker.",
    category: "ia",
    price: 390,
    pricingModel: "one-time",
    badge: "popular",
    features: ["Ingestão multi-fonte", "Citações", "Docker Compose", "UI de chat"],
    includes: ["Código-fonte", "Guia de deploy"],
    stack: ["Python", "pgvector", "Next.js"],
    delivery: "Repositório + docs",
    rating: 4.8,
    reviews: 119,
  },
  {
    id: "wl-agency",
    slug: "agency-white-label",
    name: "Agency White Label Suite",
    tagline: "Revenda soluções com sua marca",
    description:
      "Painel de revenda, branding custom e margem recorrente em SaaS e automações ISStudio.",
    longDescription:
      "Ideal para agências: ofereça Inbox Studio, Agentes IA e Hospedagem sob sua marca, com comissão recorrente e painel de clientes.",
    category: "white-label",
    price: 990,
    pricingModel: "subscription",
    billingPeriod: "month",
    badge: "enterprise",
    featured: true,
    features: ["Branding total", "Painel de clientes", "Comissão recorrente", "Suporte white-label"],
    includes: ["Onboarding comercial", "Kit de vendas", "SLA dedicado"],
    stack: ["Multi-tenant", "Billing"],
    delivery: "Ativação com gerente de conta",
    rating: 5.0,
    reviews: 27,
  },
  {
    id: "host-edge",
    slug: "edge-hosting",
    name: "Edge Hosting",
    tagline: "Hospedagem Next.js com CDN global",
    description: "Deploy contínuo, SSL, CDN e monitoramento para apps Next.js e Node.",
    longDescription:
      "Infra gerenciada otimizada para App Router. Preview deployments, logs, métricas e backups diários.",
    category: "hospedagem",
    price: 49,
    pricingModel: "subscription",
    billingPeriod: "month",
    badge: "popular",
    features: ["CDN global", "Preview deploys", "SSL automático", "Backups diários"],
    includes: ["3 projetos", "100GB bandwidth", "Suporte 24/5"],
    stack: ["Edge", "Docker", "Nginx"],
    delivery: "Provisionamento em minutos",
    rating: 4.8,
    reviews: 265,
  },
  {
    id: "host-pro",
    slug: "pro-cloud",
    name: "Pro Cloud",
    tagline: "VPS gerenciado com banco incluso",
    description: "VPS com PostgreSQL gerenciado, Redis e monitoramento APM.",
    longDescription:
      "Para workloads mais pesados: VPS com CPU dedicada, DB gerenciado e alertas. Ideal para ERP e SaaS próprios.",
    category: "hospedagem",
    price: 189,
    pricingModel: "subscription",
    billingPeriod: "month",
    badge: "enterprise",
    features: ["4 vCPU / 8GB RAM", "PostgreSQL gerenciado", "Redis", "APM incluso"],
    includes: ["Migracão assistida", "SLA 99.9%"],
    stack: ["Linux", "PostgreSQL", "Redis"],
    delivery: "Provisionamento em até 1h",
    rating: 4.9,
    reviews: 73,
  },
  {
    id: "sub-studio-plus",
    slug: "studio-plus",
    name: "Studio+",
    tagline: "Clube de soluções e atualizações",
    description:
      "Acesso a novos templates, créditos de API e descontos em todo o catálogo.",
    longDescription:
      "Assinatura mensal que libera downloads ilimitados de templates, 50k créditos de API e 20% off em sistemas e IA.",
    category: "assinaturas",
    price: 79,
    compareAt: 119,
    pricingModel: "subscription",
    billingPeriod: "month",
    badge: "destaque",
    featured: true,
    features: ["Templates ilimitados", "50k créditos API", "20% off no catálogo", "Suporte prioritário"],
    includes: ["Acesso imediato", "Cancelamento fácil"],
    stack: ["Membership"],
    delivery: "Ativação instantânea",
    rating: 4.9,
    reviews: 508,
  },
  {
    id: "sub-studio-annual",
    slug: "studio-annual",
    name: "Studio Annual",
    tagline: "Tudo do Studio+ com 2 meses off",
    description: "Plano anual do clube ISStudio com créditos dobrados e prioridade em lançamentos.",
    longDescription:
      "Mesmos benefícios do Studio+ com economia de 2 meses, 100k créditos/mês e early access a betas.",
    category: "assinaturas",
    price: 790,
    compareAt: 948,
    pricingModel: "subscription",
    billingPeriod: "year",
    badge: "popular",
    features: ["2 meses grátis", "100k créditos API", "Early access", "Suporte VIP"],
    includes: ["Acesso imediato", "Nota fiscal"],
    stack: ["Membership"],
    delivery: "Ativação instantânea",
    rating: 5.0,
    reviews: 191,
  },
];

export function getCategory(slug: string): Category | undefined {
  return categories.find((c) => c.slug === slug);
}

export function getProduct(slug: string): Product | undefined {
  return products.find((p) => p.slug === slug);
}

export function getProductsByCategory(slug: CategorySlug): Product[] {
  return products.filter((p) => p.category === slug);
}

export function getFeaturedProducts(): Product[] {
  return products.filter((p) => p.featured);
}

export function formatPrice(value: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

export function pricingLabel(product: Product): string {
  if (product.pricingModel === "custom") return "Sob consulta";
  if (product.pricingModel === "subscription") {
    return product.billingPeriod === "year" ? "/ano" : "/mês";
  }
  return "pagamento único";
}
