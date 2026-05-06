// ─── Admin Dashboard Mock Data ───────────────────────────────────────────────

export type LeadStage =
  | "new"
  | "contacted"
  | "qualified"
  | "site_assessment"
  | "quotation_sent"
  | "negotiation"
  | "won"
  | "lost";

export type LeadSource =
  | "website_form"
  | "whatsapp"
  | "phone"
  | "referral"
  | "indiamart"
  | "trade_show"
  | "dealer";

export interface Lead {
  id: string;
  name: string;
  company: string;
  designation: string;
  phone: string;
  email: string;
  city: string;
  state: string;
  kvaRequired: string;
  application: string;
  stage: LeadStage;
  source: LeadSource;
  assignedTo: string;
  createdAt: string;
  lastActivity: string;
  score: number;
}

export interface AdminProduct {
  id: string;
  name: string;
  model: string;
  kva: number;
  engineBrand: string;
  type: "silent" | "open";
  price: number | null;
  cpcb: "IV+" | "II";
  status: "published" | "draft" | "archived";
  category: string;
  stock: "in_stock" | "on_order" | "discontinued";
  inquiries: number;
}

export interface KpiData {
  label: string;
  value: string;
  change: string;
  trend: "up" | "down" | "neutral";
  icon: string;
  color: string;
}

export interface Dealer {
  id: string;
  name: string;
  region: string;
  activeLeads: number;
  totalSales: number;
  status: "active" | "inactive";
}

export interface SalesRep {
  id: string;
  name: string;
  presentations: number;
  quotesSent: number;
  conversionRate: number;
  lastActive: string;
}

export interface AppNotification {
  id: string;
  type: "lead" | "quote" | "dealer" | "system";
  title: string;
  message: string;
  time: string;
  unread: boolean;
}

export interface AppNotification {
  id: string;
  type: "lead" | "quote" | "dealer" | "system";
  title: string;
  message: string;
  time: string;
  unread: boolean;
}
