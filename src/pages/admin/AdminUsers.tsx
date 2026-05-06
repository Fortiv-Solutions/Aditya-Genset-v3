import { useState, useEffect } from "react";
import {
  ShieldCheck, Plus, Trash2, Edit2, Eye,
  Mail, Lock, Globe, AlertTriangle, CheckCircle,
} from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";

interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: string;
  status: "active" | "inactive";
  lastLogin: string;
  initials: string;
  color: string;
}

const ROLES = [
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
  { module: "Dashboard",    superAdmin: true, admin: true, salesMgr: true, salesExec: true, mediaEd: true },
  { module: "Products",     superAdmin: true, admin: true, salesMgr: true, salesExec: true, mediaEd: true },
  { module: "Leads (All)",  superAdmin: true, admin: true, salesMgr: true, salesExec: false, mediaEd: false },
  { module: "Media Library",superAdmin: true, admin: true, salesMgr: false, salesExec: false, mediaEd: true },
  { module: "Users & Roles",superAdmin: true, admin: false, salesMgr: false, salesExec: false, mediaEd: false },
  { module: "Reports",      superAdmin: true, admin: true, salesMgr: true, salesExec: false, mediaEd: false },
  { module: "Settings",     superAdmin: true, admin: false, salesMgr: false, salesExec: false, mediaEd: false },
];



function Check({ yes }: { yes: boolean }) {
  return yes
    ? <CheckCircle size={14} className="text-green-400 mx-auto" />
    : <span className="block text-center text-muted-foreground text-xs">—</span>;
}

export default function AdminUsers() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"users" | "roles" | "matrix" | "activity">("users");
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState("Sales Executive");

  useEffect(() => {
    async function fetchUsers() {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*');

        if (error) throw error;

        const mapped: AdminUser[] = (data || []).map(u => ({
          id: u.id,
          name: u.full_name || 'Anonymous',
          email: u.email || '',
          role: u.role || 'Sales Executive',
          status: 'active',
          lastLogin: u.last_login ? new Date(u.last_login).toLocaleString() : 'Never',
          initials: (u.full_name || 'A').split(' ').map((n: string) => n[0]).join(''),
          color: 'bg-accent/20 text-accent'
        }));
        setUsers(mapped);
      } catch (e) {
        console.error("Error fetching users:", e);
      } finally {
        setLoading(false);
      }
    }
    fetchUsers();
  }, []);

  const handleInvite = () => {
    if (!inviteEmail) { toast.error("Please enter an email address"); return; }
    toast.success(`Invitation sent to ${inviteEmail}`);
    setShowInviteModal(false);
    setInviteEmail("");
  };

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Invite Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-background/80 backdrop-blur-sm backdrop-blur-sm" onClick={() => setShowInviteModal(false)} />
          <div className="relative z-10 w-full max-w-md bg-card border border-border rounded-2xl shadow-2xl p-6 animate-scale-in">
            <h3 className="text-lg font-bold text-foreground mb-4">Invite New User</h3>
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Email Address</label>
                <div className="relative">
                  <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <input
                    type="email"
                    placeholder="colleague@adityagenset.com"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    className="w-full pl-9 pr-4 py-2.5 bg-background border border-border rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-accent/60 transition-all"
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Assign Role</label>
                <select
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-background border border-border rounded-lg text-sm text-foreground focus:outline-none focus:border-accent/60"
                >
                  {ROLES.map((r) => <option key={r.name}>{r.name}</option>)}
                </select>
              </div>
              <div className="flex gap-2 pt-2">
                <button onClick={() => setShowInviteModal(false)} className="flex-1 py-2.5 bg-secondary border border-border rounded-lg text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Cancel
                </button>
                <button onClick={handleInvite} className="flex-1 py-2.5 bg-accent hover:bg-accent/90 rounded-lg text-sm font-bold text-accent-foreground transition-colors">
                  Send Invitation
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground font-display">Users & Roles</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {users.filter((u) => u.status === "active").length} active · {users.length} total users
          </p>
        </div>
        <button
          onClick={() => setShowInviteModal(true)}
          className="flex items-center gap-1.5 px-4 py-2 bg-accent hover:bg-accent/90 rounded-lg text-sm font-bold text-accent-foreground transition-colors"
        >
          <Plus size={16} /> Invite User
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-border">
        {(["users", "roles", "matrix", "activity"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2.5 text-sm font-medium capitalize transition-colors border-b-2 -mb-px ${
              activeTab === tab
                ? "text-accent border-accent"
                : "text-muted-foreground border-transparent hover:text-muted-foreground"
            }`}
          >
            {tab === "matrix" ? "Permission Matrix" : tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* ── USERS TAB ── */}
      {activeTab === "users" && (
        <div className="bg-card shadow-sm border border-border rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-secondary">
                  {["User", "Role", "Status", "Last Login", "2FA", "Actions"].map((h) => (
                    <th key={h} className="px-5 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {users.map((user) => {
                  const role = ROLES.find((r) => r.name === user.role);
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
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold border ${role?.badge}`}>
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
                          <span className="text-xs text-muted-foreground">—</span>
                        )}
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex gap-1">
                          <button className="p-1.5 rounded-md text-muted-foreground hover:text-accent hover:bg-accent/10 transition-colors">
                            <Edit2 size={14} />
                          </button>
                          <button className="p-1.5 rounded-md text-muted-foreground hover:text-blue-400 hover:bg-blue-500/10 transition-colors">
                            <Eye size={14} />
                          </button>
                          {user.role !== "Super Admin" && (
                            <button className="p-1.5 rounded-md text-muted-foreground hover:text-red-400 hover:bg-red-500/10 transition-colors">
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

      {/* ── ROLES TAB ── */}
      {activeTab === "roles" && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {ROLES.map((role) => (
            <div key={role.name} className="bg-card shadow-sm border border-border rounded-xl p-5 hover:border-border transition-colors">
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
                {role.permissions.map((perm) => (
                  <div key={perm} className="flex items-center gap-2 text-xs text-muted-foreground">
                    <CheckCircle size={11} className="text-accent flex-shrink-0" />
                    {perm}
                  </div>
                ))}
              </div>
              <div className="mt-4 pt-3 border-t border-border">
                  {users.filter((u) => u.role === role.name).length} user(s) with this role
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── PERMISSION MATRIX TAB ── */}
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
                {PERMISSION_MATRIX.map((row, i) => (
                  <tr key={row.module} className={`${i % 2 === 0 ? "" : "bg-secondary"} hover:bg-secondary transition-colors`}>
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

        <div className="bg-card shadow-sm border border-border rounded-xl divide-y divide-border">
          <div className="p-10 text-center text-muted-foreground italic text-sm">
            No recent activity recorded.
          </div>
        </div>
    </div>
  );
}
