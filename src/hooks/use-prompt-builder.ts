import { useCallback, useEffect, useMemo, useState } from "react";
import { CATEGORIES, type Token } from "@/lib/prompt-data";

type Selections = Record<string, string[]>;
type Favorite = { id: string; prompt: string; selections: Selections; createdAt: number };
type CustomTokens = Record<string, Token[]>;
type RemovedTokens = Record<string, string[]>;
type RecentTokens = Record<string, string[]>;
type BackupData = {
  version: number;
  exportedAt: string;
  selections: Selections;
  favorites: Favorite[];
  custom: CustomTokens;
  removed: RemovedTokens;
  order: string[];
  recent: RecentTokens;
};

const BACKUP_VERSION = 1;

const STORAGE_KEY = "promptdeck:selections";
const FAV_KEY = "promptdeck:favorites";
const CUSTOM_KEY = "promptdeck:custom";
const REMOVED_KEY = "promptdeck:removed";
const ORDER_KEY = "promptdeck:order";
const RECENT_KEY = "promptdeck:recent";
const RECENT_PER_CATEGORY = 4;

const haptic = (ms = 8) => {
  if (typeof navigator !== "undefined" && "vibrate" in navigator) {
    try {
      navigator.vibrate(ms);
    } catch {
      /* ignore */
    }
  }
};

const EMOJI_POOL = [
  "✨",
  "🌟",
  "⭐",
  "💫",
  "🔮",
  "🎭",
  "🌈",
  "🔥",
  "❄️",
  "🌊",
  "🍄",
  "🪐",
  "🌙",
  "☄️",
  "🎨",
  "🖌️",
  "📐",
  "🧭",
  "🗝️",
  "🕯️",
];

