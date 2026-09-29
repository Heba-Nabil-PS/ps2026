import { AMBIENT_SOURCE, AMBIENT_VOLUME, SOUND_SOURCES, SOUND_STORAGE_KEY, SOUND_VOLUME, type SoundName } from "@/versions/option-2/audio/sound";

type Listener = () => void;

/**
 * Framework-agnostic sound system (HTML5 Audio).
 *
 * - Muted by default; the preference persists in localStorage.
 * - Small UI sounds are fetched lazily on first use after opting in; the ambient bed only when requested.
 * - Browsers block audio before a user gesture, so ambient playback waits for the first interaction.
 * - Missing files or blocked playback never throw.
 */
class SoundManager {
  private enabled = false;
  private hydrated = false;
  private masterVolume = 1;
  private listeners = new Set<Listener>();
  private cache = new Map<SoundName, HTMLAudioElement>();
  private missing = new Set<string>();
  private lastHover = 0;
  private ambient: HTMLAudioElement | null = null;
  private ambientWanted = false;
  private fadeFrame = 0;
  private unlocked = false;

  private hydrate() {
    if (this.hydrated || typeof window === "undefined") return;
    this.hydrated = true;
    try {
      this.enabled = window.localStorage.getItem(SOUND_STORAGE_KEY) === "on";
    } catch {
      this.enabled = false;
    }
    window.addEventListener("storage", (event) => {
      if (event.key !== SOUND_STORAGE_KEY) return;
      this.setEnabled(event.newValue === "on", false);
    });
    const unlock = () => {
      this.unlocked = true;
      window.removeEventListener("pointerdown", unlock);
      window.removeEventListener("keydown", unlock);
      this.syncAmbient();
    };
    window.addEventListener("pointerdown", unlock, { passive: true });
    window.addEventListener("keydown", unlock);
  }

  subscribe = (listener: Listener) => {
    this.hydrate();
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  };

  isEnabled = () => {
    this.hydrate();
    return this.enabled;
  };

  toggle = () => {
    this.hydrate();
    // Toggling is itself a user gesture.
    this.unlocked = true;
    this.setEnabled(!this.enabled, true);
    if (this.enabled) this.playClick();
  };

  setVolume = (volume: number) => {
    this.masterVolume = Math.min(1, Math.max(0, volume));
    if (this.ambient && !this.ambient.paused) this.ambient.volume = AMBIENT_VOLUME * this.masterVolume;
  };

  playHover = () => {
    const now = performance.now();
    if (now - this.lastHover < 90) return;
    this.lastHover = now;
    this.play("hover");
  };

  playClick = () => this.play("click");

  playTransition = () => this.play("transition");

  play = (name: SoundName) => {
    if (!this.isEnabled()) return;
    const src = SOUND_SOURCES[name];
    if (this.missing.has(src)) return;
    let audio = this.cache.get(name);
    if (!audio) {
      audio = this.createAudio(src);
      this.cache.set(name, audio);
    }
    audio.volume = SOUND_VOLUME[name] * this.masterVolume;
    audio.currentTime = 0;
    audio.play().catch(() => {});
  };

  /** Request the ambient bed (e.g. while an immersive page is mounted). */
  startAmbient = () => {
    this.hydrate();
    this.ambientWanted = true;
    this.syncAmbient();
  };

  stopAmbient = () => {
    this.ambientWanted = false;
    this.syncAmbient();
  };

  private setEnabled(next: boolean, persist: boolean) {
    this.enabled = next;
    if (persist) {
      try {
        window.localStorage.setItem(SOUND_STORAGE_KEY, next ? "on" : "off");
      } catch {
        /* Private mode — preference just won't persist. */
      }
    }
    this.syncAmbient();
    this.listeners.forEach((listener) => listener());
  }

  private createAudio(src: string) {
    const audio = new Audio(src);
    audio.preload = "auto";
    audio.addEventListener("error", () => this.missing.add(src), { once: true });
    return audio;
  }

  private syncAmbient() {
    const shouldPlay = this.enabled && this.ambientWanted && this.unlocked && !this.missing.has(AMBIENT_SOURCE);
    if (shouldPlay) {
      if (!this.ambient) {
        this.ambient = this.createAudio(AMBIENT_SOURCE);
        this.ambient.loop = true;
        this.ambient.volume = 0;
      }
      this.ambient.play().catch(() => {});
      this.fadeAmbient(AMBIENT_VOLUME * this.masterVolume);
    } else if (this.ambient && !this.ambient.paused) {
      this.fadeAmbient(0, () => this.ambient?.pause());
    }
  }

  private fadeAmbient(target: number, done?: () => void) {
    const audio = this.ambient;
    if (!audio) return;
    cancelAnimationFrame(this.fadeFrame);
    const from = audio.volume;
    const start = performance.now();
    const step = (now: number) => {
      // rAF timestamps can predate `start`, so clamp both progress and volume into range.
      const t = Math.min(1, Math.max(0, (now - start) / 1200));
      audio.volume = Math.min(1, Math.max(0, from + (target - from) * t));
      if (t < 1) this.fadeFrame = requestAnimationFrame(step);
      else done?.();
    };
    this.fadeFrame = requestAnimationFrame(step);
  }
}

export const soundManager = new SoundManager();
