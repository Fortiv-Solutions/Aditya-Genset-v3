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

export const MOCK_LEADS: Lead[] = [
  {
    id: "L001",
    name: "Rajesh Mehta",
    company: "Mehta Textiles Pvt. Ltd.",
    designation: "MD",
    phone: "+91 98765 43210",
    email: "rajesh@mehtatextiles.com",
    city: "Ahmedabad",
    state: "Gujarat",
    kvaRequired: "250 kVA",
    application: "Textile Factory",
    stage: "quotation_sent",
    source: "website_form",
    assignedTo: "Vikram Shah",
    createdAt: "2025-04-28",
    lastActivity: "2025-05-03",
    score: 85,
  },
  {
    id: "L002",
    name: "Dr. Anita Desai",
    company: "Desai Multispecialty Hospital",
    designation: "Director",
    phone: "+91 99887 65432",
    email: "anita@desaihospital.com",
    city: "Surat",
    state: "Gujarat",
    kvaRequired: "500 kVA",
    application: "Hospital",
    stage: "site_assessment",
    source: "phone",
    assignedTo: "Priya Joshi",
    createdAt: "2025-04-25",
    lastActivity: "2025-05-02",
    score: 92,
  },
  {
    id: "L003",
    name: "Suresh Patel",
    company: "Patel Construction Group",
    designation: "Procurement Head",
    phone: "+91 98123 45678",
    email: "suresh@patelcg.com",
    city: "Jaipur",
    state: "Rajasthan",
    kvaRequired: "125 kVA",
    application: "Construction Site",
    stage: "new",
    source: "indiamart",
    assignedTo: "Arjun Singh",
    createdAt: "2025-05-03",
    lastActivity: "2025-05-03",
    score: 60,
  },
  {
    id: "L004",
    name: "Neeraj Sharma",
    company: "Grand Palace Hotel",
    designation: "GM - Facilities",
    phone: "+91 91234 56789",
    email: "neeraj@grandpalace.com",
    city: "Udaipur",
    state: "Rajasthan",
    kvaRequired: "350 kVA",
    application: "Hotel / Hospitality",
    stage: "won",
    source: "referral",
    assignedTo: "Vikram Shah",
    createdAt: "2025-04-10",
    lastActivity: "2025-04-30",
    score: 97,
  },
  {
    id: "L005",
    name: "Amit Kulkarni",
    company: "Kulkarni IT Park",
    designation: "CEO",
    phone: "+91 97654 32109",
    email: "amit@kulkarniit.com",
    city: "Pune",
    state: "Maharashtra",
    kvaRequired: "1000 kVA",
    application: "IT Park",
    stage: "negotiation",
    source: "website_form",
    assignedTo: "Priya Joshi",
    createdAt: "2025-04-18",
    lastActivity: "2025-05-01",
    score: 88,
  },
  {
    id: "L006",
    name: "Fatima Sheikh",
    company: "Sheikh Cold Storage",
    designation: "Owner",
    phone: "+91 93210 98765",
    email: "fatima@sheikholdstorage.com",
    city: "Nagpur",
    state: "Maharashtra",
    kvaRequired: "62.5 kVA",
    application: "Cold Storage",
    stage: "contacted",
    source: "whatsapp",
    assignedTo: "Arjun Singh",
    createdAt: "2025-05-01",
    lastActivity: "2025-05-03",
    score: 72,
  },
  {
    id: "L007",
    name: "Harish Bhatia",
    company: "Bhatia Mall",
    designation: "Facility Manager",
    phone: "+91 88765 43219",
    email: "harish@bhatiamall.com",
    city: "Silvassa",
    state: "Dadra & NH",
    kvaRequired: "750 kVA",
    application: "Shopping Mall",
    stage: "qualified",
    source: "dealer",
    assignedTo: "Vikram Shah",
    createdAt: "2025-04-29",
    lastActivity: "2025-05-02",
    score: 79,
  },
  {
    id: "L008",
    name: "Kavita Rane",
    company: "Rane Pharma",
    designation: "Purchase Manager",
    phone: "+91 87654 32108",
    email: "kavita@ranepharma.com",
    city: "Mumbai",
    state: "Maharashtra",
    kvaRequired: "200 kVA",
    application: "Pharmaceutical",
    stage: "lost",
    source: "trade_show",
    assignedTo: "Priya Joshi",
    createdAt: "2025-04-05",
    lastActivity: "2025-04-20",
    score: 45,
  },
];

