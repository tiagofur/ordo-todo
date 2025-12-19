// Learn more https://docs.expo.io/guides/monorepos/
const { getDefaultConfig } = require("expo/metro-config");
const path = require("path");

const projectRoot = __dirname;
const monorepoRoot = path.resolve(projectRoot, "../..");

// Get the default Expo metro config
const config = getDefaultConfig(projectRoot);

// 1. Add monorepo root to watch folders so Metro can see all packages
config.watchFolders = [monorepoRoot];

// 2. Ensure node_modules resolution works correctly in the monorepo
// Local node_modules should come FIRST to take precedence
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, "node_modules"),
  path.resolve(monorepoRoot, "node_modules"),
];

// 3. Force resolution of expo packages from local workspace to avoid
// the "Cannot find module 'expo-asset/tools/hashAssetFiles'" error
config.resolver.extraNodeModules = {
  "expo-asset": path.resolve(projectRoot, "node_modules/expo-asset"),
};

// 4. Explicitly configure the asset plugins to use local expo-asset
config.transformer = {
  ...config.transformer,
  assetPlugins: [
    path.resolve(projectRoot, "node_modules/expo-asset/tools/hashAssetFiles"),
  ],
  getTransformOptions: async () => ({
    transform: {
      experimentalImportSupport: false,
      inlineRequires: true,
    },
  }),
};

module.exports = config;
