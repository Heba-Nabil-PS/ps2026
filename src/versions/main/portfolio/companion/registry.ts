import type { CompanionModel } from "./kit";

/**
 * How a companion travels:
 * - `swim`  leaves a piece of campaign artwork (a posts item marked `emerge`) and swims the page, turning as it goes.
 * - `tumble` rises from below the screen as the story starts and spins down the page alongside it.
 */
export type Motion = "swim" | "tumble";
/** `deep`: moonlit water light; `studio`: a soft room reflected in every surface, for product-like objects. */
export type Mood = "deep" | "studio";

type Spec = { load: () => Promise<{ default: () => CompanionModel }>; motion: Motion; mood: Mood };

/** Each model is its own chunk, fetched only on the case study that shows it. */
export const companions = {
  shark: { load: () => import("./models/shark"), motion: "swim", mood: "deep" },
  sandwich: { load: () => import("./models/sandwich"), motion: "tumble", mood: "studio" },
  syringe: { load: () => import("./models/syringe"), motion: "tumble", mood: "studio" },
  cloche: { load: () => import("./models/cloche"), motion: "tumble", mood: "studio" },
  dumbbell: { load: () => import("./models/dumbbell"), motion: "tumble", mood: "studio" },
  dallah: { load: () => import("./models/dallah"), motion: "tumble", mood: "studio" },
  capsule: { load: () => import("./models/capsule"), motion: "tumble", mood: "studio" },
  hourglass: { load: () => import("./models/hourglass"), motion: "tumble", mood: "studio" },
  key: { load: () => import("./models/key"), motion: "tumble", mood: "studio" },
  sunglasses: { load: () => import("./models/sunglasses"), motion: "tumble", mood: "studio" },
  mochi: { load: () => import("./models/mochi"), motion: "tumble", mood: "studio" },
  chair: { load: () => import("./models/chair"), motion: "tumble", mood: "studio" },
  trophy: { load: () => import("./models/trophy"), motion: "tumble", mood: "studio" },
  icecream: { load: () => import("./models/icecream"), motion: "tumble", mood: "studio" },
} satisfies Record<string, Spec>;

export type CompanionKey = keyof typeof companions;

/** The object each case study carries, by project slug. A project without one simply has none. */
export const companionOf: Partial<Record<string, CompanionKey>> = {
  "texas-chicken": "sandwich",
  "sinclair-aesthetics": "syringe",
  "shark-tank-egypt": "shark",
  "million-pound-menu": "cloche",
  physiowell: "dumbbell",
  "million-riyal-menu": "dallah",
  pharco: "capsule",
  "m-squared": "hourglass",
  "elsewhere-developments": "key",
  astk: "sunglasses",
  yumochi: "mochi",
  "at-home": "chair",
  eea: "trophy",
  moishi: "icecream",
};
