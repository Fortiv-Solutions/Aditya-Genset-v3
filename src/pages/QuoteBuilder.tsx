import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { fetchPublishedProducts } from "@/lib/api/products";
import { createQuote, createQuoteItems, generateQuoteNumber } from "@/lib/api/quotes";
import { useAuth } from "@/components/auth/AuthContext";
import { SEO } from "@/components/site/SEO";
import { ArrowLeft, Trash2, Download, Send, Calculator, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import gensetFallback from "@/assets/products/showcase/main-view.png";
import { EditableText } from "@/components/cms/EditableText";

interface QuoteItem {
  id: string;
  product: any;
  quantity: number;
  unitPrice: number;
  discount: number;
  notes: string;
}

interface CustomerInfo {
  name: string;
  email: string;
  phone: string;
  company: string;
  address: string;
}

const emptyCustomerInfo: CustomerInfo = {
  name: "",
  email: "",
  phone: "",
  company: "",
  address: "",
};

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function clampNumber(value: number, min: number, max?: number) {
  if (!Number.isFinite(value)) return min;
  const lowerBounded = Math.max(min, value);
  return typeof max === "number" ? Math.min(max, lowerBounded) : lowerBounded;
}

function getProductPrice(product: any) {
  if (product?.price_on_request) return 0;
  const price = Number(product?.price);
  return Number.isFinite(price) && price > 0 ? price : 0;
}

function getProductImage(product: any) {
  const primaryMedia = product?.product_media?.find((m: any) => m.kind === "primary");
  return primaryMedia?.url || primaryMedia?.public_url || gensetFallback;
}

function formatCurrency(value: number) {
  return `Rs ${value.toLocaleString("en-IN", { maximumFractionDigits: 2 })}`;
}

function cleanPdfText(value: string) {
  return value.replace(/[^\x20-\x7E]/g, " ");
}

function escapePdfText(value: string) {
  return cleanPdfText(value).replace(/\\/g, "\\\\").replace(/\(/g, "\\(").replace(/\)/g, "\\)");
}

function wrapText(text: string, maxLength = 84) {
  const words = cleanPdfText(text).split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let current = "";

  words.forEach((word) => {
    const next = current ? `${current} ${word}` : word;
    if (next.length > maxLength && current) {
      lines.push(current);
      current = word;
    } else {
      current = next;
    }
  });

  if (current) lines.push(current);
  return lines.length ? lines : [""];
}

function pdfColor(hex: string) {
  const normalized = hex.replace("#", "");
  const r = parseInt(normalized.slice(0, 2), 16) / 255;
  const g = parseInt(normalized.slice(2, 4), 16) / 255;
  const b = parseInt(normalized.slice(4, 6), 16) / 255;
  return `${r.toFixed(3)} ${g.toFixed(3)} ${b.toFixed(3)}`;
}

function pdfText(text: string, x: number, y: number, options: {
  size?: number;
  font?: "regular" | "bold";
  color?: string;
} = {}) {
  const font = options.font === "bold" ? "F2" : "F1";
  const size = options.size || 10;
  const color = pdfColor(options.color || "#0B2F4D");
  return `BT /${font} ${size} Tf ${color} rg ${x} ${y} Td (${escapePdfText(text)}) Tj ET`;
}

function pdfRect(x: number, y: number, width: number, height: number, color: string) {
  return `q ${pdfColor(color)} rg ${x} ${y} ${width} ${height} re f Q`;
}

function pdfStrokeRect(x: number, y: number, width: number, height: number, color: string, lineWidth = 1) {
  return `q ${lineWidth} w ${pdfColor(color)} RG ${x} ${y} ${width} ${height} re S Q`;
}

function pdfLine(x1: number, y1: number, x2: number, y2: number, color: string, lineWidth = 1) {
  return `q ${lineWidth} w ${pdfColor(color)} RG ${x1} ${y1} m ${x2} ${y2} l S Q`;
}

function createPdfDocument(pageContents: string[]) {
  const objects: string[] = [];
  const catalogId = 1;
  const pagesId = 2;
  const regularFontId = 3;
  const boldFontId = 4;
  let nextId = 5;
  const pageRefs: number[] = [];

  pageContents.forEach((content) => {
    const pageId = nextId++;
    const contentId = nextId++;
    pageRefs.push(pageId);

    objects[contentId] = `<< /Length ${content.length} >>\nstream\n${content}\nendstream`;
    objects[pageId] = `<< /Type /Page /Parent ${pagesId} 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 ${regularFontId} 0 R /F2 ${boldFontId} 0 R >> >> /Contents ${contentId} 0 R >>`;
  });

  objects[catalogId] = `<< /Type /Catalog /Pages ${pagesId} 0 R >>`;
  objects[pagesId] = `<< /Type /Pages /Kids [${pageRefs.map((id) => `${id} 0 R`).join(" ")}] /Count ${pageRefs.length} >>`;
  objects[regularFontId] = `<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>`;
  objects[boldFontId] = `<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>`;

  let pdf = "%PDF-1.4\n";
  const offsets = [0];

  for (let id = 1; id < objects.length; id += 1) {
    offsets[id] = pdf.length;
    pdf += `${id} 0 obj\n${objects[id]}\nendobj\n`;
  }

  const xrefOffset = pdf.length;
  pdf += `xref\n0 ${objects.length}\n0000000000 65535 f \n`;
  for (let id = 1; id < objects.length; id += 1) {
    pdf += `${String(offsets[id]).padStart(10, "0")} 00000 n \n`;
  }
  pdf += `trailer\n<< /Size ${objects.length} /Root ${catalogId} 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`;

  return new Blob([pdf], { type: "application/pdf" });
}

export default function QuoteBuilder() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const [products, setProducts] = useState<any[]>([]);
  const [quoteItems, setQuoteItems] = useState<QuoteItem[]>([]);
  const [customerInfo, setCustomerInfo] = useState<CustomerInfo>(emptyCustomerInfo);
  const [quoteNotes, setQuoteNotes] = useState("");
  const [validityDays, setValidityDays] = useState(30);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadProducts() {
      try {
        console.log('🔍 Quote Builder: Loading products...');
        const data = await fetchPublishedProducts();
        console.log('✅ Quote Builder: Loaded products:', data);
        console.log('📊 Quote Builder: Product count:', data.length);
        setProducts(data);
      } catch (error) {
        console.error('❌ Quote Builder: Error loading products:', error);
        toast({
          title: "Error loading products",
          description: "Could not load products from database. Please refresh the page.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    }
    loadProducts();
  }, []);

  const addQuoteItem = (productId: string) => {
    const product = products.find((p) => p.id === productId);
    if (!product) return;

    const existingItem = quoteItems.find((item) => item.product.id === productId);
    if (existingItem) {
      toast({
        title: "Product already added",
        description: "This product is already in the quote. You can adjust the quantity.",
        variant: "destructive",
      });
      return;
    }

    const newItem: QuoteItem = {
      id: crypto.randomUUID(),
      product,
      quantity: 1,
      unitPrice: getProductPrice(product),
      discount: 0,
      notes: "",
    };

    setQuoteItems([...quoteItems, newItem]);
    toast({
      title: "Product added",
      description: `${product.name} has been added to the quote.`,
    });
  };

  const removeQuoteItem = (itemId: string) => {
    setQuoteItems(quoteItems.filter((item) => item.id !== itemId));
  };

  const updateQuoteItem = (itemId: string, field: keyof QuoteItem, value: any) => {
    setQuoteItems(
      quoteItems.map((item) =>
        item.id === itemId ? { ...item, [field]: value } : item
      )
    );
  };

  const calculateItemTotal = (item: QuoteItem) => {
    const subtotal = item.quantity * item.unitPrice;
    const discountAmount = (subtotal * item.discount) / 100;
    return subtotal - discountAmount;
  };

  const calculateSubtotal = () => {
    return quoteItems.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
  };

  const calculateTotalDiscount = () => {
    return quoteItems.reduce((sum, item) => {
      const subtotal = item.quantity * item.unitPrice;
      return sum + (subtotal * item.discount) / 100;
    }, 0);
  };

  const calculateGrandTotal = () => {
    return quoteItems.reduce((sum, item) => sum + calculateItemTotal(item), 0);
  };

  const calculateTax = (rate: number = 18) => {
    return (calculateGrandTotal() * rate) / 100;
  };

  const calculateFinalTotal = () => {
    return calculateGrandTotal() + calculateTax();
  };

  const buildQuoteLines = (quoteNumber?: string) => {
    const lines = [
      "ADITYA GENSET",
      "Quote Builder",
      "",
      `Quote No: ${quoteNumber || `DRAFT-${new Date().toISOString().slice(0, 10)}`}`,
      `Date: ${new Date().toLocaleDateString("en-IN")}`,
      `Valid For: ${validityDays} days`,
      "",
      "Customer",
      `Name: ${customerInfo.name || "-"}`,
      `Company: ${customerInfo.company || "-"}`,
      `Email: ${customerInfo.email || "-"}`,
      `Phone: ${customerInfo.phone || "-"}`,
      `Address: ${customerInfo.address || "-"}`,
      "",
      "Items",
    ];

    quoteItems.forEach((item, index) => {
      lines.push(
        `${index + 1}. ${item.product.name}`,
        `   ${item.product.kva || "-"} kVA | ${item.product.engine_brand || "-"}`,
        `   Qty: ${item.quantity} | Unit: ${formatCurrency(item.unitPrice)} | Discount: ${item.discount}%`,
        `   Line Total: ${formatCurrency(calculateItemTotal(item))}`
      );

      if (item.notes.trim()) {
        wrapText(`   Notes: ${item.notes.trim()}`).forEach((line) => lines.push(line));
      }
    });

    lines.push(
      "",
      "Summary",
      `Subtotal: ${formatCurrency(calculateSubtotal())}`,
      `Discount: ${formatCurrency(calculateTotalDiscount())}`,
      `After Discount: ${formatCurrency(calculateGrandTotal())}`,
      `GST 18%: ${formatCurrency(calculateTax())}`,
      `Total: ${formatCurrency(calculateFinalTotal())}`,
      "",
      "Terms",
      `Quote valid for ${validityDays} days.`,
      "Prices exclude installation and commissioning.",
      "Subject to terms and conditions."
    );

    if (quoteNotes.trim()) {
      lines.push("", "Additional Notes");
      wrapText(quoteNotes.trim()).forEach((line) => lines.push(line));
    }

    return lines.flatMap((line) => wrapText(line));
  };

  const createBrandedQuotePdf = (quoteNumber: string) => {
    const brandNavy = "#0B2F4D";
    const brandOrange = "#F5A000";
    const slate = "#47657F";
    const softBlue = "#EEF4F8";
    const border = "#D7E2EA";
    const green = "#12805C";
    const pageWidth = 595;
    const pageHeight = 842;
    const left = 42;
    const right = pageWidth - 42;
    const pages: string[] = [];

    const addFooter = (commands: string[], pageNumber: number) => {
      commands.push(
        pdfLine(left, 38, right, 38, border),
        pdfText("Aditya Genset | Power solutions, service and support", left, 22, {
          size: 8,
          color: slate,
        }),
        pdfText(`Page ${pageNumber}`, right - 42, 22, { size: 8, color: slate })
      );
    };

    const createPage = () => {
      const commands = [
        pdfRect(0, pageHeight - 112, pageWidth, 112, brandNavy),
        pdfRect(0, pageHeight - 118, pageWidth, 6, brandOrange),
        pdfRect(left, pageHeight - 84, 34, 34, brandOrange),
        pdfText("AG", left + 8, pageHeight - 72, { size: 14, font: "bold", color: "#FFFFFF" }),
        pdfText("ADITYA GENSET", left + 46, pageHeight - 58, {
          size: 22,
          font: "bold",
          color: "#FFFFFF",
        }),
        pdfText("Generator Quote", left + 47, pageHeight - 78, {
          size: 10,
          color: "#DCE8F0",
        }),
        pdfText("QUOTATION", right - 112, pageHeight - 58, {
          size: 20,
          font: "bold",
          color: "#FFFFFF",
        }),
        pdfText(quoteNumber, right - 92, pageHeight - 78, {
          size: 10,
          color: "#FFE2A3",
        }),
      ];
      return commands;
    };

    const addInfoCards = (commands: string[]) => {
      commands.push(
        pdfRect(left, 635, 245, 76, softBlue),
        pdfStrokeRect(left, 635, 245, 76, border),
        pdfText("BILL TO", left + 14, 691, { size: 9, font: "bold", color: brandOrange }),
        pdfText(customerInfo.name || "-", left + 14, 673, { size: 12, font: "bold" }),
        pdfText(customerInfo.company || "Company not specified", left + 14, 657, {
          size: 9,
          color: slate,
        }),
        pdfText(customerInfo.email || "-", left + 14, 643, { size: 8, color: slate }),

        pdfRect(right - 245, 635, 245, 76, "#FFFFFF"),
        pdfStrokeRect(right - 245, 635, 245, 76, border),
        pdfText("QUOTE DETAILS", right - 231, 691, { size: 9, font: "bold", color: brandOrange }),
        pdfText(`Date: ${new Date().toLocaleDateString("en-IN")}`, right - 231, 672, {
          size: 9,
          color: slate,
        }),
        pdfText(`Validity: ${validityDays} days`, right - 231, 656, { size: 9, color: slate }),
        pdfText(`Currency: INR`, right - 231, 640, { size: 9, color: slate })
      );
    };

    const addTableHeader = (commands: string[], y: number) => {
      commands.push(
        pdfRect(left, y, right - left, 24, brandNavy),
        pdfText("PRODUCT", left + 12, y + 8, { size: 8, font: "bold", color: "#FFFFFF" }),
        pdfText("QTY", 324, y + 8, { size: 8, font: "bold", color: "#FFFFFF" }),
        pdfText("UNIT", 364, y + 8, { size: 8, font: "bold", color: "#FFFFFF" }),
        pdfText("DISC", 438, y + 8, { size: 8, font: "bold", color: "#FFFFFF" }),
        pdfText("TOTAL", 490, y + 8, { size: 8, font: "bold", color: "#FFFFFF" })
      );
    };

    let pageNumber = 1;
    let commands = createPage();
    addInfoCards(commands);
    addTableHeader(commands, 590);
    let y = 538;

    quoteItems.forEach((item, index) => {
      if (y < 150) {
        addFooter(commands, pageNumber);
        pages.push(commands.join("\n"));
        pageNumber += 1;
        commands = createPage();
        addTableHeader(commands, 680);
        y = 628;
      }

      const rowFill = index % 2 === 0 ? "#FFFFFF" : "#F8FBFD";
      const productLines = wrapText(`${index + 1}. ${item.product.name}`, 34).slice(0, 2);
      commands.push(
        pdfRect(left, y - 12, right - left, 48, rowFill),
        pdfStrokeRect(left, y - 12, right - left, 48, border, 0.5),
        pdfText(productLines[0], left + 12, y + 16, { size: 9, font: "bold" }),
        pdfText(productLines[1] || `${item.product.kva || "-"} kVA | ${item.product.engine_brand || "-"}`, left + 12, y + 1, {
          size: 8,
          color: slate,
        }),
        pdfText(String(item.quantity), 326, y + 8, { size: 9 }),
        pdfText(formatCurrency(item.unitPrice), 356, y + 8, { size: 8 }),
        pdfText(`${item.discount}%`, 441, y + 8, { size: 8 }),
        pdfText(formatCurrency(calculateItemTotal(item)), 480, y + 8, {
          size: 8,
          font: "bold",
          color: brandNavy,
        })
      );
      y -= 52;
    });

    if (y < 250) {
      addFooter(commands, pageNumber);
      pages.push(commands.join("\n"));
      pageNumber += 1;
      commands = createPage();
      y = 650;
    }

    commands.push(
      pdfRect(left, y - 96, 245, 104, softBlue),
      pdfStrokeRect(left, y - 96, 245, 104, border),
      pdfText("TERMS & NOTES", left + 14, y - 17, { size: 9, font: "bold", color: brandOrange }),
      pdfText(`Quote valid for ${validityDays} days.`, left + 14, y - 35, { size: 8, color: slate }),
      pdfText("Prices exclude installation and commissioning.", left + 14, y - 50, {
        size: 8,
        color: slate,
      }),
      pdfText("Subject to terms and conditions.", left + 14, y - 65, { size: 8, color: slate }),

      pdfRect(right - 220, y - 116, 220, 124, "#FFFFFF"),
      pdfStrokeRect(right - 220, y - 116, 220, 124, border),
      pdfText("Subtotal", right - 206, y - 18, { size: 9, color: slate }),
      pdfText(formatCurrency(calculateSubtotal()), right - 92, y - 18, { size: 9, font: "bold" }),
      pdfText("Discount", right - 206, y - 38, { size: 9, color: slate }),
      pdfText(`-${formatCurrency(calculateTotalDiscount())}`, right - 92, y - 38, {
        size: 9,
        font: "bold",
        color: green,
      }),
      pdfText("GST 18%", right - 206, y - 58, { size: 9, color: slate }),
      pdfText(formatCurrency(calculateTax()), right - 92, y - 58, { size: 9, font: "bold" }),
      pdfRect(right - 220, y - 116, 220, 36, brandNavy),
      pdfText("TOTAL", right - 206, y - 102, { size: 11, font: "bold", color: "#FFFFFF" }),
      pdfText(formatCurrency(calculateFinalTotal()), right - 98, y - 102, {
        size: 11,
        font: "bold",
        color: "#FFE2A3",
      })
    );

    if (quoteNotes.trim()) {
      let noteY = y - 142;
      commands.push(pdfText("ADDITIONAL NOTES", left, noteY, { size: 9, font: "bold", color: brandOrange }));
      wrapText(quoteNotes.trim(), 92).slice(0, 5).forEach((line) => {
        noteY -= 14;
        commands.push(pdfText(line, left, noteY, { size: 8, color: slate }));
      });
    }

    addFooter(commands, pageNumber);
    pages.push(commands.join("\n"));
    return createPdfDocument(pages);
  };

  const generateQuotePDF = async () => {
    if (quoteItems.length === 0) {
      toast({
        title: "No items",
        description: "Please add at least one product before downloading a PDF.",
        variant: "destructive",
      });
      return;
    }

    try {
      const quoteNumber = await generateQuoteNumber();
      const blob = createBrandedQuotePdf(quoteNumber);
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${quoteNumber}-quote.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);

      toast({
        title: "PDF downloaded",
        description: `${quoteNumber}-quote.pdf has been created.`,
      });
    } catch (error) {
      console.error("Error generating quote PDF:", error);
      toast({
        title: "PDF failed",
        description: "Could not generate the quote PDF. Please try again.",
        variant: "destructive",
      });
    }
  };

  const sendQuoteEmail = () => {
    const email = customerInfo.email.trim();

    if (!email) {
      toast({
        title: "Email required",
        description: "Please enter customer email address.",
        variant: "destructive",
      });
      return;
    }

    if (!EMAIL_RE.test(email)) {
      toast({
        title: "Invalid email",
        description: "Please enter a valid customer email address.",
        variant: "destructive",
      });
      return;
    }

    if (quoteItems.length === 0) {
      toast({
        title: "No items",
        description: "Please add at least one product before sending a quote.",
        variant: "destructive",
      });
      return;
    }

    const subject = "Your Aditya Genset Quote";
    const body = buildQuoteLines().join("\n");
    window.location.href = `mailto:${encodeURIComponent(email)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

    toast({
      title: "Email draft opened",
      description: "Your mail app should open with the quote details filled in.",
    });
  };

  const saveQuoteToDatabase = async () => {
    if (quoteItems.length === 0) {
      toast({
        title: "No items",
        description: "Please add at least one product to the quote.",
        variant: "destructive",
      });
      return;
    }

    const normalizedCustomerInfo = {
      name: customerInfo.name.trim(),
      email: customerInfo.email.trim(),
      phone: customerInfo.phone.trim(),
      company: customerInfo.company.trim(),
      address: customerInfo.address.trim(),
    };

    if (!normalizedCustomerInfo.name || !normalizedCustomerInfo.email) {
      toast({
        title: "Missing information",
        description: "Please enter customer name and email.",
        variant: "destructive",
      });
      return;
    }

    if (!EMAIL_RE.test(normalizedCustomerInfo.email)) {
      toast({
        title: "Invalid email",
        description: "Please enter a valid customer email address.",
        variant: "destructive",
      });
      return;
    }

    const invalidItem = quoteItems.find(
      (item) =>
        item.quantity < 1 ||
        item.unitPrice < 0 ||
        item.discount < 0 ||
        item.discount > 100
    );

    if (invalidItem) {
      toast({
        title: "Invalid quote item",
        description: "Quantity, price, and discount values must be valid before saving.",
        variant: "destructive",
      });
      return;
    }

    if (!user?.id) {
      toast({
        title: "Login required",
        description: "Please log in again before saving this quote.",
        variant: "destructive",
      });
      navigate("/login", { replace: true });
      return;
    }

    const safeValidityDays = clampNumber(validityDays, 1, 365);

    try {
      toast({
        title: "Saving quote",
        description: "Creating quote in database...",
      });

      // Calculate expiry date
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + safeValidityDays);

      let quoteNumber = "";
      let quote: any = null;

      for (let attempt = 0; attempt < 3; attempt += 1) {
        quoteNumber = await generateQuoteNumber();

        try {
          quote = await createQuote({
            quote_number: quoteNumber,
            created_by_user_id: user.id,
            total_amount: calculateFinalTotal(),
            currency: 'INR',
            expires_at: expiresAt.toISOString(),
            payload: {
              customerInfo: normalizedCustomerInfo,
              quoteNotes: quoteNotes.trim(),
              validityDays: safeValidityDays,
              subtotal: calculateSubtotal(),
              discount: calculateTotalDiscount(),
              tax: calculateTax(),
              grandTotal: calculateGrandTotal(),
            },
          });
          break;
        } catch (error: any) {
          if (error?.code !== "23505" || !String(error?.message || "").includes("quote_number")) {
            throw error;
          }
        }
      }

      if (!quote) {
        throw new Error("Could not reserve a unique quote number. Please try again.");
      }

      // Create quote items
      const items = quoteItems.map((item, index) => ({
        product_id: UUID_RE.test(item.product.id) ? item.product.id : null,
        quantity: item.quantity,
        unit_price: item.unitPrice,
        line_total: calculateItemTotal(item),
        product_snapshot: {
          name: item.product.name,
          model: item.product.model,
          kva: item.product.kva,
          engine_brand: item.product.engine_brand,
          product_id: item.product.id,
          slug: item.product.slug,
          source: UUID_RE.test(item.product.id) ? "database" : "static_catalog",
          notes: item.notes,
          discount: item.discount,
        },
        display_order: index,
      }));

      await createQuoteItems(quote.id, items);

      toast({
        title: "Quote saved!",
        description: `Quote ${quoteNumber} has been created successfully.`,
      });

      // Clear the form
      setQuoteItems([]);
      setCustomerInfo(emptyCustomerInfo);
      setQuoteNotes("");
      setValidityDays(30);
      localStorage.removeItem("quote_draft");

    } catch (error) {
      console.error("Error saving quote:", error);
      const message =
        error instanceof Error
          ? error.message
          : "Failed to save quote. Please try again.";
      toast({
        title: "Error",
        description: message,
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent"></div>
      </div>
    );
  }

  return (
    <>
      <SEO title="Quote Builder | Aditya Genset" />
      
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="container-x max-w-7xl">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <div>
              <button
                onClick={() => navigate(-1)}
                className="flex items-center gap-2 text-sm text-muted-foreground hover:text-accent transition-colors mb-2"
              >
                <ArrowLeft size={16} />
                Back
              </button>
              <h1 className="text-3xl font-bold font-display flex items-center gap-3">
                <Calculator className="text-accent" size={32} />
                <EditableText section="quoteBuilderPage" contentKey="title" />
              </h1>
              <p className="text-muted-foreground mt-2">
                <EditableText section="quoteBuilderPage" contentKey="subtitle" />
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Customer Info & Products */}
            <div className="lg:col-span-2 space-y-6">
              {/* Customer Information */}
              <Card>
                <CardHeader>
                  <CardTitle><EditableText section="quoteBuilderPage" contentKey="step2Title" /></CardTitle>
                  <CardDescription><EditableText section="quoteBuilderPage" contentKey="step2Desc" /></CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="name">Customer Name *</Label>
                      <Input
                        id="name"
                        value={customerInfo.name}
                        onChange={(e) =>
                          setCustomerInfo({ ...customerInfo, name: e.target.value })
                        }
                        placeholder="John Doe"
                      />
                    </div>
                    <div>
                      <Label htmlFor="company">Company</Label>
                      <Input
                        id="company"
                        value={customerInfo.company}
                        onChange={(e) =>
                          setCustomerInfo({ ...customerInfo, company: e.target.value })
                        }
                        placeholder="ABC Industries"
                      />
                    </div>
                    <div>
                      <Label htmlFor="email">Email *</Label>
                      <Input
                        id="email"
                        type="email"
                        value={customerInfo.email}
                        onChange={(e) =>
                          setCustomerInfo({ ...customerInfo, email: e.target.value })
                        }
                        placeholder="john@example.com"
                      />
                    </div>
                    <div>
                      <Label htmlFor="phone">Phone</Label>
                      <Input
                        id="phone"
                        value={customerInfo.phone}
                        onChange={(e) =>
                          setCustomerInfo({ ...customerInfo, phone: e.target.value })
                        }
                        placeholder="+91 98765 43210"
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="address">Address</Label>
                    <Textarea
                      id="address"
                      value={customerInfo.address}
                      onChange={(e) =>
                        setCustomerInfo({ ...customerInfo, address: e.target.value })
                      }
                      placeholder="Complete address"
                      rows={2}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Add Products */}
              <Card>
                <CardHeader>
                  <CardTitle>Add Products</CardTitle>
                  <CardDescription>Select products to include in the quote</CardDescription>
                </CardHeader>
                <CardContent>
                  {products.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <p className="mb-2">No products available</p>
                      <p className="text-sm">Please add products to the database first</p>
                    </div>
                  ) : (
                    <Select onValueChange={addQuoteItem}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a product to add" />
                      </SelectTrigger>
                      <SelectContent>
                        {products.map((product) => (
                          <SelectItem key={product.id} value={product.id}>
                            {product.name} ({product.kva} kVA - {product.engine_brand})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                </CardContent>
              </Card>

              {/* Quote Items */}
              {quoteItems.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Quote Items ({quoteItems.length})</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {quoteItems.map((item) => (
                      <div
                        key={item.id}
                        className="p-4 border border-border rounded-lg space-y-4"
                      >
                        <div className="flex items-start gap-4">
                          <img
                            src={getProductImage(item.product)}
                            alt={item.product.name}
                            className="w-20 h-20 object-contain bg-gray-50 rounded-lg"
                          />
                          <div className="flex-1">
                            <h4 className="font-bold">{item.product.name}</h4>
                            <p className="text-sm text-muted-foreground">
                              {item.product.kva} kVA • {item.product.engine_brand}
                            </p>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeQuoteItem(item.id)}
                            className="text-red-500 hover:text-red-600 hover:bg-red-50"
                          >
                            <Trash2 size={16} />
                          </Button>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                          <div>
                            <Label className="text-xs">Quantity</Label>
                            <Input
                              type="number"
                              min="1"
                              value={item.quantity}
                              onFocus={(e) => e.target.select()}
                              onChange={(e) =>
                                updateQuoteItem(
                                  item.id,
                                  "quantity",
                                  clampNumber(parseInt(e.target.value, 10) || 1, 1, 999)
                                )
                              }
                            />
                          </div>
                          <div>
                            <Label className="text-xs">Unit Price (₹)</Label>
                            <Input
                              type="number"
                              min="0"
                              step="0.01"
                              value={item.unitPrice}
                              onFocus={(e) => e.target.select()}
                              onChange={(e) =>
                                updateQuoteItem(
                                  item.id,
                                  "unitPrice",
                                  clampNumber(parseFloat(e.target.value) || 0, 0)
                                )
                              }
                            />
                          </div>
                          <div>
                            <Label className="text-xs">Discount (%)</Label>
                            <Input
                              type="number"
                              min="0"
                              max="100"
                              value={item.discount}
                              onFocus={(e) => e.target.select()}
                              onChange={(e) =>
                                updateQuoteItem(
                                  item.id,
                                  "discount",
                                  clampNumber(parseFloat(e.target.value) || 0, 0, 100)
                                )
                              }
                            />
                          </div>
                          <div>
                            <Label className="text-xs">Total (₹)</Label>
                            <Input
                              value={calculateItemTotal(item).toLocaleString("en-IN")}
                              disabled
                              className="bg-gray-50 font-bold"
                            />
                          </div>
                        </div>

                        <div>
                          <Label className="text-xs">Item Notes</Label>
                          <Input
                            value={item.notes}
                            onChange={(e) =>
                              updateQuoteItem(item.id, "notes", e.target.value)
                            }
                            placeholder="Optional notes for this item"
                          />
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}

              {/* Quote Notes */}
              <Card>
                <CardHeader>
                  <CardTitle>Quote Notes & Terms</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="notes">Additional Notes</Label>
                    <Textarea
                      id="notes"
                      value={quoteNotes}
                      onChange={(e) => setQuoteNotes(e.target.value)}
                      placeholder="Payment terms, delivery conditions, warranty information, etc."
                      rows={4}
                    />
                  </div>
                  <div>
                    <Label htmlFor="validity">Quote Validity (Days)</Label>
                    <Input
                      id="validity"
                      type="number"
                      min="1"
                      value={validityDays}
                      onChange={(e) =>
                        setValidityDays(clampNumber(parseInt(e.target.value, 10), 1, 365))
                      }
                    />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Right Column - Summary */}
            <div className="lg:col-span-1">
              <Card className="sticky top-24">
                <CardHeader>
                  <CardTitle>Quote Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Subtotal:</span>
                      <span className="font-medium">
                        ₹{calculateSubtotal().toLocaleString("en-IN")}
                      </span>
                    </div>
                    <div className="flex justify-between text-green-600">
                      <span>Discount:</span>
                      <span>-₹{calculateTotalDiscount().toLocaleString("en-IN")}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">After Discount:</span>
                      <span className="font-medium">
                        ₹{calculateGrandTotal().toLocaleString("en-IN")}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">GST (18%):</span>
                      <span className="font-medium">
                        ₹{calculateTax().toLocaleString("en-IN")}
                      </span>
                    </div>
                    <div className="pt-2 border-t border-border flex justify-between text-lg font-bold">
                      <span>Total:</span>
                      <span className="text-accent">
                        ₹{calculateFinalTotal().toLocaleString("en-IN")}
                      </span>
                    </div>
                  </div>

                  <div className="pt-4 space-y-2">
                    <Button
                      className="w-full"
                      onClick={saveQuoteToDatabase}
                      disabled={quoteItems.length === 0}
                    >
                      <Save className="mr-2" size={16} />
                      Save to Database
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={generateQuotePDF}
                      disabled={quoteItems.length === 0}
                    >
                      <Download className="mr-2" size={16} />
                      Download PDF
                    </Button>

                  </div>

                  <div className="pt-4 border-t border-border text-xs text-muted-foreground space-y-1">
                    <p>• Quote valid for {validityDays} days</p>
                    <p>• Prices exclude installation & commissioning</p>
                    <p>• Subject to terms & conditions</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
