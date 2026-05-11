/**
 * ChapterInteractive.tsx
 * 
 * Rich interactive content panel for each EKL 15 kVA showcase chapter.
 * Each chapter has a specific interaction pattern:
 *   01 overview     — tab switcher (highlights / about)
 *   02 engine       — tab switcher + expandable bullet list
 *   03 fuel/lube    — load slider + lube/cooling toggle
 *   04 alternator   — tab switcher + efficiency bars
 *   05 electrical   — accordion for reactance data
 *   06 enclosure    — open/acoustic toggle
 *   07 control      — 3-tab switcher
 *   08 protection   — 2-tab + certification badges
 *   09 supply       — checklist + expandable optional
 *   10 dimensions   — open/acoustic toggle + SVG diagram
 */

import { useState } from "react";
import { cn } from "@/lib/utils";
import { 
  ChevronDown, CheckCircle2, Circle, Zap, Shield, 
  Trash2, Plus, Info, 
  Clock as ClockIcon, 
  MonitorPlay as MonitorPlayIcon, 
  Clapperboard as ClapperboardIcon 
} from "lucide-react";
import type { ChapterDataInput } from "@/lib/api/productPublisher";
import { CountUp } from "@/components/site/CountUp";
import { EditableText } from "@/components/cms/EditableText";
import type { CMSSection } from "@/lib/sanity";

interface Props {
  chapterId: string;
  data: ChapterDataInput;
  active: boolean;
  sectionId?: string;
  index?: number;
  onChange?: (data: Partial<ChapterDataInput>) => void;
}

// ── Shared sub-components ─────────────────────────────────────────────────────

