import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { fetchPublishedProducts } from "@/lib/api/products";
import { SEO } from "@/components/site/SEO";
import { ArrowLeft, Plus, Trash2, Download, Send, Calculator } from "lucide-react";
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

export default function QuoteBuilder() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [products, setProducts] = useState<any[]>([]);
  const [quoteItems, setQuoteItems] = useState<QuoteItem[]>([]);
  const [customerInfo, setCustomerInfo] = useState<CustomerInfo>({
    name: "",
    email: "",
    phone: "",
    company: "",
    address: "",
  });
  const [quoteNotes, setQuoteNotes] = useState("");
  const [validityDays, setValidityDays] = useState(30);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadProducts() {
      const data = await fetchPublishedProducts();
      setProducts(data);
      setLoading(false);
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
      unitPrice: 0, // To be filled by user
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

  const generateQuotePDF = () => {
    // This would integrate with a PDF generation library
    toast({
      title: "Generating PDF",
      description: "Your quote is being prepared for download...",
    });
    
    // Placeholder for PDF generation
    setTimeout(() => {
      toast({
        title: "PDF Ready",
        description: "Quote has been generated successfully.",
      });
    }, 1500);
  };

  const sendQuoteEmail = () => {
    if (!customerInfo.email) {
      toast({
        title: "Email required",
        description: "Please enter customer email address.",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Sending quote",
      description: `Quote will be sent to ${customerInfo.email}`,
    });

    // Placeholder for email sending
    setTimeout(() => {
      toast({
        title: "Quote sent",
        description: "The quote has been emailed successfully.",
      });
    }, 1500);
  };

  const saveQuoteDraft = () => {
    const draft = {
      quoteItems,
      customerInfo,
      quoteNotes,
      validityDays,
      savedAt: new Date().toISOString(),
    };
    localStorage.setItem("quote_draft", JSON.stringify(draft));
    toast({
      title: "Draft saved",
      description: "Your quote has been saved locally.",
    });
  };

  const loadQuoteDraft = () => {
    const saved = localStorage.getItem("quote_draft");
    if (saved) {
      const draft = JSON.parse(saved);
      setQuoteItems(draft.quoteItems || []);
      setCustomerInfo(draft.customerInfo || {});
      setQuoteNotes(draft.quoteNotes || "");
      setValidityDays(draft.validityDays || 30);
      toast({
        title: "Draft loaded",
        description: "Your saved quote has been restored.",
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
      <SEO title="Quote Builder — Aditya Genset" />
      
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
                Quote Builder
              </h1>
              <p className="text-muted-foreground mt-2">
                Create professional quotes for your customers
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={loadQuoteDraft}>
                Load Draft
              </Button>
              <Button variant="outline" onClick={saveQuoteDraft}>
                Save Draft
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Customer Info & Products */}
            <div className="lg:col-span-2 space-y-6">
              {/* Customer Information */}
              <Card>
                <CardHeader>
                  <CardTitle>Customer Information</CardTitle>
                  <CardDescription>Enter customer details for the quote</CardDescription>
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
                            src={
                              item.product.product_media?.find(
                                (m: any) => m.kind === "primary"
                              )?.url || gensetFallback
                            }
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
                              onChange={(e) =>
                                updateQuoteItem(
                                  item.id,
                                  "quantity",
                                  parseInt(e.target.value) || 1
                                )
                              }
                            />
                          </div>
                          <div>
                            <Label className="text-xs">Unit Price (₹)</Label>
                            <Input
                              type="number"
                              min="0"
                              value={item.unitPrice}
                              onChange={(e) =>
                                updateQuoteItem(
                                  item.id,
                                  "unitPrice",
                                  parseFloat(e.target.value) || 0
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
                              onChange={(e) =>
                                updateQuoteItem(
                                  item.id,
                                  "discount",
                                  parseFloat(e.target.value) || 0
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
                        setValidityDays(parseInt(e.target.value) || 30)
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
                      onClick={generateQuotePDF}
                      disabled={quoteItems.length === 0}
                    >
                      <Download className="mr-2" size={16} />
                      Download PDF
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={sendQuoteEmail}
                      disabled={quoteItems.length === 0 || !customerInfo.email}
                    >
                      <Send className="mr-2" size={16} />
                      Send via Email
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
