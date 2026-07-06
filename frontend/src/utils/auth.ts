export function hasAdminRole(roles: unknown): boolean {
  if (!Array.isArray(roles)) {
    return false;
  }

  return roles.some((role) => typeof role === "string" && role.toLowerCase().includes("admin"));
}