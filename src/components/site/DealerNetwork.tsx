import { SectionReveal } from "./SectionReveal";
import dealerMap from "@/assets/brand/dealer-network.jpg";
import { MapPin, Plus, X, Check } from "lucide-react";
import { EditableText } from "@/components/cms/EditableText";
import { useCMSState } from "@/components/cms/CMSEditorProvider";
import { useState, useRef } from "react";

export function DealerNetwork({ id }: { id?: string }) {
  const { content, isEditMode, updateContent } = useCMSState();
  const [isAdding, setIsAdding] = useState(false);
  const [newCityName, setNewCityName] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  // Cities stored as newline-separated string, split for rendering
  const citiesRaw = content.dealerNetwork?.cities || "";
  const cities = citiesRaw.split("\n").map((c: string) => c.trim()).filter(Boolean);

  const confirmAddCity = () => {
    if (newCityName.trim()) {
      const updated = citiesRaw ? citiesRaw + "\n" + newCityName.trim() : newCityName.trim();
      updateContent("dealerNetwork", "cities", updated);
    }
    setNewCityName("");
    setIsAdding(false);
  };

  const cancelAddCity = () => {
    setNewCityName("");
    setIsAdding(false);
  };

  const removeCity = (index: number) => {
    const updated = cities.filter((_: string, i: number) => i !== index).join("\n");
    updateContent("dealerNetwork", "cities", updated);
  };

  const renameCity = (index: number, newName: string) => {
    const newCities = [...cities];
    newCities[index] = newName;
    updateContent("dealerNetwork", "cities", newCities.join("\n"));
  };

  return (
    <section id={id} className="relative flex min-h-screen snap-center flex-col justify-center overflow-hidden bg-white pt-16 md:pt-0">
      <div className="container-x grid gap-16 md:grid-cols-2 md:items-center">
        {/* Left — text + cities */}
        <SectionReveal variant="slideLeft">
          <div className="font-display text-xs uppercase tracking-[0.3em] text-accent">
            <EditableText section="dealerNetwork" contentKey="sectionLabel" />
          </div>
          <h2 className="mt-3 font-display text-4xl font-bold text-foreground md:text-5xl heading-underline">
            <EditableText section="dealerNetwork" contentKey="heading" />
          </h2>
          <p className="mt-6 max-w-md text-muted-foreground">
            <EditableText section="dealerNetwork" contentKey="description" />
          </p>

          <div className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-3">
            {cities.map((city: string, i: number) => (
              <div
                key={i}
                className="group relative flex items-center gap-2 rounded-sm border border-border bg-secondary/50 px-3 py-2 text-sm transition-all duration-300 ease-brand hover:-translate-y-0.5 hover:border-accent hover:shadow-md"
              >
                <MapPin size={14} className="text-accent shrink-0" />
                {isEditMode ? (
                  <span
                    contentEditable
                    suppressContentEditableWarning
                    onBlur={(e) => renameCity(i, e.currentTarget.textContent || city)}
                    className="outline-none flex-1 cursor-text focus:text-accent"
                  >
                    {city}
                  </span>
                ) : (
                  <span>{city}</span>
                )}
                {isEditMode && (
                  <button
                    onClick={(e) => { e.stopPropagation(); removeCity(i); }}
                    style={{ pointerEvents: "all" }}
                    className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:text-red-500 flex-shrink-0 z-10"
                    title="Remove city"
                  >
                    <X size={12} />
                  </button>
                )}
              </div>
            ))}

            {/* Add City UI — only in edit mode */}
            {isEditMode && !isAdding && (
              <button
                onClick={() => { setIsAdding(true); setTimeout(() => inputRef.current?.focus(), 50); }}
                style={{ pointerEvents: "all" }}
                className="flex items-center gap-2 rounded-sm border border-dashed border-accent/60 bg-accent/5 px-3 py-2 text-sm text-accent font-medium hover:bg-accent/15 hover:border-accent transition-all z-10"
              >
                <Plus size={14} />
                Add City
              </button>
            )}

            {/* Inline add input — appears when Add City is clicked */}
            {isEditMode && isAdding && (
              <div className="col-span-2 sm:col-span-3 flex items-center gap-2 rounded-sm border-2 border-accent bg-white px-3 py-2">
                <MapPin size={14} className="text-accent shrink-0" />
                <input
                  ref={inputRef}
                  type="text"
                  value={newCityName}
                  onChange={(e) => setNewCityName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") confirmAddCity();
                    if (e.key === "Escape") cancelAddCity();
                  }}
                  placeholder="City name (press Enter to confirm)"
                  style={{ pointerEvents: "all" }}
                  className="flex-1 outline-none text-sm bg-transparent text-foreground placeholder:text-muted-foreground"
                />
                <button
                  onClick={confirmAddCity}
                  style={{ pointerEvents: "all" }}
                  className="text-accent hover:text-accent/80 transition-colors"
                  title="Confirm"
                >
                  <Check size={16} />
                </button>
                <button
                  onClick={cancelAddCity}
                  style={{ pointerEvents: "all" }}
                  className="text-muted-foreground hover:text-destructive transition-colors"
                  title="Cancel"
                >
                  <X size={16} />
                </button>
              </div>
            )}
          </div>
        </SectionReveal>

        {/* Right — map image */}
        <SectionReveal variant="slideRight" delay={100}>
          <div className="relative">
            <div className="absolute -inset-4 rounded-sm bg-amber-gradient opacity-30 blur-xl" />
            <div className="relative overflow-hidden rounded-sm border border-border bg-white p-4 shadow-xl">
              <img src={dealerMap} alt="Aditya dealer network across India" loading="lazy" className="w-full" />
            </div>
          </div>
        </SectionReveal>
      </div>
    </section>
  );
}
