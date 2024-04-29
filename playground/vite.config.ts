/* eslint-disable import/no-extraneous-dependencies */
import react from '@vitejs/plugin-react';
// import prismjsPlugin from 'vite-plugin-prismjs';
import path from 'path';
import fs from 'fs';
import { defineConfig, loadEnv } from 'vite';
import type { Plugin } from 'vite';

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
              getPackages(rootPath).reduce(
                (acc: any, pkg: any) =>
                  acc.concat([
                    [
                      `${pkg.name}/style`,
                      path.join(pkg.name, 'src/style/index.css'),
                    ],
                    [pkg.name, path.join(pkg.name, pkg.source)],
                  ]),
                [] as any,
              ),
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

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  return {
    define: {
      'process.env': env,
    },
    server: {
      port: 3001,
    },
    // base: process.env.No'lla-editor',
    base:
      process.env.NODE_ENV_FOR_PLAYGROUND === 'CI' ? 'lla-editor' : undefined,
    plugins: [react(), watchWorkspaces('../')],
  };
});
