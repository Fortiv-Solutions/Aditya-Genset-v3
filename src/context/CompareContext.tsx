import React, { createContext, useContext, useState, useEffect } from "react";

interface CompareContextType {
  selectedIds: string[];
  addToCompare: (id: string) => void;
  removeFromCompare: (id: string) => void;
  clearCompare: () => void;
  isInCompare: (id: string) => boolean;
}

const CompareContext = createContext<CompareContextType | undefined>(undefined);

export const CompareProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [selectedIds, setSelectedIds] = useState<string[]>(() => {
    const saved = localStorage.getItem("compare_ids");
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem("compare_ids", JSON.stringify(selectedIds));
  }, [selectedIds]);

  const addToCompare = (id: string) => {
    setSelectedIds((prev) => {
      if (prev.includes(id)) return prev;
      if (prev.length >= 4) return prev; // Limit to 4 products
      return [...prev, id];
    });
  };

  const removeFromCompare = (id: string) => {
    setSelectedIds((prev) => prev.filter((i) => i !== id));
  };

  const clearCompare = () => {
    setSelectedIds([]);
  };

  const isInCompare = (id: string) => selectedIds.includes(id);

  return (
    <CompareContext.Provider
      value={{
        selectedIds,
        addToCompare,
        removeFromCompare,
        clearCompare,
        isInCompare,
      }}
    >
      {children}
    </CompareContext.Provider>
  );
};

export const useCompare = () => {
  const context = useContext(CompareContext);
  if (context === undefined) {
    throw new Error("useCompare must be used within a CompareProvider");
  }
  return context;
};
