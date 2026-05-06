import { useCallback, useEffect, useState } from "react";
import type { FormEvent } from "react";
import {
  CheckCircle,
  Edit2,
  Eye,
  Lock,
  Mail,
  Phone,
  Plus,
  ShieldCheck,
  Trash2,
  User,
  UserPlus,
} from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import type { AppRole } from "@/lib/supabase";

interface AdminUser {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: AppRole;
  status: "active" | "inactive";
  lastLogin: string;
  initials: string;
  color: string;
}

interface AdminUsersFunctionUser {
  id: string;
  email: string;
  fullName: string;
  phone: string;
  role: AppRole;
  updatedAt: string | null;
  lastSignInAt: string | null;
  bannedUntil: string | null;
}

interface AdminUsersFunctionResponse {
  users?: AdminUsersFunctionUser[];
  error?: string;
}

const ROLES: Array<{
  name: AppRole;
  desc: string;
  badge: string;
  permissions: string[];
}> = [
  {
    name: "Super Admin",
    desc: "Full unrestricted access to all modules, settings, and user management.",
    badge: "bg-red-900/40 text-red-300 border-red-700/40",
    permissions: ["All Modules", "User Management", "System Settings", "Delete Access"],
  },
  {
    name: "Admin",
    desc: "Full access excluding system-level settings and user deletion.",
    badge: "bg-orange-900/40 text-orange-300 border-orange-700/40",
    permissions: ["Dashboard", "Products", "Leads", "Media Library", "Reports"],
  },
  {
    name: "Sales Manager",
    desc: "Full access to Leads, Products, and Presentations.",
    badge: "bg-amber-900/40 text-accent border-amber-700/40",
    permissions: ["Leads (All)", "Products", "Reports"],
  },
  {
    name: "Sales Executive",
    desc: "Access only to assigned leads and products.",
    badge: "bg-blue-900/40 text-blue-300 border-blue-700/40",
    permissions: ["Leads (Own)", "Products"],
  },
  {
    name: "Media Editor",
    desc: "Access to Media Library and Product assets.",
    badge: "bg-purple-900/40 text-purple-300 border-purple-700/40",
    permissions: ["Media Library", "Products"],
  },
];

const PERMISSION_MATRIX = [
  { module: "Dashboard", superAdmin: true, admin: true, salesMgr: true, salesExec: true, mediaEd: true },
  { module: "Products", superAdmin: true, admin: true, salesMgr: true, salesExec: true, mediaEd: true },
  { module: "Leads (All)", superAdmin: true, admin: true, salesMgr: true, salesExec: false, mediaEd: false },
  { module: "Media Library", superAdmin: true, admin: true, salesMgr: false, salesExec: false, mediaEd: true },
  { module: "Users & Roles", superAdmin: true, admin: false, salesMgr: false, salesExec: false, mediaEd: false },
  { module: "Reports", superAdmin: true, admin: true, salesMgr: true, salesExec: false, mediaEd: false },
  { module: "Settings", superAdmin: true, admin: false, salesMgr: false, salesExec: false, mediaEd: false },
];

const defaultForm = {
  fullName: "",
  email: "",
  phone: "",
  password: "",
  confirmPassword: "",
  role: "Sales Executive" as AppRole,
};

function Check({ yes }: { yes: boolean }) {
  return yes
    ? <CheckCircle size={14} className="text-green-400 mx-auto" />
    : <span className="block text-center text-muted-foreground text-xs">-</span>;
}

