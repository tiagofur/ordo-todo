/**
 * Fix Metro Resolution for EAS Builds
 * 
 * This script ensures that the expo-asset/tools/hashAssetFiles module can be found
 * by Metro in EAS builds where the root monorepo's metro takes precedence.
 * 
 * It creates a symlink from the root node_modules to the local expo-asset.
 */
const fs = require('fs');
const path = require('path');

const projectRoot = __dirname.replace('/scripts', '');
const monorepoRoot = path.resolve(projectRoot, '../..');

// Paths
const localExpoAsset = path.join(projectRoot, 'node_modules', 'expo-asset');
const rootExpoAsset = path.join(monorepoRoot, 'node_modules', 'expo-asset');
const rootNodeModules = path.join(monorepoRoot, 'node_modules');

console.log('🔧 Fixing Metro resolution for EAS build...');
console.log(`  Project root: ${projectRoot}`);
console.log(`  Monorepo root: ${monorepoRoot}`);

// Check if local expo-asset exists
if (!fs.existsSync(localExpoAsset)) {
  console.error('❌ Local expo-asset not found at:', localExpoAsset);
  process.exit(1);
}

console.log('✅ Local expo-asset found');

// Ensure root node_modules directory exists
if (!fs.existsSync(rootNodeModules)) {
  fs.mkdirSync(rootNodeModules, { recursive: true });
  console.log('📁 Created root node_modules directory');
}

// If root expo-asset doesn't exist or is not a symlink, create symlink
if (!fs.existsSync(rootExpoAsset)) {
  try {
    // Create symlink
    fs.symlinkSync(localExpoAsset, rootExpoAsset, 'junction');
    console.log('🔗 Created symlink for expo-asset at root node_modules');
  } catch (error) {
    console.error('⚠️ Could not create symlink:', error.message);
    // Try copying instead
    try {
      fs.cpSync(localExpoAsset, rootExpoAsset, { recursive: true });
      console.log('📋 Copied expo-asset to root node_modules');
    } catch (copyError) {
      console.error('❌ Could not copy expo-asset:', copyError.message);
    }
  }
} else {
  console.log('ℹ️ expo-asset already exists at root node_modules');
  
  // Check if it has tools/hashAssetFiles
  const hashAssetFilesPath = path.join(rootExpoAsset, 'tools', 'hashAssetFiles.js');
  if (!fs.existsSync(hashAssetFilesPath)) {
    console.log('⚠️ Root expo-asset is missing hashAssetFiles, replacing...');
    try {
      fs.rmSync(rootExpoAsset, { recursive: true, force: true });
      fs.symlinkSync(localExpoAsset, rootExpoAsset, 'junction');
      console.log('🔗 Created symlink for expo-asset at root node_modules');
    } catch (error) {
      console.error('⚠️ Could not create symlink:', error.message);
      try {
        fs.cpSync(localExpoAsset, rootExpoAsset, { recursive: true });
        console.log('📋 Copied expo-asset to root node_modules');
      } catch (copyError) {
        console.error('❌ Could not copy expo-asset:', copyError.message);
      }
    }
  } else {
    console.log('✅ Root expo-asset has hashAssetFiles');
  }
}

console.log('✅ Metro resolution fix complete');
