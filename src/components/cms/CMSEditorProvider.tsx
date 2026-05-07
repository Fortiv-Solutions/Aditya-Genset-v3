import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { fetchCMSSection, updateCMSSection } from "@/lib/api/cms";
import { defaultContent, CMSSection as CMSSectionKey } from "@/lib/sanity";

type CMSContentState = typeof defaultContent;

interface CMSEditorContextType {
  isEditMode: boolean;
  setIsEditMode: (v: boolean) => void;
  content: CMSContentState;
  updateContent: (section: CMSSectionKey, key: string, value: string) => void;
  updateContentLive: (section: CMSSectionKey, key: string, value: string) => void;
  commitHistory: () => void;
  undo: () => void;
  redo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  discard: () => void;
  saveAll: () => Promise<void>;
  loadProductCMS: (productId: string) => Promise<void>;
  setCurrentProductId: (productId: string | null) => void;
}

const CMSEditorContext = createContext<CMSEditorContextType | null>(null);

const ALL_GLOBAL_SECTIONS = Object.keys(defaultContent).filter(
  s => !s.toLowerCase().includes('showcase') && !s.toLowerCase().includes('presentation')
) as CMSSectionKey[];

export function CMSEditorProvider({ children }: { children: ReactNode }) {
  const [isEditMode, setIsEditMode] = useState(false);
  const [content, setContent] = useState<CMSContentState>(defaultContent);
  const [initialContent, setInitialContent] = useState<CMSContentState>(defaultContent);
  const [currentProductId, setCurrentProductId] = useState<string | null>(null);

  // History for undo/redo
  const [history, setHistory] = useState<CMSContentState[]>([defaultContent]);
  const [historyIndex, setHistoryIndex] = useState(0);

  // Load GLOBAL sections on mount
  useEffect(() => {
    const loadGlobals = async () => {
      try {
        const results = await Promise.all(ALL_GLOBAL_SECTIONS.map(s => fetchCMSSection(s, 'global')));
        
        setContent(prev => {
          const newState = { ...prev };
          ALL_GLOBAL_SECTIONS.forEach((section, i) => {
            if (results[i]) {
              newState[section] = { ...defaultContent[section], ...results[i].content } as any;
            }
          });
          return newState;
        });
      } catch (err) {
        console.error("CMS Load Globals Failed:", err);
      }
    };
    loadGlobals();
  }, []);

  const loadProductCMS = React.useCallback(async (productId: string) => {
    try {
      setCurrentProductId(productId);
      const showcase = await fetchCMSSection('showcaseData', 'product', productId);
      const presentation = await fetchCMSSection('presentationData', 'product', productId);
      
      setContent(prev => ({
        ...prev,
        showcaseData: showcase?.content || prev.showcaseData,
        presentationData: presentation?.content || prev.presentationData
      }));
    } catch (err) {
      console.error("CMS Load Product Data Failed:", err);
    }
  }, []);

  const updateContentLive = React.useCallback((section: CMSSectionKey, key: string, value: string) => {
    setContent((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [key]: value
      }
    }));
  }, []);

  const commitHistory = React.useCallback(() => {
    setHistory(prevHistory => {
      const newHistory = prevHistory.slice(0, historyIndex + 1);
      if (JSON.stringify(newHistory[newHistory.length - 1]) !== JSON.stringify(content)) {
        newHistory.push(content);
        setHistoryIndex(newHistory.length - 1);
      }
      return newHistory;
    });
  }, [content, historyIndex]);

  const undo = React.useCallback(() => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      setHistoryIndex(newIndex);
      setContent(history[newIndex]);
    }
  }, [history, historyIndex]);

  const redo = React.useCallback(() => {
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1;
      setHistoryIndex(newIndex);
      setContent(history[newIndex]);
    }
  }, [history, historyIndex]);

  const discard = React.useCallback(() => {
    setContent(initialContent);
    setHistory([initialContent]);
    setHistoryIndex(0);
  }, [initialContent]);

  const saveAll = React.useCallback(async () => {
    const sectionsToSave = Object.keys(content) as CMSSectionKey[];
    await Promise.all(
      sectionsToSave.flatMap(section => {
        const scopeType = (section === 'showcaseData' || section === 'presentationData') ? 'product' : 'global';
        if (scopeType === "product" && !currentProductId) {
          return [];
        }
        const scopeId = scopeType === "product" ? currentProductId || undefined : undefined;
        return [updateCMSSection(section, content[section], scopeType, scopeId)];
      })
    );
    setInitialContent(content);
  }, [content, currentProductId]);

  const contextValue = React.useMemo(() => ({
    isEditMode,
    setIsEditMode,
    content,
    updateContent: updateContentLive,
    updateContentLive,
    commitHistory,
    undo,
    redo,
    canUndo: historyIndex > 0,
    canRedo: historyIndex < history.length - 1,
    discard,
    saveAll,
    loadProductCMS,
    setCurrentProductId,
  }), [
    isEditMode,
    content,
    historyIndex,
    history.length,
    updateContentLive,
    commitHistory,
    undo,
    redo,
    discard,
    saveAll,
    loadProductCMS,
    setCurrentProductId,
  ]);


  return (
    <CMSEditorContext.Provider value={contextValue}>
      {children}
    </CMSEditorContext.Provider>
  );
}

export const useCMSState = () => {
  const context = useContext(CMSEditorContext);
  if (!context) throw new Error("useCMSState must be used within CMSEditorProvider");
  return context;
};
