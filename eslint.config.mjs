import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Routes render one component (STACK-AND-STRUCTURE.md §3). Markup lives in src/versions/<id>/.
  {
    files: ["src/app/**/page.tsx", "src/app/**/layout.tsx", "src/app/**/error.tsx", "src/app/**/not-found.tsx", "src/app/**/loading.tsx"],
    // Each design's root layout owns <html>/<body>; they are the only files allowed intrinsic elements.
    ignores: ["src/app/[[]lang]/(main)/layout.tsx", "src/app/[[]lang]/(option-2)/layout.tsx", "src/app/global-error.tsx"],
    rules: {
      "no-restricted-syntax": [
        "error",
        {
          selector: "JSXOpeningElement[name.name=/^[a-z]/]",
          message: "Routes render one component. Move markup into a view in src/versions/<id>/.",
        },
      ],
    },
  },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // Snapshot of the previous site, kept for reference only.
    "archive/**",
  ]),
]);

export default eslintConfig;
