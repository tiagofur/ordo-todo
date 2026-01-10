import { defineConfig } from 'tsup';

export default defineConfig({
    entry: ['src/index.ts', 'src/use-username-validation.ts'],
    format: ['cjs', 'esm'],
    dts: true,
    clean: true,
    sourcemap: true,
    target: 'es2022',
    external: ['@tanstack/react-query', 'react'],
});
