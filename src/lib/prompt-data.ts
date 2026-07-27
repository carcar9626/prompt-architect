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
   *  served from public/icons/. See `resolveCategoryIcon` for the fallback
   *  chain — `emoji` is kept on the type for backup-export compatibility but
   *  is no longer used to render the category icon itself. */
  icon?: string;
  description: string;
  tokens: Token[];
};

// This is the real 10-category schema — not a placeholder demo set — kept in
// sync with the personal-catalog backup shape (see
// use-prompt-builder.ts/BackupData and [[category-schema-contract]] memory).
// Token content here is generic sample data only; personal catalog content
// stays out of this public repo and arrives via Import instead.
export const CATEGORIES: Category[] = [
  {
    id: "subject",
    name: "Subject",
    emoji: "👤",
    description: "Character identity & build",
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
    id: "outfit",
    name: "Outfit",
    emoji: "👗",
    description: "Clothing & attire",
    tokens: [
      { id: "o1", label: "Streetwear", value: "casual streetwear", emoji: "🧢" },
      { id: "o2", label: "Business Suit", value: "a tailored business suit", emoji: "🕴️" },
      { id: "o3", label: "Evening Gown", value: "an elegant evening gown", emoji: "👘" },
      { id: "o4", label: "Battle Armor", value: "ornate battle armor", emoji: "🛡️" },
      { id: "o5", label: "Kimono", value: "a traditional kimono", emoji: "🎎" },
      { id: "o6", label: "Leather Jacket", value: "a worn leather jacket", emoji: "🧥" },
      { id: "o7", label: "Summer Dress", value: "a light summer dress", emoji: "👒" },
      { id: "o8", label: "Sportswear", value: "athletic sportswear", emoji: "👟" },
    ],
  },
  {
    id: "pose-action",
    name: "Pose",
    emoji: "🕺",
    description: "Body position & action",
    tokens: [
      { id: "p1", label: "Standing Tall", value: "standing tall, confident posture", emoji: "🧍" },
      { id: "p2", label: "Mid-Stride", value: "walking mid-stride", emoji: "🚶" },
      { id: "p3", label: "Seated", value: "seated, relaxed pose", emoji: "🪑" },
      { id: "p4", label: "Leaning", value: "leaning against a wall", emoji: "🧱" },
      { id: "p5", label: "Dynamic Action", value: "mid-action, dynamic pose", emoji: "💥" },
      { id: "p6", label: "Crouching", value: "crouching low", emoji: "🐆" },
      { id: "p7", label: "Reaching Up", value: "reaching upward", emoji: "🙆" },
      { id: "p8", label: "Reclining", value: "reclining pose", emoji: "🛋️" },
    ],
  },
  {
    id: "scene-setting",
    name: "Setting",
    emoji: "🏞️",
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
    id: "composition",
    name: "Composition",
    emoji: "🎬",
    description: "Framing, lens & camera angle",
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
    id: "spatial-addons",
    name: "Spatial Add-ons",
    emoji: "✨",
    description: "Scene-fit & rendering instructions",
    tokens: [
      {
        id: "a1",
        label: "Seamless Blend",
        value: "seamlessly blended into the scene",
        emoji: "🧩",
      },
      {
        id: "a2",
        label: "Depth Matched",
        value: "depth and scale matched to the scene",
        emoji: "📐",
      },
      {
        id: "a3",
        label: "Soft Contact Shadows",
        value: "soft contact shadows grounding the subject",
        emoji: "🌗",
      },
      {
        id: "a4",
        label: "Color Harmony",
        value: "color-harmonized with the environment",
        emoji: "🎨",
      },
    ],
  },
  {
    id: "lighting",
    name: "Lighting",
    emoji: "💡",
    description: "Time of day & mood",
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
    id: "aesthetic",
    name: "Aesthetic",
    emoji: "🎨",
    description: "Overall render style & finish",
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
    id: "misc",
    name: "Misc",
    emoji: "🗂️",
    description: "One-off modifiers",
    tokens: [
      { id: "q1", label: "8K", value: "8k ultra detailed", emoji: "🖥️" },
      { id: "q2", label: "Hyperreal", value: "hyperrealistic", emoji: "💎" },
      { id: "q3", label: "Octane", value: "octane render", emoji: "🧊" },
      { id: "q4", label: "Trending", value: "trending on artstation", emoji: "🔥" },
      { id: "q5", label: "Masterpiece", value: "masterpiece", emoji: "🏆" },
      { id: "q6", label: "Sharp Focus", value: "sharp focus", emoji: "🎯" },
    ],
  },
  {
    id: "custom",
    name: "Custom",
    emoji: "🔧",
    description: "Saved presets",
    tokens: [],
  },
];

// Fixed default icons, keyed by category id — the built-in CATEGORIES above
// use these same ids 1:1, and imported customCategories backups reuse the
// same ids too. Not user-editable yet; a category's own `icon` field (once
// that exists in the UI) takes precedence over this map.
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

// Fallback for any category id outside the set above — e.g. a category the
// user creates by hand. Not customizable yet.
export const NEW_CATEGORY_ICON = "/icons/new.svg";

// Always resolves to one of the SVG files in public/icons/ — with or without
// an import — never an emoji fallback, for any of the 10 known category ids.
export function resolveCategoryIcon(category: Category): string {
  return category.icon ?? DEFAULT_CATEGORY_ICONS[category.id] ?? NEW_CATEGORY_ICON;
}
