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

interface Props {
  chapterId: string;
  data: EKL15ChapterData;
  active: boolean;
}

// ── Shared sub-components ─────────────────────────────────────────────────────

function TabBar({ tabs, active, onSelect }: { tabs: string[]; active: number; onSelect: (i: number) => void }) {
  return (
    <div className="flex gap-1 rounded-lg bg-muted/50 p-1 mb-5">
      {tabs.map((t, i) => (
        <button
          key={t}
          onClick={() => onSelect(i)}
          className={cn(
            "flex-1 rounded-md px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider transition-all duration-200",
            i === active
              ? "bg-foreground text-background shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          {t}
        </button>
      ))}
    </div>
  );
}

function SpecGrid({ rows }: { rows: { label: string; value: string }[] }) {
  return (
    <div className="grid grid-cols-1 gap-0 divide-y divide-border">
      {rows.map((r) => (
        <div key={r.label} className="flex items-baseline justify-between py-2.5 gap-4">
          <span className="text-[11px] uppercase tracking-wider text-muted-foreground font-medium shrink-0">{r.label}</span>
          <span className="text-sm font-semibold text-foreground text-right">{r.value}</span>
        </div>
      ))}
    </div>
  );
}

function BulletList({ items, icon }: { items: string[]; icon?: React.ReactNode }) {
  return (
    <ul className="space-y-2">
      {items.map((item, i) => (
        <li key={i} className="flex items-start gap-2.5 text-sm text-foreground/85">
          <span className="mt-0.5 shrink-0 text-accent">{icon ?? "▸"}</span>
          <span className="leading-relaxed">{item}</span>
        </li>
      ))}
    </ul>
  );
}

function Badge({ text, color = "default" }: { text: string; color?: "default" | "green" | "blue" }) {
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
function OverviewChapter({ data }: { data: EKL15ChapterData }) {
  const [tab, setTab] = useState(0);

  const heroStats = [
    { end: 15, suffix: " kVA", label: "Prime Power", decimals: 0 },
    { end: 70, suffix: " dB(A)", label: "Sound @ 1m", decimals: 0 },
    { end: 27, suffix: "+ yrs", label: "Heritage", decimals: 0 },
  ];

  return (
    <div>
      <TabBar tabs={["Highlights", "About"]} active={tab} onSelect={setTab} />
      {tab === 0 && (
        <div className="space-y-5">
          {/* Hero CountUp stats */}
          <div className="grid grid-cols-3 gap-3 border-y border-border py-4">
            {heroStats.map((s) => (
              <div key={s.label} className="text-center">
                <div className="num-display text-2xl font-semibold md:text-3xl text-foreground flex items-baseline justify-center">
                  <CountUp end={s.end} suffix={s.suffix} decimals={s.decimals} duration={1000} />
                </div>
                <div className="text-[10px] uppercase tracking-wider text-muted-foreground mt-1">{s.label}</div>
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
function EngineChapter({ data }: { data: EKL15ChapterData }) {
  const [tab, setTab] = useState(0);
  return (
    <div>
      <TabBar tabs={["Core Specs", "Engine Features"]} active={tab} onSelect={setTab} />
      {tab === 0 && <SpecGrid rows={data.specs ?? []} />}
      {tab === 1 && (
        <div className="space-y-4">
          <BulletList items={data.features ?? []} />
        </div>
      )}
    </div>
  );
}

// ── Chapter 03 — Fuel, Lube & Cooling ────────────────────────────────────────
function FuelChapter({ data }: { data: EKL15ChapterData }) {
  const [load, setLoad] = useState(100);
  const [tab, setTab] = useState(0);

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
      {tab === 0 && <SpecGrid rows={data.lubeSpecs ?? []} />}
      {tab === 1 && <SpecGrid rows={data.coolingSpecs ?? []} />}
    </div>
  );
}

// ── Chapter 04 — Alternator ───────────────────────────────────────────────────
function AlternatorChapter({ data }: { data: EKL15ChapterData }) {
  const [tab, setTab] = useState(0);
  return (
    <div>
      <TabBar tabs={["Core Specs", "Performance", "Features"]} active={tab} onSelect={setTab} />
      {tab === 0 && <SpecGrid rows={data.specs ?? []} />}
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
          <SpecGrid rows={data.perfSpecs ?? []} />
        </div>
      )}
      {tab === 2 && <BulletList items={data.features ?? []} />}
    </div>
  );
}

// ── Chapter 05 — Electrical Performance ──────────────────────────────────────
function ElectricalChapter({ data }: { data: EKL15ChapterData }) {
  const [tab, setTab] = useState(0);
  return (
    <div>
      <TabBar tabs={["Key Specs", "Reactance Data"]} active={tab} onSelect={setTab} />
      {tab === 0 && <SpecGrid rows={data.specs ?? []} />}
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
              {(data.reactanceData ?? []).map(row => (
                <tr key={row.symbol} className="hover:bg-muted/20 transition-colors">
                  <td className="px-3 py-2.5 font-mono font-bold text-accent">{row.symbol}</td>
                  <td className="px-3 py-2.5 text-foreground/80 leading-snug">{row.description}</td>
                  <td className="px-3 py-2.5 font-semibold text-right text-foreground">{row.value}</td>
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
function EnclosureChapter({ data }: { data: EKL15ChapterData }) {
  const [isAcoustic, setIsAcoustic] = useState(true);
  const dims = isAcoustic ? data.acousticDims : data.openDims;
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
          {dims.map(d => (
            <div key={d.label} className="rounded-lg border border-border bg-muted/20 p-3 text-center">
              <div className="font-display text-xl font-bold text-foreground">{d.value}</div>
              <div className="text-[10px] uppercase tracking-wider text-muted-foreground mt-1">{d.label}</div>
            </div>
          ))}
        </div>
      )}

      <div className="border-t border-border pt-4">
        <p className="text-[11px] uppercase tracking-wider text-muted-foreground font-medium mb-3">Environmental Ratings</p>
        <SpecGrid rows={data.envSpecs ?? []} />
      </div>
    </div>
  );
}

// ── Chapter 07 — Control Panel ────────────────────────────────────────────────
function ControlChapter({ data }: { data: EKL15ChapterData }) {
  const [tab, setTab] = useState(0);
  return (
    <div>
      <TabBar tabs={["Controller", "Features", "Metering", "Electrical"]} active={tab} onSelect={setTab} />
      {tab === 0 && <SpecGrid rows={data.specs ?? []} />}
      {tab === 1 && <BulletList items={data.features ?? []} />}
      {tab === 2 && (
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-[11px] uppercase tracking-wider text-muted-foreground font-medium mb-3">Engine Parameters</p>
            <BulletList items={data.engineParams ?? []} />
          </div>
          <div>
            <p className="text-[11px] uppercase tracking-wider text-muted-foreground font-medium mb-3">Electrical Parameters</p>
            <BulletList items={data.electricalParams ?? []} />
          </div>
        </div>
      )}
      {tab === 3 && <SpecGrid rows={data.electricalSpecs ?? []} />}
    </div>
  );
}

// ── Chapter 08 — Protection & Approvals ──────────────────────────────────────
function ProtectionChapter({ data }: { data: EKL15ChapterData }) {
  const [tab, setTab] = useState(0);
  return (
    <div className="space-y-5">
      <TabBar tabs={["Engine Protection", "Electrical Protection"]} active={tab} onSelect={setTab} />
      {tab === 0 && <BulletList items={data.engineProtections ?? []} icon={<Shield size={13} />} />}
      {tab === 1 && <BulletList items={data.electricalProtections ?? []} icon={<Zap size={13} />} />}
      <div className="border-t border-border pt-4">
        <p className="text-[11px] uppercase tracking-wider text-muted-foreground font-medium mb-3">Approvals & Compliance</p>
        <div className="flex flex-wrap gap-2">
          {(data.approvals ?? []).map(a => <Badge key={a} text={a} color="green" />)}
        </div>
      </div>
    </div>
  );
}

// ── Chapter 09 — Standard Supply & Optional Extras ───────────────────────────
function SupplyChapter({ data }: { data: EKL15ChapterData }) {
  const [tab, setTab] = useState(0);
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
                <span className="text-foreground/85">{item}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === 1 && (
        <div className="space-y-3">
          <p className="text-[11px] uppercase tracking-wider text-muted-foreground font-medium">Optional Extras ({data.optionalItems?.length} items)</p>
          <div className="rounded-lg border border-border p-4 space-y-4 max-h-[16rem] overflow-y-auto">
            {(data.optionalGroups ?? []).map(group => (
              <div key={group.label}>
                <p className="text-[10px] uppercase tracking-wider text-accent font-semibold mb-2">{group.label}</p>
                <div className="space-y-1.5">
                  {group.items.map((item, i) => (
                    <div key={i} className="flex items-center gap-2.5 text-sm text-foreground/80">
                      <Circle size={12} className="text-muted-foreground shrink-0" />
                      {item}
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
function DimensionsChapter({ data }: { data: EKL15ChapterData }) {
  const [isAcoustic, setIsAcoustic] = useState(true);
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
          <DimensionDiagram dims={dims} />
        </div>
      )}

      <SpecGrid rows={data.specs ?? []} />
    </div>
  );
}

function DimensionDiagram({ dims }: { dims: { label: string; value: string }[] }) {
  const L = dims.find(d => d.label === "Length")?.value ?? "—";
  const W = dims.find(d => d.label === "Width")?.value ?? "—";
  const H = dims.find(d => d.label === "Height")?.value ?? "—";

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
      <text x="110" y="142" textAnchor="middle" fontSize="9" fill="hsl(var(--accent))" fontFamily="monospace" fontWeight="600">L = {L}</text>

      {/* Height arrow */}
      <line x1="24" y1="20" x2="24" y2="110" stroke="hsl(var(--accent))" strokeWidth="1.5" markerEnd="url(#arrowD)" markerStart="url(#arrowU)" />
      <text x="12" y="68" textAnchor="middle" fontSize="9" fill="hsl(var(--accent))" fontFamily="monospace" fontWeight="600" transform="rotate(-90, 12, 68)">H = {H}</text>

      {/* Width label */}
      <text x="110" y="75" textAnchor="middle" fontSize="9" fill="hsl(var(--foreground))" opacity="0.6" fontFamily="monospace">W = {W}</text>

      <defs>
        <marker id="arrowR" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto"><path d="M0,0 L6,3 L0,6" fill="hsl(var(--accent))" /></marker>
        <marker id="arrowL" markerWidth="6" markerHeight="6" refX="1" refY="3" orient="auto"><path d="M6,0 L0,3 L6,6" fill="hsl(var(--accent))" /></marker>
        <marker id="arrowD" markerWidth="6" markerHeight="6" refX="3" refY="5" orient="auto"><path d="M0,0 L3,6 L6,0" fill="hsl(var(--accent))" /></marker>
        <marker id="arrowU" markerWidth="6" markerHeight="6" refX="3" refY="1" orient="auto"><path d="M0,6 L3,0 L6,6" fill="hsl(var(--accent))" /></marker>
      </defs>
    </svg>
  );
}

// ── Main dispatcher ───────────────────────────────────────────────────────────
export function ChapterInteractive({ chapterId, data, active }: Props) {
  return (
    <div className={cn(
      "transition-all duration-700 ease-brand",
      active ? "opacity-100 translate-y-0" : "opacity-40 translate-y-3 pointer-events-none"
    )}>
      {chapterId === "overview"    && <OverviewChapter data={data} />}
      {chapterId === "engine"      && <EngineChapter data={data} />}
      {chapterId === "fuel"        && <FuelChapter data={data} />}
      {chapterId === "alternator"  && <AlternatorChapter data={data} />}
      {chapterId === "electrical"  && <ElectricalChapter data={data} />}
      {chapterId === "enclosure"   && <EnclosureChapter data={data} />}
      {chapterId === "control"     && <ControlChapter data={data} />}
      {chapterId === "protection"  && <ProtectionChapter data={data} />}
      {chapterId === "supply"      && <SupplyChapter data={data} />}
      {chapterId === "dimensions"  && <DimensionsChapter data={data} />}
    </div>
  );
}
