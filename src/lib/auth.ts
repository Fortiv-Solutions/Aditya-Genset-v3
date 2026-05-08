import type { Session, User } from "@supabase/supabase-js";
import type { AppRole, Profile } from "@/lib/supabase";

export type UserProfile = Pick<Profile, "user_id" | "role" | "full_name" | "phone">;

export interface AuthState {
  session: Session | null;
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
}

export const ADMIN_ROLES: AppRole[] = ["Super Admin", "Admin"];
export const SALES_ROLES: AppRole[] = ["Sales Manager", "Sales Executive"];

export function normalizeRole(role?: AppRole | string | null): AppRole | null {
  const normalized = role?.trim().toLowerCase().replace(/[_-]+/g, " ").replace(/\s+/g, " ");

  switch (normalized) {
    case "super admin":
      return "Super Admin";
    case "admin":
      return "Admin";
    case "sales manager":
      return "Sales Manager";
    case "sales executive":
      return "Sales Executive";
    case "media editor":
      return "Media Editor";
    default:
      return null;
  }
}

export function isAdminRole(role?: AppRole | string | null) {
  const normalizedRole = normalizeRole(role);
  return Boolean(normalizedRole && ADMIN_ROLES.includes(normalizedRole));
}

export function isSalesRole(role?: AppRole | string | null) {
  const normalizedRole = normalizeRole(role);
  return Boolean(normalizedRole && SALES_ROLES.includes(normalizedRole));
}

export function getRoleHomePath(role?: AppRole | string | null) {
  return isAdminRole(role) ? "/admin" : "/";
}
