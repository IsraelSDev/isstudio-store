/**
 * Papéis e permissões.
 *
 * Comece com poucos papéis: a maior fonte de bug de autorização é papel demais
 * com sobreposição mal definida. Prefira adicionar permissão a um papel
 * existente antes de criar um novo.
 */
export const permissions = [
  "user:read",
  "user:write",
  "session:revoke",
  "billing:read",
  "billing:write",
  "audit:read",
] as const;

export type Permission = (typeof permissions)[number];

export const roles = {
  owner: [...permissions],
  admin: [
    "user:read",
    "user:write",
    "session:revoke",
    "billing:read",
    "audit:read",
  ],
  member: ["user:read"],
} satisfies Record<string, Permission[]>;

export type Role = keyof typeof roles;

export function isRole(value: string): value is Role {
  return value in roles;
}

export function permissionsFor(userRoles: string[]): Set<Permission> {
  const granted = new Set<Permission>();
  for (const role of userRoles) {
    if (!isRole(role)) continue;
    for (const permission of roles[role]) granted.add(permission);
  }
  return granted;
}

export function can(userRoles: string[], permission: Permission): boolean {
  return permissionsFor(userRoles).has(permission);
}

export class ForbiddenError extends Error {
  constructor(permission: Permission) {
    super(`Acesso negado: requer permissão "${permission}".`);
  }
}

/** Use nos handlers para falhar cedo, antes de qualquer efeito colateral. */
export function assertCan(userRoles: string[], permission: Permission): void {
  if (!can(userRoles, permission)) throw new ForbiddenError(permission);
}
