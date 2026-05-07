// Shared admin data types used by Supabase-backed admin screens.

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
  activeAccounts: number;
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
  type: "request" | "quote" | "dealer" | "system";
  title: string;
  message: string;
  time: string;
  unread: boolean;
}
