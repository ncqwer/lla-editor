import reactRefresh from '@vitejs/plugin-react-refresh';
import prismjsPlugin from 'vite-plugin-prismjs';
import path from 'path';
import fs from 'fs';
import { defineConfig, Plugin } from 'vite';

const watchWorkspaces = (rootPath: string): Plugin => {
  return {
    name: '@lla_internal/vite-plugin-watch-source',
    config: (userConfig) => {
      const modifiedConfig = {
        ...userConfig,
        resolve: {
          ...userConfig?.resolve,
          alias: {
            ...Object.fromEntries(
              getPackages(rootPath).map((pkg) => [
                pkg.name,
                path.join(pkg.name, pkg.source),
              ]),
            ),
            ...userConfig?.resolve?.alias,
          },
        },
      };

      console.log('Automatic aliases:', modifiedConfig.resolve.alias);

      return modifiedConfig;
    },
  };

  function getPackages(rootPath: string) {
    const rootPkg = require(path.resolve(
      process.cwd(),
      rootPath,
      'package.json',
    ));

    const folders = rootPkg.workspaces.flatMap((workspace) => {
      if (workspace.includes('/*')) {
        const folderWithWorkspaces = workspace.replace('/*', '');
        const workspacesFolders = fs.readdirSync(
          path.resolve(process.cwd(), rootPath, folderWithWorkspaces),
        );
        return workspacesFolders.map((folderName) =>
          path.join(folderWithWorkspaces, folderName),
        );
      }
      return workspace;
    });

    const folderPaths = folders.map((folder) =>
      path.resolve(process.cwd(), rootPath, folder),
    );

    const packages = folderPaths
      .map((folderPath) => require(path.resolve(folderPath, 'package.json')))
      .filter((pkg) => pkg.source);

    return packages;
  }
};

export default defineConfig({
  server: {
    port: 3001,
  },
  plugins: [
    reactRefresh(),
    watchWorkspaces('../../'),
    // prismjsPlugin({
    //   // languages: [
    //   //   'c',
    //   //   'python',
    //   //   'java',
    //   //   'cpp',
    //   //   'csharp',
    //   //   'vb',
    //   //   'jsx',
    //   //   'tsx',
    //   //   'php',
    //   //   'wasm',
    //   //   'sql',
    //   //   'markup',
    //   //   'html',
    //   //   'haskell',
    //   //   'css',
    //   // ],
    //   // // plugins: ["line-numbers"],
    //   // theme: 'tomorrow',
    //   // css: true,
    // }),
  ],
});
