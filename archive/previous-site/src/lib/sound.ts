/** Replace these files (e.g. with .mp3) to change the sound palette. */
export const SOUND_SOURCES = {
  hover: "/audio/hover.wav",
  click: "/audio/click.wav",
  transition: "/audio/transition.wav",
} as const;

/** Long ambient bed — never preloaded; fetched only once sound is switched on. */
export const AMBIENT_SOURCE = "/audio/ambient.wav";

export const SOUND_VOLUME: Record<SoundName, number> = {
  hover: 0.12,
  click: 0.2,
  transition: 0.22,
};

export const AMBIENT_VOLUME = 0.35;

export const SOUND_STORAGE_KEY = "psd:sound";

export type SoundName = keyof typeof SOUND_SOURCES;