function TabBar({ tabs, active, onSelect }: { tabs: string[]; active: number; onSelect: (i: number) => void }) {
  return (
    <div className="flex h-10 gap-1 rounded-lg bg-muted/50 p-1 mb-5">
      {tabs.map((t, i) => (
        <button
          key={t}
          onClick={() => onSelect(i)}
          className={cn(
            "flex h-8 min-w-0 flex-1 items-center justify-center rounded-md px-3 text-[11px] font-semibold uppercase tracking-wider transition-all duration-200",
            i === active
              ? "bg-foreground text-background shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          <span className="truncate">{t}</span>
        </button>
      ))}
    </div>
  );
}

function SpecGrid({ rows, sectionId, index, onChange }: { rows: { label: string; value: string }[]; sectionId?: CMSSection; index?: number; onChange?: (rows: { label: string; value: string }[]) => void }) {
  if (onChange) {
    const update = (i: number, field: "label"|"value", val: string) => {
      const next = [...rows];
      next[i] = { ...next[i], [field]: val };
      onChange(next);
    };
    return (
      <div className="grid grid-cols-1 gap-0 divide-y divide-border group/grid relative pb-8">
        {rows.map((r, i) => (
          <div key={i} className="flex items-baseline justify-between py-2.5 gap-4 group/row">
            <span
              contentEditable
              suppressContentEditableWarning
              onBlur={e => update(i, 'label', e.currentTarget.textContent || "")}
              className="text-[11px] uppercase tracking-wider text-muted-foreground font-medium shrink-0 outline-none focus:bg-accent/10 focus:ring-2 focus:ring-accent/30 rounded px-1 -ml-1 transition-all"
            >
              {r.label}
            </span>
            <div className="flex items-center gap-2 text-right">
              <span
                contentEditable
                suppressContentEditableWarning
                onBlur={e => update(i, 'value', e.currentTarget.textContent || "")}
                className="text-sm font-semibold text-foreground outline-none focus:bg-accent/10 focus:ring-2 focus:ring-accent/30 rounded px-1 -mr-1 transition-all"
              >
                {r.value}
              </span>
              <button 
                onClick={() => onChange(rows.filter((_, idx) => idx !== i))}
                className="opacity-0 group-hover/row:opacity-100 p-0.5 text-red-500 hover:text-red-400 transition-opacity ml-1"
                title="Remove Spec"
              >
                <Trash2 size={12} />
              </button>
            </div>
          </div>
        ))}
        <button 
          onClick={() => onChange([...rows, { label: "New Spec", value: "-" }])}
          className="absolute -bottom-1 left-0 text-[10px] text-accent uppercase tracking-wider font-bold flex items-center gap-1 hover:text-accent/80 transition-colors opacity-0 group-hover/grid:opacity-100"
        >
          <Plus size={12} /> Add Spec
        </button>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-0 divide-y divide-border">
      {rows.map((r, i) => (
        <div key={i} className="flex items-baseline justify-between py-2.5 gap-4">
          <span className="text-[11px] uppercase tracking-wider text-muted-foreground font-medium shrink-0">
            {sectionId !== undefined && index !== undefined ? (
              <EditableText section={sectionId} contentKey={`chapter_${index}_spec${i}_label`} fallback={r.label} />
            ) : r.label}
          </span>
          <span className="text-sm font-semibold text-foreground text-right">
            {sectionId !== undefined && index !== undefined ? (
              <EditableText section={sectionId} contentKey={`chapter_${index}_spec${i}_value`} fallback={r.value} />
            ) : r.value}
          </span>
        </div>
      ))}
    </div>
  );
}

function BulletList({ items, icon, sectionId, index, listKey, onChange }: { items: string[]; icon?: React.ReactNode; sectionId?: CMSSection; index?: number; listKey?: string; onChange?: (items: string[]) => void }) {
  if (onChange) {
    return (
      <ul className="space-y-2 group/list relative pb-6">
        {items.map((item, i) => (
          <li key={i} className="flex items-start gap-2.5 text-sm text-foreground/85 group/item">
            <span className="mt-1 shrink-0 text-accent">{icon ?? "▸"}</span>
            <span
              contentEditable
              suppressContentEditableWarning
              onBlur={e => {
                const n = [...items]; n[i] = e.currentTarget.textContent || ""; onChange(n);
              }}
              className="flex-1 outline-none focus:bg-accent/10 focus:ring-2 focus:ring-accent/30 rounded px-1 -mx-1 transition-all leading-relaxed"
            >
              {item}
            </span>
            <button 
              onClick={() => onChange(items.filter((_, idx) => idx !== i))}
              className="opacity-0 group-hover/item:opacity-100 p-0.5 text-red-500 hover:text-red-400 mt-0.5 transition-opacity"
              title="Remove Item"
            >
              <Trash2 size={12} />
            </button>
          </li>
        ))}
        <button 
          onClick={() => onChange([...items, "New feature"])}
          className="absolute -bottom-1 left-0 mt-2 text-[10px] text-accent uppercase tracking-wider font-bold flex items-center gap-1 hover:text-accent/80 transition-colors opacity-0 group-hover/list:opacity-100"
        >
          <Plus size={12} /> Add Item
        </button>
      </ul>
    );
  }

  return (
    <ul className="space-y-2">
      {items.map((item, i) => (
        <li key={i} className="flex items-start gap-2.5 text-sm text-foreground/85">
          <span className="mt-0.5 shrink-0 text-accent">{icon ?? "▸"}</span>
          <span className="leading-relaxed">
            {sectionId !== undefined && index !== undefined && listKey ? (
              <EditableText section={sectionId} contentKey={`chapter_${index}_${listKey}_${i}`} fallback={item} />
            ) : item}
          </span>
        </li>
      ))}
    </ul>
  );
}

function Badge({ text, color = "default" }: { text: React.ReactNode; color?: "default" | "green" | "blue" }) {
  return (
    <span className={cn(
      "inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[11px] font-semibold tracking-wide",
      color === "green" && "border-green-500/30 bg-green-500/10 text-green-700 dark:text-green-400",
      color === "blue" && "border-blue-500/30 bg-blue-500/10 text-blue-700 dark:text-blue-400",
      color === "default" && "border-border bg-muted/60 text-foreground/70",
    )}>
      {text}
    </span>
  );
}

// ── Chapter 01 — Overview ─────────────────────────────────────────────────────
function OverviewChapter({ data, sectionId, index, onChange }: { data: ChapterDataInput; sectionId: string; index: number; onChange?: (d: Partial<ChapterDataInput>) => void }) {
  const [tab, setTab] = useState(0);
  const sectionKey = sectionId as CMSSection;

  return (
    <div>
      <TabBar tabs={["Highlights", "About"]} active={tab} onSelect={setTab} />
      {tab === 0 && (
        <div className="space-y-5">
          {/* Hero CountUp stats */}
          <div className="grid grid-cols-3 gap-3 border-y border-border py-4">
            {(() => {
              const base = data.highlights ?? [];
              const defaults = [
                { label: "KVA RATING", value: data.kva || "Refer", suffix: "kVA" },
                { label: "VOLTAGE", value: "415", suffix: "V" },
                { label: "FREQUENCY", value: "50", suffix: "Hz" }
              ];
              // Ensure we have exactly 3 items
              const displayItems = [...base, ...defaults.slice(base.length)].slice(0, 3);
              return displayItems;
            })().map((h, i) => (
              <div key={i} className="text-center group/stat relative">
                <div className="num-display text-2xl font-semibold md:text-3xl text-foreground flex items-baseline justify-center">
                  {onChange ? (
                    <>
                      <span
                        contentEditable
                        suppressContentEditableWarning
                        onBlur={e => {
                          const next = [...(data.highlights ?? [])];
                          if (!next[i]) next[i] = { label: "", value: "", suffix: "" };
                          next[i] = { ...next[i], value: e.currentTarget.textContent || "" };
                          onChange({ highlights: next });
                        }}
                        className="outline-none focus:bg-accent/10 focus:ring-2 focus:ring-accent/30 rounded px-1 transition-all"
                      >
                        {h.value}
                      </span>
                      <span
                        contentEditable
                        suppressContentEditableWarning
                        onBlur={e => {
                          const next = [...(data.highlights ?? [])];
                          if (!next[i]) next[i] = { label: "", value: "", suffix: "" };
                          next[i] = { ...next[i], suffix: e.currentTarget.textContent || "" };
                          onChange({ highlights: next });
                        }}
                        className="text-sm font-normal outline-none focus:bg-accent/10 focus:ring-2 focus:ring-accent/30 rounded px-1 transition-all"
                      >
                        {h.suffix}
                      </span>
                    </>
                  ) : (
                    <>
                      <EditableText section={sectionKey} contentKey={`chapter_${index}_h${i}_value`} fallback={String(h.value)} as="span" />
                      <EditableText section={sectionKey} contentKey={`chapter_${index}_h${i}_suffix`} fallback={h.suffix || ""} as="span" className="text-sm font-normal" />
                    </>
                  )}
                </div>
                {onChange ? (
                  <div
                    contentEditable
                    suppressContentEditableWarning
                    onBlur={e => {
                      const next = [...(data.highlights ?? [])];
                      if (!next[i]) next[i] = { label: "", value: "", suffix: "" };
                      next[i] = { ...next[i], label: e.currentTarget.textContent || "" };
                      onChange({ highlights: next });
                    }}
                    className="text-[10px] uppercase tracking-wider text-muted-foreground mt-1 outline-none focus:bg-accent/10 focus:ring-2 focus:ring-accent/30 rounded px-1 transition-all"
                  >
                    {h.label}
                  </div>
                ) : (
                  <EditableText section={sectionKey} contentKey={`chapter_${index}_h${i}_label`} fallback={h.label} as="div" className="text-[10px] uppercase tracking-wider text-muted-foreground mt-1" />
                )}
              </div>
            ))}
          </div>

          {/* Feature badges */}
          <div className="flex flex-wrap gap-2 group/badges relative pb-6">
            {(data.badges ?? []).map((b, bIdx) => (
              <span 
                key={bIdx} 
                className="group/badge inline-flex items-center gap-1.5 rounded-full border border-border bg-muted/60 px-3 py-1 text-[11px] font-medium text-foreground/70 tracking-wide transition-all"
              >
                <span
                  contentEditable={!!onChange}
                  suppressContentEditableWarning
                  onBlur={e => {
                    if (onChange) {
                      const next = [...(data.badges ?? [])];
                      next[bIdx] = e.currentTarget.textContent || "";
                      onChange({ badges: next });
                    }
                  }}
                  className="outline-none focus:bg-accent/10 focus:ring-2 focus:ring-accent/30 rounded px-1 transition-all"
                >
                  {b}
                </span>
                {onChange && (
                  <button 
                    onClick={() => onChange({ badges: data.badges?.filter((_, i) => i !== bIdx) })}
                    className="opacity-0 group-hover/badge:opacity-100 text-red-500 hover:text-red-400 transition-opacity ml-1"
                  >
                    <Trash2 size={10} />
                  </button>
                )}
              </span>
            ))}
            {onChange && (
              <button 
                onClick={() => onChange({ badges: [...(data.badges ?? []), "New Badge"] })}
                className="absolute -bottom-1 left-0 text-[10px] text-accent uppercase tracking-wider font-bold flex items-center gap-1 hover:text-accent/80 transition-colors opacity-0 group-hover/badges:opacity-100"
              >
                <Plus size={12} /> Add Badge
              </button>
            )}
          </div>

          {/* Spec grid */}
          <SpecGrid rows={data.specs ?? []} onChange={onChange ? (specs) => onChange({ specs }) : undefined} />
        </div>
      )}
      {tab === 1 && (
        <div className="space-y-4">
          <p 
            contentEditable={!!onChange}
            suppressContentEditableWarning
            onBlur={e => onChange?.({ description: e.currentTarget.textContent || "" })}
            className="text-sm leading-relaxed text-foreground/80 border-l-2 border-accent pl-4 font-display italic outline-none focus:bg-accent/10 focus:ring-2 focus:ring-accent/30 rounded px-1 transition-all"
          >
            {data.description}
          </p>
          <SpecGrid rows={data.aboutSpecs ?? []} onChange={onChange ? (aboutSpecs) => onChange({ aboutSpecs }) : undefined} />
        </div>
      )}
    </div>
  );
}

// ── Chapter 02 — Engine ───────────────────────────────────────────────────────
function EngineChapter({ data, sectionId, index, onChange }: { data: ChapterDataInput; sectionId: string; index: number; onChange?: (d: Partial<ChapterDataInput>) => void }) {
  const [tab, setTab] = useState(0);
  const sectionKey = sectionId as CMSSection;
  return (
    <div>
      <TabBar tabs={["Core Specs", "Engine Features"]} active={tab} onSelect={setTab} />
      {tab === 0 && <SpecGrid rows={data.specs ?? []} sectionId={sectionKey} index={index} onChange={onChange ? (specs) => onChange({ specs }) : undefined} />}
      {tab === 1 && (
        <div className="space-y-4">
          <BulletList items={data.features ?? []} sectionId={sectionKey} index={index} listKey="features" onChange={onChange ? (features) => onChange({ features }) : undefined} />
        </div>
      )}
    </div>
  );
}

// ── Chapter 03 — Fuel, Lube & Cooling ────────────────────────────────────────
function FuelChapter({ data, sectionId, index, onChange }: { data: ChapterDataInput; sectionId: string; index: number; onChange?: (d: Partial<ChapterDataInput>) => void }) {
  const [load, setLoad] = useState(100);
  const [tab, setTab] = useState(0);
  const sectionKey = sectionId as CMSSection;

  const fuelPoints = data.fuelConsumptionPoints ?? [
    { load: 25, lhr: 1.69 },
    { load: 50, lhr: 2.28 },
    { load: 75, lhr: 2.98 },
    { load: 100, lhr: 3.78 },
    { load: 110, lhr: 4.40 },
  ];
  const interpolate = (l: number) => {
    const sorted = fuelPoints;
    for (let i = 0; i < sorted.length - 1; i++) {
      if (l <= sorted[i + 1].load) {
        const t = (l - sorted[i].load) / (sorted[i + 1].load - sorted[i].load);
        return (sorted[i].lhr + t * (sorted[i + 1].lhr - sorted[i].lhr)).toFixed(2);
      }
    }
    return sorted[sorted.length - 1].lhr.toFixed(2);
  };

  return (
    <div className="space-y-5">
      {/* Fuel Calculator */}
      <div className="rounded-xl border border-border bg-muted/30 p-4">
        <div className="flex items-baseline justify-between mb-3">
          <span className="text-[11px] uppercase tracking-wider text-muted-foreground font-medium">Fuel Consumption</span>
          <span className="font-display text-2xl font-semibold text-accent">{interpolate(load)} <span className="text-sm font-normal text-muted-foreground">L/hr</span></span>
        </div>
        <input
          type="range" min={25} max={110} step={1} value={load}
          onChange={e => setLoad(Number(e.target.value))}
          className="w-full h-1.5 rounded-full accent-amber-500 cursor-pointer"
        />
        <div className="flex justify-between text-[10px] text-muted-foreground mt-1.5">
          {fuelPoints.map((p, i) => (
            <div key={i} className="flex flex-col items-center group/p">
              <span>{p.load}%</span>
              {onChange ? (
                <span
                  contentEditable
                  suppressContentEditableWarning
                  onBlur={e => {
                    const next = [...fuelPoints];
                    next[i] = { ...next[i], lhr: parseFloat(e.currentTarget.textContent || "0") || 0 };
                    onChange({ fuelConsumptionPoints: next });
                  }}
                  className="text-[9px] font-bold text-accent mt-0.5 outline-none focus:bg-accent/10 rounded px-0.5 transition-all"
                >
                  {p.lhr}
                </span>
              ) : (
                <span className="text-[8px] opacity-60">{p.lhr}</span>
              )}
            </div>
          ))}
        </div>
        <div className="text-center mt-1">
          <span className="text-xs font-semibold text-foreground/70">{load}% Load</span>
        </div>
      </div>

      {/* Lube / Cooling tabs */}
      <TabBar tabs={["Lubrication", "Cooling"]} active={tab} onSelect={setTab} />
      {tab === 0 && <SpecGrid rows={data.lubeSpecs ?? []} sectionId={sectionKey} index={index} onChange={onChange ? (lubeSpecs) => onChange({ lubeSpecs }) : undefined} />}
      {tab === 1 && <SpecGrid rows={data.coolingSpecs ?? []} sectionId={sectionKey} index={index} onChange={onChange ? (coolingSpecs) => onChange({ coolingSpecs }) : undefined} />}
    </div>
  );
}

// ── Chapter 04 — Alternator ───────────────────────────────────────────────────
function AlternatorChapter({ data, sectionId, index, onChange }: { data: ChapterDataInput; sectionId: string; index: number; onChange?: (d: Partial<ChapterDataInput>) => void }) {
  const [tab, setTab] = useState(0);
  const sectionKey = sectionId as CMSSection;
  return (
    <div>
      <TabBar tabs={["Core Specs", "Performance", "Features"]} active={tab} onSelect={setTab} />
      {tab === 0 && <SpecGrid rows={data.specs ?? []} sectionId={sectionKey} index={index} onChange={onChange ? (specs) => onChange({ specs }) : undefined} />}
      {tab === 1 && (
        <div className="space-y-4">
          <p className="text-[11px] uppercase tracking-wider text-muted-foreground font-medium mb-3">Efficiency @ 0.8 p.f.</p>
          {(data.efficiencyPoints ?? [
            { label: "75% Load", value: 86.4 },
            { label: "100% Load", value: 83.5 },
          ]).map((row, i) => (
            <div key={i} className="group/eff relative mb-4 last:mb-0">
              <div className="flex justify-between text-sm mb-1.5">
                {onChange ? (
                   <span
                    contentEditable
                    suppressContentEditableWarning
                    onBlur={e => {
                      const next = [...(data.efficiencyPoints ?? [{ label: "75% Load", value: 86.4 }, { label: "100% Load", value: 83.5 }])];
                      next[i] = { ...next[i], label: e.currentTarget.textContent || "" };
                      onChange({ efficiencyPoints: next });
                    }}
                    className="text-muted-foreground outline-none focus:bg-accent/10 rounded px-1 -mx-1"
                  >
                    {row.label}
                  </span>
                ) : (
                  <span className="text-muted-foreground">{row.label}</span>
                )}
                
                {onChange ? (
                   <div className="flex items-center gap-0.5">
                    <span
                      contentEditable
                      suppressContentEditableWarning
                      onBlur={e => {
                        const next = [...(data.efficiencyPoints ?? [{ label: "75% Load", value: 86.4 }, { label: "100% Load", value: 83.5 }])];
                        next[i] = { ...next[i], value: parseFloat(e.currentTarget.textContent || "0") || 0 };
                        onChange({ efficiencyPoints: next });
                      }}
                      className="font-semibold text-foreground outline-none focus:bg-accent/10 rounded px-1"
                    >
                      {row.value}
                    </span>
                    <span className="font-semibold text-foreground">%</span>
                   </div>
                ) : (
                  <span className="font-semibold text-foreground">{row.value}%</span>
                )}
              </div>
              <div className="h-2 rounded-full bg-muted overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-accent to-amber-400 transition-all duration-700"
                  style={{ width: `${row.value}%` }}
                />
              </div>
            </div>
          ))}
          <SpecGrid rows={data.perfSpecs ?? []} sectionId={sectionKey} index={index} onChange={onChange ? (perfSpecs) => onChange({ perfSpecs }) : undefined} />
        </div>
      )}
      {tab === 2 && <BulletList items={data.features ?? []} sectionId={sectionKey} index={index} listKey="features" onChange={onChange ? (features) => onChange({ features }) : undefined} />}
    </div>
  );
}

// ── Chapter 05 — Electrical Performance ──────────────────────────────────────
function ElectricalChapter({ data, sectionId, index, onChange }: { data: ChapterDataInput; sectionId: string; index: number; onChange?: (d: Partial<ChapterDataInput>) => void }) {
  const [tab, setTab] = useState(0);
  const sectionKey = sectionId as CMSSection;
  return (
    <div>
      <TabBar tabs={["Key Specs", "Reactance Data"]} active={tab} onSelect={setTab} />
      {tab === 0 && <SpecGrid rows={data.specs ?? []} sectionId={sectionKey} index={index} onChange={onChange ? (specs) => onChange({ specs }) : undefined} />}
      {tab === 1 && (
        <div className="rounded-lg border border-border overflow-hidden">
          <table className="w-full text-xs">
            <thead className="bg-muted/50">
              <tr>
                <th className="text-left px-3 py-2.5 font-semibold text-muted-foreground">Symbol</th>
                <th className="text-left px-3 py-2.5 font-semibold text-muted-foreground">Description</th>
                <th className="text-right px-3 py-2.5 font-semibold text-muted-foreground">Value (p.u.)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {(data.reactanceData ?? []).map((row, rIdx) => (
                <tr key={rIdx} className="hover:bg-muted/20 transition-colors group/reactance">
                  <td className="px-3 py-2.5 font-mono font-bold text-accent">
                    {onChange ? (
                      <span
                        contentEditable
                        suppressContentEditableWarning
                        onBlur={e => {
                          const next = [...(data.reactanceData ?? [])];
                          next[rIdx] = { ...next[rIdx], symbol: e.currentTarget.textContent || "" };
                          onChange({ reactanceData: next });
                        }}
                        className="outline-none focus:bg-accent/10 focus:ring-2 focus:ring-accent/30 rounded px-1 transition-all"
                      >
                        {row.symbol}
                      </span>
                    ) : (
                      <EditableText section={sectionKey} contentKey={`chapter_${index}_reactance${rIdx}_symbol`} fallback={row.symbol} />
                    )}
                  </td>
                  <td className="px-3 py-2.5 text-foreground/80 leading-snug">
                    {onChange ? (
                      <span
                        contentEditable
                        suppressContentEditableWarning
                        onBlur={e => {
                          const next = [...(data.reactanceData ?? [])];
                          next[rIdx] = { ...next[rIdx], description: e.currentTarget.textContent || "" };
                          onChange({ reactanceData: next });
                        }}
                        className="outline-none focus:bg-accent/10 focus:ring-2 focus:ring-accent/30 rounded px-1 transition-all"
                      >
                        {row.description}
                      </span>
                    ) : (
                      <EditableText section={sectionKey} contentKey={`chapter_${index}_reactance${rIdx}_desc`} fallback={row.description} />
                    )}
                  </td>
                  <td className="px-3 py-2.5 font-semibold text-right text-foreground">
                    <div className="flex items-center justify-end gap-2">
                      {onChange ? (
                        <span
                          contentEditable
                          suppressContentEditableWarning
                          onBlur={e => {
                            const next = [...(data.reactanceData ?? [])];
                            next[rIdx] = { ...next[rIdx], value: e.currentTarget.textContent || "" };
                            onChange({ reactanceData: next });
                          }}
                          className="outline-none focus:bg-accent/10 focus:ring-2 focus:ring-accent/30 rounded px-1 transition-all"
                        >
                          {row.value}
                        </span>
                      ) : (
                        <EditableText section={sectionKey} contentKey={`chapter_${index}_reactance${rIdx}_value`} fallback={row.value} />
                      )}
                      {onChange && (
                        <button 
                          onClick={() => onChange({ reactanceData: data.reactanceData?.filter((_, i) => i !== rIdx) })}
                          className="opacity-0 group-hover/reactance:opacity-100 p-0.5 text-red-500 hover:text-red-400 transition-opacity"
                        >
                          <Trash2 size={12} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {onChange && (
            <div className="p-2 border-t border-border bg-muted/10">
              <button 
                onClick={() => onChange({ reactanceData: [...(data.reactanceData ?? []), { symbol: "X'd", description: "Transient Reactance", value: "0.15" }] })}
                className="text-[10px] text-accent uppercase tracking-wider font-bold flex items-center gap-1 hover:text-accent/80 transition-colors"
              >
                <Plus size={12} /> Add Row
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── Chapter 06 — Enclosure & Sound ───────────────────────────────────────────
function EnclosureChapter({ data, sectionId, index, onChange }: { data: ChapterDataInput; sectionId: string; index: number; onChange?: (d: Partial<ChapterDataInput>) => void }) {
  const [tab, setTab] = useState(0);
  const sectionKey = sectionId as CMSSection;

  return (
    <div className="space-y-6">
      <TabBar tabs={["Features", "Compliance & Ratings"]} active={tab} onSelect={setTab} />
      
      {tab === 0 && (
        <div className="animate-in fade-in slide-in-from-left-2 duration-300">
          <p className="text-[11px] uppercase tracking-wider text-muted-foreground font-medium mb-3">Enclosure Features</p>
          <BulletList 
            items={data.features ?? []} 
            sectionId={sectionKey} 
            index={index} 
            listKey="features" 
            onChange={onChange ? (features) => onChange({ features }) : undefined} 
          />
        </div>
      )}

      {tab === 1 && (
        <div className="animate-in fade-in slide-in-from-right-2 duration-300">
          <p className="text-[11px] uppercase tracking-wider text-muted-foreground font-medium mb-3">Compliance & Ratings</p>
          <SpecGrid rows={data.specs ?? []} sectionId={sectionKey} index={index} onChange={onChange ? (specs) => onChange({ specs }) : undefined} />
        </div>
      )}
    </div>
  );
}

// ── Chapter 07 — Control Panel ────────────────────────────────────────────────
function ControlChapter({ data, sectionId, index, onChange }: { data: ChapterDataInput; sectionId: string; index: number; onChange?: (d: Partial<ChapterDataInput>) => void }) {
  const [mainTab, setMainTab] = useState(0);
  const [meterTab, setMeterTab] = useState(0);
  const sectionKey = sectionId as CMSSection;
  return (
    <div>
      <TabBar tabs={["Controller", "Features", "Metering", "Electrical"]} active={mainTab} onSelect={setMainTab} />
      {mainTab === 0 && <SpecGrid rows={data.specs ?? []} sectionId={sectionKey} index={index} onChange={onChange ? (specs) => onChange({ specs }) : undefined} />}
      {mainTab === 1 && <BulletList items={data.features ?? []} sectionId={sectionKey} index={index} listKey="features" onChange={onChange ? (features) => onChange({ features }) : undefined} />}
      {mainTab === 2 && (
        <div className="space-y-4">
          <div className="flex gap-1 bg-muted/50 p-1 rounded-md w-fit">
            {["Engine Metering", "Electrical Metering"].map((t, i) => (
              <button
                key={t}
                onClick={() => setMeterTab(i)}
                className={cn(
                  "px-3 py-1 rounded text-[10px] font-bold uppercase transition-all",
                  meterTab === i ? "bg-foreground text-background shadow-sm" : "text-muted-foreground hover:text-foreground"
                )}
              >
                {t}
              </button>
            ))}
          </div>
          <div className="rounded-xl border border-border bg-muted/20 p-5 min-h-[10rem]">
            {meterTab === 0 ? (
              <div className="animate-in fade-in slide-in-from-left-2 duration-300">
                <p className="text-[11px] uppercase tracking-wider text-accent font-bold mb-3">Engine Parameters</p>
                <BulletList items={data.engineParams ?? []} sectionId={sectionKey} index={index} listKey="engineParams" onChange={onChange ? (engineParams) => onChange({ engineParams }) : undefined} />
              </div>
            ) : (
              <div className="animate-in fade-in slide-in-from-right-2 duration-300">
                <p className="text-[11px] uppercase tracking-wider text-accent font-bold mb-3">Electrical Parameters</p>
                <BulletList items={data.electricalParams ?? []} sectionId={sectionKey} index={index} listKey="electricalParams" onChange={onChange ? (electricalParams) => onChange({ electricalParams }) : undefined} />
              </div>
            )}
          </div>
        </div>
      )}
      {mainTab === 3 && <SpecGrid rows={data.electricalSpecs ?? []} sectionId={sectionKey} index={index} onChange={onChange ? (electricalSpecs) => onChange({ electricalSpecs }) : undefined} />}
    </div>
  );
}

// ── Chapter 08 — Protection & Approvals ──────────────────────────────────────
function ProtectionChapter({ data, sectionId, index, onChange }: { data: ChapterDataInput; sectionId: string; index: number; onChange?: (d: Partial<ChapterDataInput>) => void }) {
  const [tab, setTab] = useState(0);
  const sectionKey = sectionId as CMSSection;
  return (
    <div className="space-y-5">
      <TabBar tabs={["Engine Protection", "Electrical Protection"]} active={tab} onSelect={setTab} />
      {tab === 0 && <BulletList items={data.engineProtections ?? []} icon={<Shield size={13} />} sectionId={sectionKey} index={index} listKey="engineProtections" onChange={onChange ? (engineProtections) => onChange({ engineProtections }) : undefined} />}
      {tab === 1 && <BulletList items={data.electricalProtections ?? []} icon={<Zap size={13} />} sectionId={sectionKey} index={index} listKey="electricalProtections" onChange={onChange ? (electricalProtections) => onChange({ electricalProtections }) : undefined} />}
      <div className="border-t border-border pt-4">
        <p className="text-[11px] uppercase tracking-wider text-muted-foreground font-medium mb-3">Approvals & Compliance</p>
        <div className="flex flex-wrap gap-2 group/approvals relative pb-6">
          {(data.approvals ?? []).map((a, aIdx) => (
            <span 
              key={aIdx} 
              className="group/badge inline-flex items-center gap-1.5 rounded-full border border-green-500/30 bg-green-500/10 text-green-700 dark:text-green-400 px-3 py-1 text-[11px] font-semibold tracking-wide transition-all"
            >
              <span
                contentEditable={!!onChange}
                suppressContentEditableWarning
                onBlur={e => {
                  if (onChange) {
                    const next = [...(data.approvals ?? [])];
                    next[aIdx] = e.currentTarget.textContent || "";
                    onChange({ approvals: next });
                  }
                }}
                className="outline-none focus:bg-green-500/10 focus:ring-2 focus:ring-green-500/30 rounded px-1 transition-all"
              >
                {a}
              </span>
              {onChange && (
                <button 
                  onClick={() => onChange({ approvals: data.approvals?.filter((_, i) => i !== aIdx) })}
                  className="opacity-0 group-hover/badge:opacity-100 text-red-500 hover:text-red-400 transition-opacity ml-1"
                >
                  <Trash2 size={10} />
                </button>
              )}
            </span>
          ))}
          {onChange && (
            <button 
              onClick={() => onChange({ approvals: [...(data.approvals ?? []), "New Approval"] })}
              className="absolute -bottom-1 left-0 text-[10px] text-accent uppercase tracking-wider font-bold flex items-center gap-1 hover:text-accent/80 transition-colors opacity-0 group-hover/approvals:opacity-100"
            >
              <Plus size={12} /> Add Approval
            </button>
          )}
        </div>
      </div>

      {(data.unmappedNotes && data.unmappedNotes.length > 0) && (
        <div className="border-t border-border pt-4">
          <p className="text-[11px] uppercase tracking-wider text-muted-foreground font-medium mb-3">Additional Technical Notes</p>
          <BulletList 
            items={data.unmappedNotes} 
            icon={<Info size={13} className="text-blue-500" />} 
            sectionId={sectionKey} 
            index={index} 
            listKey="unmappedNotes" 
            onChange={onChange ? (unmappedNotes) => onChange({ unmappedNotes }) : undefined} 
          />
        </div>
      )}
    </div>
  );
}

// ── Chapter 09 — Standard Supply & Optional Extras ───────────────────────────
function SupplyChapter({ data, sectionId, index, onChange }: { data: ChapterDataInput; sectionId: string; index: number; onChange?: (d: Partial<ChapterDataInput>) => void }) {
  const [mainTab, setMainTab] = useState(0);
  const [subTab, setSubTab] = useState(0);
  const sectionKey = sectionId as CMSSection;

  return (
    <div>
      <TabBar tabs={["Standard Supply", "Optional Supply"]} active={mainTab} onSelect={setMainTab} />
      
      {mainTab === 0 && (
        <div className="space-y-3">
          <p className="text-[11px] uppercase tracking-wider text-muted-foreground font-medium">Standard Scope ({data.standardItems?.length || 0} items)</p>
          <div className="grid grid-cols-1 gap-1.5 max-h-[22rem] overflow-y-auto pr-1">
            {onChange ? (
              <BulletList 
                items={data.standardItems ?? []} 
                icon={<CheckCircle2 size={14} className="text-accent shrink-0" />} 
                onChange={(standardItems) => onChange({ standardItems })} 
              />
            ) : (
              (data.standardItems ?? []).map((item, i) => (
                <div key={i} className="flex items-center gap-2.5 text-sm">
                  <CheckCircle2 size={14} className="text-accent shrink-0" />
                  <span className="text-foreground/85">
                    <EditableText section={sectionKey} contentKey={`chapter_${index}_standardItem${i}`} fallback={item} />
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {mainTab === 1 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-[11px] uppercase tracking-wider text-muted-foreground font-medium">Optional Extras</p>
            {data.optionalGroups && data.optionalGroups.length > 0 && (
              <div className="flex gap-1">
                {data.optionalGroups.map((g, i) => (
                  <button
                    key={i}
                    onClick={() => setSubTab(i)}
                    className={cn(
                      "px-2 py-0.5 rounded text-[9px] font-bold uppercase transition-all",
                      subTab === i ? "bg-accent text-white shadow-sm" : "bg-muted text-muted-foreground hover:bg-muted/80"
                    )}
                  >
                    {g.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="rounded-xl border border-border bg-muted/20 p-5 min-h-[12rem] relative group/optional">
            {data.optionalGroups?.[subTab] ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  {onChange ? (
                    <span
                      contentEditable
                      suppressContentEditableWarning
                      onBlur={e => {
                        const next = [...(data.optionalGroups ?? [])];
                        next[subTab] = { ...next[subTab], label: e.currentTarget.textContent || "" };
                        onChange({ optionalGroups: next });
                      }}
                      className="text-xs font-bold text-accent uppercase tracking-wide outline-none focus:bg-accent/10 rounded px-1"
                    >
                      {data.optionalGroups[subTab].label}
                    </span>
                  ) : (
                    <span className="text-xs font-bold text-accent uppercase tracking-wide">
                      {data.optionalGroups[subTab].label}
                    </span>
                  )}
                  {onChange && (
                    <button 
                      onClick={() => onChange({ optionalGroups: data.optionalGroups?.filter((_, i) => i !== subTab) })}
                      className="text-red-500 hover:text-red-400 opacity-0 group-hover/optional:opacity-100 transition-opacity"
                    >
                      <Trash2 size={12} />
                    </button>
                  )}
                </div>
                
                <BulletList 
                  items={data.optionalGroups[subTab].items} 
                  icon={<Circle size={10} className="text-muted-foreground shrink-0 mt-1" />} 
                  onChange={onChange ? (items) => {
                    const next = [...(data.optionalGroups ?? [])];
                    next[subTab] = { ...next[subTab], items };
                    onChange({ optionalGroups: next });
                  } : undefined} 
                />
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-center py-8 opacity-40">
                <Circle size={24} className="mb-2" />
                <p className="text-xs">No optional extras defined.</p>
                {onChange && (
                  <button 
                    onClick={() => onChange({ optionalGroups: [{ label: "Electrical", items: ["ATS"] }] })}
                    className="mt-4 text-xs font-bold text-accent hover:underline"
                  >
                    + Add New Group
                  </button>
                )}
              </div>
            )}
            
            {onChange && (
               <button 
                onClick={() => {
                  const next = [...(data.optionalGroups ?? []), { label: "New Group", items: ["New Item"] }];
                  onChange({ optionalGroups: next });
                  setSubTab(next.length - 1);
                }}
                className="absolute bottom-4 right-4 p-1.5 rounded-full bg-accent text-white shadow-lg hover:scale-110 transition-transform opacity-0 group-hover/optional:opacity-100"
                title="Add New Group"
              >
                <Plus size={14} />
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Chapter 10 — Dimensions & Weights ────────────────────────────────────────
function DimensionsChapter({ data, sectionId, index, onChange }: { data: ChapterDataInput; sectionId: string; index: number; onChange?: (d: Partial<ChapterDataInput>) => void }) {
  const [isAcoustic, setIsAcoustic] = useState(true);
  const sectionKey = sectionId as CMSSection;
  const dims = isAcoustic ? data.acousticDims : data.openDims;

  const updateDim = (label: string, newVal: string) => {
    if (!onChange) return;
    const next = [...(dims ?? [])];
    const idx = next.findIndex(d => d.label === label);
    if (idx > -1) {
      next[idx] = { ...next[idx], value: newVal };
    } else {
      next.push({ label, value: newVal });
    }
    onChange({ [isAcoustic ? 'acousticDims' : 'openDims']: next });
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3 rounded-lg border border-border bg-muted/30 p-1">
        <button onClick={() => setIsAcoustic(false)} className={cn("flex-1 rounded-md py-2 text-xs font-semibold transition-all", !isAcoustic ? "bg-foreground text-background shadow" : "text-muted-foreground")}>Open Set</button>
        <button onClick={() => setIsAcoustic(true)} className={cn("flex-1 rounded-md py-2 text-xs font-semibold transition-all", isAcoustic ? "bg-foreground text-background shadow" : "text-muted-foreground")}>Acoustic Set</button>
      </div>

      {/* SVG dimension diagram */}
      {dims && (
        <div className="rounded-xl border border-border bg-muted/20 p-4">
          <DimensionDiagram 
            dims={dims} 
            sectionId={sectionKey} 
            index={index} 
            isAcoustic={isAcoustic} 
            onChange={onChange ? updateDim : undefined}
          />
        </div>
      )}

      <div className="space-y-4">
        <p className="text-[11px] uppercase tracking-wider text-muted-foreground font-medium">Dimension Details</p>
        <SpecGrid 
          rows={dims ?? []} 
          onChange={onChange ? (newDims) => onChange({ [isAcoustic ? 'acousticDims' : 'openDims']: newDims }) : undefined} 
        />
      </div>

      <div className="border-t border-border pt-4">
        <p className="text-[11px] uppercase tracking-wider text-muted-foreground font-medium mb-3">Overall Specifications</p>
        <SpecGrid rows={data.specs ?? []} sectionId={sectionKey} index={index} onChange={onChange ? (specs) => onChange({ specs }) : undefined} />
      </div>
    </div>
  );
}

function DimensionDiagram({ dims, sectionId, index, isAcoustic, onChange }: { dims: { label: string; value: string }[]; sectionId?: CMSSection; index?: number; isAcoustic?: boolean; onChange?: (label: string, val: string) => void }) {
  const L = dims.find(d => d.label === "Length")?.value ?? "—";
  const W = dims.find(d => d.label === "Width")?.value ?? "—";
  const H = dims.find(d => d.label === "Height")?.value ?? "—";

  const EditableLabel = ({ val, label, className, x, y, transform }: { val: string; label: string; className?: string; x: number; y: number; transform?: string }) => {
    if (!onChange) {
      return (
        <text x={x} y={y} textAnchor="middle" fontSize="9" className={className} transform={transform} fontFamily="monospace" fontWeight="600">
          {label[0]} = {val}
        </text>
      );
    }
    return (
      <foreignObject x={x - 40} y={y - 10} width="80" height="20" transform={transform}>
        <div className="w-full h-full flex items-center justify-center">
          <span className={cn("text-[9px] font-mono font-bold whitespace-nowrap", className)}>
            {label[0]} = 
            <span
              contentEditable
              suppressContentEditableWarning
              onBlur={e => onChange(label, e.currentTarget.textContent || "")}
              className="ml-1 outline-none focus:bg-accent/20 focus:ring-1 focus:ring-accent/50 rounded px-1 min-w-[20px] inline-block"
            >
              {val}
            </span>
          </span>
        </div>
      </foreignObject>
    );
  };

  return (
    <svg viewBox="0 0 240 160" className="w-full max-w-[320px] mx-auto h-auto text-foreground block overflow-visible">
      <defs>
        <marker id="arrowR" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto"><path d="M0,0 L6,3 L0,6" fill="hsl(var(--accent))" /></marker>
        <marker id="arrowL" markerWidth="6" markerHeight="6" refX="1" refY="3" orient="auto"><path d="M6,0 L0,3 L6,6" fill="hsl(var(--accent))" /></marker>
        <marker id="arrowD" markerWidth="6" markerHeight="6" refX="3" refY="5" orient="auto"><path d="M0,0 L3,6 L6,0" fill="hsl(var(--accent))" /></marker>
        <marker id="arrowU" markerWidth="6" markerHeight="6" refX="3" refY="1" orient="auto"><path d="M0,6 L3,0 L6,6" fill="hsl(var(--accent))" /></marker>
      </defs>

      {/* Shadow box */}
      <rect x="45" y="25" width="140" height="90" rx="4"
        fill="none" stroke="currentColor" strokeWidth="1.5" strokeDasharray="4 2" opacity="0.2" />
      
      {/* Main box */}
      <rect x="40" y="20" width="140" height="90" rx="4"
        fill="hsl(var(--muted))" stroke="hsl(var(--border))" strokeWidth="1.5" />

      {/* Length arrow */}
      <line x1="40" y1="128" x2="180" y2="128" stroke="hsl(var(--accent))" strokeWidth="1.5" markerEnd="url(#arrowR)" markerStart="url(#arrowL)" />
      <EditableLabel val={L} label="Length" x={110} y={142} className="text-accent" />

      {/* Height arrow */}
      <line x1="24" y1="20" x2="24" y2="110" stroke="hsl(var(--accent))" strokeWidth="1.5" markerEnd="url(#arrowD)" markerStart="url(#arrowU)" />
      <EditableLabel val={H} label="Height" x={12} y={68} className="text-accent" transform="rotate(-90, 12, 68)" />

      {/* Width indicator */}
      <line x1="180" y1="20" x2="210" y2="50" stroke="hsl(var(--foreground))" strokeWidth="1" strokeDasharray="2 2" opacity="0.4" />
      <EditableLabel val={W} label="Width" x={110} y={75} className="text-foreground/60" />
    </svg>
  );
}


// ── Chapter 10 — Video ────────────────────────────────────────────────────────
function VideoChapter({ data, sectionId, index, onChange }: { data: ChapterDataInput; sectionId: string; index: number; onChange?: (d: Partial<ChapterDataInput>) => void }) {
  const sectionKey = sectionId as CMSSection;
  const stats = [
    { icon: <ClockIcon size={18} />, valueKey: "duration", labelKey: "DURATION", fallbackValue: "8 sec", fallbackLabel: "DURATION" },
    { icon: <MonitorPlayIcon size={18} />, valueKey: "resolution", labelKey: "RESOLUTION", fallbackValue: "1080p HD", fallbackLabel: "RESOLUTION" },
    { icon: <ClapperboardIcon size={18} />, valueKey: "views", labelKey: "VIEWS", fallbackValue: "360°", fallbackLabel: "VIEWS" },
  ];

  return (
    <div className="space-y-8 py-4">
      <div className="space-y-1">
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-accent">Official Film</p>
        <h3 className="font-display text-2xl font-bold text-slate-900 dark:text-white">
          {onChange ? (
            <span
              contentEditable
              suppressContentEditableWarning
              onBlur={e => onChange?.({ tagline: e.currentTarget.textContent || "" })}
              className="outline-none focus:bg-accent/10 focus:ring-2 focus:ring-accent/30 rounded px-1 transition-all"
            >
              {data.tagline || "Escort DG Set — In Action"}
            </span>
          ) : (
            <EditableText section={sectionKey} contentKey={`chapter_${index}_tagline`} fallback={data.tagline || "Escort DG Set — In Action"} />
          )}
        </h3>
      </div>

      <div className="border-l-[3px] border-accent pl-5">
        <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-400 italic">
          {onChange ? (
            <span
              contentEditable
              suppressContentEditableWarning
              onBlur={e => onChange?.({ description: e.currentTarget.textContent || "" })}
              className="outline-none focus:bg-accent/10 focus:ring-2 focus:ring-accent/30 rounded px-1 transition-all"
            >
              {data.description || "Multiple angles of the Escort DG Set — showcasing the final product from every side, including a full 360° view of the complete unit."}
            </span>
          ) : (
            <EditableText section={sectionKey} contentKey={`chapter_${index}_description`} fallback={data.description || "Multiple angles of the Escort DG Set — showcasing the final product from every side, including a full 360° view of the complete unit."} />
          )}
        </p>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {stats.map((s) => (
          <div key={s.labelKey} className="flex flex-col items-center justify-center rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 p-5 text-center transition-all hover:border-accent/30 hover:bg-slate-50 dark:hover:bg-slate-900">
            <div className="mb-3 text-accent">{s.icon}</div>
            <div className="mb-1 text-lg font-bold text-slate-900 dark:text-white">
              {onChange ? (
                <span
                  contentEditable
                  suppressContentEditableWarning
                  onBlur={e => {
                    onChange({ [s.valueKey]: e.currentTarget.textContent || "" } as any);
                  }}
                  className="outline-none focus:bg-accent/10 focus:ring-2 focus:ring-accent/30 rounded px-1 transition-all"
                >
                  {(data as any)[s.valueKey] || s.fallbackValue}
                </span>
              ) : (
                <EditableText section={sectionKey} contentKey={`chapter_${index}_stat_${s.valueKey}`} fallback={s.fallbackValue} />
              )}
            </div>
            <div className="text-[9px] font-black uppercase tracking-widest text-slate-400">
              {onChange ? (
                s.fallbackLabel
              ) : (
                <EditableText section={sectionKey} contentKey={`chapter_${index}_stat_${s.labelKey}`} fallback={s.fallbackLabel} />
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Main dispatcher ───────────────────────────────────────────────────────────
export function ChapterInteractive({ chapterId, data, active, sectionId = "showcaseData", index = 0, onChange }: Props) {
  return (
    <div className={cn(
      "w-full min-w-0 transition-all duration-700 ease-brand",
      active ? "opacity-100 translate-y-0" : "opacity-40 translate-y-3 pointer-events-none"
    )}>
      {chapterId === "overview"    && <OverviewChapter data={data} sectionId={sectionId} index={index} onChange={onChange} />}
      {chapterId === "engine"      && <EngineChapter data={data} sectionId={sectionId} index={index} onChange={onChange} />}
      {chapterId === "fuel"        && <FuelChapter data={data} sectionId={sectionId} index={index} onChange={onChange} />}
      {chapterId === "alternator"  && <AlternatorChapter data={data} sectionId={sectionId} index={index} onChange={onChange} />}
      {chapterId === "electrical"  && <ElectricalChapter data={data} sectionId={sectionId} index={index} onChange={onChange} />}
      {chapterId === "enclosure"   && <EnclosureChapter data={data} sectionId={sectionId} index={index} onChange={onChange} />}
      {chapterId === "control"     && <ControlChapter data={data} sectionId={sectionId} index={index} onChange={onChange} />}
      {chapterId === "protection"  && <ProtectionChapter data={data} sectionId={sectionId} index={index} onChange={onChange} />}
      {chapterId === "supply"      && <SupplyChapter data={data} sectionId={sectionId} index={index} onChange={onChange} />}
      {chapterId === "dimensions"  && <DimensionsChapter data={data} sectionId={sectionId} index={index} onChange={onChange} />}
      {chapterId === "video"       && <VideoChapter data={data} sectionId={sectionId} index={index} onChange={onChange} />}
    </div>
  );
}


