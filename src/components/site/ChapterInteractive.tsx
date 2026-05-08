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
import { ChevronDown, CheckCircle2, Circle, Zap, Shield } from "lucide-react";
import type { EKL15ChapterData } from "@/data/ekl15Data";
import { CountUp } from "@/components/site/CountUp";
import { EditableText } from "@/components/cms/EditableText";
import type { CMSSection } from "@/lib/sanity";

interface Props {
  chapterId: string;
  data: EKL15ChapterData;
  active: boolean;
  sectionId?: string;
  index?: number;
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

function SpecGrid({ rows, sectionId, index }: { rows: { label: string; value: string }[]; sectionId?: CMSSection; index?: number }) {
  return (
    <div className="grid grid-cols-1 gap-0 divide-y divide-border">
      {rows.map((r, i) => (
        <div key={r.label} className="flex items-baseline justify-between py-2.5 gap-4">
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

function BulletList({ items, icon, sectionId, index, listKey }: { items: string[]; icon?: React.ReactNode; sectionId?: CMSSection; index?: number; listKey?: string }) {
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
function OverviewChapter({ data, sectionId, index }: { data: EKL15ChapterData; sectionId: string; index: number }) {
  const [tab, setTab] = useState(0);
  const sectionKey = sectionId as CMSSection;

  return (
    <div>
      <TabBar tabs={["Highlights", "About"]} active={tab} onSelect={setTab} />
      {tab === 0 && (
        <div className="space-y-5">
          {/* Hero CountUp stats */}
          <div className="grid grid-cols-3 gap-3 border-y border-border py-4">
            {[0, 1, 2].map((i) => (
              <div key={i} className="text-center">
                <div className="num-display text-2xl font-semibold md:text-3xl text-foreground flex items-baseline justify-center">
                  <EditableText 
                    section={sectionKey} 
                    contentKey={`chapter_${index}_h${i}_value`} 
                    as="span"
                  />
                  <EditableText 
                    section={sectionKey} 
                    contentKey={`chapter_${index}_h${i}_suffix`} 
                    as="span"
                    className="text-sm font-normal"
                  />
                </div>
                <EditableText 
                  section={sectionKey} 
                  contentKey={`chapter_${index}_h${i}_label`} 
                  as="div"
                  className="text-[10px] uppercase tracking-wider text-muted-foreground mt-1"
                />
              </div>
            ))}
          </div>

          {/* Feature badges */}
          <div className="flex flex-wrap gap-2">
            {(data.badges ?? []).slice(0, 4).map(b => (
              <span key={b} className="inline-flex items-center gap-1.5 rounded-full border border-border bg-muted/60 px-3 py-1 text-[11px] font-medium text-foreground/70 tracking-wide">
                {b}
              </span>
            ))}
          </div>

          {/* Spec grid */}
          <SpecGrid rows={data.specs ?? []} />
        </div>
      )}
      {tab === 1 && (
        <div className="space-y-4">
          <p className="text-sm leading-relaxed text-foreground/80 border-l-2 border-accent pl-4 font-display italic">{data.description}</p>
          <SpecGrid rows={data.aboutSpecs ?? []} />
        </div>
      )}
    </div>
  );
}

// ── Chapter 02 — Engine ───────────────────────────────────────────────────────
function EngineChapter({ data, sectionId, index }: { data: EKL15ChapterData; sectionId: string; index: number }) {
  const [tab, setTab] = useState(0);
  const sectionKey = sectionId as CMSSection;
  return (
    <div>
      <TabBar tabs={["Core Specs", "Engine Features"]} active={tab} onSelect={setTab} />
      {tab === 0 && <SpecGrid rows={data.specs ?? []} sectionId={sectionKey} index={index} />}
      {tab === 1 && (
        <div className="space-y-4">
          <BulletList items={data.features ?? []} sectionId={sectionKey} index={index} listKey="features" />
        </div>
      )}
    </div>
  );
}

// ── Chapter 03 — Fuel, Lube & Cooling ────────────────────────────────────────
function FuelChapter({ data, sectionId, index }: { data: EKL15ChapterData; sectionId: string; index: number }) {
  const [load, setLoad] = useState(100);
  const [tab, setTab] = useState(0);
  const sectionKey = sectionId as CMSSection;

  const fuelPoints = [
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
          <span>25%</span><span>50%</span><span>75%</span><span>100%</span><span>110%</span>
        </div>
        <div className="text-center mt-1">
          <span className="text-xs font-semibold text-foreground/70">{load}% Load</span>
        </div>
      </div>

      {/* Lube / Cooling tabs */}
      <TabBar tabs={["Lubrication", "Cooling"]} active={tab} onSelect={setTab} />
      {tab === 0 && <SpecGrid rows={data.lubeSpecs ?? []} sectionId={sectionKey} index={index} />}
      {tab === 1 && <SpecGrid rows={data.coolingSpecs ?? []} sectionId={sectionKey} index={index} />}
    </div>
  );
}

// ── Chapter 04 — Alternator ───────────────────────────────────────────────────
function AlternatorChapter({ data, sectionId, index }: { data: EKL15ChapterData; sectionId: string; index: number }) {
  const [tab, setTab] = useState(0);
  const sectionKey = sectionId as CMSSection;
  return (
    <div>
      <TabBar tabs={["Core Specs", "Performance", "Features"]} active={tab} onSelect={setTab} />
      {tab === 0 && <SpecGrid rows={data.specs ?? []} sectionId={sectionKey} index={index} />}
      {tab === 1 && (
        <div className="space-y-4">
          <p className="text-[11px] uppercase tracking-wider text-muted-foreground font-medium mb-3">Efficiency @ 0.8 p.f.</p>
          {[
            { label: "75% Load", value: 86.4, bar: 86.4 },
            { label: "100% Load", value: 83.5, bar: 83.5 },
          ].map(row => (
            <div key={row.label}>
              <div className="flex justify-between text-sm mb-1.5">
                <span className="text-muted-foreground">{row.label}</span>
                <span className="font-semibold text-foreground">{row.value}%</span>
              </div>
              <div className="h-2 rounded-full bg-muted overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-accent to-amber-400 transition-all duration-700"
                  style={{ width: `${row.bar}%` }}
                />
              </div>
            </div>
          ))}
          <SpecGrid rows={data.perfSpecs ?? []} sectionId={sectionKey} index={index} />
        </div>
      )}
      {tab === 2 && <BulletList items={data.features ?? []} sectionId={sectionKey} index={index} listKey="features" />}
    </div>
  );
}

// ── Chapter 05 — Electrical Performance ──────────────────────────────────────
function ElectricalChapter({ data, sectionId, index }: { data: EKL15ChapterData; sectionId: string; index: number }) {
  const [tab, setTab] = useState(0);
  const sectionKey = sectionId as CMSSection;
  return (
    <div>
      <TabBar tabs={["Key Specs", "Reactance Data"]} active={tab} onSelect={setTab} />
      {tab === 0 && <SpecGrid rows={data.specs ?? []} sectionId={sectionKey} index={index} />}
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
                <tr key={row.symbol} className="hover:bg-muted/20 transition-colors">
                  <td className="px-3 py-2.5 font-mono font-bold text-accent">
                    <EditableText section={sectionKey} contentKey={`chapter_${index}_reactance${rIdx}_symbol`} fallback={row.symbol} />
                  </td>
                  <td className="px-3 py-2.5 text-foreground/80 leading-snug">
                    <EditableText section={sectionKey} contentKey={`chapter_${index}_reactance${rIdx}_desc`} fallback={row.description} />
                  </td>
                  <td className="px-3 py-2.5 font-semibold text-right text-foreground">
                    <EditableText section={sectionKey} contentKey={`chapter_${index}_reactance${rIdx}_value`} fallback={row.value} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ── Chapter 06 — Enclosure & Sound ───────────────────────────────────────────
function EnclosureChapter({ data, sectionId, index }: { data: EKL15ChapterData; sectionId: string; index: number }) {
  const [isAcoustic, setIsAcoustic] = useState(true);
  const sectionKey = sectionId as CMSSection;
  const dims = isAcoustic ? data.acousticDims : data.openDims;
  const dimKeyPrefix = isAcoustic ? "acousticDims" : "openDims";

  return (
    <div className="space-y-5">
      {/* Toggle */}
      <div className="flex items-center gap-3 rounded-lg border border-border bg-muted/30 p-1">
        <button
          onClick={() => setIsAcoustic(false)}
          className={cn("flex-1 rounded-md py-2 text-xs font-semibold transition-all", !isAcoustic ? "bg-foreground text-background shadow" : "text-muted-foreground")}
        >Open Set</button>
        <button
          onClick={() => setIsAcoustic(true)}
          className={cn("flex-1 rounded-md py-2 text-xs font-semibold transition-all", isAcoustic ? "bg-foreground text-background shadow" : "text-muted-foreground")}
        >Acoustic Set</button>
      </div>

      {dims && (
        <div className="grid grid-cols-3 gap-3">
          {dims.map((d, dIdx) => (
            <div key={d.label} className="rounded-lg border border-border bg-muted/20 p-3 text-center">
              <div className="font-display text-xl font-bold text-foreground">
                <EditableText section={sectionKey} contentKey={`chapter_${index}_${dimKeyPrefix}${dIdx}_value`} fallback={d.value} />
              </div>
              <div className="text-[10px] uppercase tracking-wider text-muted-foreground mt-1">
                <EditableText section={sectionKey} contentKey={`chapter_${index}_${dimKeyPrefix}${dIdx}_label`} fallback={d.label} />
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="border-t border-border pt-4">
        <p className="text-[11px] uppercase tracking-wider text-muted-foreground font-medium mb-3">Environmental Ratings</p>
        <SpecGrid rows={data.envSpecs ?? []} sectionId={sectionKey} index={index} />
      </div>
    </div>
  );
}

// ── Chapter 07 — Control Panel ────────────────────────────────────────────────
function ControlChapter({ data, sectionId, index }: { data: EKL15ChapterData; sectionId: string; index: number }) {
  const [tab, setTab] = useState(0);
  const sectionKey = sectionId as CMSSection;
  return (
    <div>
      <TabBar tabs={["Controller", "Features", "Metering", "Electrical"]} active={tab} onSelect={setTab} />
      {tab === 0 && <SpecGrid rows={data.specs ?? []} sectionId={sectionKey} index={index} />}
      {tab === 1 && <BulletList items={data.features ?? []} sectionId={sectionKey} index={index} listKey="features" />}
      {tab === 2 && (
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-[11px] uppercase tracking-wider text-muted-foreground font-medium mb-3">Engine Parameters</p>
            <BulletList items={data.engineParams ?? []} sectionId={sectionKey} index={index} listKey="engineParams" />
          </div>
          <div>
            <p className="text-[11px] uppercase tracking-wider text-muted-foreground font-medium mb-3">Electrical Parameters</p>
            <BulletList items={data.electricalParams ?? []} sectionId={sectionKey} index={index} listKey="electricalParams" />
          </div>
        </div>
      )}
      {tab === 3 && <SpecGrid rows={data.electricalSpecs ?? []} sectionId={sectionKey} index={index} />}
    </div>
  );
}

// ── Chapter 08 — Protection & Approvals ──────────────────────────────────────
function ProtectionChapter({ data, sectionId, index }: { data: EKL15ChapterData; sectionId: string; index: number }) {
  const [tab, setTab] = useState(0);
  const sectionKey = sectionId as CMSSection;
  return (
    <div className="space-y-5">
      <TabBar tabs={["Engine Protection", "Electrical Protection"]} active={tab} onSelect={setTab} />
      {tab === 0 && <BulletList items={data.engineProtections ?? []} icon={<Shield size={13} />} sectionId={sectionKey} index={index} listKey="engineProtections" />}
      {tab === 1 && <BulletList items={data.electricalProtections ?? []} icon={<Zap size={13} />} sectionId={sectionKey} index={index} listKey="electricalProtections" />}
      <div className="border-t border-border pt-4">
        <p className="text-[11px] uppercase tracking-wider text-muted-foreground font-medium mb-3">Approvals & Compliance</p>
        <div className="flex flex-wrap gap-2">
          {(data.approvals ?? []).map((a, aIdx) => (
            <Badge key={a} text={
              <EditableText section={sectionKey} contentKey={`chapter_${index}_approval${aIdx}`} fallback={a} />
            } color="green" />
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Chapter 09 — Standard Supply & Optional Extras ───────────────────────────
function SupplyChapter({ data, sectionId, index }: { data: EKL15ChapterData; sectionId: string; index: number }) {
  const [tab, setTab] = useState(0);
  const sectionKey = sectionId as CMSSection;
  return (
    <div>
      <TabBar tabs={["Standard Supply", "Optional Supply"]} active={tab} onSelect={setTab} />
      
      {tab === 0 && (
        <div className="space-y-3">
          <p className="text-[11px] uppercase tracking-wider text-muted-foreground font-medium">Standard Scope ({data.standardItems?.length} items)</p>
          <div className="grid grid-cols-1 gap-1.5 max-h-[16rem] overflow-y-auto pr-1">
            {(data.standardItems ?? []).map((item, i) => (
              <div key={i} className="flex items-center gap-2.5 text-sm">
                <CheckCircle2 size={14} className="text-accent shrink-0" />
                <span className="text-foreground/85">
                  <EditableText section={sectionKey} contentKey={`chapter_${index}_standardItem${i}`} fallback={item} />
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === 1 && (
        <div className="space-y-3">
          <p className="text-[11px] uppercase tracking-wider text-muted-foreground font-medium">Optional Extras ({data.optionalItems?.length} items)</p>
          <div className="rounded-lg border border-border p-4 space-y-4 max-h-[16rem] overflow-y-auto">
            {(data.optionalGroups ?? []).map((group, gIdx) => (
              <div key={group.label}>
                <p className="text-[10px] uppercase tracking-wider text-accent font-semibold mb-2">
                  <EditableText section={sectionKey} contentKey={`chapter_${index}_optionalGroup${gIdx}_label`} fallback={group.label} />
                </p>
                <div className="space-y-1.5">
                  {group.items.map((item, i) => (
                    <div key={i} className="flex items-center gap-2.5 text-sm text-foreground/80">
                      <Circle size={12} className="text-muted-foreground shrink-0" />
                      <EditableText section={sectionKey} contentKey={`chapter_${index}_optionalGroup${gIdx}_item${i}`} fallback={item} />
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Chapter 10 — Dimensions & Weights ────────────────────────────────────────
function DimensionsChapter({ data, sectionId, index }: { data: EKL15ChapterData; sectionId: string; index: number }) {
  const [isAcoustic, setIsAcoustic] = useState(true);
  const sectionKey = sectionId as CMSSection;
  const dims = isAcoustic ? data.acousticDims : data.openDims;

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3 rounded-lg border border-border bg-muted/30 p-1">
        <button onClick={() => setIsAcoustic(false)} className={cn("flex-1 rounded-md py-2 text-xs font-semibold transition-all", !isAcoustic ? "bg-foreground text-background shadow" : "text-muted-foreground")}>Open Set</button>
        <button onClick={() => setIsAcoustic(true)} className={cn("flex-1 rounded-md py-2 text-xs font-semibold transition-all", isAcoustic ? "bg-foreground text-background shadow" : "text-muted-foreground")}>Acoustic Set</button>
      </div>

      {/* SVG dimension diagram */}
      {dims && (
        <div className="rounded-xl border border-border bg-muted/20 p-4">
          <DimensionDiagram dims={dims} sectionId={sectionKey} index={index} isAcoustic={isAcoustic} />
        </div>
      )}

      <SpecGrid rows={data.specs ?? []} sectionId={sectionKey} index={index} />
    </div>
  );
}

function DimensionDiagram({ dims, sectionId, index, isAcoustic }: { dims: { label: string; value: string }[]; sectionId?: CMSSection; index?: number; isAcoustic?: boolean }) {
  const L = dims.find(d => d.label === "Length")?.value ?? "—";
  const W = dims.find(d => d.label === "Width")?.value ?? "—";
  const H = dims.find(d => d.label === "Height")?.value ?? "—";

  const dimKeyPrefix = isAcoustic ? "acousticDims" : "openDims";

  return (
    <svg viewBox="0 0 240 160" className="w-3/4 max-w-[280px] mx-auto h-auto text-foreground block">
      {/* Box */}
      <rect x="40" y="20" width="140" height="90" rx="4"
        fill="none" stroke="currentColor" strokeWidth="1.5" strokeDasharray="none" opacity="0.3" />
      {/* Front face */}
      <rect x="40" y="20" width="140" height="90" rx="4"
        fill="hsl(var(--muted))" stroke="hsl(var(--border))" strokeWidth="1.5" />

      {/* Length arrow */}
      <line x1="40" y1="128" x2="180" y2="128" stroke="hsl(var(--accent))" strokeWidth="1.5" markerEnd="url(#arrowR)" markerStart="url(#arrowL)" />
      <text x="110" y="142" textAnchor="middle" fontSize="9" fill="hsl(var(--accent))" fontFamily="monospace" fontWeight="600">
        L = {sectionId !== undefined && index !== undefined ? (
          <EditableText section={sectionId} contentKey={`chapter_${index}_${dimKeyPrefix}0_value`} fallback={L} as="tspan" />
        ) : L}
      </text>

      {/* Height arrow */}
      <line x1="24" y1="20" x2="24" y2="110" stroke="hsl(var(--accent))" strokeWidth="1.5" markerEnd="url(#arrowD)" markerStart="url(#arrowU)" />
      <text x="12" y="68" textAnchor="middle" fontSize="9" fill="hsl(var(--accent))" fontFamily="monospace" fontWeight="600" transform="rotate(-90, 12, 68)">
        H = {sectionId !== undefined && index !== undefined ? (
          <EditableText section={sectionId} contentKey={`chapter_${index}_${dimKeyPrefix}2_value`} fallback={H} as="tspan" />
        ) : H}
      </text>

      {/* Width label */}
      <text x="110" y="75" textAnchor="middle" fontSize="9" fill="hsl(var(--foreground))" opacity="0.6" fontFamily="monospace">
        W = {sectionId !== undefined && index !== undefined ? (
          <EditableText section={sectionId} contentKey={`chapter_${index}_${dimKeyPrefix}1_value`} fallback={W} as="tspan" />
        ) : W}
      </text>

      <defs>
        <marker id="arrowR" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto"><path d="M0,0 L6,3 L0,6" fill="hsl(var(--accent))" /></marker>
        <marker id="arrowL" markerWidth="6" markerHeight="6" refX="1" refY="3" orient="auto"><path d="M6,0 L0,3 L6,6" fill="hsl(var(--accent))" /></marker>
        <marker id="arrowD" markerWidth="6" markerHeight="6" refX="3" refY="5" orient="auto"><path d="M0,0 L3,6 L6,0" fill="hsl(var(--accent))" /></marker>
        <marker id="arrowU" markerWidth="6" markerHeight="6" refX="3" refY="1" orient="auto"><path d="M0,6 L3,0 L6,6" fill="hsl(var(--accent))" /></marker>
      </defs>
    </svg>
  );
}

import { Clock, MonitorPlay, Clapperboard } from "lucide-react";

// ── Chapter 10 — Video ────────────────────────────────────────────────────────
function VideoChapter({ data, sectionId, index }: { data: EKL15ChapterData; sectionId: string; index: number }) {
  const sectionKey = sectionId as CMSSection;
  const stats = [
    { icon: <Clock size={18} />, valueKey: "duration", labelKey: "DURATION", fallbackValue: "8 sec", fallbackLabel: "DURATION" },
    { icon: <MonitorPlay size={18} />, valueKey: "resolution", labelKey: "RESOLUTION", fallbackValue: "1080p HD", fallbackLabel: "RESOLUTION" },
    { icon: <Clapperboard size={18} />, valueKey: "views", labelKey: "VIEWS", fallbackValue: "360°", fallbackLabel: "VIEWS" },
  ];

  return (
    <div className="space-y-8 py-4">
      <div className="space-y-1">
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-accent">Official Film</p>
        <h3 className="font-display text-2xl font-bold text-slate-900 dark:text-white">
          <EditableText section={sectionKey} contentKey={`chapter_${index}_tagline`} fallback={data.tagline || "Escort DG Set — In Action"} />
        </h3>
      </div>

      <div className="border-l-[3px] border-accent pl-5">
        <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-400 italic">
          <EditableText section={sectionKey} contentKey={`chapter_${index}_description`} fallback={data.description || "Multiple angles of the Escort DG Set — showcasing the final product from every side, including a full 360° view of the complete unit."} />
        </p>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {stats.map((s) => (
          <div key={s.labelKey} className="flex flex-col items-center justify-center rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 p-5 text-center transition-all hover:border-accent/30 hover:bg-slate-50 dark:hover:bg-slate-900">
            <div className="mb-3 text-accent">{s.icon}</div>
            <div className="mb-1 text-lg font-bold text-slate-900 dark:text-white">
              <EditableText section={sectionKey} contentKey={`chapter_${index}_stat_${s.valueKey}`} fallback={s.fallbackValue} />
            </div>
            <div className="text-[9px] font-black uppercase tracking-widest text-slate-400">
              <EditableText section={sectionKey} contentKey={`chapter_${index}_stat_${s.labelKey}`} fallback={s.fallbackLabel} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Main dispatcher ───────────────────────────────────────────────────────────
export function ChapterInteractive({ chapterId, data, active, sectionId = "showcaseData", index = 0 }: Props) {
  return (
    <div className={cn(
      "w-full min-w-0 transition-all duration-700 ease-brand",
      active ? "opacity-100 translate-y-0" : "opacity-40 translate-y-3 pointer-events-none"
    )}>
      {chapterId === "overview"    && <OverviewChapter data={data} sectionId={sectionId} index={index} />}
      {chapterId === "engine"      && <EngineChapter data={data} sectionId={sectionId} index={index} />}
      {chapterId === "fuel"        && <FuelChapter data={data} sectionId={sectionId} index={index} />}
      {chapterId === "alternator"  && <AlternatorChapter data={data} sectionId={sectionId} index={index} />}
      {chapterId === "electrical"  && <ElectricalChapter data={data} sectionId={sectionId} index={index} />}
      {chapterId === "enclosure"   && <EnclosureChapter data={data} sectionId={sectionId} index={index} />}
      {chapterId === "control"     && <ControlChapter data={data} sectionId={sectionId} index={index} />}
      {chapterId === "protection"  && <ProtectionChapter data={data} sectionId={sectionId} index={index} />}
      {chapterId === "supply"      && <SupplyChapter data={data} sectionId={sectionId} index={index} />}
      {chapterId === "dimensions"  && <DimensionsChapter data={data} sectionId={sectionId} index={index} />}
      {chapterId === "video"       && <VideoChapter data={data} sectionId={sectionId} index={index} />}
    </div>
  );
}


