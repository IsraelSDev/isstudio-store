export const siteConfig = {
  name: "ISStudio Store",
  shortName: "ISStudio",
  tagline: "Soluções digitais para vender e escalar",
  description:
    "Marketplace de sistemas, APIs, templates, plugins, SaaS, IA, white label, hospedagem e assinaturas. Pague com Asaas e resgate o código-fonte após a compra.",
  locale: "pt_BR",
  language: "pt-BR",
  keywords: [
    "ISStudio",
    "marketplace digital",
    "sistemas",
    "APIs",
    "templates Next.js",
    "SaaS",
    "inteligência artificial",
    "white label",
    "hospedagem",
    "assinaturas",
    "Asaas",
    "e-commerce de software",
  ],
  social: {
    twitter: "@isstudio",
  },
  get url() {
    const fromEnv = (
      process.env.NEXT_PUBLIC_APP_URL ||
      process.env.FRONTEND_URL ||
      ""
    ).replace(/\/+$/, "");
    if (fromEnv) return fromEnv;
    if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
    return "http://localhost:3000";
  },
} as const;

export function absoluteUrl(path = "/") {
  const base = siteConfig.url.replace(/\/+$/, "");
  if (!path || path === "/") return base;
  return `${base}${path.startsWith("/") ? path : `/${path}`}`;
}
