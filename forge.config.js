const { FusesPlugin } = require('@electron-forge/plugin-fuses');
const { FuseV1Options, FuseVersion } = require('@electron/fuses');
const { execSync } = require('child_process');
const path = require('path');

module.exports = {
  packagerConfig: {
    name: 'NA Image Generator',
    asar: true,
    extraResource: [
      './bin',
    ],
    icon: './images/icons/icon-generic'
},
  rebuildConfig: {},
  makers: [
    {
      name: '@electron-forge/maker-squirrel',
      config: {},
    },
    {
      name: '@electron-forge/maker-zip',
      platforms: ['darwin'],
    },
    {
      name: '@electron-forge/maker-deb',
      config: {},
    },
    {
      name: '@electron-forge/maker-rpm',
      config: {},
    },
  ],
  plugins: [
    {
      name: '@electron-forge/plugin-auto-unpack-natives',
      config: {},
    },
    // Fuses are used to enable/disable various Electron functionality
    // at package time, before code signing the application
    new FusesPlugin({
      version: FuseVersion.V1,
      [FuseV1Options.RunAsNode]: false,
      [FuseV1Options.EnableCookieEncryption]: true,
      [FuseV1Options.EnableNodeOptionsEnvironmentVariable]: false,
      [FuseV1Options.EnableNodeCliInspectArguments]: false,
      [FuseV1Options.EnableEmbeddedAsarIntegrityValidation]: true,
      [FuseV1Options.OnlyLoadAppFromAsar]: true,
    }),
  ],
  hooks: {
    generateAssets: async (forgeConfig, platform, arch) => {
      console.log('Running composer install for the PHP backend...');
      const phpBackendPath = path.join(process.cwd(), 'bin', 'php_backend'); // Adjust path as needed

      try {
        // Run composer install command in the PHP backend directory
        execSync('rm -rf php_backend', {
          cwd: path.join(process.cwd(), 'bin'),
          stdio: 'inherit'
        })
        execSync('git clone --depth 1 git@github.com:nailalliance/images-for-bundles.git php_backend_tmp', {
          cwd: path.join(process.cwd(), 'bin'),
          stdio: 'inherit'
        })
        execSync('git archive --format=zip main -o ../php_backend.zip', {
          cwd: path.join(process.cwd(), 'bin/php_backend_tmp'),
          stdio: 'inherit'
        })
        execSync('unzip php_backend.zip -d php_backend && rm -rf php_backend.zip php_backend_tmp', {
          cwd: path.join(process.cwd(), 'bin'),
          stdio: 'inherit'
        })
        execSync('composer install --no-dev --prefer-dist', {
          cwd: phpBackendPath,
          stdio: 'inherit'
        });
        console.log('Composer install completed successfully.');
      } catch (error) {
        console.error('Failed to run composer install:', error);
        throw new Error('Composer install failed. Cannot package the application.');
      }
    }
  }
};
