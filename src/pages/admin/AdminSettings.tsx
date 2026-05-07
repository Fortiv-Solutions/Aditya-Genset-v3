import { useEffect, useState } from "react";
import {
  Settings, Globe, Mail, Phone, MapPin, Instagram,
  Youtube, Linkedin, Facebook, Twitter, Save,
  Bell, Lock, Key, Palette, ToggleLeft, ToggleRight,
  Plus, Trash2, ChevronDown,
} from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";

function SettingSection({ title, icon: Icon, children }: {
  title: string; icon: React.ElementType; children: React.ReactNode;
}) {
  return (
    <div className="bg-card shadow-sm border border-border rounded-xl overflow-hidden">
      <div className="flex items-center gap-3 px-5 py-4 border-b border-border bg-secondary">
        <div className="w-7 h-7 rounded-lg bg-accent/15 flex items-center justify-center">
          <Icon size={14} className="text-accent" />
        </div>
        <h3 className="text-sm font-semibold text-foreground">{title}</h3>
      </div>
      <div className="p-5 space-y-4">{children}</div>
    </div>
  );
}

function FormRow({ label, hint, children }: {
  label: string; hint?: string; children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-start gap-3">
      <div className="sm:w-48 flex-shrink-0 pt-2.5">
        <label className="text-xs font-semibold text-muted-foreground">{label}</label>
        {hint && <p className="text-[11px] text-muted-foreground mt-0.5">{hint}</p>}
      </div>
      <div className="flex-1">{children}</div>
    </div>
  );
}

function TextInput({ value, onChange, placeholder }: {
  value: string; onChange: (v: string) => void; placeholder?: string;
}) {
  return (
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full px-3.5 py-2.5 bg-background border border-border rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-accent/60 focus:ring-1 focus:ring-accent/20 transition-all"
    />
  );
}

