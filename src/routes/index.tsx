import { createFileRoute } from "@tanstack/react-router";
import {
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
  type PointerEvent as ReactPointerEvent,
} from "react";
import {
  ChevronDown,
  Copy,
  Check,
  Sparkles,
  Trash2,
  Heart,
  X,
  Wand2,
  Pencil,
  Plus,
  RotateCcw,
  GripVertical,
  Download,
  Upload,
  Maximize2,
  Minimize2,
  Dices,
  Lock,
  Unlock,
} from "lucide-react";
import { CATEGORIES, resolveCategoryIcon, type Token } from "@/lib/prompt-data";
import { usePromptBuilder } from "@/hooks/use-prompt-builder";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "PromptDeck — The Lego Set for AI Art" },
      {
        name: "description",
        content:
          "Build professional AI art prompts by tapping visual token cards. No blank page. Copy to Midjourney, DALL·E, or SDXL.",
      },
      { property: "og:title", content: "PromptDeck — The Lego Set for AI Art" },
      {
        property: "og:description",
        content: "Build professional AI art prompts by tapping visual token cards.",
      },
    ],
  }),
  component: Index,
});

const PROMPT_MIN_H = 56;
const PROMPT_DEFAULT_H = 96;
// Non-box chrome inside the fixed pane (handle + label row + copy button +
// paddings) that expanding shouldn't eat into.
const PROMPT_CHROME_H = 150;
const HEADER_FALLBACK_H = 76;
// A quick flick vs. a slow deliberate drag, in px/ms.
const FLICK_VELOCITY_THRESHOLD = 0.5;

const DRAWER_MIN_H = 220;
const DRAWER_DEFAULT_VH = 0.8;
const DRAWER_EXPANDED_VH = 0.95;

type DragState = { y: number; height: number; lastY: number; lastT: number; velocity: number };

