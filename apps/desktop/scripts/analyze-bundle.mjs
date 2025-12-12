#!/usr/bin/env node

/**
 * Bundle Analysis Script
 *
 * Analyzes the built bundle and generates optimization reports
 */

import { readFileSync, existsSync, mkdirSync, writeFileSync } from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = fileURLToPath(new URL('.', import.meta.url));

// Configuration
const DIST_DIR = join(__dirname, '../dist');
const ANALYSIS_OUTPUT_DIR = join(__dirname, '../bundle-analysis');

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function formatBytes(bytes) {
  const units = ['B', 'KB', 'MB', 'GB'];
  let size = bytes;
  let unitIndex = 0;

  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex++;
  }

  return `${size.toFixed(1)} ${units[unitIndex]}`;
}

function analyzeBundleSize(distPath) {
  const assets = [];
  let totalSize = 0;
  let jsSize = 0;
  let cssSize = 0;

  try {
    const manifestPath = join(distPath, '.vite', 'manifest.json');
    let manifest = {};

    if (existsSync(manifestPath)) {
      manifest = JSON.parse(readFileSync(manifestPath, 'utf8'));
    }

    // Simple directory scan for assets
    const assetDir = join(distPath, 'assets');
    if (existsSync(assetDir)) {
      const fs = require('fs');
      const files = fs.readdirSync(assetDir);

      files.forEach(file => {
        const filePath = join(assetDir, file);
        const stats = fs.statSync(filePath);
        const size = stats.size;
        totalSize += size;

        const ext = file.split('.').pop();
        if (ext === 'js') jsSize += size;
        if (ext === 'css') cssSize += size;

        assets.push({
          file,
          size,
          type: ext,
          path: filePath
        });
      });
    }

    return {
      totalSize,
      jsSize,
      cssSize,
      assets: assets.sort((a, b) => b.size - a.size)
    };
  } catch (error) {
    log(`Error analyzing bundle: ${error.message}`, 'red');
    return {
      totalSize: 0,
      jsSize: 0,
      cssSize: 0,
      assets: []
    };
  }
}

function calculateOptimalChunkSize(jsSize) {
  // Based on web performance best practices
  const chunks = Math.ceil(jsSize / 250000); // 250KB per chunk
  return Math.max(3, Math.min(8, chunks)); // 3-8 chunks optimal
}

function generateRecommendations(analysis) {
  const recommendations = [];

  // Size recommendations
  if (analysis.totalSize > 3000000) { // > 3MB
    recommendations.push('🔴 Bundle size is too large (>3MB). Consider aggressive code splitting');
  } else if (analysis.totalSize > 2000000) { // > 2MB
    recommendations.push('🟡 Bundle size is large (>2MB). Consider optimizing dependencies');
  } else if (analysis.totalSize < 500000) { // < 500KB
    recommendations.push('🟢 Bundle size is optimal');
  }

  // JavaScript size recommendations
  if (analysis.jsSize > 1500000) { // > 1.5MB
    recommendations.push('🔴 JavaScript bundle is too large. Implement better tree shaking');
  }

  // Asset-specific recommendations
  const largeAssets = analysis.assets.filter(asset => asset.size > 200000);
  if (largeAssets.length > 0) {
    recommendations.push(`🟡 Large assets detected: ${largeAssets.map(a => `${a.file} (${formatBytes(a.size))}`).join(', ')}`);
  }

  // Code splitting recommendations
  const optimalChunks = calculateOptimalChunkSize(analysis.jsSize);
  const currentChunks = analysis.assets.filter(a => a.type === 'js').length;

  if (currentChunks < optimalChunks) {
    recommendations.push(`💡 Consider splitting into ${optimalChunks} chunks (current: ${currentChunks})`);
  }

  // Compression recommendations
  const estimatedGzip = analysis.totalSize * 0.35; // 35% of original
  recommendations.push(`📦 Enable compression - estimated gzip size: ${formatBytes(estimatedGzip)}`);

  return recommendations;
}

