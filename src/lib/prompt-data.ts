export type Token = {
  id: string;
  label: string;
  value: string;
  emoji: string;
};

export type Category = {
  id: string;
  name: string;
  emoji: string;
  /** Optional path to a custom category icon (e.g. "/icons/subject.svg"),
   *  served from public/icons/. Falls back to `emoji` when unset. */
  icon?: string;
  description: string;
  tokens: Token[];
};

export const CATEGORIES: Category[] = [
  {
    id: "subject",
    name: "Subject",
    emoji: "👤",
    description: "The main focus",
    tokens: [
      { id: "s1", label: "Warrior", value: "a mythic warrior", emoji: "⚔️" },
      { id: "s2", label: "Astronaut", value: "a lone astronaut", emoji: "👨‍🚀" },
      { id: "s3", label: "Cyborg", value: "a chrome cyborg", emoji: "🤖" },
      { id: "s4", label: "Fox", value: "a mystical fox", emoji: "🦊" },
      { id: "s5", label: "Dancer", value: "a graceful dancer", emoji: "💃" },
      { id: "s6", label: "Samurai", value: "an armored samurai", emoji: "🗡️" },
      { id: "s7", label: "Alien", value: "an ancient alien", emoji: "👽" },
      { id: "s8", label: "Witch", value: "a forest witch", emoji: "🧙‍♀️" },
    ],
  },
  {
    id: "style",
    name: "Style",
    emoji: "🎨",
    description: "Aesthetic direction",
    tokens: [
      { id: "st1", label: "Cyberpunk", value: "cyberpunk", emoji: "🌆" },
      { id: "st2", label: "Studio Ghibli", value: "studio ghibli style", emoji: "🍃" },
      { id: "st3", label: "Baroque", value: "baroque painting", emoji: "🖼️" },
      { id: "st4", label: "Vaporwave", value: "vaporwave aesthetic", emoji: "🌴" },
      { id: "st5", label: "Art Nouveau", value: "art nouveau", emoji: "🌿" },
      { id: "st6", label: "Pixel Art", value: "16-bit pixel art", emoji: "👾" },
      { id: "st7", label: "Watercolor", value: "watercolor painting", emoji: "💧" },
      { id: "st8", label: "Brutalist", value: "brutalist concrete", emoji: "🏛️" },
    ],
  },
  {
    id: "lighting",
    name: "Lighting",
    emoji: "💡",
    description: "How light behaves",
    tokens: [
      { id: "l1", label: "Cinematic", value: "cinematic lighting", emoji: "🎬" },
      { id: "l2", label: "Golden Hour", value: "golden hour", emoji: "🌅" },
      { id: "l3", label: "Neon", value: "neon glow", emoji: "💜" },
      { id: "l4", label: "Volumetric", value: "volumetric god rays", emoji: "☀️" },
      { id: "l5", label: "Moonlight", value: "moonlit", emoji: "🌙" },
      { id: "l6", label: "Studio", value: "softbox studio light", emoji: "📸" },
      { id: "l7", label: "Bioluminescent", value: "bioluminescent glow", emoji: "🪼" },
      { id: "l8", label: "Chiaroscuro", value: "chiaroscuro shadows", emoji: "🕯️" },
    ],
  },
  {
    id: "camera",
    name: "Camera",
    emoji: "📷",
    description: "Framing and lens",
    tokens: [
      { id: "c1", label: "Close-up", value: "extreme close-up", emoji: "🔍" },
      { id: "c2", label: "Wide Angle", value: "wide angle 24mm", emoji: "🌐" },
      { id: "c3", label: "Bokeh", value: "shallow depth of field, bokeh", emoji: "✨" },
      { id: "c4", label: "Aerial", value: "aerial drone shot", emoji: "🚁" },
      { id: "c5", label: "Macro", value: "macro photography", emoji: "🐜" },
      { id: "c6", label: "Fisheye", value: "fisheye lens", emoji: "🐟" },
      { id: "c7", label: "35mm Film", value: "shot on 35mm film", emoji: "🎞️" },
      { id: "c8", label: "Portrait 85mm", value: "portrait lens 85mm f1.4", emoji: "👤" },
    ],
  },
  {
    id: "mood",
    name: "Mood",
    emoji: "🌀",
    description: "Emotional tone",
    tokens: [
      { id: "m1", label: "Ethereal", value: "ethereal dreamlike", emoji: "☁️" },
      { id: "m2", label: "Ominous", value: "ominous, foreboding", emoji: "🌫️" },
      { id: "m3", label: "Serene", value: "serene and calm", emoji: "🕊️" },
      { id: "m4", label: "Epic", value: "epic grandeur", emoji: "⛰️" },
      { id: "m5", label: "Nostalgic", value: "nostalgic warmth", emoji: "📻" },
      { id: "m6", label: "Surreal", value: "surreal dreamscape", emoji: "🌀" },
      { id: "m7", label: "Melancholic", value: "melancholic solitude", emoji: "🌧️" },
      { id: "m8", label: "Playful", value: "whimsical and playful", emoji: "🎈" },
    ],
  },
  {
    id: "setting",
    name: "Setting",
    emoji: "🏔️",
    description: "Where it happens",
    tokens: [
      { id: "e1", label: "Neo-Tokyo", value: "in neo-tokyo streets", emoji: "🏙️" },
      { id: "e2", label: "Ancient Forest", value: "in an ancient forest", emoji: "🌲" },
      { id: "e3", label: "Desert", value: "in a martian desert", emoji: "🏜️" },
      { id: "e4", label: "Underwater", value: "in a coral reef", emoji: "🐠" },
      { id: "e5", label: "Space Station", value: "aboard a space station", emoji: "🛰️" },
      { id: "e6", label: "Ruins", value: "in mossy ruins", emoji: "🏛️" },
      { id: "e7", label: "Snowy Peak", value: "on a snowy peak", emoji: "🏔️" },
      { id: "e8", label: "Rooftop", value: "on a rainy rooftop", emoji: "🌃" },
    ],
  },
  {
    id: "quality",
    name: "Quality",
    emoji: "⚡",
    description: "Render fidelity",
    tokens: [
      { id: "q1", label: "8K", value: "8k ultra detailed", emoji: "🖥️" },
      { id: "q2", label: "Hyperreal", value: "hyperrealistic", emoji: "💎" },
      { id: "q3", label: "Octane", value: "octane render", emoji: "🧊" },
      { id: "q4", label: "Trending", value: "trending on artstation", emoji: "🔥" },
      { id: "q5", label: "Masterpiece", value: "masterpiece", emoji: "🏆" },
      { id: "q6", label: "Sharp Focus", value: "sharp focus", emoji: "🎯" },
    ],
  },
];

