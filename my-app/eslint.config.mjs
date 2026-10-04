import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTypescript from "eslint-config-next/typescript";
export default defineConfig([
  ...nextVitals, ...nextTypescript,
  { rules: { "@typescript-eslint/no-explicit-any": "warn" } },
  { files: ["**/*.test.*", "jest*.js", "src/mocks/**", "src/test-utils/**"], rules: { "@typescript-eslint/no-require-imports": "off" } },
  globalIgnores([".next/**", "out/**", "build/**", "next-env.d.ts", "verification/**"]),
]);
