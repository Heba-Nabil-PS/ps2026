import type { NextConfig } from "next";

/**
 * Retired URLs from the previous site. The new sitemap folds case studies,
 * the portfolio and projects into /work, so each old address points at its
 * new home permanently, in both languages.
 */
const retired: { source: string; destination: string }[] = [
  { source: "/case-studies", destination: "/work" },
  { source: "/case-studies/:slug", destination: "/work/:slug" },
  { source: "/portfolio", destination: "/work" },
  { source: "/portfolio/:slug", destination: "/work/:slug" },
  { source: "/projects", destination: "/work" },
  { source: "/projects/:slug", destination: "/work/:slug" },
  { source: "/home-opt2", destination: "/" },
];

const nextConfig: NextConfig = {
  poweredByHeader: false,
  images: {
    formats: ["image/avif", "image/webp"],
    qualities: [70, 75, 85],
  },
  // The one experimental key STACK-AND-STRUCTURE.md §0 tolerates: the body limit only exists here,
  // and without it the careers upload fails. Remove when Next promotes it to stable.
  experimental: {
    serverActions: {
      // Careers applications may carry a PDF portfolio (8 MB cap, validated in src/lib/forms.ts).
      bodySizeLimit: "9mb",
    },
  },
  async redirects() {
    return retired.flatMap(({ source, destination }) => [
      { source, destination, permanent: true },
      { source: `/ar${source}`, destination: `/ar${destination === "/" ? "" : destination}`, permanent: true },
    ]);
  },
};

export default nextConfig;
