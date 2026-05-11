import { useEffect, useMemo, useState } from "react";
import type { ElementType, ReactNode } from "react";
import {
  AlertCircle,
  Bell,
  Facebook,
  Globe,
  Instagram,
  Linkedin,
  Lock,
  MapPin,
  Phone,
  Save,
  Twitter,
  Youtube,
} from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";

type SettingsTab = "site" | "notifications" | "security";

type SiteConfig = {
  companyName: string;
  tagline: string;
  website: string;
  phone1: string;
  phone2: string;
  email: string;
  adminEmail: string;
  whatsapp: string;
  address: string;
  linkedin: string;
  facebook: string;
  instagram: string;
  youtube: string;
  twitter: string;
  gmapsKey: string;
};

type NotificationConfig = {
  newRequest: boolean;
  requestAssigned: boolean;
  quoteSent: boolean;
  followupDue: boolean;
  amcRenewal: boolean;
  serviceTicket: boolean;
  weeklyReport: boolean;
  monthlyReport: boolean;
};

type SecurityConfig = {
  twoFactor: boolean;
  ipWhitelist: boolean;
  auditLog: boolean;
  sessionTimeout: string;
  loginAttempts: string;
};

type RecordIds = {
  site: string;
  notifications: string;
  security: string;
};

type SettingSectionProps = {
  title: string;
  icon: ElementType;
  children: ReactNode;
};

type FormRowProps = {
  label: string;
  hint?: string;
  children: ReactNode;
};

const emptySiteConfig: SiteConfig = {
  companyName: "",
  tagline: "",
  website: "",
  phone1: "",
  phone2: "",
  email: "",
  adminEmail: "",
  whatsapp: "",
  address: "",
  linkedin: "",
  facebook: "",
  instagram: "",
  youtube: "",
  twitter: "",
  gmapsKey: "",
};

const defaultNotificationConfig: NotificationConfig = {
  newRequest: false,
  requestAssigned: false,
  quoteSent: false,
  followupDue: false,
  amcRenewal: false,
  serviceTicket: false,
  weeklyReport: false,
  monthlyReport: false,
};

const defaultSecurityConfig: SecurityConfig = {
  twoFactor: false,
  ipWhitelist: false,
  auditLog: true,
  sessionTimeout: "480",
  loginAttempts: "5",
};

const TABS: { key: SettingsTab; label: string; icon: ElementType }[] = [
  { key: "site", label: "Site Config", icon: Globe },
  { key: "notifications", label: "Notifications", icon: Bell },
  { key: "security", label: "Security", icon: Lock },
];

const notificationRows: { key: keyof NotificationConfig; label: string; hint: string }[] = [
  { key: "newRequest", label: "New Product Request", hint: "Alert when a customer product request arrives" },
  { key: "requestAssigned", label: "Request Assigned to Rep", hint: "Notify the rep when a request is assigned" },
  { key: "quoteSent", label: "Quotation Sent", hint: "Confirm when a quote is emailed to customer" },
  { key: "followupDue", label: "Follow-up Reminders", hint: "1 hour before scheduled follow-up" },
  { key: "amcRenewal", label: "AMC Renewal Alerts", hint: "30, 14, 7 days before AMC expiry" },
  { key: "serviceTicket", label: "New Service Ticket", hint: "Alert when a new service ticket is created" },
  { key: "weeklyReport", label: "Weekly Report Summary", hint: "Every Monday at 9:00 AM" },
  { key: "monthlyReport", label: "Monthly Report", hint: "On the 1st of every month" },
];

const socialRows: { key: keyof Pick<SiteConfig, "linkedin" | "facebook" | "instagram" | "youtube" | "twitter">; label: string; icon: ElementType }[] = [
  { key: "linkedin", label: "LinkedIn", icon: Linkedin },
  { key: "facebook", label: "Facebook", icon: Facebook },
  { key: "instagram", label: "Instagram", icon: Instagram },
  { key: "youtube", label: "YouTube", icon: Youtube },
  { key: "twitter", label: "Twitter / X", icon: Twitter },
];

