import React, { useState, useEffect } from 'react';
import { Package, Download, Eye, RefreshCw, AlertTriangle, CheckCircle, Clock, Filter, Search, BarChart3, PieChart } from 'lucide-react';
import { cn, Card, CardContent, CardHeader, CardTitle, Button, Input, Select, SelectContent, SelectItem, SelectTrigger, SelectValue, Badge, Progress, Alert, AlertDescription, Tabs, TabsContent, TabsList, TabsTrigger } from '@ordo-todo/ui';

interface BundleAnalyzerProps {
  isOpen?: boolean;
  className?: string;
}

interface ChunkInfo {
  name: string;
  size: number;
  gzippedSize: number;
  brotliSize: number;
  type: 'vendor' | 'app' | 'css' | 'other';
  modules: string[];
  dependencies?: string[];
}

interface BundleMetrics {
  totalSize: number;
  gzippedSize: number;
  brotliSize: number;
  chunks: ChunkInfo[];
  assets: any[];
}

interface BundleAnalysis {
  metrics: BundleMetrics;
  healthScore: number;
  recommendations: string[];
  generatedAt: string;
}

export function BundleAnalyzer({ isOpen = true, className }: BundleAnalyzerProps) {
  const [analysis, setAnalysis] = useState<BundleAnalysis | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [activeTab, setActiveTab] = useState('overview');
  const [sortBy, setSortBy] = useState('size');

  // Mock bundle data for demonstration
  const loadBundleAnalysis = async () => {
    setIsLoading(true);
    try {
      // In a real implementation, this would fetch actual bundle analysis data
      // For now, using mock data that represents a typical Next.js bundle
      const mockAnalysis: BundleAnalysis = {
        generatedAt: new Date().toISOString(),
        metrics: {
          totalSize: 2150000, // ~2.1MB
          gzippedSize: 752500, // ~732KB
          brotliSize: 645000, // ~630KB
          chunks: [
            {
              name: 'vendor-react',
              size: 125000,
              gzippedSize: 42500,
              brotliSize: 37500,
              type: 'vendor',
              modules: ['react', 'react-dom', 'react-is']
            },
            {
              name: 'vendor-ui',
              size: 185000,
              gzippedSize: 62000,
              brotliSize: 52000,
              type: 'vendor',
              modules: ['@ordo-todo/ui', 'lucide-react', '@radix-ui', 'framer-motion']
            },
            {
              name: 'vendor-query',
              size: 95000,
              gzippedSize: 32000,
              brotliSize: 28000,
              type: 'vendor',
              modules: ['@tanstack/react-query', 'zustand']
            },
            {
              name: 'app-pages',
              size: 450000,
              gzippedSize: 150000,
              brotliSize: 130000,
              type: 'app',
              modules: ['dashboard', 'tasks', 'projects', 'analytics']
            },
            {
              name: 'app-components',
              size: 320000,
              gzippedSize: 110000,
              brotli_size: 95000,
              type: 'app',
              modules: ['TaskCard', 'ProjectCard', 'Timer', 'Charts']
            },
            {
              name: 'app-utils',
              size: 80000,
              gzippedSize: 28000,
              brotliSize: 24000,
              type: 'app',
              modules: ['hooks', 'utils', 'lib']
            }
          ],
          assets: [
            { name: 'main.css', size: 45000, type: 'css' },
            { name: 'globals.css', size: 32000, type: 'css' },
            { name: 'logo.png', size: 15000, type: 'image' },
            { name: 'icon-192.png', size: 8500, type: 'image' }
          ]
        },
        healthScore: 85,
        recommendations: [
          'Consider lazy loading large charts library for better initial load time',
          'Implement dynamic imports for rarely used components',
          'Optimize image assets further - consider WebP/AVIF formats',
          'Review bundle splitting strategy for vendor chunks'
        ]
      };

      setAnalysis(mockAnalysis);
    } catch (error) {
      console.error('Failed to load bundle analysis:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && !analysis) {
      loadBundleAnalysis();
    }
  }, [isOpen]);

  const filteredChunks = analysis?.metrics.chunks.filter(chunk => {
    const matchesSearch = searchTerm === '' ||
      chunk.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      chunk.modules.some(mod => mod.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesType = filterType === 'all' || chunk.type === filterType;

    return matchesSearch && matchesType;
  }) || [];

  const sortedChunks = [...(filteredChunks || [])].sort((a, b) => {
    switch (sortBy) {
      case 'size':
        return b.size - a.size;
      case 'name':
        return a.name.localeCompare(b.name);
      case 'type':
        return a.type.localeCompare(b.type);
      default:
        return 0;
    }
  });

  const getHealthScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getCompressionRatio = (original: number, compressed: number) => {
    return Math.round((1 - compressed / original) * 100);
  };

  const formatBytes = (bytes: number) => {
    const units = ['B', 'KB', 'MB', 'GB'];
    let size = bytes;
    let unitIndex = 0;

    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024;
      unitIndex++;
    }

    return `${size.toFixed(1)} ${units[unitIndex]}`;
  };

  const exportAnalysis = () => {
    if (!analysis) return;

    const data = {
      ...analysis,
      exportedAt: new Date().toISOString(),
      summary: {
        totalChunks: analysis.metrics.chunks.length,
        vendorChunks: analysis.metrics.chunks.filter(c => c.type === 'vendor').length,
        appChunks: analysis.metrics.chunks.filter(c => c.type === 'app').length,
        totalDependencies: analysis.metrics.chunks.reduce((sum, chunk) => sum + chunk.modules.length, 0)
      }
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `bundle-analysis-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <Card className="w-full max-w-6xl max-h-[90vh] overflow-hidden">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Package className="h-5 w-5 text-blue-500" />
              Bundle Analyzer
              {analysis?.healthScore && (
                <Badge
                  variant={analysis.healthScore >= 80 ? 'default' : analysis.healthScore >= 60 ? 'secondary' : 'destructive'}
                  className={getHealthScoreColor(analysis.healthScore)}
                >
                  Score: {analysis.healthScore}/100
                </Badge>
              )}
            </CardTitle>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowDetails(!showDetails)}
              >
                <Eye className="h-4 w-4 mr-1" />
                {showDetails ? 'Hide' : 'Show'} Details
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={loadBundleAnalysis}
                disabled={isLoading}
              >
                <RefreshCw className={cn("h-4 w-4 mr-1", isLoading && "animate-spin")} />
                Refresh
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={exportAnalysis}
                disabled={!analysis}
              >
                <Download className="h-4 w-4 mr-1" />
                Export
              </Button>
            </div>
          </div>

          {/* Health Score Overview */}
          {analysis && (
            <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                    {formatBytes(analysis.metrics.totalSize)}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Total Bundle</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                    {formatBytes(analysis.metrics.gzippedSize)}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Gzipped</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                    {getCompressionRatio(analysis.metrics.totalSize, analysis.metrics.gzippedSize)}%
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Compression</div>
                </div>
              </div>
            </div>
          )}
        </CardHeader>

        <CardContent className="p-0">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="chunks">Chunks</TabsTrigger>
              <TabsTrigger value="assets">Assets</TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="mt-0">
              <div className="p-4 space-y-6">
                {/* Bundle Health */}
                {analysis && (
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-semibold text-lg mb-2">Bundle Health</h3>
                      <div className="flex items-center justify-between mb-2">
                        <span>Overall Score</span>
                        <div className="flex items-center gap-2">
                          <div className="w-32">
                            <Progress
                              value={analysis.healthScore}
                              className={getHealthScoreColor(analysis.healthScore)}
                            />
                          </div>
                          <span className={cn("font-bold", getHealthScoreColor(analysis.healthScore))}>
                            {analysis.healthScore}/100
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Recommendations */}
                    <div>
                      <h3 className="font-semibold text-lg mb-2">Recommendations</h3>
                      <div className="space-y-2">
                        {analysis.recommendations.map((rec, index) => (
                          <Alert key={index}>
                            <AlertDescription>{rec}</AlertDescription>
                          </Alert>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </TabsContent>

            {/* Chunks Tab */}
            <TabsContent value="chunks" className="mt-0">
              <div className="p-4">
                {/* Filters */}
                <div className="flex items-center gap-3 mb-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search chunks..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-9"
                    />
                  </div>
                  <Select value={filterType} onValueChange={setFilterType}>
                    <SelectTrigger className="w-32">
                      <SelectValue placeholder="Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      <SelectItem value="vendor">Vendor</SelectItem>
                      <SelectItem value="app">App</SelectItem>
                      <SelectItem value="css">CSS</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger className="w-32">
                      <SelectValue placeholder="Sort by" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="size">Size</SelectItem>
                      <SelectItem value="name">Name</SelectItem>
                      <SelectItem value="type">Type</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Chunks List */}
                <div className="space-y-2">
                  {sortedChunks.map((chunk, index) => (
                    <Card key={`${chunk.name}-${index}`} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex items-start gap-3">
                            <div className={cn(
                              "w-3 h-3 rounded-full",
                              chunk.type === 'vendor' ? 'bg-green-500' :
                              chunk.type === 'app' ? 'bg-blue-500' :
                              chunk.type === 'css' ? 'bg-purple-500' : 'bg-gray-500'
                            )} />
                            <div className="min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="font-medium text-sm">{chunk.name}</span>
                                <Badge variant="outline" className="text-xs">
                                  {chunk.type}
                                </Badge>
                              </div>
                              <div className="flex items-center gap-4 text-xs text-gray-600">
                                <span>{formatBytes(chunk.size)}</span>
                                <span>{formatBytes(chunk.gzippedSize)} gz</span>
                                <span>{getCompressionRatio(chunk.size, chunk.gzippedSize)}% off</span>
                              </div>
                              {chunk.modules.length > 0 && (
                                <div className="text-xs text-gray-500">
                                  {chunk.modules.slice(0, 3).join(', ')}
                                  {chunk.modules.length > 3 && `... + (chunk.modules.length - 3)}`}
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-xs text-gray-500">
                              {formatBytes(chunk.size)}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </TabsContent>

            {/* Assets Tab */}
            <TabsContent value="assets" className="mt-0">
              <div className="p-4">
                {analysis && (
                  <div className="space-y-2">
                    {analysis.metrics.assets.map((asset, index) => (
                      <Card key={`${asset.name}-${index}`} className="hover:shadow-md transition-shadow">
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className={cn(
                                "w-2 h-2 rounded-full",
                                asset.type === 'css' ? 'bg-purple-500' :
                                asset.type === 'image' ? 'bg-blue-500' : 'bg-gray-500'
                              )} />
                              <span className="font-medium text-sm">{asset.name}</span>
                              <span className="text-xs text-gray-600">
                                {formatBytes(asset.size)}
                              </span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}

// Hook for controlling bundle analyzer
export function useBundleAnalyzer() {
  const [isOpen, setIsOpen] = useState(false);

  return {
    isOpen,
    open: () => setIsOpen(true),
    close: () => setIsOpen(false),
    toggle: () => setIsOpen(!isOpen),
  };
}