// Fixed default icons, keyed by category id — covers both the built-in
// CATEGORIES above and the personal category ids used by imported
// customCategories backups (see use-prompt-builder.ts). Not user-editable
// yet; a category's own `icon` field (once that exists in the UI) will take
// precedence over this map.
export const DEFAULT_CATEGORY_ICONS: Record<string, string> = {
  subject: "/icons/subject.svg",
  outfit: "/icons/outfit.svg",
  "scene-setting": "/icons/setting.svg",
  composition: "/icons/composition.svg",
  "pose-action": "/icons/pose.svg",
  "spatial-addons": "/icons/spacial_addon.svg",
  lighting: "/icons/lighting.svg",
  aesthetic: "/icons/aesthetic.svg",
  misc: "/icons/misc.svg",
  custom: "/icons/custom.svg",
};

// Fallback for any category id outside the sets above — e.g. a category a
// user creates by hand once that's possible.
export const NEW_CATEGORY_ICON = "/icons/new.svg";

// The built-in sample categories always show their own `emoji`, never a
// DEFAULT_CATEGORY_ICONS entry — even though a couple of their ids ("subject",
// "lighting") collide with ids from the personal catalog below. Those ids are
// shared on purpose (an imported custom category with the same id fully
// replaces its built-in counterpart, see use-prompt-builder.ts), but the
// built-in object itself — returned by `CATEGORIES.find(...)`, e.g. when
// nothing has been imported — must stay a fixed sample default regardless of
// what personal-catalog icons exist. Reference identity against CATEGORIES is
// what tells the two apart, since a same-id custom category is a distinct
// object.
export function resolveCategoryIcon(category: Category): string | undefined {
  if (category.icon) return category.icon;
  if (CATEGORIES.includes(category)) return undefined;
  return DEFAULT_CATEGORY_ICONS[category.id] ?? NEW_CATEGORY_ICON;
}
