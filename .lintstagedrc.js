export default {
  // Run type-check on TypeScript files (no files passed, checks whole workspace)
  '**/*.{ts,tsx}': () => 'pnpm type-check',

  // Lint API files
  'apps/api/**/*.{ts,js,json}': () => 'pnpm --filter @scaffold/api lint',

  // Lint and fix Web files
  'apps/web/**/*.{ts,tsx,js,jsx,json,css}': () => 'pnpm --filter @scaffold/web lint:fix',

  // Type-check packages
  'packages/**/*.{ts,tsx,js,json}': () => 'pnpm --filter @scaffold/types type-check',
};
