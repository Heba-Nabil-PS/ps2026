"use client";

import { TransitionLink } from "@/components/navigation/TransitionLink";
import { useSectionTheme } from "@/components/studio/useSectionTheme";
import { LocalTime } from "@/components/ui/LocalTime";
import { gsap, useGSAP } from "@/lib/gsap";
import { useContent } from "@/i18n/LocaleProvider";
import { ArrowRight, ArrowUp } from "lucide-react";
import { useLenis } from "lenis/react";
import { useRef, useState, type FormEvent } from "react";

export function StudioFooter() {
  const { site: siteConfig, studioHome, t } = useContent();
  const { footer } = studioHome;
  const links = [{ label: t.common.home, href: "/" }, ...siteConfig.nav, ...siteConfig.moreNav, { label: t.common.homeOption2, href: "/home-opt2" }];
  const root = useRef<HTMLElement>(null);
  const lenis = useLenis();
  const [subscribed, setSubscribed] = useState(false);
  const year = new Date().getFullYear();

  useSectionTheme(root, "dark");

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.from("[data-wordmark] span", {
          yPercent: 100,
          duration: 1.4,
          ease: "expo.out",
          stagger: 0.04,
          scrollTrigger: { trigger: "[data-wordmark]", start: "top 95%", once: true },
        });
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
    <footer ref={root} className="relative overflow-hidden bg-[#0b0c0e] px-4 pt-20 text-[#f2f3f5] md:px-8 md:pt-28">
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
                className="grid size-10 shrink-0 place-items-center rounded-full bg-[#f2f3f5] text-[#0b0c0e] transition-colors hover:bg-[#88bbd8]"
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
        data-wordmark
        aria-hidden
        dir="ltr"
        className="mt-20 flex select-none overflow-hidden pb-[0.02em] font-medium tracking-[-0.07em] text-[21vw] md:mt-28 leading-[1]"
      >
        {siteConfig.name.split("").map((char, index) => (
          <span key={index} className="inline-block">
            {char}
          </span>
        ))}
      </p>

      <div className="text-label flex flex-wrap items-center justify-between gap-4 border-t border-white/15 py-6 text-white/45">
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
