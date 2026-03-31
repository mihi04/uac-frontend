/**
 * Aligns with backend/apps/users/permissions.py role names.
 */

const ADMIN_ROLES = new Set(["admin", "super_admin"]);
const MANAGER_ROLES = new Set(["manager", "operations_manager", "finance_manager"]);
const ADMIN_OR_MANAGER = new Set([...ADMIN_ROLES, ...MANAGER_ROLES]);

const FINANCE_ROLES = new Set(["admin", "super_admin", "accounts", "finance_manager"]);

function normRole(role) {
  return (role || "").toLowerCase().trim();
}

/** Full Admin dropdown (user/group CRUD etc.) — backend IsAdminOrManager */
export function canAccessAdminMenu(user) {
  if (!user) return false;
  if (user.is_superuser || user.is_staff) return true;
  const r = normRole(user.role);
  return ADMIN_OR_MANAGER.has(r);
}

/** Finance-heavy screens (billing, accounting) — mirror IsFinanceTeam where useful */
export function canAccessFinanceScreens(user) {
  if (!user) return false;
  if (user.is_superuser) return true;
  const r = normRole(user.role);
  return FINANCE_ROLES.has(r);
}

/**
 * @param {import("./AuthContext.jsx").user} user
 * @param {{ label: string, screen: string }[]} items
 */
export function filterAdminItems(user, items) {
  if (canAccessAdminMenu(user)) return items;
  return [];
}

/**
 * Optional: hide pricing from non-finance if desired
 */
export function filterMenuItems(user, items) {
  if (!user) return [];
  const fin = canAccessFinanceScreens(user);
  if (fin) return items;
  return items.filter(
    (i) => !["pricing", "accounting"].includes(i.screen)
  );
}