function Toggle({ enabled, onChange, label }: {
  enabled: boolean; onChange: (v: boolean) => void; label: string;
}) {
  return (
    <label className="flex items-center gap-3 cursor-pointer">
      <button
        type="button"
        onClick={() => onChange(!enabled)}
        className={`relative w-9 h-5 rounded-full transition-colors ${enabled ? "bg-accent" : "bg-secondary"}`}
      >
        <span className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${enabled ? "translate-x-4" : "translate-x-0"}`} />
      </button>
      <span className="text-sm text-muted-foreground">{label}</span>
    </label>
  );
}

export default function AdminSettings() {
  const [activeTab, setActiveTab] = useState<"site" | "notifications" | "security" | "integrations" | "email">("site");
  const [saving, setSaving] = useState(false);
  const [recordIds, setRecordIds] = useState({
    site: "",
    notifications: "",
    security: "",
  });

  // Site config state
  const [site, setSite] = useState({
    companyName: "Aditya Tech Mech Pvt. Ltd.",
    tagline: "Silent Power. Since 1997.",
    website: "https://aditya-genset-v2.vercel.app",
    phone1: "+91 99099 24242",
    phone2: "+91 99099 24243",
    email: "info@adityagenset.com",
    adminEmail: "admin@adityagenset.com",
    whatsapp: "+91 99099 24242",
    address: "Plot No. 12, GIDC Industrial Area, Silvassa, DNH - 396230",
    linkedin: "https://linkedin.com/company/adityatechmech",
    facebook: "https://facebook.com/adityagenset",
    instagram: "https://instagram.com/adityagenset",
    youtube: "",
    twitter: "",
    gmapsKey: "",
  });

  // Notification toggles
  const [notifs, setNotifs] = useState({
    newRequest: true,
    requestAssigned: true,
    quoteSent: true,
    followupDue: true,
    amcRenewal: true,
    serviceTicket: false,
    weeklyReport: true,
    monthlyReport: true,
  });

  // Security toggles
  const [security, setSecurity] = useState({
    twoFactor: true,
    ipWhitelist: false,
    auditLog: true,
    sessionTimeout: "480",
    loginAttempts: "5",
  });

  useEffect(() => {
    async function loadSettings() {
      try {
        const [{ data: siteData }, { data: notifData }, { data: securityData }] = await Promise.all([
          supabase.from("site_settings").select("*").order("updated_at", { ascending: false }).limit(1).maybeSingle(),
          supabase.from("notification_settings").select("*").order("updated_at", { ascending: false }).limit(1).maybeSingle(),
          supabase.from("security_settings").select("*").order("updated_at", { ascending: false }).limit(1).maybeSingle(),
        ]);

        if (siteData) {
          setRecordIds((current) => ({ ...current, site: siteData.id }));
          setSite({
            companyName: siteData.company_name || "",
            tagline: siteData.tagline || "",
            website: siteData.website || "",
            phone1: siteData.phone1 || "",
            phone2: siteData.phone2 || "",
            email: siteData.email || "",
            adminEmail: siteData.admin_email || "",
            whatsapp: siteData.whatsapp || "",
            address: siteData.address || "",
            linkedin: siteData.linkedin || "",
            facebook: siteData.facebook || "",
            instagram: siteData.instagram || "",
            youtube: siteData.youtube || "",
            twitter: siteData.twitter || "",
            gmapsKey: siteData.gmaps_key || "",
          });
        }

        if (notifData) {
          setRecordIds((current) => ({ ...current, notifications: notifData.id }));
          setNotifs({
            newRequest: Boolean(notifData.new_lead),
            requestAssigned: Boolean(notifData.lead_assigned),
            quoteSent: Boolean(notifData.quote_sent),
            followupDue: Boolean(notifData.followup_due),
            amcRenewal: Boolean(notifData.amc_renewal),
            serviceTicket: Boolean(notifData.service_ticket),
            weeklyReport: Boolean(notifData.weekly_report),
            monthlyReport: Boolean(notifData.monthly_report),
          });
        }

        if (securityData) {
          setRecordIds((current) => ({ ...current, security: securityData.id }));
          setSecurity({
            twoFactor: Boolean(securityData.two_factor),
            ipWhitelist: Boolean(securityData.ip_whitelist),
            auditLog: Boolean(securityData.audit_log),
            sessionTimeout: String(securityData.session_timeout_minutes || 480),
            loginAttempts: String(securityData.login_attempts || 5),
          });
        }
      } catch (error) {
        console.error(error);
        toast.error("Unable to load settings");
      }
    }

    loadSettings();
  }, []);

  const upsertSingleton = async (table: string, id: string, payload: Record<string, unknown>) => {
    if (id) {
      const { error } = await supabase.from(table).update(payload).eq("id", id);
      if (error) throw error;
      return id;
    }

    const { data, error } = await supabase.from(table).insert(payload).select("id").single();
    if (error) throw error;
    return data.id as string;
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const [siteId, notifId, securityId] = await Promise.all([
        upsertSingleton("site_settings", recordIds.site, {
          company_name: site.companyName,
          tagline: site.tagline,
          website: site.website,
          phone1: site.phone1,
          phone2: site.phone2,
          email: site.email,
          admin_email: site.adminEmail,
          whatsapp: site.whatsapp,
          address: site.address,
          linkedin: site.linkedin,
          facebook: site.facebook,
          instagram: site.instagram,
          youtube: site.youtube,
          twitter: site.twitter,
          gmaps_key: site.gmapsKey,
        }),
        upsertSingleton("notification_settings", recordIds.notifications, {
          new_lead: notifs.newRequest,
          lead_assigned: notifs.requestAssigned,
          quote_sent: notifs.quoteSent,
          followup_due: notifs.followupDue,
          amc_renewal: notifs.amcRenewal,
          service_ticket: notifs.serviceTicket,
          weekly_report: notifs.weeklyReport,
          monthly_report: notifs.monthlyReport,
        }),
        upsertSingleton("security_settings", recordIds.security, {
          two_factor: security.twoFactor,
          ip_whitelist: security.ipWhitelist,
          audit_log: security.auditLog,
          session_timeout_minutes: Number(security.sessionTimeout || 480),
          login_attempts: Number(security.loginAttempts || 5),
        }),
      ]);

      setRecordIds({ site: siteId, notifications: notifId, security: securityId });
      setSaving(false);
      toast.success("Settings saved successfully");
    } catch (error) {
      console.error(error);
      toast.error("Unable to save settings");
      setSaving(false);
    }
  };

  const TABS = [
    { key: "site", label: "Site Config", icon: Globe },
    { key: "notifications", label: "Notifications", icon: Bell },
    { key: "security", label: "Security", icon: Lock },
    { key: "integrations", label: "Integrations", icon: Key },
    { key: "email", label: "Email Templates", icon: Mail },
  ] as const;

  return (
    <div className="admin-page admin-page-narrow space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-accent">System Preferences</p>
          <h1 className="mt-2 text-3xl font-bold text-foreground font-display">Settings</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Configure your admin portal and site preferences</p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-1.5 px-4 py-2 bg-accent hover:bg-accent/90 rounded-lg text-sm font-bold text-accent-foreground transition-colors disabled:opacity-70"
        >
          <Save size={15} />
          {saving ? "Saving..." : "Save All Changes"}
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 overflow-x-auto border-b border-border pb-0">
        {TABS.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setActiveTab(key)}
            className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium transition-colors border-b-2 -mb-px whitespace-nowrap ${
              activeTab === key
                ? "text-accent border-accent"
                : "text-muted-foreground border-transparent hover:text-muted-foreground"
            }`}
          >
            <Icon size={14} /> {label}
          </button>
        ))}
      </div>

      {/* ── SITE CONFIG ── */}
      {activeTab === "site" && (
        <div className="space-y-4">
          <SettingSection title="Company Information" icon={Globe}>
            <FormRow label="Company Name" hint="Displayed in header and footer">
              <TextInput value={site.companyName} onChange={(v) => setSite({ ...site, companyName: v })} />
            </FormRow>
            <FormRow label="Tagline" hint="Brand sub-heading">
              <TextInput value={site.tagline} onChange={(v) => setSite({ ...site, tagline: v })} />
            </FormRow>
            <FormRow label="Website URL">
              <TextInput value={site.website} onChange={(v) => setSite({ ...site, website: v })} />
            </FormRow>
          </SettingSection>

          <SettingSection title="Contact Details" icon={Phone}>
            <FormRow label="Primary Phone">
              <TextInput value={site.phone1} onChange={(v) => setSite({ ...site, phone1: v })} />
            </FormRow>
            <FormRow label="Secondary Phone">
              <TextInput value={site.phone2} onChange={(v) => setSite({ ...site, phone2: v })} />
            </FormRow>
            <FormRow label="Email Address">
              <TextInput value={site.email} onChange={(v) => setSite({ ...site, email: v })} />
            </FormRow>
            <FormRow label="Admin Email" hint="Receives product, quote, and system notifications">
              <TextInput value={site.adminEmail} onChange={(v) => setSite({ ...site, adminEmail: v })} />
            </FormRow>
            <FormRow label="WhatsApp Number">
              <TextInput value={site.whatsapp} onChange={(v) => setSite({ ...site, whatsapp: v })} />
            </FormRow>
          </SettingSection>

          <SettingSection title="Office Address" icon={MapPin}>
            <FormRow label="Head Office" hint="Shown on Contact page">
              <textarea
                value={site.address}
                onChange={(e) => setSite({ ...site, address: e.target.value })}
                rows={3}
                className="w-full px-3.5 py-2.5 bg-background border border-border rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-accent/60 resize-none transition-all"
              />
            </FormRow>
            <FormRow label="Google Maps API Key" hint="For map embed on Contact page">
              <TextInput
                value={site.gmapsKey}
                onChange={(v) => setSite({ ...site, gmapsKey: v })}
                placeholder="AIzaSy..."
              />
            </FormRow>
          </SettingSection>

          <SettingSection title="Social Media" icon={Globe}>
            {[
              { key: "linkedin", label: "LinkedIn", icon: Linkedin },
              { key: "facebook", label: "Facebook", icon: Facebook },
              { key: "instagram", label: "Instagram", icon: Instagram },
              { key: "youtube", label: "YouTube", icon: Youtube },
              { key: "twitter", label: "Twitter / X", icon: Twitter },
            ].map(({ key, label, icon: SocialIcon }) => (
              <FormRow key={key} label={label}>
                <div className="relative">
                  <SocialIcon size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <input
                    type="url"
                    value={site[key as keyof typeof site]}
                    onChange={(e) => setSite({ ...site, [key]: e.target.value })}
                    placeholder={`https://${key}.com/...`}
                    className="w-full pl-9 pr-4 py-2.5 bg-background border border-border rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-accent/60 transition-all"
                  />
                </div>
              </FormRow>
            ))}
          </SettingSection>
        </div>
      )}

      {/* ── NOTIFICATIONS ── */}
      {activeTab === "notifications" && (
        <SettingSection title="Notification Preferences" icon={Bell}>
          <p className="text-sm text-muted-foreground mb-2">Configure which events trigger email/SMS alerts to your team.</p>
          <div className="space-y-4 divide-y divide-border">
            {[
              { key: "newRequest", label: "New Product Request", hint: "Alert when a customer product request arrives" },
              { key: "requestAssigned", label: "Request Assigned to Rep", hint: "Notify the rep when a request is assigned" },
              { key: "quoteSent", label: "Quotation Sent", hint: "Confirm when a quote is emailed to customer" },
              { key: "followupDue", label: "Follow-up Reminders", hint: "1 hour before scheduled follow-up" },
              { key: "amcRenewal", label: "AMC Renewal Alerts", hint: "30, 14, 7 days before AMC expiry" },
              { key: "serviceTicket", label: "New Service Ticket", hint: "Alert when a new service ticket is created" },
              { key: "weeklyReport", label: "Weekly Report Summary", hint: "Every Monday at 9:00 AM" },
              { key: "monthlyReport", label: "Monthly Report", hint: "On the 1st of every month" },
            ].map(({ key, label, hint }) => (
              <div key={key} className="flex items-center justify-between pt-4 first:pt-0">
                <div>
                  <p className="text-sm font-medium text-foreground">{label}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{hint}</p>
                </div>
                <Toggle
                  enabled={notifs[key as keyof typeof notifs]}
                  onChange={(v) => setNotifs({ ...notifs, [key]: v })}
                  label=""
                />
              </div>
            ))}
          </div>
        </SettingSection>
      )}

      {/* ── SECURITY ── */}
      {activeTab === "security" && (
        <div className="space-y-4">
          <SettingSection title="Authentication & Access" icon={Lock}>
            <div className="space-y-4 divide-y divide-border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-foreground">Two-Factor Authentication (2FA)</p>
                  <p className="text-xs text-muted-foreground mt-0.5">Required for Super Admin and Admin roles</p>
                </div>
                <Toggle
                  enabled={security.twoFactor}
                  onChange={(v) => setSecurity({ ...security, twoFactor: v })}
                  label=""
                />
              </div>
              <div className="flex items-center justify-between pt-4">
                <div>
                  <p className="text-sm font-medium text-foreground">IP Whitelist</p>
                  <p className="text-xs text-muted-foreground mt-0.5">Restrict admin access to specific office IPs</p>
                </div>
                <Toggle
                  enabled={security.ipWhitelist}
                  onChange={(v) => setSecurity({ ...security, ipWhitelist: v })}
                  label=""
                />
              </div>
              <div className="flex items-center justify-between pt-4">
                <div>
                  <p className="text-sm font-medium text-foreground">Immutable Audit Log</p>
                  <p className="text-xs text-muted-foreground mt-0.5">Every action logged with timestamp and user</p>
                </div>
                <Toggle
                  enabled={security.auditLog}
                  onChange={(v) => setSecurity({ ...security, auditLog: v })}
                  label=""
                />
              </div>
              <div className="pt-4">
                <FormRow label="Session Timeout" hint="Minutes before auto-logout (default: 480 = 8 hrs)">
                  <div className="relative w-48">
                    <input
                      type="number"
                      value={security.sessionTimeout}
                      onChange={(e) => setSecurity({ ...security, sessionTimeout: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-background border border-border rounded-lg text-sm text-foreground focus:outline-none focus:border-accent/60 transition-all"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">min</span>
                  </div>
                </FormRow>
              </div>
              <div className="pt-4">
                <FormRow label="Max Login Attempts" hint="Lockout after N failed attempts">
                  <div className="relative w-48">
                    <input
                      type="number"
                      value={security.loginAttempts}
                      onChange={(e) => setSecurity({ ...security, loginAttempts: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-background border border-border rounded-lg text-sm text-foreground focus:outline-none focus:border-accent/60 transition-all"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">tries</span>
                  </div>
                </FormRow>
              </div>
            </div>
          </SettingSection>

          <SettingSection title="Security Summary" icon={Lock}>
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: "Encryption", value: "AES-256 + TLS 1.3", ok: true },
                { label: "Auth Method", value: "JWT + Refresh Tokens", ok: true },
                { label: "Backup", value: "Daily, 30-day retention", ok: true },
                { label: "GDPR", value: "Data export/delete enabled", ok: true },
              ].map(({ label, value, ok }) => (
                <div key={label} className="bg-background rounded-lg px-4 py-3 border border-border">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`w-2 h-2 rounded-full ${ok ? "bg-green-400" : "bg-red-400"}`} />
                    <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{label}</span>
                  </div>
                  <p className="text-sm text-foreground">{value}</p>
                </div>
              ))}
            </div>
          </SettingSection>
        </div>
      )}

      {/* ── INTEGRATIONS ── */}
      {activeTab === "integrations" && (
        <SettingSection title="Third-Party Integrations" icon={Key}>
          <div className="space-y-3">
            {[
              { name: "Google Analytics 4", desc: "Track website traffic and conversions", status: "not_connected", color: "text-orange-400" },
              { name: "Google Search Console", desc: "Monitor SEO performance and crawl errors", status: "not_connected", color: "text-blue-400" },
              { name: "IndiaMART Catalogue API", desc: "Sync catalogue visibility and product requests from IndiaMART", status: "not_connected", color: "text-green-400" },
              { name: "WhatsApp Business API", desc: "Receive and reply to product requests", status: "not_connected", color: "text-green-400" },
              { name: "SendGrid (Email)", desc: "Transactional email delivery", status: "not_connected", color: "text-blue-400" },
              { name: "MSG91 (SMS)", desc: "Indian SMS gateway for request alerts", status: "not_connected", color: "text-purple-400" },
              { name: "Razorpay", desc: "Online advance payment links", status: "not_connected", color: "text-blue-400" },
              { name: "Tally / Zoho Books", desc: "Push orders to accounting software", status: "not_connected", color: "text-accent" },
            ].map(({ name, desc, status, color }) => (
              <div
                key={name}
                className="flex items-center gap-4 px-4 py-3.5 bg-background border border-border rounded-lg hover:border-border transition-colors"
              >
                <div className={`w-2 h-2 rounded-full flex-shrink-0 ${status === "connected" ? "bg-green-400" : "bg-stone-600"}`} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground">{name}</p>
                  <p className="text-xs text-muted-foreground">{desc}</p>
                </div>
                <button className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors ${
                  status === "connected"
                    ? "border-green-700/50 text-green-400 bg-green-900/20 hover:bg-green-900/30"
                    : "border-border text-muted-foreground bg-secondary hover:bg-secondary hover:text-foreground"
                }`}>
                  {status === "connected" ? "Connected ✓" : "Connect"}
                </button>
              </div>
            ))}
          </div>
        </SettingSection>
      )}

      {/* ── EMAIL TEMPLATES ── */}
      {activeTab === "email" && (
        <SettingSection title="Email Templates" icon={Mail}>
          <p className="text-sm text-muted-foreground mb-4">
            Manage automated email templates. Variables: <code className="text-accent text-xs bg-muted px-1.5 py-0.5 rounded">{"{{customer_name}}"}</code>{" "}
            <code className="text-accent text-xs bg-muted px-1.5 py-0.5 rounded">{"{{product_name}}"}</code>{" "}
            <code className="text-accent text-xs bg-muted px-1.5 py-0.5 rounded">{"{{rep_name}}"}</code>{" "}
            <code className="text-accent text-xs bg-muted px-1.5 py-0.5 rounded">{"{{quote_amount}}"}</code>
          </p>
          <div className="space-y-2">
            {[
              { name: "New Product Request", trigger: "On request capture", audience: "Sales team" },
              { name: "Request Acknowledgement", trigger: "On request capture", audience: "Customer" },
              { name: "Quotation Email", trigger: "When quote is sent", audience: "Customer" },
              { name: "Follow-up Reminder", trigger: "1 hr before follow-up", audience: "Sales rep" },
              { name: "AMC Renewal – 30 days", trigger: "30 days before expiry", audience: "Customer" },
              { name: "AMC Renewal – 7 days", trigger: "7 days before expiry", audience: "Customer" },
              { name: "Service Ticket Update", trigger: "On status change", audience: "Customer" },
              { name: "New User Invitation", trigger: "On user invite", audience: "New user" },
              { name: "Password Reset", trigger: "On password reset request", audience: "User" },
            ].map(({ name, trigger, audience }) => (
              <div
                key={name}
                className="flex items-center gap-4 px-4 py-3 bg-background border border-border rounded-lg hover:border-accent/20 transition-colors cursor-pointer group"
              >
                <Mail size={14} className="text-muted-foreground group-hover:text-accent flex-shrink-0 transition-colors" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground">{name}</p>
                  <p className="text-xs text-muted-foreground">{trigger} · To: {audience}</p>
                </div>
                <button className="px-3 py-1.5 rounded-lg text-xs font-semibold text-accent bg-accent/10 border border-accent/20 hover:bg-accent/20 transition-colors opacity-0 group-hover:opacity-100">
                  Edit Template
                </button>
              </div>
            ))}
          </div>
        </SettingSection>
      )}
    </div>
  );
}