export function usePromptBuilder() {
  const [selections, setSelections] = useState<Selections>({});
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [custom, setCustom] = useState<CustomTokens>({});
  const [removed, setRemoved] = useState<RemovedTokens>({});
  const [order, setOrder] = useState<string[]>(() => CATEGORIES.map((c) => c.id));
  const [recent, setRecent] = useState<RecentTokens>({});
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const s = localStorage.getItem(STORAGE_KEY);
      if (s) setSelections(JSON.parse(s));
      const f = localStorage.getItem(FAV_KEY);
      if (f) setFavorites(JSON.parse(f));
      const c = localStorage.getItem(CUSTOM_KEY);
      if (c) setCustom(JSON.parse(c));
      const r = localStorage.getItem(REMOVED_KEY);
      if (r) setRemoved(JSON.parse(r));
      const o = localStorage.getItem(ORDER_KEY);
      if (o) {
        const parsed: string[] = JSON.parse(o);
        const known = new Set(CATEGORIES.map((c) => c.id));
        const merged = [
          ...parsed.filter((id) => known.has(id)),
          ...CATEGORIES.map((c) => c.id).filter((id) => !parsed.includes(id)),
        ];
        setOrder(merged);
      }
      const rc = localStorage.getItem(RECENT_KEY);
      if (rc) setRecent(JSON.parse(rc));
    } catch {
      /* ignore */
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated) localStorage.setItem(STORAGE_KEY, JSON.stringify(selections));
  }, [selections, hydrated]);
  useEffect(() => {
    if (hydrated) localStorage.setItem(FAV_KEY, JSON.stringify(favorites));
  }, [favorites, hydrated]);
  useEffect(() => {
    if (hydrated) localStorage.setItem(CUSTOM_KEY, JSON.stringify(custom));
  }, [custom, hydrated]);
  useEffect(() => {
    if (hydrated) localStorage.setItem(REMOVED_KEY, JSON.stringify(removed));
  }, [removed, hydrated]);
  useEffect(() => {
    if (hydrated) localStorage.setItem(ORDER_KEY, JSON.stringify(order));
  }, [order, hydrated]);
  useEffect(() => {
    if (hydrated) localStorage.setItem(RECENT_KEY, JSON.stringify(recent));
  }, [recent, hydrated]);

  const tokensFor = useCallback(
    (categoryId: string): Token[] => {
      const cat = CATEGORIES.find((c) => c.id === categoryId);
      const base = cat ? cat.tokens : [];
      const rem = new Set(removed[categoryId] ?? []);
      const kept = base.filter((t) => !rem.has(t.id));
      const extras = custom[categoryId] ?? [];
      return [...kept, ...extras];
    },
    [custom, removed],
  );

  const recentTokensFor = useCallback(
    (categoryId: string): Token[] => {
      const ids = recent[categoryId] ?? [];
      const available = tokensFor(categoryId);
      const byId = new Map(available.map((t) => [t.id, t]));
      const out: Token[] = [];
      for (const id of ids) {
        const t = byId.get(id);
        if (t) out.push(t);
        if (out.length === RECENT_PER_CATEGORY) break;
      }
      return out;
    },
    [recent, tokensFor],
  );

  const toggle = useCallback(
    (categoryId: string, tokenId: string) => {
      haptic(10);
      const isAdding = !(selections[categoryId] ?? []).includes(tokenId);
      setSelections((prev) => {
        const cur = prev[categoryId] ?? [];
        const next = cur.includes(tokenId) ? cur.filter((x) => x !== tokenId) : [...cur, tokenId];
        return { ...prev, [categoryId]: next };
      });
      if (isAdding) {
        setRecent((prev) => {
          const cur = prev[categoryId] ?? [];
          const next = [tokenId, ...cur.filter((id) => id !== tokenId)].slice(
            0,
            RECENT_PER_CATEGORY * 2,
          );
          return { ...prev, [categoryId]: next };
        });
      }
    },
    [selections],
  );

  const removeToken = useCallback((categoryId: string, tokenId: string) => {
    haptic(12);
    // If it's a custom token, drop from custom; otherwise mark preset as removed.
    setCustom((prev) => {
      const list = prev[categoryId] ?? [];
      if (list.some((t) => t.id === tokenId)) {
        return { ...prev, [categoryId]: list.filter((t) => t.id !== tokenId) };
      }
      return prev;
    });
    setRemoved((prev) => {
      const cat = CATEGORIES.find((c) => c.id === categoryId);
      const isPreset = cat?.tokens.some((t) => t.id === tokenId);
      if (!isPreset) return prev;
      const cur = prev[categoryId] ?? [];
      if (cur.includes(tokenId)) return prev;
      return { ...prev, [categoryId]: [...cur, tokenId] };
    });
    setSelections((prev) => {
      const cur = prev[categoryId] ?? [];
      if (!cur.includes(tokenId)) return prev;
      return { ...prev, [categoryId]: cur.filter((x) => x !== tokenId) };
    });
  }, []);

  const addToken = useCallback(
    (categoryId: string, label: string, value?: string, emoji?: string) => {
      const trimmed = label.trim();
      if (!trimmed) return;
      haptic(15);
      const token: Token = {
        id: `custom-${categoryId}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        label: trimmed.slice(0, 40),
        value: (value?.trim() || trimmed).slice(0, 200),
        emoji: emoji?.trim() || EMOJI_POOL[Math.floor(Math.random() * EMOJI_POOL.length)],
      };
      setCustom((prev) => ({ ...prev, [categoryId]: [...(prev[categoryId] ?? []), token] }));
    },
    [],
  );

  const restoreCategory = useCallback((categoryId: string) => {
    haptic(15);
    setRemoved((prev) => ({ ...prev, [categoryId]: [] }));
  }, []);

  const clearAll = useCallback(() => {
    haptic(20);
    setSelections({});
  }, []);

  const orderedCategories = useMemo(() => {
    const map = new Map(CATEGORIES.map((c) => [c.id, c]));
    const seen = new Set<string>();
    const out: typeof CATEGORIES = [];
    for (const id of order) {
      const c = map.get(id);
      if (c && !seen.has(id)) {
        out.push(c);
        seen.add(id);
      }
    }
    for (const c of CATEGORIES) if (!seen.has(c.id)) out.push(c);
    return out;
  }, [order]);

  const moveCategory = useCallback((fromId: string, toId: string) => {
    if (fromId === toId) return;
    setOrder((prev) => {
      const ids = prev.length ? [...prev] : CATEGORIES.map((c) => c.id);
      // ensure both exist
      for (const c of CATEGORIES) if (!ids.includes(c.id)) ids.push(c.id);
      const from = ids.indexOf(fromId);
      const to = ids.indexOf(toId);
      if (from === -1 || to === -1) return prev;
      ids.splice(from, 1);
      ids.splice(to, 0, fromId);
      return ids;
    });
  }, []);

  const randomize = useCallback(() => {
    haptic(25);
    const next: Selections = {};
    for (const cat of orderedCategories) {
      const tokens = tokensFor(cat.id);
      if (!tokens.length) continue;
      const pick = tokens[Math.floor(Math.random() * tokens.length)];
      next[cat.id] = [pick.id];
    }
    setSelections(next);
  }, [tokensFor, orderedCategories]);

  const prompt = useMemo(() => {
    const parts: string[] = [];
    for (const cat of orderedCategories) {
      const ids = selections[cat.id] ?? [];
      const tokens = tokensFor(cat.id);
      for (const id of ids) {
        const t = tokens.find((x) => x.id === id);
        if (t) parts.push(t.value);
      }
    }
    return parts.join(", ");
  }, [selections, tokensFor, orderedCategories]);

  const selectedTokens = useMemo(() => {
    const out: { category: string; token: Token }[] = [];
    for (const cat of orderedCategories) {
      const tokens = tokensFor(cat.id);
      for (const id of selections[cat.id] ?? []) {
        const t = tokens.find((x) => x.id === id);
        if (t) out.push({ category: cat.name, token: t });
      }
    }
    return out;
  }, [selections, tokensFor, orderedCategories]);

  const saveFavorite = useCallback(() => {
    if (!prompt) return;
    haptic(15);
    setFavorites((prev) =>
      [{ id: crypto.randomUUID(), prompt, selections, createdAt: Date.now() }, ...prev].slice(
        0,
        50,
      ),
    );
  }, [prompt, selections]);

  const loadFavorite = useCallback((fav: Favorite) => {
    haptic(15);
    setSelections(fav.selections);
  }, []);

  const removeFavorite = useCallback((id: string) => {
    setFavorites((prev) => prev.filter((f) => f.id !== id));
  }, []);

  const exportData = useCallback(
    (): BackupData => ({
      version: BACKUP_VERSION,
      exportedAt: new Date().toISOString(),
      selections,
      favorites,
      custom,
      removed,
      order,
      recent,
    }),
    [selections, favorites, custom, removed, order, recent],
  );

  // Best-effort shape check on untrusted imported JSON — falls back to safe
  // defaults for any field that's missing or the wrong type rather than
  // rejecting the whole file over one bad field.
  const importData = useCallback((data: unknown): boolean => {
    if (!data || typeof data !== "object") return false;
    const d = data as Partial<BackupData>;
    if (
      typeof d.selections !== "object" ||
      d.selections === null ||
      !Array.isArray(d.favorites) ||
      typeof d.custom !== "object" ||
      d.custom === null ||
      typeof d.removed !== "object" ||
      d.removed === null ||
      !Array.isArray(d.order) ||
      typeof d.recent !== "object" ||
      d.recent === null
    ) {
      return false;
    }
    haptic(20);
    setSelections(d.selections as Selections);
    setFavorites(d.favorites as Favorite[]);
    setCustom(d.custom as CustomTokens);
    setRemoved(d.removed as RemovedTokens);
    setOrder(d.order.length ? (d.order as string[]) : CATEGORIES.map((c) => c.id));
    setRecent(d.recent as RecentTokens);
    return true;
  }, []);

  return {
    selections,
    toggle,
    clearAll,
    randomize,
    prompt,
    selectedTokens,
    favorites,
    saveFavorite,
    loadFavorite,
    removeFavorite,
    tokensFor,
    recentTokensFor,
    addToken,
    removeToken,
    restoreCategory,
    removed,
    orderedCategories,
    moveCategory,
    exportData,
    importData,
  };
}
