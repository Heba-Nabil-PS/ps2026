/** Arabic copy of the /case-studies page content. */

import type { CaseStudiesPage } from "@/versions/option-2/data/caseStudies";
import { portfolioAr } from "@/data/portfolio.ar";

export const caseStudiesPageAr: CaseStudiesPage = {
  hero: {
    label: "دراسات الحالة",
    title: ["أعمال", "تحرّك", "الأسواق"],
    intro:
      "أربع عشرة شراكة في مطاعم الخدمة السريعة والرعاية الصحية والعقارات والإعلام والتجزئة — في كلٍّ منها استراتيجية وحِرفة وأداء يقدّمها فريق واحد.",
    meta: `${portfolioAr.length} دراسة حالة · الشرق الأوسط وشمال أفريقيا وما بعدها`,
  },
  index: {
    all: "كل الأعمال",
  },
  cta: {
    label: "هل تريد أن تكون التالي؟",
    title: ["لنكتب", "دراسة", "حالتك"],
    button: "ابدأ مشروعك",
  },
};
