"use client";

import { gsap, useGSAP } from "@/lib/gsap";
import { DrawableLogo } from "@/shared/brand/DrawableLogo";
import { introCarriesMark, onIntroReveal } from "@/versions/main/intro/intro-signal";
import { replayOnReturn } from "@/versions/main/motion/StretchHeading";
import { motionGate } from "@/versions/main/motion/useMotionGate";
import { PULL, StretchLetter, stretchLetterOf, stretchTo } from "@/versions/main/motion/StretchLetter";
import { FlowField } from "@/versions/main/portfolio/ui/FlowField";
import { AppLink } from "@/versions/main/ui/AppLink";
import { PointerLight } from "@/versions/main/ui/PointerLight";
import { useCopy } from "@/versions/main/use-copy";
import Image from "next/image";
import { useRef } from "react";

/**
 * Home hero — the first screen after the intro opens.
 *
 * Centred: the PSdigital mark drawing itself as if by one pen, then the brand line revealed word by word from below its baseline, over the brand
 * cover art with the identity's flowing lines. The entrance waits for the intro (see
 * intro-signal) so the two play as one sequence.
 *
 * The section is one screen. Scrolling it away, the type lifts away while the page's
 * thread is pulled out of the mark's stem (LogoThread), and the letters step aside to let
 * it through (each is a `[data-hero-char]`; Arabic letters join, so there each word moves
 * whole). With reduced motion or without JavaScript everything is simply there.
 */
