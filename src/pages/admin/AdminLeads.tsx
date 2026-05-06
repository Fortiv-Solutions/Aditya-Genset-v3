import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search, Plus, Filter, Phone, Mail, MapPin,
  TrendingUp, Users, ChevronRight, X, Star,
  MessageSquare, Calendar, Paperclip, ArrowRight,
} from "lucide-react";
import { Lead, LeadStage } from "@/data/adminData";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import type { LeadSource } from "@/data/adminData";

// ─── Stage Config ────────────────────────────────────────────────────────────
const STAGES: { key: LeadStage; label: string; color: string; border: string }[] = [
  { key: "new",             label: "New",            color: "bg-slate-700/40",    border: "border-slate-600/40" },
  { key: "contacted",       label: "Contacted",       color: "bg-blue-900/40",     border: "border-blue-700/40" },
  { key: "qualified",       label: "Qualified",       color: "bg-amber-900/40",    border: "border-amber-700/40" },
  { key: "site_assessment", label: "Site Assess",     color: "bg-purple-900/40",   border: "border-purple-700/40" },
  { key: "quotation_sent",  label: "Quote Sent",      color: "bg-orange-900/40",   border: "border-orange-700/40" },
  { key: "negotiation",     label: "Negotiation",     color: "bg-yellow-900/40",   border: "border-yellow-700/40" },
  { key: "won",             label: "Won ✓",           color: "bg-green-900/40",    border: "border-green-700/40" },
  { key: "lost",            label: "Lost",            color: "bg-red-900/30",      border: "border-red-800/40" },
];

const STAGE_DOT: Record<LeadStage, string> = {
  new: "bg-slate-400",
  contacted: "bg-blue-400",
  qualified: "bg-accent",
  site_assessment: "bg-purple-400",
  quotation_sent: "bg-orange-400",
  negotiation: "bg-yellow-400",
  won: "bg-green-400",
  lost: "bg-red-400",
};

const SOURCE_LABELS: Record<string, string> = {
  website_form: "Website",
  whatsapp: "WhatsApp",
  phone: "Phone",
  referral: "Referral",
  indiamart: "IndiaMART",
  trade_show: "Trade Show",
  dealer: "Dealer",
};

