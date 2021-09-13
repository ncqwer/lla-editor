import reactRefresh from '@vitejs/plugin-react-refresh';
// import typescript from 'rollup-plugin-typescript2';
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
  plugins: [reactRefresh()],
});