export function HeroSection() {
  const { copy, locale, site } = useCopy();
  const hero = copy.home.hero;
  const isAr = locale === "ar";
  const root = useRef<HTMLElement>(null);
  /** The headline letter that stretches, as in every banner title (see StretchLetter). */
  const letter = isAr ? undefined : stretchLetterOf(hero.title.join(" "));

  useGSAP(
    () => {
      const section = root.current;
      if (!section) return;
      const letters = section.querySelectorAll<HTMLElement>("[data-stretch-letter]");

      return motionGate(
        () => {
          const entrance = gsap.timeline({ paused: true });
          // When the intro plays, its logo flies in and becomes the mark (see IntroAnimation); otherwise the mark draws itself
          // in the intro's pen order: the loop, the stem from the junction, then the thin inner line.
          if (!introCarriesMark()) {
            entrance
              .fromTo("[data-hero-mark]", { opacity: 0, scale: 0.92 }, { opacity: 1, scale: 1, duration: 1.6, ease: "expo.out" }, 0)
              .fromTo("[data-hero-mark] [data-draw='main']", { strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: 1.5, ease: "power2.inOut" }, 0)
              .fromTo("[data-hero-mark] [data-draw='stem']", { strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: 0.55, ease: "power2.inOut" }, 0.5)
              .fromTo("[data-hero-mark] [data-draw='inner']", { strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: 1.2, ease: "power2.inOut" }, 0.85);
          }
          // y is pinned to 0: GSAP would otherwise read the CSS starting offset as pixels and keep it.
          entrance.fromTo(
            "[data-hero-word]",
            { y: 0, yPercent: 110, opacity: 0 },
            { y: 0, yPercent: 0, opacity: 1, duration: 1.2, ease: "power4.out", stagger: 0.09 },
            0.25,
          );
          // Then the awards settle in beneath the line, one after another.
          entrance.fromTo(
            "[data-hero-award]",
            { y: 16, opacity: 0 },
            { y: 0, opacity: 1, duration: 0.9, ease: "power3.out", stagger: 0.08 },
            0.9,
          );
          // Once its word has landed, the letter pulls out long.
          const to = stretchTo("[data-hero-line]");
          if (letters.length) entrance.to(letters, { "--x": to, ...PULL }, 1.1);
          // Each time the title is scrolled back to, its words rise and the letter pulls out again, as they first did.
          const replay = gsap
            .timeline({ paused: true })
            .fromTo(
              "[data-hero-word]",
              { y: 0, yPercent: 110, opacity: 0 },
              { y: 0, yPercent: 0, opacity: 1, duration: 1.2, ease: "power4.out", stagger: 0.09, immediateRender: false },
              0,
            );
          if (letters.length) replay.set(letters, { "--x": 0 }, 0).to(letters, { "--x": to, ...PULL }, 0.9);
          replayOnReturn(section.querySelector("[data-hero-title]")!, () => {
            entrance.progress(1);
            replay.restart();
          });

          // Scrolling away: the type lifts off. The mark stays where it stands: the page's thread is pulled out of its stem (LogoThread).
          const content = section.querySelector("[data-hero-content]") ?? section;
          gsap
            .timeline({ defaults: { ease: "none" }, scrollTrigger: { trigger: content, start: "top top", end: "bottom top", scrub: 0.8 } })
            .to("[data-hero-title]", { yPercent: -22, duration: 1 }, 0)
            .to("[data-hero-title]", { opacity: 0, duration: 0.45 }, 0.3)
            .to("[data-hero-awards]", { yPercent: -40, opacity: 0, duration: 0.4 }, 0.15);

          return onIntroReveal(() => entrance.play());
        },
        () => {
          if (letters.length) gsap.set(letters, { "--x": stretchTo("[data-hero-line]") });
        },
      );
    },
    { scope: root },
  );

  return (
    <section ref={root}>
      <div data-hero-content className="gutter relative flex min-h-svh flex-col items-center justify-center overflow-hidden pb-20 pt-28 text-center md:pt-32">
        {/* The brand cover art, sunk into the navy, with the identity's flowing lines over it (as on option 2's home).
            Not isolated: the page's thread (LogoThread) runs between these layers and the type.
            Both layers fade out towards the bottom, so the hero melts into the page's backdrop instead of ending on a hard edge. */}
        <div aria-hidden className="absolute inset-0 -z-20 [mask-image:linear-gradient(to_bottom,black_55%,transparent)]">
          <Image src="/images/site/cover.webp" alt="" fill priority sizes="100vw" className="object-cover opacity-40" />
          <div className="absolute inset-0 bg-linear-to-b from-bg/70 to-bg/60" />
          {/* The same sky light as the closing CTA, following the pointer across the hero. */}
          <PointerLight className="opacity-60" rest={{ x: 50, y: 35 }} />
        </div>
        <FlowField className="pointer-events-none absolute inset-0 -z-10 h-full w-full [mask-image:linear-gradient(to_bottom,black_60%,transparent_95%)]" />

        {/* The mark. Decorative here: the header carries the named logo. */}
        <div data-hero-mark aria-hidden className="relative mb-7 w-[clamp(6.5rem,min(30vw,22svh),15rem)] md:mb-9">
          <div data-hero-mark-inner className="relative will-change-transform">
            {/* Drawn by the entrance; without JavaScript or with reduced motion its strokes stay full and it is simply there. */}
            <DrawableLogo
              variant="mark"
              className="block h-auto w-full text-paper drop-shadow-[0_0_30px_rgb(140_196_230/0.28)]"
              renderStroke={(stroke) => <path {...stroke} pathLength={1} strokeDasharray="1 2" />}
            />
          </div>
        </div>

        {/* The display face runs wide: on phones the size follows the screen so the longest word still fits. */}
        <h1
          data-hero-title
          aria-label={hero.title.join(" ")}
          className="stretch max-w-[16ch] text-[clamp(min(2.2rem,8.6vw),5.8vw,7rem)] leading-[0.92] ar:text-[clamp(2rem,4.9vw,6rem)]"
        >
          {hero.title.map((line, lineIndex) => (
            <span key={line} data-hero-line className={lineIndex === 1 ? "block text-sky ar:inline" : "block ar:inline"}>
              {/* Arabic sets the two lines as one: the space a line break gave the Latin. */}
              {lineIndex > 0 ? " " : null}
              {line.split(" ").map((word, wordIndex) => (
                <span key={`${word}-${wordIndex}`}>
                  {wordIndex > 0 ? " " : null}
                  {/* The clip lets each word rise from below its own baseline; it is open at the sides, where letters step aside for the thread. */}
                  <span className="inline-block pb-[0.1em] align-top [clip-path:inset(-0.6em_-3em_0_-3em)] ar:pb-[0.3em]">
                    <span data-hero-word className="inline-block whitespace-nowrap will-change-transform">
                      {isAr ? (
                        <span data-hero-char className="inline-block">
                          {word}
                        </span>
                      ) : (
                        Array.from(word, (char, at) => (
                          <span key={at} data-hero-char className="inline-block">
                            {char.toLowerCase() === letter ? <StretchLetter>{char}</StretchLetter> : char}
                          </span>
                        ))
                      )}
                    </span>
                  </span>
                </span>
              ))}
            </span>
          ))}
        </h1>

        {/* Proof under the promise: the awards and the Meta partnership, each badge on its own plate (third-party marks keep
            their colours). Every chip leads to the full story on About. */}
        <ul data-hero-awards aria-label={copy.footer.awards} className="mt-10 flex flex-nowrap items-center justify-center gap-3 md:mt-14">
          {site.awards.map((award) => (
            <li key={award.file} data-hero-award>
              <AppLink
                href="/about#awards"
                transitionLabel={copy.meta.pages.about.title}
                aria-label={`${award.title}, ${award.issuer}`}
                title={`${award.title}, ${award.issuer}`}
                className="flex h-16 w-28 items-center justify-center overflow-hidden rounded-md p-1.5 transition-[translate] duration-500 ease-expo hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-sky"
                style={{ backgroundColor: award.surface }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element -- third-party SVG badges, served as they are */}
                <img src={`/images/awards/${award.file}.svg`} alt="" className="h-full w-full object-contain" />
              </AppLink>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
