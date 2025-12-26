export default {
  // Run type-check on TypeScript files
  '**/*.{ts,tsx}': () => 'pnpm type-check',

  // Format and lint all files
  'apps/api/**/*.{ts,js,json}': ['pnpm --filter @scaffold/api lint'],
  'apps/web/**/*.{ts,tsx,js,jsx,json,css}': ['pnpm --filter @scaffold/web lint:fix'],
  'packages/**/*.{ts,tsx,js,json}': ['pnpm --filter @scaffold/types type-check'],
};
