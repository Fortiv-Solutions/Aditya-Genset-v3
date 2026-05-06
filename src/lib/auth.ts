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

export function isAdminRole(role?: AppRole | null) {
  return Boolean(role && ADMIN_ROLES.includes(role));
}

export function isSalesRole(role?: AppRole | null) {
  return Boolean(role && SALES_ROLES.includes(role));
}

export function getRoleHomePath(role?: AppRole | null) {
  return isAdminRole(role) ? "/admin" : "/sales";
}
