const { getDefaultConfig } = require("expo/metro-config");
const path = require("path");

const projectRoot = __dirname;
const monorepoRoot = path.resolve(projectRoot, "../..");

const config = getDefaultConfig(projectRoot);

// Add the monorepo root to watch folders
config.watchFolders = [monorepoRoot];

// Ensure we resolve node_modules from both locations
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, "node_modules"),
  path.resolve(monorepoRoot, "node_modules"),
];

config.transformer = {
  ...config.transformer,
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
