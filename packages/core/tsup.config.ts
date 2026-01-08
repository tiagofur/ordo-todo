import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['cjs', 'esm'],
  dts: true,
  minify: false,
  clean: true,
  sourcemap: true,
  target: 'es2022',
  noExternal: ['zod'],
  // Skip type checking for faster builds (we have tsc --noEmit separately)
  // This prevents DTS build errors in Docker environments
  tsconfig: 'tsconfig.build.json',
});

