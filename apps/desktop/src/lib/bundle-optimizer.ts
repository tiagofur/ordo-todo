/**
 * Bundle Optimization Analyzer
 *
 * Comprehensive bundle analysis and optimization utilities
 */

import { platform, isDevelopment } from './optimized-imports';
import { codeSplittingConfig, getChunkRecommendations } from './code-splitting';

export interface BundleMetrics {
  totalSize: number;
  gzippedSize: number;
  brotliSize: number;
  chunks: ChunkMetrics[];
  assets: AssetMetrics[];
  dependencies: DependencyMetrics[];
}

export interface ChunkMetrics {
  name: string;
  size: number;
  gzippedSize: number;
  type: 'entry' | 'chunk' | 'asset';
  modules: string[];
  dependencies: string[];
}

export interface AssetMetrics {
  name: string;
  size: number;
  type: 'js' | 'css' | 'image' | 'font' | 'other';
  optimized: boolean;
}

export interface DependencyMetrics {
  name: string;
  version: string;
  size: number;
  used: boolean;
  usage: number; // percentage of exports used
}

export interface BundleHealthScore {
  overall: number; // 0-100
  categories: {
    size: number;
    performance: number;
    maintainability: number;
    caching: number;
  };
  recommendations: string[];
  warnings: string[];
}

export interface OptimizationConfig {
  level: 'minimal' | 'standard' | 'aggressive';
  enableTreeShaking: boolean;
  enableCodeSplitting: boolean;
  enableCompression: boolean;
  chunkSizeLimit: number;
  dependencyAnalysis: boolean;
}

class BundleAnalyzer {
  private metrics: BundleMetrics | null = null;
  private analysisTime = 0;
  private config: OptimizationConfig;

  constructor(config: Partial<OptimizationConfig> = {}) {
    this.config = {
      level: 'standard',
      enableTreeShaking: true,
      enableCodeSplitting: true,
      enableCompression: true,
      chunkSizeLimit: 250000, // 250KB
      dependencyAnalysis: true,
      ...config
    };
  }

  // Analyze current bundle (in development)
  async analyzeBundle(): Promise<BundleMetrics> {
    const startTime = performance.now();

    if (typeof window === 'undefined' || !isDevelopment) {
      throw new Error('Bundle analysis is only available in development mode');
    }

    try {
      // Fetch bundle analysis data from Vite's built-in stats
      const response = await fetch('/@vite/client');
      const clientData = await response.text();

      // Extract module information
      const moduleRegex = /"([^"]+)":\{([^}]+)\}/g;
      const modules: string[] = [];
      let match;

      while ((match = moduleRegex.exec(clientData)) !== null) {
        modules.push(match[1]);
      }

      // Simulate bundle metrics (in real implementation, this would come from build stats)
      const metrics: BundleMetrics = {
        totalSize: this.estimateBundleSize(modules),
        gzippedSize: this.estimateCompressedSize(modules, 'gzip'),
        brotliSize: this.estimateCompressedSize(modules, 'brotli'),
        chunks: this.analyzeChunks(modules),
        assets: this.analyzeAssets(),
        dependencies: this.analyzeDependencies(modules)
      };

      this.metrics = metrics;
      this.analysisTime = performance.now() - startTime;