export const ADMIN_PRODUCTS: AdminProduct[] = [
  {
    id: "P001",
    name: "7.5 kVA Silent DG Set",
    model: "ATM-7.5S",
    kva: 7.5,
    engineBrand: "Kubota",
    type: "silent",
    price: 185000,
    cpcb: "IV+",
    status: "published",
    category: "Silent DG Sets",
    stock: "in_stock",
    inquiries: 24,
  },
  {
    id: "P002",
    name: "15 kVA Silent DG Set",
    model: "ATM-15S",
    kva: 15,
    engineBrand: "Kubota",
    type: "silent",
    price: 245000,
    cpcb: "IV+",
    status: "published",
    category: "Silent DG Sets",
    stock: "in_stock",
    inquiries: 38,
  },
  {
    id: "P003",
    name: "62.5 kVA Silent DG Set",
    model: "ADG-62.5S",
    kva: 62.5,
    engineBrand: "Escorts-Kubota",
    type: "silent",
    price: 695000,
    cpcb: "IV+",
    status: "published",
    category: "Silent DG Sets",
    stock: "in_stock",
    inquiries: 67,
  },
  {
    id: "P004",
    name: "125 kVA Silent DG Set",
    model: "ATM-125S",
    kva: 125,
    engineBrand: "Baudouin",
    type: "silent",
    price: 1250000,
    cpcb: "IV+",
    status: "published",
    category: "Silent DG Sets",
    stock: "in_stock",
    inquiries: 52,
  },
  {
    id: "P005",
    name: "250 kVA Silent DG Set",
    model: "ATM-250S",
    kva: 250,
    engineBrand: "Baudouin",
    type: "silent",
    price: null,
    cpcb: "IV+",
    status: "published",
    category: "Silent DG Sets",
    stock: "on_order",
    inquiries: 41,
  },
  {
    id: "P006",
    name: "500 kVA Silent DG Set",
    model: "ATM-500S",
    kva: 500,
    engineBrand: "Baudouin",
    type: "silent",
    price: null,
    cpcb: "IV+",
    status: "published",
    category: "Silent DG Sets",
    stock: "on_order",
    inquiries: 29,
  },
  {
    id: "P007",
    name: "30 kVA Open DG Set",
    model: "ATM-30O",
    kva: 30,
    engineBrand: "Mahindra",
    type: "open",
    price: 285000,
    cpcb: "II",
    status: "published",
    category: "Open DG Sets",
    stock: "in_stock",
    inquiries: 18,
  },
  {
    id: "P008",
    name: "1000 kVA Industrial DG Set",
    model: "ATM-1000I",
    kva: 1000,
    engineBrand: "Baudouin",
    type: "silent",
    price: null,
    cpcb: "IV+",
    status: "draft",
    category: "Industrial DG Sets",
    stock: "on_order",
    inquiries: 12,
  },
];

export const LEAD_TREND_DATA = [
  { day: "Apr 5", leads: 3 },
  { day: "Apr 8", leads: 5 },
  { day: "Apr 11", leads: 4 },
  { day: "Apr 14", leads: 7 },
  { day: "Apr 17", leads: 6 },
  { day: "Apr 20", leads: 9 },
  { day: "Apr 23", leads: 8 },
  { day: "Apr 26", leads: 11 },
  { day: "Apr 29", leads: 13 },
  { day: "May 2", leads: 10 },
  { day: "May 4", leads: 14 },
];

