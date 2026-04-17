import { defineConfig, type Options } from 'tsup';

interface CustomOptions extends Options {
  paths?: {
    [path: string]: string | string[];
  };
}

export default defineConfig({
  entry: ['src/main/index.ts'],
  format: ['cjs'],
  outDir: 'dist',
  clean: true,
  sourcemap: true,
  paths: {
    '@/*': ['./src/*'],
  },
} as CustomOptions);