function generateReport(analysis) {
  const report = `
# Bundle Analysis Report

Generated: ${new Date().toISOString()}

## 📊 Bundle Size Summary

- **Total Size**: ${formatBytes(analysis.totalSize)}
- **JavaScript**: ${formatBytes(analysis.jsSize)} (${Math.round(analysis.jsSize / analysis.totalSize * 100)}%)
- **CSS**: ${formatBytes(analysis.cssSize)} (${Math.round(analysis.cssSize / analysis.totalSize * 100)}%)
- **Assets**: ${analysis.assets.length} files

## 📦 Largest Assets

${analysis.assets.slice(0, 10).map((asset, index) =>
  `${index + 1}. ${asset.file} - ${formatBytes(asset.size)} (${asset.type.toUpperCase()})`
).join('\n')}

## 💡 Optimization Recommendations

${generateRecommendations(analysis).map(rec => `- ${rec}`).join('\n')}

## 🔧 Next Steps

1. Run \`npm run build:analyze\` to see detailed bundle visualization
2. Review bundle analysis report in \`dist/bundle-analysis.html\`
3. Implement code splitting for large components
4. Consider removing unused dependencies
5. Enable Brotli compression on your server

## 📈 Performance Targets

- **Total Bundle Size**: < 2MB
- **JavaScript Size**: < 1.5MB
- **Largest Chunk**: < 250KB
- **Compression Ratio**: < 40% of original

Current performance: ${analysis.totalSize < 2000000 ? '✅ On Target' : '⚠️ Needs Optimization'}
  `.trim();

  return report;
}

function saveReport(report) {
  // Create output directory if it doesn't exist
  if (!existsSync(ANALYSIS_OUTPUT_DIR)) {
    mkdirSync(ANALYSIS_OUTPUT_DIR, { recursive: true });
  }

  // Save markdown report
  const reportPath = join(ANALYSIS_OUTPUT_DIR, `bundle-analysis-${new Date().toISOString().split('T')[0]}.md`);
  writeFileSync(reportPath, report);

  // Save JSON data
  const jsonData = {
    timestamp: new Date().toISOString(),
    report
  };
  const jsonPath = join(ANALYSIS_OUTPUT_DIR, `bundle-analysis-${new Date().toISOString().split('T')[0]}.json`);
  writeFileSync(jsonPath, JSON.stringify(jsonData, null, 2));

  log(`Report saved to: ${reportPath}`, 'green');
  log(`JSON data saved to: ${jsonPath}`, 'green');
}

function main() {
  log('🔍 Analyzing bundle...', 'bright');

  // Check if dist directory exists
  if (!existsSync(DIST_DIR)) {
    log('❌ Build directory not found. Run `npm run build` first.', 'red');
    process.exit(1);
  }

  // Analyze bundle
  const analysis = analyzeBundleSize(DIST_DIR);

  // Display summary
  log('\n📊 Bundle Analysis Summary:', 'bright');
  log(`   Total Size: ${formatBytes(analysis.totalSize)}`, analysis.totalSize > 2000000 ? 'yellow' : 'green');
  log(`   JavaScript: ${formatBytes(analysis.jsSize)}`, analysis.jsSize > 1500000 ? 'yellow' : 'green');
  log(`   CSS: ${formatBytes(analysis.cssSize)}`, 'cyan');
  log(`   Assets: ${analysis.assets.length} files`, 'blue');

  // Show top 5 largest assets
  log('\n📦 Largest Assets:', 'bright');
  analysis.assets.slice(0, 5).forEach((asset, index) => {
    const sizeColor = asset.size > 200000 ? 'yellow' : asset.size > 500000 ? 'red' : 'green';
    log(`   ${index + 1}. ${asset.file} - ${formatBytes(asset.size)}`, sizeColor);
  });

  // Generate and show recommendations
  const recommendations = generateRecommendations(analysis);
  log('\n💡 Recommendations:', 'bright');
  recommendations.forEach(rec => {
    log(`   ${rec}`);
  });

  // Save report
  const report = generateReport(analysis);
  saveReport(report);

  // Show performance score
  const score = Math.max(0, Math.min(100, 100 - (analysis.totalSize / 2000000) * 50));
  const scoreColor = score >= 80 ? 'green' : score >= 60 ? 'yellow' : 'red';
  log(`\n📈 Performance Score: ${score}/100`, scoreColor);

  if (score < 70) {
    log('\n⚠️  Bundle optimization recommended', 'yellow');
  } else if (score >= 80) {
    log('\n✅ Bundle is well optimized!', 'green');
  }
}

// Run the analysis
main();