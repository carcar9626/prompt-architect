import { useCallback, useEffect, useMemo, useState } from "react";
import { CATEGORIES, type Token } from "@/lib/prompt-data";

type Selections = Record<string, string[]>;
type Favorite = { id: string; prompt: string; selections: Selections; createdAt: number };

const STORAGE_KEY = "promptdeck:selections";
const FAV_KEY = "promptdeck:favorites";

const haptic = (ms = 8) => {
  if (typeof navigator !== "undefined" && "vibrate" in navigator) {
    try { navigator.vibrate(ms); } catch { /* ignore */ }
  }
};

export function usePromptBuilder() {
  const [selections, setSelections] = useState<Selections>({});
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const s = localStorage.getItem(STORAGE_KEY);
      if (s) setSelections(JSON.parse(s));
      const f = localStorage.getItem(FAV_KEY);
      if (f) setFavorites(JSON.parse(f));
    } catch { /* ignore */ }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated) localStorage.setItem(STORAGE_KEY, JSON.stringify(selections));
  }, [selections, hydrated]);

  useEffect(() => {
    if (hydrated) localStorage.setItem(FAV_KEY, JSON.stringify(favorites));
  }, [favorites, hydrated]);

  const toggle = useCallback((categoryId: string, tokenId: string) => {
    haptic(10);
    setSelections((prev) => {
      const cur = prev[categoryId] ?? [];
      const next = cur.includes(tokenId) ? cur.filter((x) => x !== tokenId) : [...cur, tokenId];
      return { ...prev, [categoryId]: next };
    });
  }, []);

  const clearAll = useCallback(() => {
    haptic(20);
    setSelections({});
  }, []);

  const randomize = useCallback(() => {
    haptic(25);
    const next: Selections = {};
    for (const cat of CATEGORIES) {
      const pick = cat.tokens[Math.floor(Math.random() * cat.tokens.length)];
      next[cat.id] = [pick.id];
    }
    setSelections(next);
  }, []);

  const prompt = useMemo(() => {
    const parts: string[] = [];
    for (const cat of CATEGORIES) {
      const ids = selections[cat.id] ?? [];
      for (const id of ids) {
        const t = cat.tokens.find((x) => x.id === id);
        if (t) parts.push(t.value);
      }
    }
    return parts.join(", ");
  }, [selections]);

  const selectedTokens = useMemo(() => {
    const out: { category: string; token: Token }[] = [];
    for (const cat of CATEGORIES) {
      for (const id of selections[cat.id] ?? []) {
        const t = cat.tokens.find((x) => x.id === id);
        if (t) out.push({ category: cat.name, token: t });
      }
    }
    return out;
  }, [selections]);

  const saveFavorite = useCallback(() => {
    if (!prompt) return;
    haptic(15);
    setFavorites((prev) => [
      { id: crypto.randomUUID(), prompt, selections, createdAt: Date.now() },
      ...prev,
    ].slice(0, 50));
  }, [prompt, selections]);

  const loadFavorite = useCallback((fav: Favorite) => {
    haptic(15);
    setSelections(fav.selections);
  }, []);

  const removeFavorite = useCallback((id: string) => {
    setFavorites((prev) => prev.filter((f) => f.id !== id));
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
  };
}
