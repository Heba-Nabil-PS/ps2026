/**
 * Synthesises subtle UI sounds and a seamless ambient loop as 16-bit mono WAV files.
 * Run: node scripts/generate-sounds.mjs
 * Swap for your own files (e.g. .mp3) and update SOUND_SOURCES in src/lib/sound.ts.
 */
import { writeFile, mkdir } from "node:fs/promises";
import path from "node:path";

const OUT = path.resolve("public/audio");

function wav(samples, rate) {
  const data = Buffer.alloc(samples.length * 2);
  samples.forEach((s, i) => data.writeInt16LE(Math.round(Math.max(-1, Math.min(1, s)) * 32767), i * 2));
  const header = Buffer.alloc(44);
  header.write("RIFF", 0);
  header.writeUInt32LE(36 + data.length, 4);
  header.write("WAVE", 8);
  header.write("fmt ", 12);
  header.writeUInt32LE(16, 16);
  header.writeUInt16LE(1, 20);
  header.writeUInt16LE(1, 22);
  header.writeUInt32LE(rate, 24);
  header.writeUInt32LE(rate * 2, 28);
  header.writeUInt16LE(2, 32);
  header.writeUInt16LE(16, 34);
  header.write("data", 36);
  header.writeUInt32LE(data.length, 40);
  return Buffer.concat([header, data]);
}

function synth(duration, rate, fn) {
  const n = Math.floor(rate * duration);
  return Array.from({ length: n }, (_, i) => fn(i / rate, i / n));
}

const env = (p, attack = 0.02) => (p < attack ? p / attack : Math.pow(1 - (p - attack) / (1 - attack), 3));
const TAU = Math.PI * 2;

const LOOP = 8;
// Every frequency is a multiple of 1/LOOP Hz so the waveform wraps seamlessly.
const chord = [110, 164.75, 220, 277.25, 329.625];

const sounds = {
  // Soft high "tick"
  hover: [22050, synth(0.07, 22050, (t, p) => Math.sin(TAU * 2200 * t) * env(p, 0.05) * 0.35)],
  // Short two-tone click
  click: [22050, synth(0.12, 22050, (t, p) => (Math.sin(TAU * 880 * t) * 0.6 + Math.sin(TAU * 1320 * t) * 0.3) * env(p, 0.01) * 0.5)],
  // Airy downward sweep
  transition: [
    22050,
    synth(0.45, 22050, (t, p) => {
      const f = 520 - 300 * p;
      const noise = (Math.random() * 2 - 1) * 0.08;
      return (Math.sin(TAU * f * t) * 0.4 + noise) * env(p, 0.15) * 0.45;
    }),
  ],
  // Warm, slowly breathing pad
  ambient: [
    16000,
    synth(LOOP, 16000, (t) =>
      chord.reduce((sum, f, i) => {
        const breathe = 0.55 + 0.45 * Math.sin(TAU * (t / LOOP) * (i % 2 ? 1 : 2) + i);
        return sum + Math.sin(TAU * f * t) * breathe * (0.05 / (1 + i * 0.35));
      }, 0),
    ),
  ],
};

await mkdir(OUT, { recursive: true });
for (const [name, [rate, samples]] of Object.entries(sounds)) {
  await writeFile(path.join(OUT, `${name}.wav`), wav(samples, rate));
  console.log("✓", `${name}.wav`);
}