      return metrics;
    } catch (error) {
      console.error('Failed to analyze bundle:', error);
      throw error;
    }
  }

  // Generate bundle health score
  generateHealthScore(metrics: BundleMetrics): BundleHealthScore {
    const scores = {
      size: this.calculateSizeScore(metrics),
      performance: this.calculatePerformanceScore(metrics),
      maintainability: this.calculateMaintainabilityScore(metrics),
      caching: this.calculateCachingScore(metrics)
    };

    const overall = Object.values(scores).reduce((sum, score) => sum + score, 0) / 4;

    const recommendations = this.generateRecommendations(metrics, scores);
    const warnings = this.generateWarnings(metrics);

    return {
      overall: Math.round(overall),
      categories: scores,
      recommendations,
      warnings
    };
  }

  // Get optimization suggestions
  getOptimizationSuggestions(): string[] {
    if (!this.metrics) {
      return ['Run bundle analysis first to get optimization suggestions'];
    }

    const suggestions: string[] = [];

    // Size-based suggestions
    if (this.metrics.totalSize > 2000000) { // 2MB
      suggestions.push('Bundle size exceeds 2MB. Consider aggressive code splitting');
    }

    // Chunk analysis
    this.metrics.chunks.forEach(chunk => {
      if (chunk.size > this.config.chunkSizeLimit) {
        suggestions.push(`Chunk "${chunk.name}" is ${Math.round(chunk.size / 1000)}KB. Consider splitting it`);
      }
    });

    // Dependency analysis
    const unusedDeps = this.metrics.dependencies.filter(dep => !dep.used);
    if (unusedDeps.length > 0) {
      suggestions.push(`${unusedDeps.length} unused dependencies detected: ${unusedDeps.map(d => d.name).join(', ')}`);
    }

    // Large dependencies
    const largeDeps = this.metrics.dependencies.filter(dep => dep.size > 100000);
    if (largeDeps.length > 0) {
      suggestions.push(`Large dependencies detected: ${largeDeps.map(d => `${d.name} (${Math.round(d.size / 1000)}KB)`).join(', ')}`);
    }

    // Add code splitting recommendations
    suggestions.push(...getChunkRecommendations());

    return suggestions;
  }

  // Export analysis report
  exportReport(): string {
    if (!this.metrics) {
      return 'No bundle analysis available. Run analyzeBundle() first.';
    }

    const healthScore = this.generateHealthScore(this.metrics);

    const report = `
# Bundle Analysis Report

Generated: ${new Date().toISOString()}
Analysis Time: ${Math.round(this.analysisTime)}ms

## Bundle Metrics

- **Total Size**: ${this.formatSize(this.metrics.totalSize)}
- **Gzipped Size**: ${this.formatSize(this.metrics.gzippedSize)}
- **Brotli Size**: ${this.formatSize(this.metrics.brotliSize)}
- **Chunks**: ${this.metrics.chunks.length}
- **Assets**: ${this.metrics.assets.length}
- **Dependencies**: ${this.metrics.dependencies.length}

## Health Score: ${healthScore.overall}/100

### Categories
- **Size**: ${healthScore.categories.size}/100
- **Performance**: ${healthScore.categories.performance}/100
- **Maintainability**: ${healthScore.categories.maintainability}/100
- **Caching**: ${healthScore.categories.caching}/100

## Top Chunks by Size

${this.metrics.chunks
  .sort((a, b) => b.size - a.size)
  .slice(0, 10)
  .map(chunk => `- ${chunk.name}: ${this.formatSize(chunk.size)} (${chunk.modules.length} modules)`)
  .join('\n')}

## Large Dependencies

${this.metrics.dependencies
  .filter(dep => dep.size > 50000)
  .sort((a, b) => b.size - a.size)
  .slice(0, 10)
  .map(dep => `- ${dep.name}@${dep.version}: ${this.formatSize(dep.size)} (${dep.used ? 'used' : 'unused'})`)
  .join('\n')}

## Optimization Recommendations

${healthScore.recommendations.map(rec => `- ${rec}`).join('\n')}

## Warnings

${healthScore.warnings.length > 0 ? healthScore.warnings.map(warn => `- ⚠️ ${warn}`).join('\n') : 'No warnings detected.'}
    `.trim();

    return report;
  }

  // Private helper methods

  private estimateBundleSize(modules: string[]): number {
    // Simplified estimation - in real implementation this would use actual build stats
    const baseSize = 500000; // 500KB base
    const moduleSize = modules.length * 2000; // 2KB per module average
    return baseSize + moduleSize;
  }

  private estimateCompressedSize(modules: string[], algorithm: 'gzip' | 'brotli'): number {
    const uncompressed = this.estimateBundleSize(modules);
    const ratio = algorithm === 'brotli' ? 0.25 : 0.35; // Typical compression ratios
    return Math.round(uncompressed * ratio);
  }

  private analyzeChunks(modules: string[]): ChunkMetrics[] {
    // Group modules into chunks (simplified)
    const chunks: Record<string, string[]> = {
      main: [],
      vendor: [],
      pages: [],
      components: [],
      utils: []
    };

    modules.forEach(module => {
      if (module.includes('node_modules')) {
        chunks.vendor.push(module);
      } else if (module.includes('/pages/')) {
        chunks.pages.push(module);
      } else if (module.includes('/components/')) {
        chunks.components.push(module);
      } else if (module.includes('/lib/') || module.includes('/hooks/')) {
        chunks.utils.push(module);
      } else {
        chunks.main.push(module);
      }
    });

    return Object.entries(chunks).map(([name, moduleList]) => ({
      name,
      size: moduleList.length * 2000, // Estimated size
      gzippedSize: Math.round(moduleList.length * 2000 * 0.35),
      type: name === 'main' ? 'entry' : 'chunk',
      modules: moduleList,
      dependencies: [] // Would be populated with actual analysis
    }));
  }

  private analyzeAssets(): AssetMetrics[] {
    // Simulate asset analysis
    return [
      { name: 'main.css', size: 25000, type: 'css', optimized: true },
      { name: 'inter.woff2', size: 85000, type: 'font', optimized: true },
      { name: 'logo.png', size: 15000, type: 'image', optimized: false }
    ];
  }

  private analyzeDependencies(modules: string[]): DependencyMetrics[] {
    // Extract dependencies from modules
    const deps = new Map<string, { count: number; size: number }>();

    modules.forEach(module => {
      if (module.includes('node_modules')) {
        const match = module.match(/node_modules\/([^\/]+)/);
        if (match) {
          const depName = match[1];
          const current = deps.get(depName) || { count: 0, size: 0 };
          deps.set(depName, {
            count: current.count + 1,
            size: current.size + Math.random() * 100000 // Random size estimation
          });
        }
      }
    });

    return Array.from(deps.entries()).map(([name, data]) => ({
      name,
      version: '1.0.0', // Would be extracted from package.json
      size: Math.round(data.size),
      used: data.count > 0,
      usage: Math.min(100, data.count * 10) // Simplified usage calculation
    }));
  }

  private calculateSizeScore(metrics: BundleMetrics): number {
    const idealSize = 1000000; // 1MB ideal
    const maxSize = 3000000; // 3MB maximum acceptable

    if (metrics.totalSize <= idealSize) return 100;
    if (metrics.totalSize >= maxSize) return 0;

    // Linear interpolation
    return Math.round(100 * (1 - (metrics.totalSize - idealSize) / (maxSize - idealSize)));
  }

  private calculatePerformanceScore(metrics: BundleMetrics): number {
    let score = 100;

    // Deduct points for large chunks
    metrics.chunks.forEach(chunk => {
      if (chunk.size > 500000) score -= 20;
      else if (chunk.size > 250000) score -= 10;
    });

    // Deduct points for unused dependencies
    const unusedDeps = metrics.dependencies.filter(dep => !dep.used);
    score -= unusedDeps.length * 5;

    return Math.max(0, score);
  }

  private calculateMaintainabilityScore(metrics: BundleMetrics): number {
    let score = 100;

    // Too many chunks can be hard to maintain
    if (metrics.chunks.length > 50) score -= 20;
    else if (metrics.chunks.length > 30) score -= 10;

    // Too many dependencies
    if (metrics.dependencies.length > 200) score -= 20;
    else if (metrics.dependencies.length > 100) score -= 10;

    return Math.max(0, score);
  }

  private calculateCachingScore(metrics: BundleMetrics): number {
    let score = 100;

    // Good chunking for caching
    const vendorChunks = metrics.chunks.filter(chunk => chunk.name.includes('vendor'));
    if (vendorChunks.length > 0) score += 10;

    // Penalize if no code splitting
    if (metrics.chunks.length <= 3) score -= 30;

    return Math.min(100, Math.max(0, score));
  }

  private generateRecommendations(metrics: BundleMetrics, scores: any): string[] {
    const recommendations: string[] = [];

    if (scores.size < 70) {
      recommendations.push('Enable aggressive tree shaking and remove unused exports');
      recommendations.push('Consider using dynamic imports for large libraries');
    }

    if (scores.performance < 70) {
      recommendations.push('Implement route-based code splitting');
      recommendations.push('Preload critical chunks and prefetch non-critical ones');
    }

    if (scores.maintainability < 70) {
      recommendations.push('Consolidate similar chunks to reduce complexity');
      recommendations.push('Review and remove unnecessary dependencies');
    }

    if (scores.caching < 70) {
      recommendations.push('Separate vendor code from application code');
      recommendations.push('Use content hashing for better cache invalidation');
    }

    return recommendations;
  }

  private generateWarnings(metrics: BundleMetrics): string[] {
    const warnings: string[] = [];

    if (metrics.totalSize > 5000000) {
      warnings.push('Bundle size exceeds 5MB - this will significantly impact load times');
    }

    const oversizedChunks = metrics.chunks.filter(chunk => chunk.size > 1000000);
    if (oversizedChunks.length > 0) {
      warnings.push(`${oversizedChunks.length} chunks exceed 1MB`);
    }

    const unusedDeps = metrics.dependencies.filter(dep => !dep.used && dep.size > 50000);
    if (unusedDeps.length > 0) {
      warnings.push(`Large unused dependencies detected`);
    }

    return warnings;
  }

  private formatSize(bytes: number): string {
    const units = ['B', 'KB', 'MB', 'GB'];
    let size = bytes;
    let unitIndex = 0;

    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024;
      unitIndex++;
    }

    return `${size.toFixed(1)} ${units[unitIndex]}`;
  }
}

