import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ChevronDown, Copy, Check, Sparkles, Trash2, Heart, X, Wand2 } from "lucide-react";
import { CATEGORIES } from "@/lib/prompt-data";
import { usePromptBuilder } from "@/hooks/use-prompt-builder";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "PromptDeck — The Lego Set for AI Art" },
      { name: "description", content: "Build professional AI art prompts by tapping visual token cards. No blank page. Copy to Midjourney, DALL·E, or SDXL." },
      { property: "og:title", content: "PromptDeck — The Lego Set for AI Art" },
      { property: "og:description", content: "Build professional AI art prompts by tapping visual token cards." },
    ],
  }),
  component: Index,
});

function Index() {
  const b = usePromptBuilder();
  const [open, setOpen] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(CATEGORIES.map((c, i) => [c.id, i < 2])),
  );
  const [copied, setCopied] = useState(false);
  const [showFavs, setShowFavs] = useState(false);

  useEffect(() => {
    if (!copied) return;
    const t = setTimeout(() => setCopied(false), 1600);
    return () => clearTimeout(t);
  }, [copied]);

  const copy = async () => {
    if (!b.prompt) return;
    try {
      await navigator.clipboard.writeText(b.prompt);
      setCopied(true);
      if ("vibrate" in navigator) navigator.vibrate?.([8, 40, 8]);
    } catch { /* ignore */ }
  };

  const totalSelected = b.selectedTokens.length;

  return (
    <div className="min-h-screen pb-56">
      {/* Header */}
      <header className="sticky top-0 z-30 border-b border-border/60 bg-background/70 backdrop-blur-xl">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-4">
          <div className="flex items-center gap-2.5">
            <div className="grid h-9 w-9 place-items-center rounded-xl shadow-neon" style={{ background: "var(--gradient-neon)" }}>
              <Sparkles className="h-5 w-5 text-background" strokeWidth={2.5} />
            </div>
            <div>
              <h1 className="text-base font-semibold tracking-tight">PromptDeck</h1>
              <p className="text-[11px] uppercase tracking-widest text-muted-foreground">the lego set for ai art</p>
            </div>
          </div>
          <button
            onClick={() => setShowFavs(true)}
            className="relative grid h-10 w-10 place-items-center rounded-xl border border-border bg-card/60 transition hover:border-primary/60 hover:text-primary active:scale-95"
            aria-label="Favorites"
          >
            <Heart className="h-4.5 w-4.5" />
            {b.favorites.length > 0 && (
              <span className="absolute -right-1 -top-1 grid h-4 min-w-4 place-items-center rounded-full bg-primary px-1 text-[10px] font-bold text-primary-foreground">
                {b.favorites.length}
              </span>
            )}
          </button>
        </div>
      </header>

      {/* Action row */}
      <div className="mx-auto max-w-3xl px-4 pt-5">
        <div className="flex gap-2">
          <button
            onClick={b.randomize}
            className="group flex flex-1 items-center justify-center gap-2 rounded-2xl border border-primary/40 bg-primary/10 py-3 text-sm font-semibold text-primary transition hover:shadow-neon active:scale-[0.98]"
          >
            <Wand2 className="h-4 w-4 transition group-hover:rotate-12" />
            Surprise Me
          </button>
          <button
            onClick={b.clearAll}
            disabled={totalSelected === 0}
            className="flex items-center justify-center gap-2 rounded-2xl border border-border bg-card/60 px-4 py-3 text-sm font-medium text-muted-foreground transition hover:border-destructive/50 hover:text-destructive disabled:opacity-40 active:scale-95"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
        <p className="mt-3 px-1 text-xs text-muted-foreground">
          {totalSelected === 0 ? "Tap tokens to build your prompt →" : `${totalSelected} token${totalSelected === 1 ? "" : "s"} selected across ${Object.values(b.selections).filter((v) => v.length).length} categories`}
        </p>
      </div>

      {/* Categories */}
      <main className="mx-auto max-w-3xl space-y-3 px-4 pt-5">
        {CATEGORIES.map((cat) => {
          const selectedIds = b.selections[cat.id] ?? [];
          const isOpen = open[cat.id];
          return (
            <section
              key={cat.id}
              className="overflow-hidden rounded-3xl border border-border bg-card/50 backdrop-blur-sm transition-all"
              style={{ boxShadow: selectedIds.length ? "var(--shadow-neon)" : undefined }}
            >
              <button
                onClick={() => setOpen((o) => ({ ...o, [cat.id]: !o[cat.id] }))}
                className="flex w-full items-center gap-3 px-4 py-4 text-left"
              >
                <div className="grid h-11 w-11 place-items-center rounded-2xl border border-border bg-background/60 text-xl">
                  {cat.emoji}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h2 className="text-sm font-semibold tracking-tight">{cat.name}</h2>
                    {selectedIds.length > 0 && (
                      <span className="rounded-full bg-primary/15 px-2 py-0.5 text-[10px] font-bold text-primary">
                        {selectedIds.length}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">{cat.description}</p>
                </div>
                <ChevronDown
                  className={cn("h-5 w-5 text-muted-foreground transition-transform duration-300", isOpen && "rotate-180")}
                />
              </button>

              <div
                className={cn(
                  "grid transition-all duration-300 ease-out",
                  isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0",
                )}
              >
                <div className="overflow-hidden">
                  <div className="flex flex-wrap gap-2 px-4 pb-4">
                    {cat.tokens.map((t) => {
                      const active = selectedIds.includes(t.id);
                      return (
                        <button
                          key={t.id}
                          onClick={() => b.toggle(cat.id, t.id)}
                          className={cn(
                            "group flex items-center gap-2 rounded-2xl border px-3 py-2 text-sm font-medium transition-all duration-200 active:scale-95",
                            active
                              ? "border-primary bg-primary/15 text-primary shadow-neon"
                              : "border-border bg-background/40 text-foreground/80 hover:border-primary/40 hover:text-foreground",
                          )}
                        >
                          <span className="text-base leading-none">{t.emoji}</span>
                          <span>{t.label}</span>
                          {active && <Check className="h-3.5 w-3.5" strokeWidth={3} />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </section>
          );
        })}

        <footer className="pt-6 text-center text-xs text-muted-foreground">
          Built for Midjourney · DALL·E · SDXL · Flux
        </footer>
      </main>

      {/* Sticky accumulator */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-border/70 bg-background/85 backdrop-blur-xl">
        <div className="mx-auto max-w-3xl px-4 py-3">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
              Live Prompt
            </span>
            <button
              onClick={b.saveFavorite}
              disabled={!b.prompt}
              className="flex items-center gap-1.5 rounded-full border border-border px-2.5 py-1 text-[11px] font-medium text-muted-foreground transition hover:border-primary/50 hover:text-primary disabled:opacity-40"
            >
              <Heart className="h-3 w-3" /> Save
            </button>
          </div>
          <div className="max-h-24 overflow-y-auto rounded-2xl border border-border bg-card/60 p-3 font-mono text-[13px] leading-relaxed">
            {b.prompt ? (
              <span className="text-foreground">{b.prompt}</span>
            ) : (
              <span className="text-muted-foreground">Your prompt will appear here…</span>
            )}
          </div>
          <button
            onClick={copy}
            disabled={!b.prompt}
            className={cn(
              "mt-2.5 flex w-full items-center justify-center gap-2 rounded-2xl py-3.5 text-sm font-bold text-background transition-all active:scale-[0.98] disabled:opacity-40",
              copied ? "" : "shadow-neon",
            )}
            style={{ background: copied ? "oklch(0.75 0.18 145)" : "var(--gradient-neon)" }}
          >
            {copied ? (
              <><Check className="h-4 w-4" strokeWidth={3} /> Copied!</>
            ) : (
              <><Copy className="h-4 w-4" /> Copy Prompt</>
            )}
          </button>
        </div>
      </div>

      {/* Favorites drawer */}
      {showFavs && (
        <div className="fixed inset-0 z-50 animate-fade-in" onClick={() => setShowFavs(false)}>
          <div className="absolute inset-0 bg-background/70 backdrop-blur-sm" />
          <div
            className="absolute inset-x-0 bottom-0 max-h-[80vh] overflow-y-auto rounded-t-3xl border-t border-border bg-card p-4 animate-slide-in-right"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-border" />
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold">Saved Prompts</h3>
              <button onClick={() => setShowFavs(false)} className="grid h-9 w-9 place-items-center rounded-xl border border-border">
                <X className="h-4 w-4" />
              </button>
            </div>
            {b.favorites.length === 0 ? (
              <div className="py-12 text-center text-sm text-muted-foreground">
                <Heart className="mx-auto mb-3 h-8 w-8 opacity-40" />
                No saved prompts yet.<br />Tap Save on the bar below to bookmark a look.
              </div>
            ) : (
              <ul className="space-y-2 pb-6">
                {b.favorites.map((f) => (
                  <li key={f.id} className="group rounded-2xl border border-border bg-background/50 p-3">
                    <p className="mb-2 font-mono text-xs leading-relaxed text-foreground/90">{f.prompt}</p>
                    <div className="flex gap-2">
                      <button
                        onClick={() => { b.loadFavorite(f); setShowFavs(false); }}
                        className="flex-1 rounded-lg bg-primary/15 py-1.5 text-xs font-semibold text-primary transition hover:bg-primary/25"
                      >
                        Load
                      </button>
                      <button
                        onClick={() => b.removeFavorite(f.id)}
                        className="rounded-lg border border-border px-3 py-1.5 text-xs text-muted-foreground transition hover:border-destructive/50 hover:text-destructive"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
