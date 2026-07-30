export interface Tenant {
  id: string;
  slug: string;
  /** Domínio custom, ex.: app.agencia.com.br */
  customDomain: string | null;
  brandName: string;
  brandColor: string;
  logoUrl: string | null;
  commissionRate: number;
}

/**
 * Resolve o tenant a partir do Host.
 * Em produção, rode no middleware e injete `x-tenant-id` nas rotas internas.
 */
export function resolveTenantFromHost(
  host: string,
  tenants: Tenant[],
  rootDomain: string,
): Tenant | null {
  const normalized = host.toLowerCase().split(":")[0];

  const byDomain = tenants.find(
    (t) => t.customDomain && t.customDomain.toLowerCase() === normalized,
  );
  if (byDomain) return byDomain;

  const suffix = `.${rootDomain.toLowerCase().split(":")[0]}`;
  if (normalized.endsWith(suffix)) {
    const slug = normalized.slice(0, -suffix.length);
    return tenants.find((t) => t.slug === slug) ?? null;
  }

  return null;
}