class TreeShakingOptimizer {
  private unusedExports = new Map<string, string[]>();

  // Analyze unused exports in dependencies
  analyzeUnusedExports(modules: string[]): Record<string, string[]> {
    const exports: Record<string, string[]> = {};

    modules.forEach(module => {
      if (module.includes('node_modules')) {
        // Simulate export analysis
        const libName = module.split('node_modules/')[1]?.split('/')[0];
        if (libName && !exports[libName]) {
          exports[libName] = this.simulateExports(libName);
        }
      }
    });

    return exports;
  }

  private simulateExports(libName: string): string[] {
    // Known libraries and their potential exports
    const libraryExports: Record<string, string[]> = {
      'lodash': ['get', 'set', 'clone', 'debounce', 'throttle', 'merge', 'pick', 'omit'],
      'date-fns': ['format', 'parse', 'addDays', 'subDays', 'startOfDay', 'endOfDay'],
      'recharts': ['BarChart', 'LineChart', 'PieChart', 'XAxis', 'YAxis', 'Tooltip'],
      'framer-motion': ['motion', 'AnimatePresence', 'useAnimation', 'useScroll']
    };

    return libraryExports[libName] || [];
  }

  // Generate tree shaking recommendations
  generateRecommendations(): string[] {
    return [
      'Use ES module imports instead of CommonJS require',
      'Avoid importing entire libraries when only specific functions are needed',
      'Use babel-plugin-import for libraries that support it',
      'Configure sideEffects in package.json for pure libraries',
      'Use dynamic imports for conditional dependencies'
    ];
  }
}