function AddLeadModal({ onClose, onCreated }: { onClose: () => void; onCreated: () => void }) {
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    customer_name: "",
    company: "",
    phone: "",
    email: "",
    city: "",
    state: "",
    kva_required: "",
    application: "",
    source: "website_form",
  });

  const update = (key: string, value: string) => setForm((current) => ({ ...current, [key]: value }));

  const handleSubmit = async () => {
    if (!form.customer_name.trim() || !form.company.trim()) {
      toast.error("Customer name and company are required");
      return;
    }

    setSaving(true);
    try {
      const { data: auth } = await supabase.auth.getUser();
      const { error } = await supabase.from("leads").insert({
        customer_name: form.customer_name.trim(),
        company: form.company.trim(),
        phone: form.phone || null,
        email: form.email || null,
        city: form.city || null,
        state: form.state || null,
        kva_required: form.kva_required || null,
        application: form.application || null,
        source: form.source,
        stage: "new",
        score: 50,
        created_by_user_id: auth.user?.id || null,
        last_activity_at: new Date().toISOString(),
      });

      if (error) throw error;
      toast.success("Lead created successfully");
      onCreated();
      onClose();
    } catch (error) {
      console.error(error);
      toast.error("Unable to create lead");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 w-full max-w-xl bg-card border border-border rounded-2xl shadow-2xl p-6 animate-scale-in">
        <h3 className="text-lg font-bold text-foreground mb-4">Add Lead</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {[
            ["customer_name", "Customer Name *"],
            ["company", "Company *"],
            ["phone", "Phone"],
            ["email", "Email"],
            ["city", "City"],
            ["state", "State"],
            ["kva_required", "kVA Required"],
            ["application", "Application"],
          ].map(([key, label]) => (
            <input
              key={key}
              value={form[key as keyof typeof form]}
              onChange={(e) => update(key, e.target.value)}
              placeholder={label}
              className="w-full px-3.5 py-2.5 bg-background border border-border rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-accent/60"
            />
          ))}
          <select
            value={form.source}
            onChange={(e) => update("source", e.target.value)}
            className="sm:col-span-2 w-full px-3.5 py-2.5 bg-background border border-border rounded-lg text-sm text-foreground focus:outline-none focus:border-accent/60"
          >
            {Object.entries(SOURCE_LABELS).map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
        </div>
        <div className="flex gap-2 pt-5">
          <button onClick={onClose} className="flex-1 py-2.5 bg-secondary border border-border rounded-lg text-sm text-muted-foreground hover:text-foreground transition-colors">
            Cancel
          </button>
          <button onClick={handleSubmit} disabled={saving} className="flex-1 py-2.5 bg-accent hover:bg-accent/90 rounded-lg text-sm font-bold text-accent-foreground transition-colors disabled:opacity-70">
            {saving ? "Creating..." : "Create Lead"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Score Bar ────────────────────────────────────────────────────────────────
function ScoreBar({ score }: { score: number }) {
  const color = score >= 80 ? "bg-green-500" : score >= 60 ? "bg-accent" : "bg-red-500";
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 bg-secondary rounded-full overflow-hidden">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${score}%` }} />
      </div>
      <span className="text-[10px] font-semibold text-muted-foreground w-6">{score}</span>
    </div>
  );
}

// ─── Lead Detail Modal ────────────────────────────────────────────────────────
function LeadModal({ lead, onClose }: { lead: Lead; onClose: () => void }) {
  const [activeTab, setActiveTab] = useState<"overview" | "timeline" | "docs">("overview");

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-background/80 backdrop-blur-sm backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 w-full max-w-2xl bg-card border border-border rounded-2xl shadow-2xl overflow-hidden animate-scale-in">
        {/* Header */}
        <div className="flex items-start gap-4 p-6 border-b border-border">
          <div className="w-12 h-12 rounded-xl bg-accent/15 border border-accent/30 flex items-center justify-center flex-shrink-0">
            <span className="text-lg font-bold text-accent">{lead.name.slice(0, 2)}</span>
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-lg font-bold text-foreground">{lead.name}</h2>
            <p className="text-sm text-muted-foreground">{lead.designation} · {lead.company}</p>
            <div className="flex items-center gap-2 mt-2">
              <span className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold border ${
                STAGES.find(s => s.key === lead.stage)?.color
              } ${STAGES.find(s => s.key === lead.stage)?.border}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${STAGE_DOT[lead.stage]}`} />
                {STAGES.find(s => s.key === lead.stage)?.label}
              </span>
              <span className="text-xs text-muted-foreground">Score:</span>
              <ScoreBar score={lead.score} />
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors flex-shrink-0"
          >
            <X size={18} />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-border">
          {(["overview", "timeline", "docs"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-5 py-3 text-xs font-semibold uppercase tracking-wider transition-colors ${
                activeTab === tab
                  ? "text-accent border-b-2 border-accent"
                  : "text-muted-foreground hover:text-muted-foreground"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="p-6 max-h-96 overflow-y-auto">
          {activeTab === "overview" && (
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-3">
                <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Contact</h3>
                <div className="flex items-center gap-2 text-sm">
                  <Phone size={13} className="text-muted-foreground" />
                  <span className="text-muted-foreground">{lead.phone}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Mail size={13} className="text-muted-foreground" />
                  <span className="text-muted-foreground truncate">{lead.email}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <MapPin size={13} className="text-muted-foreground" />
                  <span className="text-muted-foreground">{lead.city}, {lead.state}</span>
                </div>
              </div>

              <div className="space-y-3">
                <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Requirement</h3>
                <div className="space-y-2">
                  {[
                    { label: "kVA Required", value: lead.kvaRequired },
                    { label: "Application", value: lead.application },
                    { label: "Source", value: SOURCE_LABELS[lead.source] },
                    { label: "Assigned To", value: lead.assignedTo },
                  ].map(({ label, value }) => (
                    <div key={label} className="flex justify-between items-center text-xs">
                      <span className="text-muted-foreground">{label}</span>
                      <span className="text-foreground font-medium">{value}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="col-span-2 pt-3 border-t border-border">
                <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Pipeline Stage</h3>
                <div className="flex gap-1 flex-wrap">
                  {STAGES.map((s) => (
                    <div
                      key={s.key}
                      className={`px-2.5 py-1 rounded-md text-[10px] font-medium border transition-all ${
                        s.key === lead.stage
                          ? `${s.color} ${s.border} text-foreground font-bold scale-105`
                          : "bg-secondary border-border text-muted-foreground"
                      }`}
                    >
                      {s.label}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === "timeline" && (
            <div className="space-y-4">
              {[
                { date: lead.lastActivity, action: "Follow-up call made. Customer reviewing quotation.", by: lead.assignedTo, icon: Phone },
                { date: lead.createdAt, action: `Lead created from ${SOURCE_LABELS[lead.source]}. Assigned to ${lead.assignedTo}.`, by: "System", icon: Users },
              ].map((item, i) => (
                <div key={i} className="flex gap-3">
                  <div className="flex-shrink-0 w-7 h-7 rounded-full bg-accent/15 border border-accent/30 flex items-center justify-center mt-0.5">
                    <item.icon size={12} className="text-accent" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">{item.action}</p>
                    <p className="text-xs text-muted-foreground mt-1">{item.date} · {item.by}</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === "docs" && (
            <div className="flex flex-col items-center justify-center py-10 text-center">
              <Paperclip size={32} className="text-muted-foreground mb-3" />
              <p className="text-muted-foreground text-sm">No documents attached yet</p>
              <button className="mt-3 px-4 py-2 bg-accent/15 border border-accent/30 rounded-lg text-xs text-accent hover:bg-accent/25 transition-colors">
                Upload Document
              </button>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex gap-2 p-4 border-t border-border bg-secondary">
          <button className="flex-1 flex items-center justify-center gap-1.5 py-2.5 bg-accent hover:bg-accent/90 rounded-lg text-xs font-bold text-accent-foreground transition-colors">
            <MessageSquare size={13} /> Log Activity
          </button>
          <button className="flex-1 flex items-center justify-center gap-1.5 py-2.5 bg-secondary hover:bg-secondary border border-border rounded-lg text-xs font-medium text-muted-foreground transition-colors">
            <Calendar size={13} /> Schedule Follow-up
          </button>
          <button className="flex items-center justify-center gap-1.5 px-3 py-2.5 bg-blue-500/15 hover:bg-blue-500/25 border border-blue-500/30 rounded-lg text-xs font-medium text-blue-300 transition-colors">
            <ArrowRight size={13} /> Quote
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Leads Page ─────────────────────────────────────────────────────────
export default function AdminLeads() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddLead, setShowAddLead] = useState(false);
  const [search, setSearch] = useState("");
  const [filterStage, setFilterStage] = useState<string>("all");
  const [filterState, setFilterState] = useState<string>("all");
  const [viewMode, setViewMode] = useState<"table" | "pipeline">("table");
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);

  const fetchLeads = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('leads')
          .select('*, profiles!leads_assigned_to_user_id_fkey(full_name)')
          .order('created_at', { ascending: false });

        if (error) throw error;

        // Map Supabase data to Lead interface
        const mappedLeads: Lead[] = (data || []).map(l => ({
          id: l.id,
          name: l.customer_name || "Unnamed lead",
          company: l.company || '',
          designation: l.designation || '',
          email: l.email || '',
          phone: l.phone || '',
          city: l.city || '',
          state: l.state || '',
          kvaRequired: l.kva_required || '',
          application: l.application || '',
          source: (l.source || 'website_form') as LeadSource,
          stage: l.stage as LeadStage || 'new',
          score: l.score || 50,
          assignedTo: l.profiles?.full_name || l.assigned_to_name || 'Unassigned',
          createdAt: new Date(l.created_at).toLocaleDateString(),
          lastActivity: l.last_activity_at ? new Date(l.last_activity_at).toLocaleDateString() : 'No activity'
        }));

        setLeads(mappedLeads);
      } catch (error) {
        console.error("Error fetching leads:", error);
      } finally {
        setLoading(false);
      }
    };

  useEffect(() => {
    fetchLeads();
  }, []);

  const filtered = leads.filter((l) => {
    const matchSearch =
      l.name.toLowerCase().includes(search.toLowerCase()) ||
      l.company.toLowerCase().includes(search.toLowerCase()) ||
      l.city.toLowerCase().includes(search.toLowerCase());
    const matchStage = filterStage === "all" || l.stage === filterStage;
    const matchState = filterState === "all" || l.state === filterState;
    return matchSearch && matchStage && matchState;
  });

  const states = [...new Set(leads.map((l) => l.state))].sort();

  // Pipeline grouped
  const byStage = STAGES.map((s) => ({
    ...s,
    leads: filtered.filter((l) => l.stage === s.key),
  }));

  return (
    <div className="space-y-5 animate-fade-in">
      {showAddLead && <AddLeadModal onClose={() => setShowAddLead(false)} onCreated={fetchLeads} />}
      {selectedLead && <LeadModal lead={selectedLead} onClose={() => setSelectedLead(null)} />}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground font-display">Leads & Inquiries</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {leads.filter((l) => l.stage === "new").length} new ·{" "}
            {leads.filter((l) => l.stage === "won").length} won ·{" "}
            {leads.length} total
          </p>
        </div>
        <button onClick={() => setShowAddLead(true)} className="flex items-center gap-1.5 px-4 py-2 bg-accent hover:bg-accent/90 rounded-lg text-sm font-bold text-accent-foreground transition-colors">
          <Plus size={16} /> Add Lead
        </button>
      </div>

      {/* KPI Strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: "Total Leads", value: leads.length, color: "text-foreground" },
          { label: "Active Pipeline", value: leads.filter((l) => !["won","lost"].includes(l.stage)).length, color: "text-accent" },
          { label: "Won This Month", value: leads.filter((l) => l.stage === "won").length, color: "text-green-400" },
          { label: "Lost", value: leads.filter((l) => l.stage === "lost").length, color: "text-red-400" },
        ].map((s) => (
          <div key={s.label} className="bg-card shadow-sm border border-border rounded-lg px-4 py-3">
            <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
            <p className="text-xs text-muted-foreground">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search by name, company, or city..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 bg-card shadow-sm border border-border rounded-lg text-sm text-muted-foreground placeholder:text-muted-foreground focus:outline-none focus:border-accent/50 transition-all"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          <select
            value={filterStage}
            onChange={(e) => setFilterStage(e.target.value)}
            className="px-3 py-2.5 bg-card shadow-sm border border-border rounded-lg text-sm text-muted-foreground focus:outline-none focus:border-accent/50"
          >
            <option value="all">All Stages</option>
            {STAGES.map((s) => (
              <option key={s.key} value={s.key}>{s.label}</option>
            ))}
          </select>
          <select
            value={filterState}
            onChange={(e) => setFilterState(e.target.value)}
            className="px-3 py-2.5 bg-card shadow-sm border border-border rounded-lg text-sm text-muted-foreground focus:outline-none focus:border-accent/50"
          >
            <option value="all">All States</option>
            {states.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>

          {/* View Toggle */}
          <div className="flex rounded-lg overflow-hidden border border-border">
            {(["table", "pipeline"] as const).map((mode) => (
              <button
                key={mode}
                onClick={() => setViewMode(mode)}
                className={`px-3 py-2.5 text-xs font-medium capitalize transition-colors ${
                  viewMode === mode
                    ? "bg-accent text-accent-foreground"
                    : "bg-card shadow-sm text-muted-foreground hover:text-foreground"
                }`}
              >
                {mode === "table" ? "📋 Table" : "📊 Pipeline"}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ─── TABLE VIEW ─── */}
      {viewMode === "table" && (
        <div className="bg-card shadow-sm border border-border rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-secondary">
                  {["Lead", "Company", "Requirement", "Location", "Source", "Stage", "Score", "Assigned", "Actions"].map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.map((lead, i) => {
                  const stage = STAGES.find((s) => s.key === lead.stage)!;
                  return (
                    <tr
                      key={lead.id}
                      className={`hover:bg-secondary transition-colors cursor-pointer ${i % 2 === 0 ? "" : "bg-secondary"}`}
                      onClick={() => setSelectedLead(lead)}
                    >
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                            <span className="text-xs font-bold text-muted-foreground">{lead.name.slice(0, 2)}</span>
                          </div>
                          <div>
                            <p className="font-medium text-foreground whitespace-nowrap">{lead.name}</p>
                            <p className="text-[10px] text-muted-foreground">{lead.id}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3.5">
                        <p className="text-muted-foreground whitespace-nowrap">{lead.company}</p>
                        <p className="text-xs text-muted-foreground">{lead.designation}</p>
                      </td>
                      <td className="px-4 py-3.5">
                        <p className="font-semibold text-accent whitespace-nowrap">{lead.kvaRequired}</p>
                        <p className="text-xs text-muted-foreground">{lead.application}</p>
                      </td>
                      <td className="px-4 py-3.5">
                        <p className="text-muted-foreground whitespace-nowrap">{lead.city}</p>
                        <p className="text-xs text-muted-foreground">{lead.state}</p>
                      </td>
                      <td className="px-4 py-3.5">
                        <span className="px-2 py-0.5 rounded-full text-[10px] bg-secondary border border-border text-muted-foreground whitespace-nowrap">
                          {SOURCE_LABELS[lead.source]}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-semibold border ${stage.color} ${stage.border} text-foreground`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${STAGE_DOT[lead.stage]}`} />
                          {stage.label}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 w-28">
                        <ScoreBar score={lead.score} />
                      </td>
                      <td className="px-4 py-3.5">
                        <p className="text-xs text-muted-foreground whitespace-nowrap">{lead.assignedTo}</p>
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
                          <button className="p-1.5 rounded-md text-muted-foreground hover:text-green-400 hover:bg-green-500/10 transition-colors">
                            <Phone size={13} />
                          </button>
                          <button className="p-1.5 rounded-md text-muted-foreground hover:text-blue-400 hover:bg-blue-500/10 transition-colors">
                            <Mail size={13} />
                          </button>
                          <button className="p-1.5 rounded-md text-muted-foreground hover:text-accent hover:bg-accent/10 transition-colors">
                            <ChevronRight size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          {filtered.length === 0 && (
            <div className="py-16 text-center">
              <Users size={40} className="text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground">No leads match your filters</p>
            </div>
          )}
        </div>
      )}

      {/* ─── PIPELINE VIEW ─── */}
      {viewMode === "pipeline" && (
        <div className="overflow-x-auto pb-4">
          <div className="flex gap-3 min-w-max">
            {byStage.map((stage) => (
              <div key={stage.key} className="w-64 flex-shrink-0">
                {/* Column Header */}
                <div className={`flex items-center justify-between px-3 py-2 rounded-lg border mb-2 ${stage.color} ${stage.border}`}>
                  <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${STAGE_DOT[stage.key]}`} />
                    <span className="text-xs font-semibold text-foreground">{stage.label}</span>
                  </div>
                  <span className="text-xs bg-secondary text-foreground/70 px-1.5 py-0.5 rounded-full font-mono">
                    {stage.leads.length}
                  </span>
                </div>

                {/* Cards */}
                <div className="space-y-2">
                  {stage.leads.map((lead) => (
                    <div
                      key={lead.id}
                      onClick={() => setSelectedLead(lead)}
                      className="bg-card shadow-sm border border-border rounded-lg p-3 cursor-pointer hover:border-accent/30 hover:bg-secondary transition-all group"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-xs font-semibold text-foreground group-hover:text-foreground transition-colors leading-tight">
                          {lead.name}
                        </p>
                        <span className="text-[10px] font-bold text-accent flex-shrink-0">{lead.kvaRequired}</span>
                      </div>
                      <p className="text-[10px] text-muted-foreground mt-0.5 truncate">{lead.company}</p>
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                          <MapPin size={9} /> {lead.city}
                        </span>
                        <span className="text-[10px] text-muted-foreground">{lead.assignedTo.split(" ")[0]}</span>
                      </div>
                      <div className="mt-2">
                        <ScoreBar score={lead.score} />
                      </div>
                    </div>
                  ))}

                  {stage.leads.length === 0 && (
                    <div className="border border-dashed border-border rounded-lg p-4 text-center">
                      <p className="text-[11px] text-muted-foreground">No leads</p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
