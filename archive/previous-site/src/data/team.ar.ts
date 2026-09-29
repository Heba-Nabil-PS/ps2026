/** Arabic copy of the /team content — same images and order as `teamPage`. */

import { teamPage, type TeamPage } from "@/data/team";
import { siteConfigAr } from "@/lib/site.ar";

const [strategy, design, motion, content, development, uiux, performance] = teamPage.disciplines.items;

export const teamPageAr: TeamPage = {
  hero: {
    ...teamPage.hero,
    label: "الفريق",
    title: ["أشخاص", "يدفعون", "العلامات للأمام"],
    intro: "استراتيجيون ومصممون ومهندسون وكتّاب ومنتجون تحت سقف واحد في الإسكندرية ودبي — الأشخاص أنفسهم من الفكرة الأولى حتى آخر بكسل.",
    meta: siteConfigAr.location,
    action: "تعرّف على القادة",
    hello: "قل مرحبًا",
  },
  manifesto: {
    ...teamPage.manifesto,
    label: "كيف بُني فريقنا",
    lines: ["غرفة واحدة.", "كل التخصصات.", "بلا تسليم."],
  },
  lead: {
    label: "القيادة",
    quote: "أسّسنا PSdigital ليكون من يفوز بالموجز هو نفسه من يسلّمه. لا شيء يضيع حين لا يضطر أحد إلى تسليم العمل لغيره.",
    alt: "صورة الرئيس التنفيذي لـ PSdigital",
  },
  crew: {
    ...teamPage.crew,
    label: "القادة",
    title: ["متخصصون،", "لا عموميون"],
    intro: "الأشخاص الذين يضعون المعيار في كل تخصص ويراجعون كل عمل قبل أن يغادر الاستوديو.",
    cursor: "مرحبًا",
    more: { ...teamPage.crew.more, title: "ومتخصصون آخرون خلفهم", action: "انضم إليهم" },
  },
  disciplines: {
    label: "التخصصات",
    title: ["سبع حِرف،", "فريق واحد"],
    items: [
      { ...strategy, title: "الاستراتيجية", body: "الجمهور والتموضع ووجهة النظر خلف كل موجز." },
      { ...design, title: "التصميم", body: "الهوية والحملات وتصميم المنتجات، ثنائية اللغة من اليوم الأول." },
      { ...motion, title: "الموشن", body: "رسوم ثنائية وثلاثية الأبعاد وأفلام تحرّك العلامات كما تتحدث." },
      { ...content, title: "المحتوى", body: "الكتابة والتواصل الاجتماعي والإنتاج لعلامات تنشر كل يوم." },
      { ...development, title: "التطوير", body: "مواقع ومنصات طلب وأكشاك، تُطوَّر داخل الوكالة." },
      { ...uiux, title: "تجربة المستخدم", body: "أبحاث ورحلات وأنظمة تصميم تتوسع عبر الأسواق." },
      { ...performance, title: "الأداء", body: "إعلانات مدفوعة واختبارات تُقاس بالأرقام الفعلية." },
    ],
  },
  life: {
    label: "الحياة في الاستوديو",
    title: ["مدينتان،", "تدفّق واحد"],
    images: [
      { src: teamPage.life.images[0].src, alt: "الفريق في استوديو الإسكندرية" },
      { src: teamPage.life.images[1].src, alt: "في موقع التصوير خلال فعالية Sinclair" },
      { src: teamPage.life.images[2].src, alt: "ورشة عمل مع عميل" },
      { src: teamPage.life.images[3].src, alt: "التصميم الرئيسي لـ Shark Tank مصر" },
      { src: teamPage.life.images[4].src, alt: "يوم إنتاج" },
    ],
  },
  cta: {
    label: "تريد مقعدًا في الغرفة؟",
    title: ["انضم إلى", "الفريق"],
    button: "الوظائف المتاحة",
  },
};
