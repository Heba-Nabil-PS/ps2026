/** Arabic copy of the /contact content. */

import { contactPage, type ContactPage } from "@/versions/option-2/data/contact";
import { siteConfigAr } from "@/lib/site.ar";

export const contactPageAr: ContactPage = {
  hero: {
    label: "تواصل معنا",
    title: ["لنتحدث", "عن خطوتك", "القادمة"],
    intro:
      "أخبرنا عن علامتك التجارية أو الإطلاق أو التحدي الذي تعمل عليه. يقرأ كل استفسار استراتيجيٌّ ومسؤول إبداعي، ونردّ خلال يومي عمل.",
    meta: siteConfigAr.location,
  },
  form: {
    label: "ابدأ مشروعك",
    title: "أخبرنا بما تبنيه",
    fields: {
      name: { label: "اسمك", placeholder: "الاسم الكامل" },
      email: { label: "البريد الإلكتروني", placeholder: "you@company.com" },
      company: { label: "الشركة", placeholder: "العلامة التجارية أو المؤسسة" },
      message: { label: "المشروع", placeholder: "ما الذي تسعى إلى تحقيقه، ومتى؟" },
    },
    interests: { label: "أنا مهتم بـ", options: siteConfigAr.services.map((service) => service.title) },
    budgets: {
      label: "نطاق الميزانية",
      options: ["أقل من 10 آلاف دولار", "10 – 25 ألف دولار", "25 – 50 ألف دولار", "50 – 100 ألف دولار", "أكثر من 100 ألف دولار"],
    },
    submit: "أرسل الاستفسار",
    sending: "جارٍ فتح بريدك الإلكتروني…",
    success: {
      title: "شكرًا لك — استفسارك في طريقه إلينا.",
      body: "من المفترض أن يكون تطبيق البريد قد فُتح والتفاصيل مكتملة. إن لم يحدث ذلك، راسلنا مباشرة.",
    },
    privacy: "نستخدم بياناتك فقط للرد على هذا الاستفسار.",
  },
  details: {
    label: "تواصل مباشر",
    nextSteps: {
      title: "ماذا يحدث بعد ذلك",
      steps: [
        { title: "نقرأ طلبك", body: "يراجع استراتيجيٌّ ومسؤول إبداعي موجزك خلال يومي عمل." },
        { title: "نتحدث", body: "مكالمة مدتها 30 دقيقة لفهم أهدافك وأسواقك وتوقيتك." },
        { title: "نقدّم مقترحنا", body: "خطة محددة النطاق تشمل الفريق والجدول الزمني والاستثمار، عادةً خلال أسبوع." },
      ],
    },
  },
  offices: {
    label: "الاستوديوهات",
    title: ["مدينتان،", "وفريق واحد"],
    image: { src: contactPage.offices.image.src, alt: "استوديو PSdigital" },
  },
  cta: {
    label: "تفضّل الكتابة؟",
    title: ["قل", "مرحبًا"],
  },
  email: {
    subject: "استفسار عن مشروع",
    name: "الاسم",
    email: "البريد الإلكتروني",
    company: "الشركة",
    interests: "مهتم بـ",
    budget: "الميزانية",
    project: "المشروع",
    separator: "، ",
  },
};