function Index() {
  const b = usePromptBuilder();
  const [open, setOpen] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(CATEGORIES.map((c) => [c.id, false])),
  );
  const [copied, setCopied] = useState(false);
  const [showFavs, setShowFavs] = useState(false);
  const [showLockPicker, setShowLockPicker] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [drafts, setDrafts] = useState<
    Record<string, { label: string; value: string; emoji: string }>
  >({});
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [importError, setImportError] = useState(false);
  const [pendingRemoval, setPendingRemoval] = useState<Record<string, string[]>>({});
  const [promptHeight, setPromptHeight] = useState(PROMPT_DEFAULT_H);
  const [promptDraft, setPromptDraft] = useState("");
  const [promptDirty, setPromptDirty] = useState(false);
  const [drawerHeight, setDrawerHeight] = useState<number | null>(null);
  const [recentSnapshots, setRecentSnapshots] = useState<Record<string, Token[]>>({});
  const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pressStart = useRef<{ x: number; y: number } | null>(null);
  const justDragged = useRef(false);
  const importInputRef = useRef<HTMLInputElement | null>(null);
  const promptDrag = useRef<DragState | null>(null);
  const drawerDrag = useRef<DragState | null>(null);
  const headerRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!copied) return;
    const t = setTimeout(() => setCopied(false), 1600);
    return () => clearTimeout(t);
  }, [copied]);

  useEffect(() => {
    if (!importError) return;
    const t = setTimeout(() => setImportError(false), 2500);
    return () => clearTimeout(t);
  }, [importError]);

  // Once the user types directly into the Live Prompt box, it detaches from
  // the token-derived prompt (which would otherwise silently overwrite their
  // edit on the next selection change) until they hit Reset or Clear All.
  const displayedPrompt = promptDirty ? promptDraft : b.prompt;
  const handlePromptEdit = (e: ChangeEvent<HTMLTextAreaElement>) => {
    setPromptDraft(e.target.value);
    setPromptDirty(true);
  };
  const resetPromptEdit = () => {
    setPromptDirty(false);
    setPromptDraft("");
  };

  const copy = async () => {
    if (!displayedPrompt) return;
    try {
      await navigator.clipboard.writeText(displayedPrompt);
      setCopied(true);
      if ("vibrate" in navigator) navigator.vibrate?.([8, 40, 8]);
    } catch {
      /* ignore */
    }
  };

  const handleExport = () => {
    const data = b.exportData();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `promptdeck-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportFile = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(String(reader.result));
        const proceed = window.confirm(
          "Import this backup? It will replace your current tokens, favorites, and settings.",
        );
        if (!proceed) return;
        if (!b.importData(parsed)) setImportError(true);
      } catch {
        setImportError(true);
      }
    };
    reader.readAsText(file);
  };

  const pendingRemovalCount = Object.values(pendingRemoval).reduce((n, ids) => n + ids.length, 0);

  const togglePendingRemoval = (catId: string, tokenId: string) => {
    if ("vibrate" in navigator) navigator.vibrate?.(10);
    setPendingRemoval((prev) => {
      const cur = prev[catId] ?? [];
      const next = cur.includes(tokenId) ? cur.filter((id) => id !== tokenId) : [...cur, tokenId];
      return { ...prev, [catId]: next };
    });
  };

  const enterEditMode = () => {
    setPendingRemoval({});
    setEditMode(true);
  };

  const cancelEditMode = () => {
    setPendingRemoval({});
    setEditMode(false);
  };

  const confirmEditMode = () => {
    if (pendingRemovalCount === 0) {
      setEditMode(false);
      return;
    }
    const proceed = window.confirm(
      `Delete ${pendingRemovalCount} token${pendingRemovalCount === 1 ? "" : "s"}? This can't be undone.`,
    );
    if (!proceed) return;
    for (const [catId, ids] of Object.entries(pendingRemoval)) {
      for (const id of ids) b.removeToken(catId, id);
    }
    setPendingRemoval({});
    setEditMode(false);
  };

  const setDraft = (
    catId: string,
    patch: Partial<{ label: string; value: string; emoji: string }>,
  ) =>
    setDrafts((d) => {
      const cur = d[catId] ?? { label: "", value: "", emoji: "" };
      return { ...d, [catId]: { ...cur, ...patch } };
    });

  const submitDraft = (catId: string) => {
    const d = drafts[catId];
    if (!d?.label.trim()) return;
    b.addToken(catId, d.label, d.value, d.emoji);
    setDrafts((prev) => ({ ...prev, [catId]: { label: "", value: "", emoji: "" } }));
  };

  const totalSelected = b.selectedTokens.length;

  const clearLongPress = () => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
    pressStart.current = null;
  };

  const findCatIdAt = (x: number, y: number): string | null => {
    const el = document.elementFromPoint(x, y);
    if (!el) return null;
    const section = (el as Element).closest?.("[data-cat-id]") as HTMLElement | null;
    return section?.dataset.catId ?? null;
  };

  const onSectionPointerDown = (catId: string) => (e: ReactPointerEvent) => {
    if (e.pointerType === "mouse" && e.button !== 0) return;
    pressStart.current = { x: e.clientX, y: e.clientY };
    clearLongPress();
    longPressTimer.current = setTimeout(() => {
      setDraggingId(catId);
      justDragged.current = true;
      if ("vibrate" in navigator) navigator.vibrate?.(30);
    }, 380);
  };

  const onSectionPointerMove = (e: ReactPointerEvent) => {
    if (draggingId) {
      e.preventDefault();
      const overId = findCatIdAt(e.clientX, e.clientY);
      if (overId && overId !== draggingId) b.moveCategory(draggingId, overId);
      return;
    }
    if (pressStart.current) {
      const dx = e.clientX - pressStart.current.x;
      const dy = e.clientY - pressStart.current.y;
      if (dx * dx + dy * dy > 64) clearLongPress();
    }
  };

  const onSectionPointerUp = () => {
    clearLongPress();
    if (draggingId) {
      setDraggingId(null);
      // keep justDragged true briefly to swallow the click that follows
      setTimeout(() => {
        justDragged.current = false;
      }, 50);
    }
  };

  const handleToggleOpen = (catId: string) => {
    if (justDragged.current) {
      justDragged.current = false;
      return;
    }
    const willOpen = !open[catId];
    // Freeze the Recently Used row's contents/order for the duration this
    // category stays open — re-snapshotting on every pick made the pills
    // reshuffle mid-browse, which was hard to track visually. It only
    // re-reads the live order the next time the category is opened.
    if (willOpen) {
      setRecentSnapshots((prev) => ({ ...prev, [catId]: b.recentTokensFor(catId) }));
    }
    setOpen((o) => ({ ...o, [catId]: willOpen }));
  };

  // As big as it can get without climbing into the sticky header — mirrors
  // how far the favorites drawer expands, just bounded by the header instead
  // of the top of the viewport.
  const getPromptMaxH = () => {
    const headerH = headerRef.current?.getBoundingClientRect().height ?? HEADER_FALLBACK_H;
    const viewportH = typeof window !== "undefined" ? window.innerHeight : 800;
    return Math.max(PROMPT_DEFAULT_H, viewportH - headerH - PROMPT_CHROME_H);
  };

  const onPromptHandlePointerDown = (e: ReactPointerEvent) => {
    promptDrag.current = {
      y: e.clientY,
      height: promptHeight,
      lastY: e.clientY,
      lastT: performance.now(),
      velocity: 0,
    };
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  };
  const onPromptHandlePointerMove = (e: ReactPointerEvent) => {
    const drag = promptDrag.current;
    if (!drag) return;
    const dy = drag.y - e.clientY;
    setPromptHeight(Math.min(getPromptMaxH(), Math.max(PROMPT_MIN_H, drag.height + dy)));
    const now = performance.now();
    const dt = now - drag.lastT;
    if (dt > 0) drag.velocity = (drag.lastY - e.clientY) / dt;
    drag.lastY = e.clientY;
    drag.lastT = now;
  };
  const onPromptHandlePointerUp = () => {
    const drag = promptDrag.current;
    promptDrag.current = null;
    if (drag && Math.abs(drag.velocity) > FLICK_VELOCITY_THRESHOLD) {
      setPromptHeight(drag.velocity > 0 ? getPromptMaxH() : PROMPT_DEFAULT_H);
    }
  };
  const togglePromptExpanded = () => {
    const max = getPromptMaxH();
    setPromptHeight((h) => (h < (PROMPT_DEFAULT_H + max) / 2 ? max : PROMPT_DEFAULT_H));
  };
  const isPromptExpanded = promptHeight >= (PROMPT_DEFAULT_H + getPromptMaxH()) / 2;

  const onDrawerHandlePointerDown = (e: ReactPointerEvent) => {
    const height = drawerHeight ?? window.innerHeight * DRAWER_DEFAULT_VH;
    drawerDrag.current = {
      y: e.clientY,
      height,
      lastY: e.clientY,
      lastT: performance.now(),
      velocity: 0,
    };
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  };
  const onDrawerHandlePointerMove = (e: ReactPointerEvent) => {
    const drag = drawerDrag.current;
    if (!drag) return;
    const dy = drag.y - e.clientY;
    const max = window.innerHeight * DRAWER_EXPANDED_VH;
    setDrawerHeight(Math.min(max, Math.max(DRAWER_MIN_H, drag.height + dy)));
    const now = performance.now();
    const dt = now - drag.lastT;
    if (dt > 0) drag.velocity = (drag.lastY - e.clientY) / dt;
    drag.lastY = e.clientY;
    drag.lastT = now;
  };
  const onDrawerHandlePointerUp = () => {
    const drag = drawerDrag.current;
    drawerDrag.current = null;
    if (drag && Math.abs(drag.velocity) > FLICK_VELOCITY_THRESHOLD) {
      const expandedTarget = window.innerHeight * DRAWER_EXPANDED_VH;
      const defaultTarget = window.innerHeight * DRAWER_DEFAULT_VH;
      setDrawerHeight(drag.velocity > 0 ? expandedTarget : defaultTarget);
    }
  };
  const toggleDrawerExpanded = () => {
    const current = drawerHeight ?? window.innerHeight * DRAWER_DEFAULT_VH;
    const expandedTarget = window.innerHeight * DRAWER_EXPANDED_VH;
    const defaultTarget = window.innerHeight * DRAWER_DEFAULT_VH;
    setDrawerHeight(
      current < (expandedTarget + defaultTarget) / 2 ? expandedTarget : defaultTarget,
    );
  };
  const isDrawerExpanded =
    typeof window !== "undefined" &&
    (drawerHeight ?? window.innerHeight * DRAWER_DEFAULT_VH) >
      (window.innerHeight * (DRAWER_DEFAULT_VH + DRAWER_EXPANDED_VH)) / 2;

  return (
    <div className="min-h-screen pb-56">
      {/* Header */}
      <header
        ref={headerRef}
        className="sticky top-0 z-30 border-b border-border/60 bg-background/70 backdrop-blur-xl"
      >
        <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-4">
          <div className="flex items-center gap-2.5">
            <div
              className="grid h-9 w-9 place-items-center rounded-xl"
              style={{ background: "var(--gradient-neon)" }}
            >
              <Sparkles className="h-4.5 w-4.5 text-primary-foreground" strokeWidth={2.5} />
            </div>
            <div>
              <h1 className="text-[17px] font-semibold tracking-tight text-gradient-neon">
                PromptDeck
              </h1>
              <p className="text-[10.5px] uppercase tracking-widest text-muted-foreground">
                the lego set for ai art
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {editMode ? (
              <>
                <button
                  onClick={cancelEditMode}
                  className="flex h-10 items-center gap-1.5 rounded-xl border border-border bg-card/60 px-3 text-xs font-semibold text-muted-foreground transition hover:border-destructive/50 hover:text-destructive active:scale-95"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmEditMode}
                  className={cn(
                    "flex h-10 items-center gap-1.5 rounded-xl border px-3 text-xs font-semibold transition active:scale-95",
                    pendingRemovalCount > 0
                      ? "border-destructive bg-destructive/15 text-destructive"
                      : "border-primary bg-primary/15 text-primary",
                  )}
                  aria-label={pendingRemovalCount > 0 ? "Confirm delete" : "Done editing"}
                >
                  <Pencil className="h-3.5 w-3.5" />
                  {pendingRemovalCount > 0 ? `Delete (${pendingRemovalCount})` : "Done"}
                </button>
              </>
            ) : (
              <button
                onClick={enterEditMode}
                className="flex h-10 items-center gap-1.5 rounded-xl border border-border bg-card/60 px-3 text-xs font-semibold text-muted-foreground transition hover:border-primary/60 hover:text-primary active:scale-95"
                aria-label="Edit tokens"
              >
                <Pencil className="h-3.5 w-3.5" />
                Edit
              </button>
            )}
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
        </div>
        {editMode && (
          <div className="border-t border-primary/30 bg-primary/5 px-4 py-2 text-center text-[11px] font-medium text-primary">
            {pendingRemovalCount > 0
              ? `${pendingRemovalCount} marked for removal · tap Delete to confirm, or Cancel to discard`
              : "Edit mode · tap a token to mark it for removal, or add your own below"}
          </div>
        )}
      </header>

      {/* Action row */}
      <div className="mx-auto max-w-3xl px-4 pt-5">
        <div className="flex gap-2">
          <button
            onClick={b.randomize}
            className="group flex flex-1 items-center justify-center gap-2 rounded-xl border border-primary/40 bg-primary/10 py-3 text-sm font-semibold text-primary transition hover:border-primary/70 hover:bg-primary/15 active:scale-[0.98]"
          >
            <Wand2 className="h-4 w-4 transition group-hover:rotate-12" />
            Remix
          </button>
          <button
            onClick={() => setShowLockPicker(true)}
            className="group flex flex-1 items-center justify-center gap-2 rounded-xl border border-neon/40 bg-neon/10 py-3 text-sm font-semibold text-neon transition hover:border-neon/70 hover:bg-neon/15 active:scale-[0.98]"
          >
            <Dices className="h-4 w-4 transition group-hover:rotate-12" />
            Reroll
          </button>
          <button
            onClick={() => {
              b.clearAll();
              resetPromptEdit();
            }}
            disabled={totalSelected === 0}
            className="flex items-center justify-center gap-2 rounded-xl border border-border bg-card/60 px-4 py-3 text-sm font-medium text-muted-foreground transition hover:border-destructive/50 hover:text-destructive disabled:opacity-40 active:scale-95"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
        <p className="mt-3 px-1 text-xs text-muted-foreground">
          {totalSelected === 0
            ? "Tap tokens to build your prompt →"
            : `${totalSelected} token${totalSelected === 1 ? "" : "s"} selected across ${Object.values(b.selections).filter((v) => v.length).length} categories`}
        </p>
      </div>

      {/* Categories */}
      <main className="mx-auto max-w-3xl space-y-3 px-4 pt-5">
        {b.orderedCategories.map((cat) => {
          const selectedIds = b.selections[cat.id] ?? [];
          const isOpen = open[cat.id] || editMode;
          const tokens = b.tokensFor(cat.id);
          const recentTokens = recentSnapshots[cat.id] ?? b.recentTokensFor(cat.id);
          const removedCount = (b.removed[cat.id] ?? []).length;
          const draft = drafts[cat.id] ?? { label: "", value: "", emoji: "" };
          const isDragging = draggingId === cat.id;
          const catIcon = resolveCategoryIcon(cat);

          return (
            <section
              key={cat.id}
              data-cat-id={cat.id}
              onPointerDown={onSectionPointerDown(cat.id)}
              onPointerMove={onSectionPointerMove}
              onPointerUp={onSectionPointerUp}
              onPointerCancel={onSectionPointerUp}
              className={cn(
                "relative overflow-hidden rounded-2xl border bg-card/60 transition-all",
                isDragging
                  ? "border-primary scale-[1.02] z-20 shadow-neon touch-none select-none"
                  : isOpen
                    ? "border-primary/50"
                    : selectedIds.length
                      ? "border-primary/25"
                      : "border-border",
                draggingId && !isDragging && "opacity-70",
              )}
              style={{ touchAction: draggingId ? "none" : undefined }}
            >
              <span
                aria-hidden
                className={cn(
                  "pointer-events-none absolute right-2 top-2 grid h-5 w-5 place-items-center rounded-md text-muted-foreground/40 transition-opacity",
                  isDragging ? "text-primary opacity-100" : "opacity-60",
                )}
                title="Long-press to reorder"
              >
                <GripVertical className="h-3.5 w-3.5" />
              </span>
              <button
                onClick={() => handleToggleOpen(cat.id)}
                className="flex w-full items-center gap-3 px-4 py-4 pr-8 text-left"
              >
                <div className="grid h-11 w-11 place-items-center rounded-2xl border border-border bg-background/60 text-xl">
                  {catIcon ? (
                    <img src={catIcon} alt="" className="h-[18px] w-[18px] opacity-90" />
                  ) : (
                    <span>{cat.emoji}</span>
                  )}
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
                  className={cn(
                    "h-5 w-5 text-muted-foreground transition-transform duration-300",
                    isOpen && "rotate-180",
                  )}
                />
              </button>

              <div
                className={cn(
                  "grid transition-all duration-300 ease-out",
                  isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0",
                )}
              >
                <div className="overflow-hidden">
                  {editMode ? (
                    <div className="flex flex-wrap gap-2 px-4 pb-4">
                      {tokens.map((t) => {
                        const marked = (pendingRemoval[cat.id] ?? []).includes(t.id);
                        return (
                          <button
                            key={t.id}
                            onClick={() => togglePendingRemoval(cat.id, t.id)}
                            className={cn(
                              "flex items-center gap-2 rounded-2xl border py-2 pl-2.5 pr-3 text-sm font-medium transition-all duration-200 active:scale-95",
                              marked
                                ? "border-destructive bg-destructive/15 text-destructive"
                                : "border-border bg-background/40 text-foreground/80 hover:border-destructive/40 hover:text-destructive",
                            )}
                          >
                            <span
                              className={cn(
                                "grid h-4.5 w-4.5 place-items-center rounded-md border",
                                marked
                                  ? "border-destructive bg-destructive text-background"
                                  : "border-border bg-background/60",
                              )}
                            >
                              {marked && <Check className="h-3 w-3" strokeWidth={3} />}
                            </span>
                            <span className="text-base leading-none">{t.emoji}</span>
                            <span>{t.label}</span>
                          </button>
                        );
                      })}
                      {tokens.length === 0 && (
                        <p className="text-xs text-muted-foreground">
                          No tokens in this category yet — add one below.
                        </p>
                      )}
                    </div>
                  ) : (
                    <div className="flex flex-col gap-2 px-4 pb-4">
                      <div className="relative">
                        <select
                          value=""
                          onChange={(e) => {
                            if (e.target.value) b.toggle(cat.id, e.target.value);
                          }}
                          className="w-full rounded-2xl border border-border bg-background/60 px-3 py-2 text-sm font-medium text-foreground/80 transition hover:border-primary/40 hover:text-foreground"
                        >
                          <option value="">Select a token...</option>
                          {tokens.map((t) => (
                            <option key={t.id} value={t.id}>
                              {t.emoji} {t.label}
                              {selectedIds.includes(t.id) ? " (selected)" : ""}
                            </option>
                          ))}
                        </select>
                      </div>
                      {recentTokens.length > 0 && (
                        <div>
                          <p className="mb-1.5 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                            Recently Used
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {recentTokens.map((t) => {
                              const active = selectedIds.includes(t.id);
                              return (
                                <button
                                  key={t.id}
                                  onClick={() => b.toggle(cat.id, t.id)}
                                  className={cn(
                                    "flex items-center gap-2 rounded-xl border px-3 py-2 text-sm font-medium transition-all duration-200 active:scale-95",
                                    active
                                      ? "border-primary bg-primary/10 text-primary"
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
                      )}
                      {tokens.length === 0 && (
                        <p className="text-xs text-muted-foreground">
                          All tokens removed. Enable Edit to add your own.
                        </p>
                      )}
                    </div>
                  )}

                  {editMode && (
                    <div className="mx-4 mb-4 space-y-2 rounded-2xl border border-dashed border-primary/40 bg-primary/5 p-3">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-primary">
                          Add token
                        </span>
                        {removedCount > 0 && (
                          <button
                            onClick={() => b.restoreCategory(cat.id)}
                            className="flex items-center gap-1 rounded-full border border-border bg-background/60 px-2 py-0.5 text-[10px] font-medium text-muted-foreground transition hover:text-foreground"
                          >
                            <RotateCcw className="h-2.5 w-2.5" />
                            Restore {removedCount}
                          </button>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <input
                          value={draft.emoji}
                          onChange={(e) => setDraft(cat.id, { emoji: e.target.value })}
                          placeholder="✨"
                          maxLength={2}
                          className="w-12 rounded-xl border border-border bg-background/60 px-2 py-2 text-center text-base outline-none focus:border-primary focus:shadow-neon"
                        />
                        <input
                          value={draft.label}
                          onChange={(e) => setDraft(cat.id, { label: e.target.value })}
                          placeholder="Label (e.g. Noir)"
                          className="flex-1 rounded-xl border border-border bg-background/60 px-3 py-2 text-sm outline-none focus:border-primary focus:shadow-neon"
                        />
                      </div>
                      <div className="flex gap-2">
                        <input
                          value={draft.value}
                          onChange={(e) => setDraft(cat.id, { value: e.target.value })}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") submitDraft(cat.id);
                          }}
                          placeholder="Prompt text (optional — defaults to label)"
                          className="flex-1 rounded-xl border border-border bg-background/60 px-3 py-2 text-sm outline-none focus:border-primary focus:shadow-neon"
                        />
                        <button
                          onClick={() => submitDraft(cat.id)}
                          disabled={!draft.label.trim()}
                          className="flex items-center gap-1 rounded-xl bg-primary px-3 py-2 text-xs font-bold text-primary-foreground transition active:scale-95 disabled:opacity-40"
                        >
                          <Plus className="h-3.5 w-3.5" strokeWidth={3} /> Add
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </section>
          );
        })}

        <footer className="pt-6 text-center text-xs text-muted-foreground">DJJPS 2026 ©</footer>
      </main>

      {/* Sticky accumulator */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-border/70 bg-background/85 backdrop-blur-xl">
        <div
          onPointerDown={onPromptHandlePointerDown}
          onPointerMove={onPromptHandlePointerMove}
          onPointerUp={onPromptHandlePointerUp}
          onPointerCancel={onPromptHandlePointerUp}
          onDoubleClick={togglePromptExpanded}
          className="flex touch-none select-none justify-center py-1.5 cursor-ns-resize"
        >
          <span className="h-1 w-10 rounded-full bg-border" />
        </div>
        <div className="mx-auto max-w-3xl px-4 pb-3">
          <div className="mb-1.5 flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
              Live Prompt
            </span>
            <div className="flex items-center gap-1.5">
              {promptDirty && (
                <button
                  onClick={resetPromptEdit}
                  className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground transition hover:text-primary"
                >
                  Reset
                </button>
              )}
              <button
                onClick={togglePromptExpanded}
                aria-label={isPromptExpanded ? "Collapse live prompt" : "Expand live prompt"}
                className="grid h-6 w-6 place-items-center rounded-md text-muted-foreground transition hover:text-primary"
              >
                {isPromptExpanded ? (
                  <Minimize2 className="h-3.5 w-3.5" />
                ) : (
                  <Maximize2 className="h-3.5 w-3.5" />
                )}
              </button>
              <button
                onClick={() => b.saveFavorite(displayedPrompt)}
                disabled={!displayedPrompt}
                className="flex items-center gap-1.5 rounded-full border border-border px-2.5 py-1 text-[11px] font-medium text-muted-foreground transition hover:border-primary/50 hover:text-primary disabled:opacity-40"
              >
                <Heart className="h-3 w-3" /> Save
              </button>
            </div>
          </div>
          <textarea
            value={displayedPrompt}
            onChange={handlePromptEdit}
            placeholder="Your prompt will appear here…"
            style={{ height: promptHeight }}
            className="w-full resize-none overflow-y-auto rounded-2xl border border-border bg-card/60 p-3 font-mono text-[13px] leading-relaxed text-foreground outline-none placeholder:text-muted-foreground focus:border-primary/50"
          />
          <button
            onClick={copy}
            disabled={!displayedPrompt}
            className={cn(
              "mt-2.5 flex w-full items-center justify-center gap-2 rounded-2xl py-3.5 text-sm font-bold text-primary-foreground transition-all active:scale-[0.98] disabled:opacity-40",
              copied ? "" : "shadow-neon",
            )}
            style={{ background: copied ? "oklch(0.75 0.18 145)" : "var(--gradient-neon)" }}
          >
            {copied ? (
              <>
                <Check className="h-4 w-4" strokeWidth={3} /> Copied!
              </>
            ) : (
              <>
                <Copy className="h-4 w-4" /> Copy Prompt
              </>
            )}
          </button>
        </div>
      </div>

      {/* Favorites drawer */}
      {showFavs && (
        <div className="fixed inset-0 z-50 animate-fade-in" onClick={() => setShowFavs(false)}>
          <div className="absolute inset-0 bg-background/70 backdrop-blur-sm" />
          <div
            style={{ height: drawerHeight ?? "80vh" }}
            className="absolute inset-x-0 bottom-0 flex flex-col rounded-t-3xl border-t border-border bg-card animate-slide-in-right"
            onClick={(e) => e.stopPropagation()}
          >
            <div
              onPointerDown={onDrawerHandlePointerDown}
              onPointerMove={onDrawerHandlePointerMove}
              onPointerUp={onDrawerHandlePointerUp}
              onPointerCancel={onDrawerHandlePointerUp}
              onDoubleClick={toggleDrawerExpanded}
              className="flex shrink-0 touch-none select-none justify-center pb-2 pt-3 cursor-ns-resize"
            >
              <span className="h-1 w-10 rounded-full bg-border" />
            </div>
            <div className="mb-4 flex shrink-0 items-center justify-between px-4">
              <h3 className="text-lg font-semibold">Saved Prompts</h3>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={toggleDrawerExpanded}
                  aria-label={isDrawerExpanded ? "Collapse drawer" : "Expand drawer"}
                  className="grid h-9 w-9 place-items-center rounded-xl border border-border text-muted-foreground transition hover:border-primary/60 hover:text-primary"
                >
                  {isDrawerExpanded ? (
                    <Minimize2 className="h-4 w-4" />
                  ) : (
                    <Maximize2 className="h-4 w-4" />
                  )}
                </button>
                <button
                  onClick={() => setShowFavs(false)}
                  className="grid h-9 w-9 place-items-center rounded-xl border border-border"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
            <div className="overflow-y-auto px-4 pb-4">
              <div className="mb-4 rounded-2xl border border-border bg-background/40 p-3">
                <p className="mb-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                  Backup & Restore
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={handleExport}
                    className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-border bg-card/60 py-2 text-xs font-medium text-foreground/80 transition hover:border-primary/50 hover:text-primary"
                  >
                    <Download className="h-3.5 w-3.5" />
                    Export
                  </button>
                  <button
                    onClick={() => importInputRef.current?.click()}
                    className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-border bg-card/60 py-2 text-xs font-medium text-foreground/80 transition hover:border-primary/50 hover:text-primary"
                  >
                    <Upload className="h-3.5 w-3.5" />
                    Import
                  </button>
                  <input
                    ref={importInputRef}
                    type="file"
                    accept="application/json,.json"
                    className="hidden"
                    onChange={handleImportFile}
                  />
                </div>
                <p className="mt-2 text-[11px] text-muted-foreground">
                  Export saves all your tokens, order, and favorites as a file you can move to
                  another device. Import replaces your current data.
                </p>
                {importError && (
                  <p className="mt-2 text-[11px] font-medium text-destructive">
                    Import failed — that file isn't a valid PromptDeck backup.
                  </p>
                )}
              </div>

              {b.favorites.length === 0 ? (
                <div className="py-12 text-center text-sm text-muted-foreground">
                  <Heart className="mx-auto mb-3 h-8 w-8 opacity-40" />
                  No saved prompts yet.
                  <br />
                  Tap Save on the bar below to bookmark a look.
                </div>
              ) : (
                <ul className="space-y-2 pb-6">
                  {b.favorites.map((f) => (
                    <li
                      key={f.id}
                      className="group rounded-2xl border border-border bg-background/50 p-3"
                    >
                      <p className="mb-2 font-mono text-xs leading-relaxed text-foreground/90">
                        {f.prompt}
                      </p>
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            b.loadFavorite(f);
                            setPromptDraft(f.prompt);
                            setPromptDirty(true);
                            setShowFavs(false);
                          }}
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
        </div>
      )}

      {showLockPicker && (
        <div
          className="fixed inset-0 z-50 animate-fade-in"
          onClick={() => setShowLockPicker(false)}
        >
          <div className="absolute inset-0 bg-background/70 backdrop-blur-sm" />
          <div
            className="absolute inset-x-0 bottom-0 flex max-h-[80vh] flex-col rounded-t-3xl border-t border-border bg-card animate-slide-in-right"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex shrink-0 justify-center pb-2 pt-3">
              <span className="h-1 w-10 rounded-full bg-border" />
            </div>
            <div className="mb-1 flex shrink-0 items-start justify-between gap-3 px-4">
              <div>
                <h3 className="text-lg font-semibold">Lock & Reroll</h3>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  Locked categories keep their current pick — everything else gets rerolled.
                </p>
              </div>
              <button
                onClick={() => setShowLockPicker(false)}
                className="grid h-9 w-9 shrink-0 place-items-center rounded-xl border border-border"
                aria-label="Close"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="overflow-y-auto px-4 py-3">
              <ul className="space-y-1.5 pb-2">
                {b.orderedCategories.map((cat) => {
                  const isLocked = !!b.lockedCategories[cat.id];
                  const catIcon = resolveCategoryIcon(cat);
                  return (
                    <li key={cat.id}>
                      <button
                        onClick={() => b.toggleLock(cat.id)}
                        className={cn(
                          "flex w-full items-center justify-between rounded-xl border px-3 py-2.5 text-left text-sm font-medium transition active:scale-[0.99]",
                          isLocked
                            ? "border-primary/50 bg-primary/10 text-primary"
                            : "border-border bg-background/40 text-foreground/80 hover:border-neon/40",
                        )}
                      >
                        <span className="flex items-center gap-2">
                          <span className="grid h-5 w-5 shrink-0 place-items-center" aria-hidden>
                            {catIcon ? (
                              <img src={catIcon} alt="" className="h-[15px] w-[15px] opacity-90" />
                            ) : (
                              <span className="text-sm">{cat.emoji}</span>
                            )}
                          </span>
                          {cat.name}
                        </span>
                        {isLocked ? (
                          <Lock className="h-4 w-4" />
                        ) : (
                          <Unlock className="h-4 w-4 opacity-50" />
                        )}
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
            <div className="shrink-0 border-t border-border px-4 py-3">
              <button
                onClick={() => {
                  b.randomizeUnlocked();
                  setShowLockPicker(false);
                }}
                className="flex w-full items-center justify-center gap-2 rounded-xl border border-neon/50 bg-neon/15 py-3 text-sm font-semibold text-neon transition hover:border-neon/70 hover:bg-neon/25 active:scale-[0.98]"
              >
                <Dices className="h-4 w-4" />
                Reroll Unlocked
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
