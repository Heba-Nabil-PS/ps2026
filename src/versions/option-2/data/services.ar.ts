/** Arabic copy of the /services content. Details line up with `siteConfigAr.services` by position. */

import { buildServices, type ServiceDetails, type ServicesPage } from "@/versions/option-2/data/services";
import { siteConfigAr } from "@/lib/site.ar";

const details: ServiceDetails[] = [
  {
    tagline: "هويات تنتقل بين الأسواق.",
    deliverables: ["التموضع واستراتيجية العلامة", "التسمية والهوية اللفظية", "أنظمة الهوية البصرية", "الطباعة ثنائية اللغة", "أدلة العلامة التجارية", "التغليف ومنافذ البيع"],
    proof: { label: "Texas Chicken — نظام واحد ثنائي اللغة في 16 سوقًا", slug: "texas-chicken" },
  },
  {
    tagline: "تصميم وهندسة تحت سقف واحد.",
    deliverables: ["تصميم واجهات وتجربة المستخدم", "التجارة الإلكترونية والطلبات", "برامج الولاء", "تطبيقات iOS وAndroid", "أكشاك الخدمة الذاتية", "حلول Headless ومخصّصة"],
    proof: { label: "Texas Chicken — تطبيق طلب إقليمي واحد، وعملية دفع واحدة", slug: "texas-chicken" },
  },
  {
    tagline: "تصوير وأفلام وموشن من استوديو الخاص بنا.",
    deliverables: ["الإدارة الفنية", "تصوير الطعام والمنتجات", "الأفلام والإعلانات التلفزيونية", "الموشن جرافيك والـ 3D", "ما بعد الإنتاج", "تصوير داخل الاستوديو وفي المواقع"],
    proof: { label: "Shark Tank مصر — علامة برنامج تلفزيوني صُمّمت لكل المنصات", slug: "shark-tank-egypt" },
  },
  {
    tagline: "إعلانات مدفوعة تُختبر بالأرقام الفعلية.",
    deliverables: ["استراتيجية الحملات", "تخطيط وشراء الوسائط", "محتوى إبداعي موجّه للأداء", "تتبّع التحويلات", "اختبارات A/B", "التقارير والتحسين"],
    proof: { label: "Physiowell — عائد على الإنفاق الإعلاني يصل إلى 10 أضعاف", slug: "physiowell" },
  },
  {
    tagline: "استراتيجية ومحتوى ومجتمع، كل يوم.",
    deliverables: ["استراتيجية المنصات", "تقويم المحتوى", "محتوى إبداعي مستمر", "إدارة المجتمعات", "برامج المؤثرين", "رصد المحادثات الاجتماعية"],
    proof: { label: "Sinclair Aesthetics — صوت واحد عبر ثلاث علامات فرعية", slug: "sinclair-aesthetics" },
  },
  {
    tagline: "حضور في البحث يتراكم بعد انتهاء الحملة.",
    deliverables: ["التدقيق التقني", "استراتيجية الكلمات المفتاحية والمحتوى", "تحسين الصفحات", "محتوى ثنائي اللغة", "تحسين البحث المحلي", "التحليلات والتقارير"],
    proof: { label: "Texas Chicken — حضور في البحث عبر ستة عشر متجرًا إلكترونيًا", slug: "texas-chicken" },
  },
];

export const servicesAr = buildServices(siteConfigAr.services, details);

export const servicesPageAr: ServicesPage = {
  hero: {
    label: "الخدمات",
    title: ["كل التخصصات،", "في تدفّق", "واحد متصل"],
    intro:
      "ستة تخصصات، فريق واحد، بلا وسطاء. الاستراتيجية والعلامة التجارية وتطوير المواقع والتطبيقات والإنتاج والحملات ومنصات التواصل وتحسين محركات البحث — ينفّذها من البداية إلى النهاية أكثر من 80 متخصصًا داخل الوكالة.",
    meta: `${siteConfigAr.services.length} تخصصات · ${siteConfigAr.location}`,
  },
  statement: {
    label: "كيف نعمل",
    action: "استكشف التخصصات",
    text: "معظم الوكالات تنقل علامتك التجارية من مورّد إلى آخر. أما نحن فنُبقي كل التخصصات في غرفة واحدة، لتصوغ الاستراتيجية نفسها الهوية والتطبيق والحملة والمحتوى الذي يُنشر عليها.",
  },
  stack: {
    label: "ماذا نقدّم",
    title: ["ست طرق", "نحرّك بها العلامات"],
  },
  process: {
    label: "منهجيتنا",
    title: ["من الفكرة الأولى", "حتى آخر بكسل"],
    steps: siteConfigAr.process,
  },
  cta: {
    label: "تحتاج أكثر من تخصص واحد؟",
    title: ["لنبنِ", "المنظومة", "كاملة"],
    button: "ابدأ مشروعك",
  },
};
