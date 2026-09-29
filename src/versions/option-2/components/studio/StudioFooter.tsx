"use client";

import { DrawLogo } from "@/shared/brand/DrawLogo";
import { TransitionLink } from "@/versions/option-2/components/navigation/TransitionLink";
import { useSectionTheme } from "@/versions/option-2/components/studio/useSectionTheme";
import { LocalTime } from "@/versions/option-2/components/ui/LocalTime";
import { gsap, useGSAP } from "@/lib/gsap";
import { useContent } from "@/versions/option-2/i18n/LocaleProvider";
import { ArrowRight, ArrowUp } from "lucide-react";
import { useLenis } from "lenis/react";
import { useEffect, useRef, useState, type CSSProperties, type FormEvent } from "react";

export function StudioFooter() {
  const { site: siteConfig, studioHome, t } = useContent();
  const { footer } = studioHome;
  const links = [{ label: t.common.home, href: "/" }, ...siteConfig.nav, ...siteConfig.moreNav, { label: t.common.homeOption2, href: "/home-opt2" }];
  const root = useRef<HTMLElement>(null);
  const lenis = useLenis();
  const [subscribed, setSubscribed] = useState(false);
  const year = new Date().getFullYear();

  useSectionTheme(root, "dark");

  // The wordmark writes itself in once visible: the logo mark draws its line,
  // then the letters follow one by one ("PS", a beat, then "digital").
  const wordmark = useRef<HTMLParagraphElement>(null);
  const [wordmarkIn, setWordmarkIn] = useState(false);
  const [instant, setInstant] = useState(false);
  useEffect(() => {
    const el = wordmark.current;
    if (!el) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        observer.disconnect();
        setInstant(reduced);
        setWordmarkIn(true);
      },
      { threshold: 0.35 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);
  const letterStyle = (index: number): CSSProperties => {
    const delay = 1.1 + index * 0.11 + (index >= 2 ? 0.25 : 0);
    return {
      opacity: wordmarkIn ? 1 : 0,
      transform: wordmarkIn ? "none" : "translateY(30%)",
      filter: wordmarkIn ? "none" : "blur(14px)",
      transition: instant ? "none" : `opacity 0.9s ease ${delay}s, transform 1s var(--ease-expo) ${delay}s, filter 0.9s ease ${delay}s`,
    };
  };

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.from("[data-footer-col]", {
          y: 30,
          opacity: 0,
          duration: 1,
          stagger: 0.08,
          scrollTrigger: { trigger: root.current, start: "top 85%", once: true },
        });
      });
    },
    { scope: root },
  );

  // Placeholder: wire this to your newsletter provider.
  const onSubscribe = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubscribed(true);
  };

  return (
    <footer ref={root} className="relative overflow-hidden bg-[#07121f] px-4 pt-10 text-[#f2f3f5] md:px-8 md:pt-14">
      <div className="grid grid-cols-2 gap-x-6 gap-y-14 border-t border-white/15 pt-14 md:grid-cols-12">
        <div data-footer-col className="col-span-2 md:col-span-5">
          <p className="text-2xl font-medium tracking-[-0.03em] md:text-3xl">{footer.newsletter.title}</p>
          <p className="mt-3 max-w-sm text-sm leading-relaxed text-white/55">{footer.newsletter.body}</p>
          {subscribed ? (
            <p role="status" className="mt-8 text-sm text-[#88bbd8]">
              {t.studio.subscribed}
            </p>
          ) : (
            <form onSubmit={onSubscribe} className="mt-8 flex max-w-md items-center gap-2 rounded-full border border-white/20 p-1.5 ps-5 focus-within:border-[#88bbd8]">
              <label htmlFor="footer-email" className="sr-only">
                {t.studio.emailAddress}
              </label>
              <input
                id="footer-email"
                type="email"
                required
                placeholder={footer.newsletter.placeholder}
                className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-white/40"
              />
              <button
                type="submit"
                aria-label={t.studio.subscribe}
                className="grid size-10 shrink-0 place-items-center rounded-full bg-[#f2f3f5] text-[#07121f] transition-colors hover:bg-[#88bbd8]"
              >
                <ArrowRight aria-hidden className="size-4" />
              </button>
            </form>
          )}
        </div>

        <nav data-footer-col aria-label={t.common.footer} className="md:col-span-2 md:col-start-7">
          <p className="text-label mb-5 text-white/45">{t.common.sitemap}</p>
          <ul className="flex flex-col gap-2 text-sm">
            {links.map((item) => (
              <li key={item.href}>
                <TransitionLink href={item.href} transitionLabel={item.label} className="transition-colors hover:text-[#88bbd8]">
                  {item.label}
                </TransitionLink>
              </li>
            ))}
          </ul>
        </nav>

        <div data-footer-col className="md:col-span-2">
          <p className="text-label mb-5 text-white/45">{t.common.offices}</p>
          <ul className="flex flex-col gap-4 text-sm">
            {siteConfig.offices.map((office) => (
              <li key={office.city}>
                <p>{office.city}</p>
                <p className="mt-1 leading-relaxed text-white/50">{office.address}</p>
              </li>
            ))}
          </ul>
        </div>

        <div data-footer-col className="col-span-2 md:col-span-2">
          <p className="text-label mb-5 text-white/45">{t.common.contact}</p>
          <a href={`mailto:${siteConfig.email}`} className="text-sm transition-colors hover:text-[#88bbd8]">
            {siteConfig.email}
          </a>
          <p className="mt-4 flex flex-col gap-1 text-sm text-white/50">
            <span>{siteConfig.location}</span>
            <LocalTime className="tabular-nums" />
          </p>
        </div>
      </div>

      <p
        ref={wordmark}
        data-wordmark
        aria-hidden
        dir="ltr"
        className="mt-16 flex select-none items-start gap-[0.08em] pb-[0.24em] font-medium leading-[1] tracking-[-0.07em] text-[15vw] md:mt-20"
      >
        {/* No clipping box: the padding leaves room for the "g" descender. */}
        <span className="mt-[0.06em] inline-flex shrink-0 tracking-normal">
          <DrawLogo variant="mark" trigger="view" title="" className="h-[0.94em] w-auto text-[#f2f3f5]" />
        </span>
        {siteConfig.name.split("").map((char, index) => (
          <span key={index} data-letter className="inline-block will-change-transform" style={letterStyle(index)}>
            {char}
          </span>
        ))}
      </p>

      {/* Sits at the end edge so the fixed version pill (bottom start corner) never covers it. */}
      <div className="text-label flex flex-wrap items-center justify-end gap-x-10 gap-y-3 border-t border-white/15 py-6 text-white/45">
        <p>
          © {year} {siteConfig.name}. {t.common.rightsReserved}
        </p>
        <button
          type="button"
          onClick={() => (lenis ? lenis.scrollTo(0, { duration: 2 }) : window.scrollTo({ top: 0, behavior: "smooth" }))}
          className="group flex items-center gap-2 transition-colors hover:text-white"
        >
          {t.common.backToTop}
          <ArrowUp aria-hidden className="size-3.5 transition-transform duration-500 group-hover:-translate-y-1" />
        </button>
      </div>
    </footer>
  );
}
