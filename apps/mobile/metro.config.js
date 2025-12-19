const { getDefaultConfig } = require("expo/metro-config");
const path = require("path");

const projectRoot = __dirname;
const monorepoRoot = path.resolve(projectRoot, "../..");

const config = getDefaultConfig(projectRoot);

// Add the monorepo root to watch folders
config.watchFolders = [monorepoRoot];

// Ensure we resolve node_modules from both locations
// IMPORTANT: Local node_modules must come first for EAS builds to work correctly
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, "node_modules"),
  path.resolve(monorepoRoot, "node_modules"),
];

// Force resolution of expo packages from the local workspace
// This fixes the "Cannot find module 'expo-asset/tools/hashAssetFiles'" error in EAS builds
const localExpoAsset = path.resolve(projectRoot, "node_modules/expo-asset");
config.resolver.extraNodeModules = {
  ...config.resolver.extraNodeModules,
  "expo-asset": localExpoAsset,
  "expo-asset/tools/hashAssetFiles": path.resolve(localExpoAsset, "tools/hashAssetFiles"),
  "expo-router": path.resolve(projectRoot, "node_modules/expo-router"),
  "expo": path.resolve(projectRoot, "node_modules/expo"),
  "@expo/metro-config": path.resolve(projectRoot, "node_modules/@expo/metro-config"),
  "metro": path.resolve(projectRoot, "node_modules/metro") || path.resolve(projectRoot, "node_modules/react-native/node_modules/metro"),
};

// Ensure assetPlugins uses the local expo-asset
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

// Force Metro to not ignore expo-router from transformation
// This is done by ensuring it is NOT in the blocklist (it usually isn't)
// But we can check if we can add it to watch folders (already done)

module.exports = config;
