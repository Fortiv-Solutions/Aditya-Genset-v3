import React, { createContext, useContext, useState, useEffect } from "react";

export interface QuoteItem {
  id: string;
  product: any;
  quantity: number;
  unitPrice: number;
  discount: number;
  notes: string;
}

export interface CustomerInfo {
  name: string;
  email: string;
  phone: string;
  company: string;
  address: string;
}

interface QuoteContextType {
  quoteItems: QuoteItem[];
  customerInfo: CustomerInfo;
  quoteNotes: string;
  validityDays: number;
  addQuoteItem: (product: any) => void;
  removeQuoteItem: (itemId: string) => void;
  updateQuoteItem: (itemId: string, field: keyof QuoteItem, value: any) => void;
  updateCustomerInfo: (info: Partial<CustomerInfo>) => void;
  setQuoteNotes: (notes: string) => void;
  setValidityDays: (days: number) => void;
  clearQuote: () => void;
  calculateItemTotal: (item: QuoteItem) => number;
  calculateSubtotal: () => number;
  calculateTotalDiscount: () => number;
  calculateGrandTotal: () => number;
  calculateTax: (rate?: number) => number;
  calculateFinalTotal: () => number;
}

const QuoteContext = createContext<QuoteContextType | undefined>(undefined);

export const QuoteProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
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

  const addQuoteItem = (product: any) => {
    const existingItem = quoteItems.find((item) => item.product.id === product.id);
    if (existingItem) {
      return; // Don't add duplicates
    }

    const newItem: QuoteItem = {
      id: crypto.randomUUID(),
      product,
      quantity: 1,
      unitPrice: 0,
      discount: 0,
      notes: "",
    };

    setQuoteItems([...quoteItems, newItem]);
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

  const updateCustomerInfo = (info: Partial<CustomerInfo>) => {
    setCustomerInfo({ ...customerInfo, ...info });
  };

  const clearQuote = () => {
    setQuoteItems([]);
    setCustomerInfo({
      name: "",
      email: "",
      phone: "",
      company: "",
      address: "",
    });
    setQuoteNotes("");
    setValidityDays(30);
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

  return (
    <QuoteContext.Provider
      value={{
        quoteItems,
        customerInfo,
        quoteNotes,
        validityDays,
        addQuoteItem,
        removeQuoteItem,
        updateQuoteItem,
        updateCustomerInfo,
        setQuoteNotes,
        setValidityDays,
        clearQuote,
        calculateItemTotal,
        calculateSubtotal,
        calculateTotalDiscount,
        calculateGrandTotal,
        calculateTax,
        calculateFinalTotal,
      }}
    >
      {children}
    </QuoteContext.Provider>
  );
};

export const useQuote = () => {
  const context = useContext(QuoteContext);
  if (context === undefined) {
    throw new Error("useQuote must be used within a QuoteProvider");
  }
  return context;
};
