import reactRefresh from '@vitejs/plugin-react-refresh';
// import typescript from 'rollup-plugin-typescript2';
// import prismjs from 'vite-plugin-prismjs';
import { defineConfig } from 'vite';

import pkg from './package.json';

const deps = []
  .concat(pkg.dependencies ? Object.keys(pkg.dependencies) : [])
  .concat(pkg.peerDependencies ? Object.keys(pkg.peerDependencies) : []);

const name = `LLAEditor${pkg.name
  .replace('@lla-editor/', '')
  .replace(/^(\s)/, (char) => char.toUpperCase())}`;

export default defineConfig({
  build: {
    sourcemap: true,
    lib: {
      entry: pkg.source,
      name,
      fileName: 'index',
      // formats: ['es'],
    },
    rollupOptions: {
      external: deps,
    },
  },
  plugins: [
    reactRefresh(),
    // prismjs({
    //   languages: [
    //     'c',
    //     'python',
    //     'java',
    //     'cpp',
    //     'csharp',
    //     'vb',
    //     'jsx',
    //     'tsx',
    //     'php',
    //     'wasm',
    //     'sql',
    //     'markup',
    //     'html',
    //     'haskell',
    //     'css',
    //   ],
    //   // plugins: ["line-numbers"],
    //   theme: 'tomorrow',
    //   css: true,
    // }),
  ],
});