export const LEAD_SOURCE_DATA = [
  { name: "Website Form", value: 38, color: "#D97706" },
  { name: "IndiaMART", value: 24, color: "#1E40AF" },
  { name: "Phone", value: 18, color: "#16A34A" },
  { name: "WhatsApp", value: 12, color: "#059669" },
  { name: "Referral", value: 5, color: "#7C3AED" },
  { name: "Trade Show", value: 3, color: "#DC2626" },
];

export const KVA_DEMAND_DATA = [
  { range: "7.5–62.5 kVA", count: 89 },
  { range: "63–200 kVA", count: 63 },
  { range: "201–500 kVA", count: 47 },
  { range: "501–1000 kVA", count: 28 },
  { range: "1001–2500 kVA", count: 11 },
];

export const PIPELINE_DATA = [
  { stage: "New", count: 28, color: "#64748B" },
  { stage: "Contacted", count: 22, color: "#1E40AF" },
  { stage: "Qualified", count: 18, color: "#D97706" },
  { stage: "Quoted", count: 14, color: "#7C3AED" },
  { stage: "Negotiation", count: 9, color: "#EA580C" },
  { stage: "Won", count: 6, color: "#16A34A" },
];

export const TOP_PRODUCTS_DATA = [
  { name: "62.5 kVA Silent", inquiries: 67, views: 1240, comparisons: 156, quotes: 42 },
  { name: "125 kVA Silent", inquiries: 52, views: 980, comparisons: 112, quotes: 35 },
  { name: "250 kVA Silent", inquiries: 41, views: 850, comparisons: 89, quotes: 28 },
  { name: "15 kVA Silent", inquiries: 38, views: 1100, comparisons: 145, quotes: 25 },
  { name: "500 kVA Silent", inquiries: 29, views: 670, comparisons: 54, quotes: 18 },
];

export const MOCK_DEALERS: Dealer[] = [
  { id: "D001", name: "Shakti Power Systems", region: "Gujarat", activeLeads: 12, totalSales: 45, status: "active" },
  { id: "D002", name: "Apex Generators", region: "Maharashtra", activeLeads: 8, totalSales: 32, status: "active" },
  { id: "D003", name: "Sunview Energy", region: "Rajasthan", activeLeads: 5, totalSales: 18, status: "active" },
  { id: "D004", name: "Metro Electrics", region: "Madhya Pradesh", activeLeads: 3, totalSales: 12, status: "inactive" },
];

export const MOCK_SALES_REPS: SalesRep[] = [
  { id: "S001", name: "Vikram Shah", presentations: 45, quotesSent: 18, conversionRate: 35, lastActive: "10 mins ago" },
  { id: "S002", name: "Priya Joshi", presentations: 38, quotesSent: 14, conversionRate: 28, lastActive: "2 hrs ago" },
  { id: "S003", name: "Arjun Singh", presentations: 24, quotesSent: 9, conversionRate: 22, lastActive: "Yesterday" },
];

export const QUOTE_METRICS = {
  totalQuotedValue: 18500000, // 1.85 Cr
  acceptanceRate: 64,
  averageDealSize: 850000,
  targetValue: 25000000,
};

export const REVENUE_FORECAST = [
  { month: "May", revenue: 4800000, weighted: 3200000 },
  { month: "Jun", revenue: 6500000, weighted: 4100000 },
  { month: "Jul", revenue: 5200000, weighted: 3500000 },
  { month: "Aug", revenue: 8400000, weighted: 5800000 },
];

export const MOCK_NOTIFICATIONS: AppNotification[] = [
  { id: "N001", type: "lead", title: "New Website Inquiry", message: "Rajesh Mehta requested a quote for 250 kVA set.", time: "5 mins ago", unread: true },
  { id: "N002", type: "quote", title: "Quote Approved", message: "Quotation #4421 for Rane Pharma has been approved.", time: "1 hr ago", unread: true },
  { id: "N003", type: "dealer", title: "Dealer Activity", message: "Shakti Power Systems added 3 new leads.", time: "3 hrs ago", unread: false },
  { id: "N004", type: "system", title: "Monthly Report", message: "April performance report is now ready for download.", time: "Yesterday", unread: false },
];
