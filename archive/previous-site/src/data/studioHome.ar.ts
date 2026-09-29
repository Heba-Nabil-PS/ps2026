/** Arabic copy of the immersive home content — media is shared with `studioHome`. */

import { studioHome, type StudioHome } from "@/data/studioHome";
import { siteConfigAr } from "@/lib/site.ar";

export const studioHomeAr: StudioHome = {
  hero: {
    title: ["تدفّق متصل،", "وإمكانات", "بلا حدود"],
    intro:
      "PSdigital استوديو رقمي متكامل الخدمات للشرق الأوسط وشمال أفريقيا وما بعدها. نمزج الاستراتيجية والتصميم والتقنية والحركة لنصنع علامات تجارية لا تُنسى.",
    scrollHint: "مرّر للاستكشاف",
    location: siteConfigAr.location,
  },

  intro: {
    label: "الاستوديو",
    statement:
      "نحن فريق من الاستراتيجيين والمصممين والمهندسين ورواة القصص، نبني العلامات التجارية والمنصات والحملات من البداية إلى النهاية — من الفكرة الأولى حتى آخر بكسل، وكلها تحت سقف واحد.",
    cta: { label: "تعرّف على الوكالة", href: "/about" },
  },

  reel: {
    label: "العرض المرئي",
    year: studioHome.reel.year,
    video: studioHome.reel.video,
    slides: [
      { image: studioHome.reel.slides[0].image, alt: "حملة Texas Chicken" },
      { image: studioHome.reel.slides[1].image, alt: "حملة Sinclair Aesthetics" },
      { image: studioHome.reel.slides[2].image, alt: "Shark Tank مصر" },
      { image: studioHome.reel.slides[3].image, alt: "حملة Physiowell" },
    ],
  },

  work: {
    title: ["أعمال", "مختارة"],
    body: "مجموعة من الشراكات التي تلتقي فيها الاستراتيجية والحِرفة والأداء — أُطلقت لعلامات تجارية في ستة عشر سوقًا.",
    cta: { label: "شاهد كل المشاريع", href: "/portfolio" },
  },

  marquee: {
    rows: [siteConfigAr.services.slice(0, 3).map((service) => service.title), siteConfigAr.services.slice(3).map((service) => service.title)],
  },

  capabilities: {
    label: "ماذا نقدّم",
    title: ["استوديو واحد.", "كل التخصصات.", "بلا وسطاء."],
    services: siteConfigAr.services.map((service, index) => ({
      ...service,
      image: studioHome.capabilities.services[index]?.image ?? "/images/og.jpg",
    })),
    stats: siteConfigAr.stats,
  },

  cta: {
    label: "لديك مشروع في ذهنك؟",
    title: ["لنصنع", "معًا شيئًا", "لا يُنسى"],
    button: "ابدأ مشروعك",
    email: studioHome.cta.email,
  },

  footer: {
    newsletter: {
      title: "ابقَ على اطّلاع",
      body: "رسائل متفرقة عن أعمالنا الجديدة وإطلاقاتنا وما نتعلّمه.",
      placeholder: "بريدك الإلكتروني",
    },
  },
};
