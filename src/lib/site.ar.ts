/**
 * Arabic copy of `siteConfig`. Identity values (name, url, email, logos) are
 * shared with the English config; only the words change.
 *
 * Service titles here are the Arabic discipline names used everywhere else
 * (portfolio `services`, case-study filters, the contact form), so keep them
 * in sync when editing.
 */

import type { Localized } from "@/i18n/config";
import { siteConfig } from "@/lib/site";

export const siteConfigAr: Localized<typeof siteConfig> = {
  ...siteConfig,
  tagline: "تدفّق متصل، وإمكانات بلا حدود",
  description:
    "PSdigital وكالة رقمية متكاملة الخدمات، صُمّمت لمنطقة الشرق الأوسط وشمال أفريقيا وما بعدها — الهوية التجارية، والمواقع والتطبيقات، والإنتاج، والحملات الرقمية، ومنصات التواصل الاجتماعي، وتحسين محركات البحث، وكلها داخل فريق واحد.",
  location: "الإسكندرية — دبي",
  offices: [
    { city: "الإسكندرية", address: "8 شارع الأمير جميل، زيزينيا، الإسكندرية، مصر" },
    { city: "دبي", address: "حي دبي للتصميم، المبنى 3، دبي، الإمارات العربية المتحدة" },
  ],
  nav: [
    { label: "الخدمات", href: "/services" },
    { label: "دراسات الحالة", href: "/case-studies" },
    { label: "الوكالة", href: "/about" },
    { label: "الفريق", href: "/team" },
    { label: "الوظائف", href: "/careers" },
    { label: "تواصل معنا", href: "/contact" },
  ],
  moreNav: [
    { label: "أعمالنا", href: "/projects" },
    { label: "المشاريع", href: "/portfolio" },
  ],
  services: [
    {
      title: "بناء العلامة التجارية",
      description: "تموضع وهوية بصرية وأنظمة علامات تجارية ثنائية اللغة تنتقل بسلاسة بين الأسواق.",
    },
    {
      title: "تطوير المواقع والتطبيقات",
      description: "متاجر إلكترونية وبرامج ولاء وأكشاك خدمة ذاتية وتطبيقات طلب — نصمّمها ونبنيها داخليًا.",
    },
    {
      title: "الإنتاج",
      description: "تصوير فوتوغرافي وأفلام وموشن جرافيك من إنتاج فريق الاستوديو الخاص بنا.",
    },
    {
      title: "الحملات الرقمية",
      description: "إعلانات مدفوعة مستمرة تُختبر بالأرقام الفعلية، لا بعدد مرات الظهور.",
    },
    {
      title: "إدارة منصات التواصل",
      description: "استراتيجية ومحتوى وإدارة مجتمعات لعلامات تجارية تنشر كل يوم.",
    },
    {
      title: "تحسين محركات البحث",
      description: "تحسين تقني وتحسين للمحتوى تتراكم نتائجه طويلًا بعد انتهاء الحملة.",
    },
  ],
  clients: siteConfig.clients,
  stats: [
    { value: "80+", label: "متخصصًا داخليًا في الاستراتيجية والتصميم والموشن والمحتوى والتطوير وتجربة المستخدم والأداء." },
    { value: "6", label: "تخصصات أساسية ننفّذها من البداية إلى النهاية، دون أي تعاقد خارجي." },
    { value: "2023", label: "وكالة العام الرقمية، جوائز Corporate LiveWire للابتكار والتميّز." },
  ],
  awards: [
    {
      ...siteConfig.awards[0],
      kind: "جائزة · 2023",
      title: "وكالة العام الرقمية",
      issuer: "جوائز Corporate LiveWire للابتكار والتميّز",
      body: "لجنة تحكيم مستقلة كرّمت طريقة عملنا: الاستراتيجية أولًا، ثم العلامة التجارية والحلول الرقمية والأداء، يبنيها فريق واحد داخل الوكالة.",
    },
    {
      ...siteConfig.awards[1],
      kind: "جائزة",
      title: "الرئيس التنفيذي للعام",
      issuer: "The Middle East Prestige Awards",
      body: "مُنحت لسيف الصواف، رئيسنا التنفيذي، تقديرًا لبناء PSdigital فريقًا واحدًا يضم أكثر من 80 متخصصًا بين الإسكندرية ودبي.",
    },
    {
      ...siteConfig.awards[2],
      kind: "شراكة",
      title: "شريك أعمال Meta",
      issuer: "Meta",
      body: "شريك معتمد من Meta للإعلان على فيسبوك وإنستغرام، المنصتين اللتين يقوم عليهما جزء كبير من عملنا في الأداء، ومنه عائد Physiowell الذي وصل إلى 10 أضعاف.",
    },
  ],
  team: {
    lead: { name: "سيف الصواف", role: "الرئيس التنفيذي", image: siteConfig.team.lead.image },
    members: [
      { name: "لبنى البنان", role: "المديرة العامة", image: siteConfig.team.members[0].image },
      { name: "أحمد خليل", role: "المدير الإبداعي", image: siteConfig.team.members[1].image },
      { name: "بيري خليل", role: "مساعدة المدير الإبداعي", image: siteConfig.team.members[2].image },
      { name: "محمد حطيبة", role: "مدير البرمجيات", image: siteConfig.team.members[3].image },
      { name: "هشام زهران", role: "المدير الرقمي", image: siteConfig.team.members[4].image },
      { name: "شاهيناز ماهر", role: "المديرة المالية", image: siteConfig.team.members[5].image },
      { name: "هبة نبيل", role: "قائدة المنتجات الرقمية وتجربة المستخدم", image: siteConfig.team.members[6].image },
    ],
  },
  process: [
    {
      title: "الاستكشاف",
      body: "دراسة الجمهور والمنافسين: الأساس الذي كشف أن Texas Chicken تحتاج إلى نظام علامة تجارية واحد ثنائي اللغة، لا ستة عشر نظامًا منفصلًا.",
    },
    {
      title: "الاستراتيجية",
      body: "رؤية واضحة قبل الخطة: إعادة تقديم علم Sinclair كمعيار للمصداقية في المنطقة، لا ككتالوج منتجات.",
    },
    {
      title: "الإبداع والبناء",
      body: "التصميم والموشن والكتابة والتطوير، كلها داخل الوكالة — من حسابات Shark Tank مصر التي بنيناها من الصفر إلى مشاريع تجربة المستخدم المتكاملة.",
    },
    {
      title: "الإطلاق والتحسين",
      body: "إعلانات مدفوعة واختبار مستمر بالأرقام الفعلية: الانضباط الذي حقق لـ Physiowell عائدًا على الإنفاق الإعلاني يصل إلى 10 أضعاف.",
    },
  ],
  reasons: [
    {
      title: "كل شيء داخل الوكالة",
      body: "الاستراتيجية والعلامة التجارية وتطوير المواقع وتجربة المستخدم والموشن والمحتوى والأداء تحت سقف واحد، بلا تعهيد خارجي ولا شيء يضيع بين الموردين.",
    },
    {
      title: "الاستراتيجية قبل التنفيذ",
      body: "نعيد صياغة العلامات التجارية قبل أن نصمّم لها: قدّمنا Texas Chicken بوصفها «علامة عالمية تتحدث المصري»، لا العكس.",
    },
    {
      title: "خبرة مُثبتة في طرفي السوق",
      body: "من P&G وBurger King وToyota وSinclair إلى علامات إقليمية سريعة النمو مثل Shark Tank مصر وASTK.",
    },
    {
      title: "تقدير مستحق",
      body: "وكالة العام الرقمية 2023 (Corporate LiveWire) وجائزة الرئيس التنفيذي للعام (Middle East Prestige Awards).",
    },
  ],
};