class CodeSplittingOptimizer {
  // Analyze code splitting opportunities
  analyzeOpportunities(modules: string[]): string[] {
    const opportunities: string[] = [];

    // Check for large components that could be lazy loaded
    const componentModules = modules.filter(m => m.includes('/components/'));
    if (componentModules.length > 20) {
      opportunities.push('Consider lazy loading components in feature-based chunks');
    }

    // Check for heavy libraries
    const heavyLibs = ['recharts', 'monaco-editor', 'pdf-lib', 'three'];
    heavyLibs.forEach(lib => {
      if (modules.some(m => m.includes(lib))) {
        opportunities.push(`Load ${lib} dynamically when needed`);
      }
    });

    // Check for route-based splitting opportunities
    const pageModules = modules.filter(m => m.includes('/pages/'));
    if (pageModules.length > 0 && !this.hasRouteSplitting(modules)) {
      opportunities.push('Implement route-based code splitting');
    }

    return opportunities;
  }

  private hasRouteSplitting(modules: string[]): boolean {
    // Simplified check for route splitting
    return modules.some(m => m.includes('lazy(') || m.includes('import('));
  }

  // Generate code splitting strategy
  generateStrategy(): {
    immediate: string[];
    preload: string[];
    prefetch: string[];
    lazy: string[];
  } {
    return {
      immediate: ['core', 'router', 'authentication'],
      preload: ['dashboard', 'tasks', 'timer'],
      prefetch: ['analytics', 'reports', 'settings'],
      lazy: ['admin', 'advanced-features', 'experimental']
    };
  }
}

// Main bundle optimizer class
export class BundleOptimizer {
  private analyzer: BundleAnalyzer;
  private treeShakingOptimizer: TreeShakingOptimizer;
  private codeSplittingOptimizer: CodeSplittingOptimizer;

  constructor(config: Partial<OptimizationConfig> = {}) {
    this.analyzer = new BundleAnalyzer(config);
    this.treeShakingOptimizer = new TreeShakingOptimizer();
    this.codeSplittingOptimizer = new CodeSplittingOptimizer();
  }

  // Run complete bundle optimization analysis
  async runOptimizationAnalysis(): Promise<{
    metrics: BundleMetrics;
    healthScore: BundleHealthScore;
    recommendations: string[];
  }> {
    const metrics = await this.analyzer.analyzeBundle();
    const healthScore = this.analyzer.generateHealthScore(metrics);
    const recommendations = [
      ...this.analyzer.getOptimizationSuggestions(),
      ...this.treeShakingOptimizer.generateRecommendations(),
      ...this.codeSplittingOptimizer.analyzeOpportunities(metrics.chunks.flatMap(c => c.modules))
    ];

    return {
      metrics,
      healthScore,
      recommendations
    };
  }

  // Get current bundle analysis
  getCurrentAnalysis() {
    return this.analyzer;
  }

  // Export optimization report
  exportReport(): string {
    return this.analyzer.exportReport();
  }
}

// Default instance
export const bundleOptimizer = new BundleOptimizer();

// Utility functions for development
export function enableBundleAnalysis() {
  if (isDevelopment && typeof window !== 'undefined') {
    // Add bundle analysis to window for debugging
    (window as any).__BUNDLE_OPTIMIZER__ = bundleOptimizer;

    // Expose analysis functions
    (window as any).analyzeBundle = () => bundleOptimizer.runOptimizationAnalysis();
    (window as any).exportBundleReport = () => bundleOptimizer.exportReport();

    console.log('🔍 Bundle analysis tools available in window.__BUNDLE_OPTIMIZER__');
  }
}