function getInitials(name: string, email: string) {
  const source = name || email || "User";
  return source
    .split(/[ @._-]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

function mapUser(user: AdminUsersFunctionUser): AdminUser {
  const banned = user.bannedUntil ? new Date(user.bannedUntil).getTime() > Date.now() : false;

  return {
    id: user.id,
    name: user.fullName || "Unnamed User",
    email: user.email || "Email unavailable",
    phone: user.phone || "",
    role: user.role || "Sales Executive",
    status: banned ? "inactive" : "active",
    lastLogin: user.lastSignInAt ? new Date(user.lastSignInAt).toLocaleString() : "Never",
    initials: getInitials(user.fullName, user.email),
    color: "bg-accent/20 text-accent",
  };
}

export default function AdminUsers() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<"users" | "roles" | "matrix" | "activity">("users");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [form, setForm] = useState(defaultForm);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke<AdminUsersFunctionResponse>("admin-users", {
        body: { action: "list" },
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      setUsers((data?.users ?? []).map(mapUser));
    } catch (error) {
      console.error("Error fetching users:", error);
      toast.error("Unable to load users. Deploy the admin-users Edge Function and confirm admin access.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchUsers();
  }, [fetchUsers]);

  const updateForm = (field: keyof typeof defaultForm, value: string) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const resetModal = () => {
    setShowCreateModal(false);
    setForm(defaultForm);
  };

  const handleCreateUser = async (event: FormEvent) => {
    event.preventDefault();

    const fullName = form.fullName.trim();
    const email = form.email.trim().toLowerCase();
    const password = form.password.trim();

    if (!fullName || !email || !password) {
      toast.error("Full name, email, and password are required");
      return;
    }

    if (password.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }

    if (password !== form.confirmPassword.trim()) {
      toast.error("Password and confirmation do not match");
      return;
    }

    setSaving(true);
    try {
      const { data, error } = await supabase.functions.invoke<AdminUsersFunctionResponse>("admin-users", {
        body: {
          action: "create",
          fullName,
          email,
          password,
          phone: form.phone.trim(),
          role: form.role,
        },
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      setUsers((data?.users ?? []).map(mapUser));
      toast.success("User created in Supabase Auth and profiles");
      resetModal();
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unable to create user";
      toast.error(message);
      console.error("Create user error:", error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-5 animate-fade-in">
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={resetModal} />
          <form
            onSubmit={handleCreateUser}
            className="relative z-10 w-full max-w-lg bg-card border border-border rounded-xl shadow-2xl p-6 animate-scale-in"
          >
            <div className="flex items-start gap-3 mb-5">
              <div className="w-10 h-10 rounded-lg bg-accent/10 text-accent flex items-center justify-center">
                <UserPlus size={18} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-foreground">Create User</h3>
                <p className="text-xs text-muted-foreground mt-1">
                  Creates a Supabase Auth account and matching profile record.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5 md:col-span-2">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Full Name</label>
                <div className="relative">
                  <User size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <input
                    value={form.fullName}
                    onChange={(e) => updateForm("fullName", e.target.value)}
                    placeholder="Rahul Sharma"
                    className="w-full pl-9 pr-4 py-2.5 bg-background border border-border rounded-lg text-sm text-foreground focus:outline-none focus:border-accent/60"
                  />
                </div>
              </div>

              <div className="space-y-1.5 md:col-span-2">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Email Address</label>
                <div className="relative">
                  <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => updateForm("email", e.target.value)}
                    placeholder="sales@adityagenset.com"
                    className="w-full pl-9 pr-4 py-2.5 bg-background border border-border rounded-lg text-sm text-foreground focus:outline-none focus:border-accent/60"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Password</label>
                <div className="relative">
                  <Lock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <input
                    type="password"
                    value={form.password}
                    onChange={(e) => updateForm("password", e.target.value)}
                    placeholder="Minimum 8 characters"
                    className="w-full pl-9 pr-4 py-2.5 bg-background border border-border rounded-lg text-sm text-foreground focus:outline-none focus:border-accent/60"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Confirm Password</label>
                <input
                  type="password"
                  value={form.confirmPassword}
                  onChange={(e) => updateForm("confirmPassword", e.target.value)}
                  placeholder="Repeat password"
                  className="w-full px-3.5 py-2.5 bg-background border border-border rounded-lg text-sm text-foreground focus:outline-none focus:border-accent/60"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Phone</label>
                <div className="relative">
                  <Phone size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <input
                    value={form.phone}
                    onChange={(e) => updateForm("phone", e.target.value)}
                    placeholder="+91 98765 43210"
                    className="w-full pl-9 pr-4 py-2.5 bg-background border border-border rounded-lg text-sm text-foreground focus:outline-none focus:border-accent/60"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Assign Role</label>
                <select
                  value={form.role}
                  onChange={(e) => updateForm("role", e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-background border border-border rounded-lg text-sm text-foreground focus:outline-none focus:border-accent/60"
                >
                  {ROLES.map((role) => (
                    <option key={role.name} value={role.name}>{role.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex gap-2 pt-6">
              <button
                type="button"
                onClick={resetModal}
                disabled={saving}
                className="flex-1 py-2.5 bg-secondary border border-border rounded-lg text-sm text-muted-foreground hover:text-foreground transition-colors disabled:opacity-60"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="flex-1 py-2.5 bg-accent hover:bg-accent/90 rounded-lg text-sm font-bold text-accent-foreground transition-colors disabled:opacity-60"
              >
                {saving ? "Creating..." : "Create User"}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground font-display">Users & Roles</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {users.filter((user) => user.status === "active").length} active - {users.length} total users
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-1.5 px-4 py-2 bg-accent hover:bg-accent/90 rounded-lg text-sm font-bold text-accent-foreground transition-colors"
        >
          <Plus size={16} /> Create User
        </button>
      </div>

      <div className="flex gap-1 border-b border-border">
        {(["users", "roles", "matrix", "activity"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2.5 text-sm font-medium capitalize transition-colors border-b-2 -mb-px ${
              activeTab === tab
                ? "text-accent border-accent"
                : "text-muted-foreground border-transparent hover:text-foreground"
            }`}
          >
            {tab === "matrix" ? "Permission Matrix" : tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {activeTab === "users" && (
        <div className="bg-card shadow-sm border border-border rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-secondary">
                  {["User", "Role", "Status", "Last Login", "2FA", "Actions"].map((heading) => (
                    <th key={heading} className="px-5 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      {heading}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="px-5 py-10 text-center text-muted-foreground">
                      Loading users...
                    </td>
                  </tr>
                ) : users.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-5 py-10 text-center text-muted-foreground">
                      No users found.
                    </td>
                  </tr>
                ) : users.map((user) => {
                  const role = ROLES.find((item) => item.name === user.role);
                  return (
                    <tr key={user.id} className="hover:bg-secondary transition-colors">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 ${user.color}`}>
                            <span className="text-xs font-bold">{user.initials}</span>
                          </div>
                          <div>
                            <p className="font-medium text-foreground">{user.name}</p>
                            <p className="text-xs text-muted-foreground">{user.email}</p>
                            {user.phone && <p className="text-xs text-muted-foreground">{user.phone}</p>}
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold border ${role?.badge ?? ""}`}>
                          {user.role}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <span className={`flex items-center gap-1.5 text-xs font-medium ${
                          user.status === "active" ? "text-green-400" : "text-muted-foreground"
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${user.status === "active" ? "bg-green-400" : "bg-stone-600"}`} />
                          {user.status === "active" ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-xs text-muted-foreground">{user.lastLogin}</td>
                      <td className="px-5 py-4">
                        {["Super Admin", "Admin"].includes(user.role) ? (
                          <span className="flex items-center gap-1 text-xs text-green-400">
                            <Lock size={11} /> Enabled
                          </span>
                        ) : (
                          <span className="text-xs text-muted-foreground">-</span>
                        )}
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex gap-1">
                          <button className="p-1.5 rounded-md text-muted-foreground hover:text-accent hover:bg-accent/10 transition-colors" aria-label="Edit user">
                            <Edit2 size={14} />
                          </button>
                          <button className="p-1.5 rounded-md text-muted-foreground hover:text-blue-400 hover:bg-blue-500/10 transition-colors" aria-label="View user">
                            <Eye size={14} />
                          </button>
                          {user.role !== "Super Admin" && (
                            <button className="p-1.5 rounded-md text-muted-foreground hover:text-red-400 hover:bg-red-500/10 transition-colors" aria-label="Delete user">
                              <Trash2 size={14} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === "roles" && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {ROLES.map((role) => (
            <div key={role.name} className="bg-card shadow-sm border border-border rounded-xl p-5">
              <div className="flex items-center justify-between mb-3">
                <span className={`px-2.5 py-1 rounded-md text-xs font-bold border ${role.badge}`}>
                  {role.name}
                </span>
                <div className="w-7 h-7 rounded-lg bg-muted flex items-center justify-center">
                  <ShieldCheck size={13} className="text-muted-foreground" />
                </div>
              </div>
              <p className="text-sm text-muted-foreground mb-4 leading-relaxed">{role.desc}</p>
              <div className="space-y-1.5">
                {role.permissions.map((permission) => (
                  <div key={permission} className="flex items-center gap-2 text-xs text-muted-foreground">
                    <CheckCircle size={11} className="text-accent flex-shrink-0" />
                    {permission}
                  </div>
                ))}
              </div>
              <div className="mt-4 pt-3 border-t border-border text-xs text-muted-foreground">
                {users.filter((user) => user.role === role.name).length} user(s) with this role
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === "matrix" && (
        <div className="bg-card shadow-sm border border-border rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-secondary">
                  <th className="px-5 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Module</th>
                  {["Super Admin", "Admin", "Sales Mgr", "Sales Exec", "Media Ed"].map((role) => (
                    <th key={role} className="px-3 py-3 text-center text-xs font-semibold text-muted-foreground uppercase tracking-wider whitespace-nowrap">
                      {role}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {PERMISSION_MATRIX.map((row, index) => (
                  <tr key={row.module} className={`${index % 2 === 0 ? "" : "bg-secondary"} hover:bg-secondary transition-colors`}>
                    <td className="px-5 py-3 text-sm font-medium text-muted-foreground">{row.module}</td>
                    <td className="px-3 py-3"><Check yes={row.superAdmin} /></td>
                    <td className="px-3 py-3"><Check yes={row.admin} /></td>
                    <td className="px-3 py-3"><Check yes={row.salesMgr} /></td>
                    <td className="px-3 py-3"><Check yes={row.salesExec} /></td>
                    <td className="px-3 py-3"><Check yes={row.mediaEd} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === "activity" && (
        <div className="bg-card shadow-sm border border-border rounded-xl divide-y divide-border">
          <div className="p-10 text-center text-muted-foreground italic text-sm">
            No recent activity recorded.
          </div>
        </div>
      )}
    </div>
  );
}
