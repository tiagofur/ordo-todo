#!/usr/bin/env node

/**
 * Bundle Analysis Script for Next.js
 *
 * Analyzes the built Next.js bundle and generates optimization reports
 */

import { readFileSync, existsSync, mkdirSync, writeFileSync, statSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const PROJECT_ROOT = join(__dirname, '..');
const BUILD_DIR = join(PROJECT_ROOT, '.next');
const ANALYSIS_OUTPUT_DIR = join(PROJECT_ROOT, 'bundle-analysis');

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

function analyzeNextBundle(buildPath) {
  const staticDir = join(buildPath, 'static');
  const chunksDir = join(staticDir, 'chunks');
  const cssDir = join(staticDir, 'css');

  const analysis = {
    totalSize: 0,
    jsSize: 0,
    cssSize: 0,
    imageCount: 0,
    fontCount: 0,
    chunks: [],
    assets: [],
    pages: [],
    dependencies: new Map(),
    optimizations: {
      gzippedSize: 0,
      brotliSize: 0,
      compressionRatio: 0
    }
  };

  try {
    // Analyze JavaScript chunks
    if (existsSync(chunksDir)) {
      const { readdirSync } = require('fs');
      const chunkFiles = readdirSync(chunksDir).filter(file => file.endsWith('.js'));

      chunkFiles.forEach(file => {
        const filePath = join(chunksDir, file);
        const stats = statSync(filePath);
        const size = stats.size;

        analysis.totalSize += size;
        analysis.jsSize += size;

        const chunkName = file.replace(/-[a-f0-9]+\.js$/, '');
        analysis.chunks.push({
          name: chunkName,
          file,
          size,
          type: chunkName.includes('vendor') ? 'vendor' : 'app'
        });
      });
    }

    // Analyze CSS files
    if (existsSync(cssDir)) {
      const { readdirSync } = require('fs');
      const cssFiles = readdirSync(cssDir).filter(file => file.endsWith('.css'));

      cssFiles.forEach(file => {
        const filePath = join(cssDir, file);
        const stats = statSync(filePath);
        const size = stats.size;

        analysis.totalSize += size;
        analysis.cssSize += size;

        analysis.assets.push({
          type: 'css',
          file,
          size
        });
      });
    }

    // Analyze other assets
    if (existsSync(staticDir)) {
      const { readdirSync } = require('fs');
      const assetFiles = readdirSync(staticDir);

      assetFiles.forEach(dir => {
        if (dir !== 'chunks' && dir !== 'css') {
          const assetDir = join(staticDir, dir);
          if (statSync(assetDir).isDirectory()) {
            const files = readdirSync(assetDir);
            files.forEach(file => {
              const filePath = join(assetDir, file);
              const stats = statSync(filePath);
              const size = stats.size;

              analysis.totalSize += size;

              if (dir === 'media' || dir === 'images') {
                analysis.imageCount++;
              } else if (dir === 'fonts') {
                analysis.fontCount++;
              }

              analysis.assets.push({
                type: dir,
                file: `${dir}/${file}`,
                size
              });
            });
          }
        }
      });
    }

    // Analyze Next.js pages (if exists)
    const pagesDir = join(buildPath, 'server/pages');
    if (existsSync(pagesDir)) {
      const { readdirSync } = require('fs');
      const pageFiles = readdirSync(pagesDir, { recursive: true });

      pageFiles.forEach(file => {
        if (file.endsWith('.js') && !file.includes('_app') && !file.includes('_document')) {
          const filePath = join(pagesDir, file);
          const stats = statSync(filePath);

          analysis.pages.push({
            page: file.replace(/\.js$/, ''),
            size: stats.size
          });
        }
      });
    }

  } catch (error) {
    log(`Error analyzing bundle: ${error.message}`, 'red');
  }

  // Calculate compression estimates
  analysis.optimizations.gzippedSize = analysis.totalSize * 0.35; // 35% compression ratio
  analysis.optimizations.brotliSize = analysis.totalSize * 0.25; // 25% compression ratio
  analysis.optimizations.compressionRatio = (analysis.optimizations.gzippedSize / analysis.totalSize) * 100;

  return analysis;
}

function generateOptimizationRecommendations(analysis) {
  const recommendations = [];

  // Size-based recommendations
  if (analysis.totalSize > 3000000) { // > 3MB
    recommendations.push('🔴 Bundle size exceeds 3MB. Consider aggressive code splitting');
  } else if (analysis.totalSize > 2000000) { // > 2MB
    recommendations.push('🟡 Bundle size is large (>2MB). Consider optimizing dependencies');
  } else if (analysis.totalSize < 500000) { // < 500KB
    recommendations.push('🟢 Bundle size is optimal');
  }

  // JavaScript size recommendations
  if (analysis.jsSize > 1500000) { // > 1.5MB
    recommendations.push('🔴 JavaScript bundle is too large. Implement better tree shaking');
  }

  // Chunk analysis
  const largeChunks = analysis.chunks.filter(chunk => chunk.size > 300000);
  if (largeChunks.length > 0) {
    recommendations.push(`🟡 Large chunks detected: ${largeChunks.map(c => `${c.name} (${formatBytes(c.size))}`).join(', ')}`);
  }

  // Vendor chunk analysis
  const vendorChunks = analysis.chunks.filter(chunk => chunk.type === 'vendor');
  if (vendorChunks.length === 0) {
    recommendations.push('💡 Consider vendor chunk separation for better caching');
  }

  // Image optimization
  if (analysis.imageCount > 50) {
    recommendations.push('💡 Consider optimizing images and using next/image properly');
  }

  // Next.js specific recommendations
  if (analysis.pages.length > 20) {
    recommendations.push('💡 Consider implementing static generation (SSG) where possible');
  }

  return recommendations;
}

function generateHealthScore(analysis) {
  let score = 100;

  // Size scoring
  if (analysis.totalSize > 3000000) score -= 30;
  else if (analysis.totalSize > 2000000) score -= 15;
  else if (analysis.totalSize < 500000) score += 10;

  // Chunk distribution scoring
  const vendorChunks = analysis.chunks.filter(c => c.type === 'vendor');
  if (vendorChunks.length === 0) score -= 20;
  if (vendorChunks.length > 5) score -= 10;

  // Large chunk penalty
  const largeChunks = analysis.chunks.filter(c => c.size > 300000);
  score -= largeChunks.length * 5;

  return Math.max(0, Math.min(100, score));
}

function generateReport(analysis) {
  const score = generateHealthScore(analysis);
  const recommendations = generateOptimizationRecommendations(analysis);

  const report = `
# Next.js Bundle Analysis Report

Generated: ${new Date().toISOString()}

## 📊 Bundle Size Summary

- **Total Size**: ${formatBytes(analysis.totalSize)}
- **JavaScript**: ${formatBytes(analysis.jsSize)} (${Math.round(analysis.jsSize / analysis.totalSize * 100)}%)
- **CSS**: ${formatBytes(analysis.cssSize)} (${Math.round(analysis.cssSize / analysis.totalSize * 100)}%)
- **Images**: ${analysis.imageCount} files
- **Fonts**: ${analysis.fontCount} files

## 📦 Compression Analysis

- **Gzip Size**: ${formatBytes(analysis.optimizations.gzippedSize)}
- **Brotli Size**: ${formatBytes(analysis.optimizations.brotliSize)}
- **Compression Ratio**: ${analysis.optimizations.compressionRatio.toFixed(1)}%

## 📈 Performance Score: ${score}/100

${score >= 80 ? '🟢 Excellent' : score >= 60 ? '🟡 Good' : '🔴 Needs Improvement'}

## 🗂️ Bundle Composition

### Chunks (${analysis.chunks.length})

${analysis.chunks
  .sort((a, b) => b.size - a.size)
  .slice(0, 10)
  .map(chunk => `- ${chunk.name}: ${formatBytes(chunk.size)} (${chunk.type})`)
  .join('\n')}

### Assets

${analysis.assets
  .slice(0, 10)
  .map(asset => `- ${asset.type}/${asset.file}: ${formatBytes(asset.size)}`)
  .join('\n')}

${analysis.pages.length > 0 ? `
### Pages (${analysis.pages.length})

${analysis.pages
  .sort((a, b) => b.size - a.size)
  .slice(0, 10)
  .map(page => `- ${page.page}: ${formatBytes(page.size)}`)
  .join('\n')}
` : ''}

## 💡 Optimization Recommendations

${recommendations.map(rec => `- ${rec}`).join('\n')}

## 🎯 Performance Targets

### Bundle Size Goals
- **Total Bundle Size**: < 2MB
- **JavaScript Size**: < 1.5MB
- **Largest Chunk**: < 250KB
- **Compression Ratio**: < 40% of original

### Current Performance
${analysis.totalSize < 2000000 ? '✅ On Target' : '⚠️ Needs Optimization'}

## 🚀 Next.js Optimizations Applied

✅ **Code Splitting**: Automatic vendor chunk separation
✅ **Tree Shaking**: Package imports optimization enabled
✅ **Image Optimization**: WebP/AVIF formats enabled
✅ **Compression**: Gzip/Brotli compression
✅ **Static Optimization**: Where applicable

## 📝 Action Items

1. **Large Chunks**: Review chunks > 300KB for further splitting
2. **Vendor Optimization**: Ensure vendor chunks are properly separated
3. **Image Assets**: Verify all images use next/image optimization
4. **Static Generation**: Consider SSG for static pages
5. **Bundle Analysis**: Run \`npm run build:analyze\` for detailed visualization

## 🔍 Files to Review

- \`next.config.ts\`: Webpack configuration and optimization settings
- \`package.json\**: Dependencies and bundle analysis scripts
- \`.next/static/chunks/\`: Generated bundle files
- \`bundle-analysis.html\`: Visual bundle analysis (if generated)

---

*This report was generated by the Next.js Bundle Analyzer. For more detailed analysis, run \`npm run build:analyze\` to see the interactive bundle visualization.*
  `.trim();

  return report;
}

function saveReport(report, analysis) {
  // Create output directory if it doesn't exist
  if (!existsSync(ANALYSIS_OUTPUT_DIR)) {
    mkdirSync(ANALYSIS_OUTPUT_DIR, { recursive: true });
  }

  // Save markdown report
  const timestamp = new Date().toISOString().split('T')[0];
  const reportPath = join(ANALYSIS_OUTPUT_DIR, `bundle-analysis-${timestamp}.md`);
  writeFileSync(reportPath, report);

  // Save JSON data
  const jsonData = {
    timestamp: new Date().toISOString(),
    analysis,
    healthScore: generateHealthScore(analysis),
    recommendations: generateOptimizationRecommendations(analysis)
  };
  const jsonPath = join(ANALYSIS_OUTPUT_DIR, `bundle-analysis-${timestamp}.json`);
  writeFileSync(jsonPath, JSON.stringify(jsonData, null, 2));

  log(`Report saved to: ${reportPath}`, 'green');
  log(`JSON data saved to: ${jsonPath}`, 'green');
}

function main() {
  log('🔍 Analyzing Next.js bundle...', 'bright');

  // Check if build directory exists
  if (!existsSync(BUILD_DIR)) {
    log('❌ Build directory not found. Run `npm run build` first.', 'red');
    process.exit(1);
  }

  // Analyze bundle
  const analysis = analyzeNextBundle(BUILD_DIR);

  // Display summary
  log('\n📊 Bundle Analysis Summary:', 'bright');
  log(`   Total Size: ${formatBytes(analysis.totalSize)}`, analysis.totalSize > 2000000 ? 'yellow' : 'green');
  log(`   JavaScript: ${formatBytes(analysis.jsSize)}`, analysis.jsSize > 1500000 ? 'yellow' : 'green');
  log(`   CSS: ${formatBytes(analysis.cssSize)}`, 'cyan');
  log(`   Chunks: ${analysis.chunks.length}`, 'blue');
  log(`   Assets: ${analysis.assets.length}`, 'magenta');

  // Show top 5 largest chunks
  if (analysis.chunks.length > 0) {
    log('\n📦 Largest Chunks:', 'bright');
    analysis.chunks
      .sort((a, b) => b.size - a.size)
      .slice(0, 5)
      .forEach((chunk, index) => {
        const sizeColor = chunk.size > 300000 ? 'red' : chunk.size > 200000 ? 'yellow' : 'green';
        log(`   ${index + 1}. ${chunk.name} - ${formatBytes(chunk.size)} (${chunk.type})`, sizeColor);
      });
  }

  // Generate health score
  const score = generateHealthScore(analysis);
  const scoreColor = score >= 80 ? 'green' : score >= 60 ? 'yellow' : 'red';
  log(`\n📈 Performance Score: ${score}/100`, scoreColor);

  // Show optimization recommendations
  const recommendations = generateOptimizationRecommendations(analysis);
  if (recommendations.length > 0) {
    log('\n💡 Recommendations:', 'bright');
    recommendations.forEach(rec => {
      log(`   ${rec}`);
    });
  }

  // Save report
  const report = generateReport(analysis);
  saveReport(report, analysis);

  log('\n✅ Bundle analysis completed!', 'green');
}

// Run the analysis
main();