function SettingSection({ title, icon: Icon, children }: SettingSectionProps) {
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

function FormRow({ label, hint, children }: FormRowProps) {
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

function TextInput({
  value,
  onChange,
  placeholder,
  type = "text",
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: "text" | "url" | "email" | "tel";
}) {
  return (
    <input
      type={type}
      value={value}
      onChange={(event) => onChange(event.target.value)}
      placeholder={placeholder}
      className="w-full px-3.5 py-2.5 bg-background border border-border rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-accent/60 focus:ring-1 focus:ring-accent/20 transition-all"
    />
  );
}

function Toggle({
  enabled,
  onChange,
  label,
}: {
  enabled: boolean;
  onChange: (value: boolean) => void;
  label: string;
}) {
  return (
    <label className="flex items-center gap-3 cursor-pointer">
      <button
        type="button"
        aria-label={label || "Toggle setting"}
        aria-pressed={enabled}
        onClick={() => onChange(!enabled)}
        className={`relative w-9 h-5 rounded-full transition-colors ${enabled ? "bg-accent" : "bg-secondary"}`}
      >
        <span className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${enabled ? "translate-x-4" : "translate-x-0"}`} />
      </button>
      {label && <span className="text-sm text-muted-foreground">{label}</span>}
    </label>
  );
}

function asPositiveInteger(value: string, fallback: number) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed < 1) return fallback;
  return Math.floor(parsed);
}

export default function AdminSettings() {
  const [activeTab, setActiveTab] = useState<SettingsTab>("site");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [loadError, setLoadError] = useState("");
  const [recordIds, setRecordIds] = useState<RecordIds>({ site: "", notifications: "", security: "" });
  const [site, setSite] = useState<SiteConfig>(emptySiteConfig);
  const [notifs, setNotifs] = useState<NotificationConfig>(defaultNotificationConfig);
  const [security, setSecurity] = useState<SecurityConfig>(defaultSecurityConfig);

  const activeLabel = useMemo(() => TABS.find((tab) => tab.key === activeTab)?.label ?? "Settings", [activeTab]);

  useEffect(() => {
    async function loadSettings() {
      setLoading(true);
      setLoadError("");

      try {
        const [siteResult, notifResult, securityResult] = await Promise.all([
          supabase.from("site_settings").select("*").order("updated_at", { ascending: false }).limit(1).maybeSingle(),
          supabase.from("notification_settings").select("*").order("updated_at", { ascending: false }).limit(1).maybeSingle(),
          supabase.from("security_settings").select("*").order("updated_at", { ascending: false }).limit(1).maybeSingle(),
        ]);

        const firstError = siteResult.error || notifResult.error || securityResult.error;
        if (firstError) throw firstError;

        if (siteResult.data) {
          setRecordIds((current) => ({ ...current, site: siteResult.data.id }));
          setSite({
            companyName: siteResult.data.company_name || "",
            tagline: siteResult.data.tagline || "",
            website: siteResult.data.website || "",
            phone1: siteResult.data.phone1 || "",
            phone2: siteResult.data.phone2 || "",
            email: siteResult.data.email || "",
            adminEmail: siteResult.data.admin_email || "",
            whatsapp: siteResult.data.whatsapp || "",
            address: siteResult.data.address || "",
            linkedin: siteResult.data.linkedin || "",
            facebook: siteResult.data.facebook || "",
            instagram: siteResult.data.instagram || "",
            youtube: siteResult.data.youtube || "",
            twitter: siteResult.data.twitter || "",
            gmapsKey: siteResult.data.gmaps_key || "",
          });
        }

        if (notifResult.data) {
          setRecordIds((current) => ({ ...current, notifications: notifResult.data.id }));
          setNotifs({
            newRequest: Boolean(notifResult.data.new_lead),
            requestAssigned: Boolean(notifResult.data.lead_assigned),
            quoteSent: Boolean(notifResult.data.quote_sent),
            followupDue: Boolean(notifResult.data.followup_due),
            amcRenewal: Boolean(notifResult.data.amc_renewal),
            serviceTicket: Boolean(notifResult.data.service_ticket),
            weeklyReport: Boolean(notifResult.data.weekly_report),
            monthlyReport: Boolean(notifResult.data.monthly_report),
          });
        }

        if (securityResult.data) {
          setRecordIds((current) => ({ ...current, security: securityResult.data.id }));
          setSecurity({
            twoFactor: Boolean(securityResult.data.two_factor),
            ipWhitelist: Boolean(securityResult.data.ip_whitelist),
            auditLog: Boolean(securityResult.data.audit_log),
            sessionTimeout: String(securityResult.data.session_timeout_minutes || 480),
            loginAttempts: String(securityResult.data.login_attempts || 5),
          });
        }
      } catch (error) {
        const message = error instanceof Error ? error.message : "Settings could not be loaded.";
        console.error(error);
        setLoadError(message);
        toast.error("Unable to load settings");
      } finally {
        setLoading(false);
      }
    }

    void loadSettings();
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
      const sessionTimeout = asPositiveInteger(security.sessionTimeout, 480);
      const loginAttempts = asPositiveInteger(security.loginAttempts, 5);

      const [siteId, notifId, securityId] = await Promise.all([
        upsertSingleton("site_settings", recordIds.site, {
          company_name: site.companyName.trim(),
          tagline: site.tagline.trim(),
          website: site.website.trim(),
          phone1: site.phone1.trim(),
          phone2: site.phone2.trim(),
          email: site.email.trim(),
          admin_email: site.adminEmail.trim(),
          whatsapp: site.whatsapp.trim(),
          address: site.address.trim(),
          linkedin: site.linkedin.trim(),
          facebook: site.facebook.trim(),
          instagram: site.instagram.trim(),
          youtube: site.youtube.trim(),
          twitter: site.twitter.trim(),
          gmaps_key: site.gmapsKey.trim(),
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
          session_timeout_minutes: sessionTimeout,
          login_attempts: loginAttempts,
        }),
      ]);

      setRecordIds({ site: siteId, notifications: notifId, security: securityId });
      setSecurity((current) => ({
        ...current,
        sessionTimeout: String(sessionTimeout),
        loginAttempts: String(loginAttempts),
      }));
      toast.success("Settings saved successfully");
    } catch (error) {
      console.error(error);
      toast.error("Unable to save settings");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="admin-page admin-page-narrow space-y-6 animate-fade-in">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-accent">System Preferences</p>
          <h1 className="mt-2 text-3xl font-bold text-foreground font-display">Settings</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Configure admin portal settings stored in Supabase</p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving || loading}
          className="flex items-center justify-center gap-1.5 px-4 py-2 bg-accent hover:bg-accent/90 rounded-lg text-sm font-bold text-accent-foreground transition-colors disabled:opacity-70"
        >
          <Save size={15} />
          {saving ? "Saving..." : "Save All Changes"}
        </button>
      </div>

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

      {loadError && (
        <div className="flex items-start gap-3 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
          <AlertCircle size={16} className="mt-0.5 flex-shrink-0" />
          <div>
            <p className="font-semibold">Settings could not be loaded.</p>
            <p className="mt-0.5 text-xs text-red-200/80">{loadError}</p>
          </div>
        </div>
      )}

      {loading && (
        <div className="rounded-xl border border-border bg-card px-5 py-8 text-center text-sm text-muted-foreground">
          Loading {activeLabel.toLowerCase()}...
        </div>
      )}

      {!loading && activeTab === "site" && (
        <div className="space-y-4">
          <SettingSection title="Company Information" icon={Globe}>
            <FormRow label="Company Name" hint="Displayed in header and footer">
              <TextInput value={site.companyName} onChange={(value) => setSite({ ...site, companyName: value })} placeholder="Company legal name" />
            </FormRow>
            <FormRow label="Tagline" hint="Brand sub-heading">
              <TextInput value={site.tagline} onChange={(value) => setSite({ ...site, tagline: value })} placeholder="Brand tagline" />
            </FormRow>
            <FormRow label="Website URL">
              <TextInput type="url" value={site.website} onChange={(value) => setSite({ ...site, website: value })} placeholder="https://example.com" />
            </FormRow>
          </SettingSection>

          <SettingSection title="Contact Details" icon={Phone}>
            <FormRow label="Primary Phone">
              <TextInput type="tel" value={site.phone1} onChange={(value) => setSite({ ...site, phone1: value })} placeholder="+91 ..." />
            </FormRow>
            <FormRow label="Secondary Phone">
              <TextInput type="tel" value={site.phone2} onChange={(value) => setSite({ ...site, phone2: value })} placeholder="+91 ..." />
            </FormRow>
            <FormRow label="Email Address">
              <TextInput type="email" value={site.email} onChange={(value) => setSite({ ...site, email: value })} placeholder="info@example.com" />
            </FormRow>
            <FormRow label="Admin Email" hint="Receives product, quote, and system notifications">
              <TextInput type="email" value={site.adminEmail} onChange={(value) => setSite({ ...site, adminEmail: value })} placeholder="admin@example.com" />
            </FormRow>
            <FormRow label="WhatsApp Number">
              <TextInput type="tel" value={site.whatsapp} onChange={(value) => setSite({ ...site, whatsapp: value })} placeholder="+91 ..." />
            </FormRow>
          </SettingSection>

          <SettingSection title="Office Address" icon={MapPin}>
            <FormRow label="Head Office" hint="Shown on Contact page">
              <textarea
                value={site.address}
                onChange={(event) => setSite({ ...site, address: event.target.value })}
                rows={3}
                placeholder="Office address"
                className="w-full px-3.5 py-2.5 bg-background border border-border rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-accent/60 resize-none transition-all"
              />
            </FormRow>
            <FormRow label="Google Maps API Key" hint="For map embed on Contact page">
              <TextInput value={site.gmapsKey} onChange={(value) => setSite({ ...site, gmapsKey: value })} placeholder="AIzaSy..." />
            </FormRow>
          </SettingSection>

          <SettingSection title="Social Media" icon={Globe}>
            {socialRows.map(({ key, label, icon: SocialIcon }) => (
              <FormRow key={key} label={label}>
                <div className="relative">
                  <SocialIcon size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <input
                    type="url"
                    value={site[key]}
                    onChange={(event) => setSite({ ...site, [key]: event.target.value })}
                    placeholder={`https://${key}.com/...`}
                    className="w-full pl-9 pr-4 py-2.5 bg-background border border-border rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-accent/60 transition-all"
                  />
                </div>
              </FormRow>
            ))}
          </SettingSection>
        </div>
      )}

      {!loading && activeTab === "notifications" && (
        <SettingSection title="Notification Preferences" icon={Bell}>
          <p className="text-sm text-muted-foreground mb-2">Configure which events should trigger team alerts.</p>
          <div className="space-y-4 divide-y divide-border">
            {notificationRows.map(({ key, label, hint }) => (
              <div key={key} className="flex items-center justify-between gap-4 pt-4 first:pt-0">
                <div>
                  <p className="text-sm font-medium text-foreground">{label}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{hint}</p>
                </div>
                <Toggle enabled={notifs[key]} onChange={(value) => setNotifs({ ...notifs, [key]: value })} label={label} />
              </div>
            ))}
          </div>
        </SettingSection>
      )}

      {!loading && activeTab === "security" && (
        <SettingSection title="Authentication & Access" icon={Lock}>
          <div className="space-y-4 divide-y divide-border">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-foreground">Two-Factor Authentication (2FA)</p>
                <p className="text-xs text-muted-foreground mt-0.5">Store whether 2FA should be required for admin roles</p>
              </div>
              <Toggle enabled={security.twoFactor} onChange={(value) => setSecurity({ ...security, twoFactor: value })} label="Two-factor authentication" />
            </div>
            <div className="flex items-center justify-between gap-4 pt-4">
              <div>
                <p className="text-sm font-medium text-foreground">IP Whitelist</p>
                <p className="text-xs text-muted-foreground mt-0.5">Store whether admin access should be restricted by IP</p>
              </div>
              <Toggle enabled={security.ipWhitelist} onChange={(value) => setSecurity({ ...security, ipWhitelist: value })} label="IP whitelist" />
            </div>
            <div className="flex items-center justify-between gap-4 pt-4">
              <div>
                <p className="text-sm font-medium text-foreground">Audit Log</p>
                <p className="text-xs text-muted-foreground mt-0.5">Store whether admin actions should be recorded</p>
              </div>
              <Toggle enabled={security.auditLog} onChange={(value) => setSecurity({ ...security, auditLog: value })} label="Audit log" />
            </div>
            <div className="pt-4">
              <FormRow label="Session Timeout" hint="Minutes before auto-logout">
                <div className="relative w-48">
                  <input
                    type="number"
                    min={1}
                    value={security.sessionTimeout}
                    onChange={(event) => setSecurity({ ...security, sessionTimeout: event.target.value })}
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
                    min={1}
                    value={security.loginAttempts}
                    onChange={(event) => setSecurity({ ...security, loginAttempts: event.target.value })}
                    className="w-full px-3.5 py-2.5 bg-background border border-border rounded-lg text-sm text-foreground focus:outline-none focus:border-accent/60 transition-all"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">tries</span>
                </div>
              </FormRow>
            </div>
          </div>
        </SettingSection>
      )}
    </div>
  );
}
