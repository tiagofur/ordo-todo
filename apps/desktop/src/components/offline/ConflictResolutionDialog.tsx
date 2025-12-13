import { useState, useEffect } from 'react';
import { AlertTriangle, GitBranch, Users, Clock, CheckCircle, XCircle, RefreshCw, Eye, EyeOff } from 'lucide-react';
import { useOfflineSyncStore, ConflictResolution } from '@/stores/offline-sync-store';
import { cn, Button, Card, CardContent, CardHeader, CardTitle, Badge, Alert, AlertDescription, Dialog, DialogContent, DialogHeader, DialogTitle, Tabs, TabsContent, TabsList, TabsTrigger } from '@ordo-todo/ui';
import { formatDistanceToNow } from 'date-fns';

interface ConflictResolutionDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ConflictResolutionDialog({ isOpen, onClose }: ConflictResolutionDialogProps) {
  const { queue, resolveConflict, resolveAllConflicts } = useOfflineSyncStore();
  const [selectedConflicts, setSelectedConflicts] = useState<Set<string>>(new Set());
  const [previewMode, setPreviewMode] = useState<'local' | 'remote' | 'diff'>('diff');
  const [bulkResolution, setBulkResolution] = useState<ConflictResolution>('manual');

  const unresolvedConflicts = queue.conflicts.filter(c => !c.resolvedAt);
  const selectedCount = selectedConflicts.size;

  // Reset selection when dialog closes
  useEffect(() => {
    if (!isOpen) {
      setSelectedConflicts(new Set());
      setPreviewMode('diff');
    }
  }, [isOpen]);

  const handleSelectConflict = (conflictId: string) => {
    setSelectedConflicts(prev => {
      const newSet = new Set(prev);
      if (newSet.has(conflictId)) {
        newSet.delete(conflictId);
      } else {
        newSet.add(conflictId);
      }
      return newSet;
    });
  };

  const handleSelectAll = () => {
    if (selectedCount === unresolvedConflicts.length) {
      setSelectedConflicts(new Set());
    } else {
      setSelectedConflicts(new Set(unresolvedConflicts.map(c => c.id)));
    }
  };

  const handleResolveSelected = async () => {
    if (selectedCount === 0) return;

    for (const conflictId of selectedConflicts) {
      await resolveConflict(conflictId, bulkResolution);
    }

    setSelectedConflicts(new Set());
  };

  const handleResolveAll = async () => {
    await resolveAllConflicts(bulkResolution);
  };

  const formatConflictData = (data: any, entityType: string) => {
    switch (entityType) {
      case 'task':
        return {
          title: data.title || 'Untitled Task',
          description: data.description || 'No description',
          status: data.status || 'unknown',
          priority: data.priority || 'medium',
          dueDate: data.due_date ? new Date(data.due_date).toLocaleDateString() : 'No due date',
          tags: data.tags?.join(', ') || 'No tags',
          completedAt: data.completed_at ? new Date(data.completed_at).toLocaleDateString() : 'Not completed',
        };
      default:
        return data;
    }
  };

  const getConflictTypeIcon = (type: string) => {
    switch (type) {
      case 'update':
        return <RefreshCw className="h-4 w-4 text-blue-500" />;
      case 'delete':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'create':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      default:
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
    }
  };

  const getResolutionColor = (resolution: ConflictResolution) => {
    switch (resolution) {
      case 'local':
        return 'text-blue-600 bg-blue-100';
      case 'remote':
        return 'text-green-600 bg-green-100';
      case 'merge':
        return 'text-purple-600 bg-purple-100';
      case 'manual':
        return 'text-orange-600 bg-orange-100';
    }
  };

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-orange-500" />
            Sync Conflict Resolution
            <Badge variant="outline" className="ml-2">
              {unresolvedConflicts.length} conflicts
            </Badge>
          </DialogTitle>
        </DialogHeader>

        <div className="flex h-[calc(90vh-10rem)]">
          {/* Conflict List */}
          <div className="w-1/3 border-r border-gray-200 dark:border-gray-700 overflow-y-auto p-4">
            <div className="space-y-4">
              {/* Bulk Actions */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Button variant="outline" size="sm" onClick={handleSelectAll}>
                    {selectedCount === unresolvedConflicts.length ? 'Deselect All' : 'Select All'}
                  </Button>
                  <span className="text-sm text-gray-500">
                    {selectedCount} selected
                  </span>
                </div>

                {selectedCount > 0 && (
                  <div className="flex items-center gap-2 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <label className="text-sm font-medium">Resolve selected as:</label>
                    <select
                      value={bulkResolution}
                      onChange={(e) => setBulkResolution(e.target.value as ConflictResolution)}
                      className="px-2 py-1 text-sm border rounded"
                    >
                      <option value="local">Keep Local</option>
                      <option value="remote">Keep Remote</option>
                      <option value="merge">Auto Merge</option>
                      <option value="manual">Manual Review</option>
                    </select>
                    <Button size="sm" onClick={handleResolveSelected}>
                      Resolve Selected ({selectedCount})
                    </Button>
                  </div>
                )}

                {unresolvedConflicts.length > 0 && (
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={handleResolveAll}
                  >
                    Resolve All Conflicts
                  </Button>
                )}
              </div>

              {/* Conflict Items */}
              <div className="space-y-2">
                {unresolvedConflicts.map((conflict) => (
                  <Card
                    key={conflict.id}
                    className={cn(
                      'cursor-pointer transition-colors',
                      selectedConflicts.has(conflict.id) && 'ring-2 ring-blue-500'
                    )}
                    onClick={() => handleSelectConflict(conflict.id)}
                  >
                    <CardHeader className="pb-2">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2">
                          {getConflictTypeIcon(conflict.type)}
                          <span className="font-medium capitalize">
                            {conflict.entityType}
                          </span>
                        </div>
                        <Badge variant="outline" className="text-xs">
                          {formatDistanceToNow(new Date(conflict.timestamp), { addSuffix: true })}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                        {formatConflictData(conflict.localData, conflict.entityType).title}
                      </p>
                      <div className="flex items-center gap-1 mt-2">
                        <div className="h-1.5 w-1.5 rounded-full bg-blue-500" />
                        <span className="text-xs text-blue-600">Local</span>
                        <span className="text-xs text-gray-400">vs</span>
                        <div className="h-1.5 w-1.5 rounded-full bg-green-500" />
                        <span className="text-xs text-green-600">Remote</span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>

          {/* Conflict Details */}
          <div className="flex-1 overflow-y-auto p-4">
            {selectedConflicts.size === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-gray-500">
                <GitBranch className="h-12 w-12 mb-4 opacity-50" />
                <p className="text-lg font-medium">No conflicts selected</p>
                <p className="text-sm mt-1">Select conflicts from the left to review and resolve them</p>
              </div>
            ) : selectedConflicts.size === 1 ? (
              <ConflictDetailView
                conflict={unresolvedConflicts.find(c => c.id === Array.from(selectedConflicts)[0])!}
                previewMode={previewMode}
                onPreviewModeChange={setPreviewMode}
              />
            ) : (
              <div className="space-y-4">
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    {selectedCount} conflicts selected. Choose a resolution strategy above or review individually.
                  </AlertDescription>
                </Alert>

                {/* Quick preview of selected conflicts */}
                <div className="space-y-3">
                  {Array.from(selectedConflicts).slice(0, 5).map(conflictId => {
                    const conflict = unresolvedConflicts.find(c => c.id === conflictId);
                    if (!conflict) return null;

                    return (
                      <Card key={conflictId} className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            {getConflictTypeIcon(conflict.type)}
                            <span className="font-medium">
                              {formatConflictData(conflict.localData, conflict.entityType).title}
                            </span>
                          </div>
                          <Badge className={getResolutionColor(bulkResolution)}>
                            {bulkResolution}
                          </Badge>
                        </div>
                      </Card>
                    );
                  })}
                  {selectedCount > 5 && (
                    <p className="text-center text-sm text-gray-500">
                      ...and {selectedCount - 5} more conflicts
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Individual conflict detail view
interface ConflictDetailViewProps {
  conflict: any;
  previewMode: 'local' | 'remote' | 'diff';
  onPreviewModeChange: (mode: 'local' | 'remote' | 'diff') => void;
}

function ConflictDetailView({ conflict, previewMode, onPreviewModeChange }: ConflictDetailViewProps) {
  const [resolution, setResolution] = useState<ConflictResolution>('manual');
  const [mergedData, setMergedData] = useState(null);

  const localData = formatConflictData(conflict.localData, conflict.entityType);
  const remoteData = formatConflictData(conflict.remoteData, conflict.entityType);

  const handleResolve = async () => {
    const { resolveConflict } = useOfflineSyncStore.getState();
    await resolveConflict(conflict.id, resolution, mergedData);
  };

  const createMerge = () => {
    // Simple merge logic - can be enhanced
    const merged = {
      ...remoteData,
      title: localData.title,
    };
    setMergedData(merged);
    setResolution('merge');
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">
          Conflict: {localData.title}
        </h3>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="capitalize">
            {conflict.entityType}
          </Badge>
          <Badge variant="outline">
            {formatDistanceToNow(new Date(conflict.timestamp), { addSuffix: true })}
          </Badge>
        </div>
      </div>

      {/* Preview Mode Tabs */}
      <Tabs value={previewMode} onValueChange={(value) => onPreviewModeChange(value)}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="diff" className="flex items-center gap-2">
            <GitBranch className="h-4 w-4" />
            Diff View
          </TabsTrigger>
          <TabsTrigger value="local" className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-blue-500" />
            Local Version
          </TabsTrigger>
          <TabsTrigger value="remote" className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-green-500" />
            Remote Version
          </TabsTrigger>
        </TabsList>

        <TabsContent value="diff" className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-blue-500" />
                  Local Changes
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <DataField label="Title" value={localData.title} />
                <DataField label="Description" value={localData.description} />
                <DataField label="Status" value={localData.status} />
                <DataField label="Priority" value={localData.priority} />
                <DataField label="Due Date" value={localData.dueDate} />
                <DataField label="Tags" value={localData.tags} />
                <DataField label="Completed" value={localData.completedAt} />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-green-500" />
                  Remote Changes
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <DataField label="Title" value={remoteData.title} />
                <DataField label="Description" value={remoteData.description} />
                <DataField label="Status" value={remoteData.status} />
                <DataField label="Priority" value={remoteData.priority} />
                <DataField label="Due Date" value={remoteData.dueDate} />
                <DataField label="Tags" value={remoteData.tags} />
                <DataField label="Completed" value={remoteData.completedAt} />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="local">
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-blue-500" />
                Local Version
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <DataField label="Title" value={localData.title} />
              <DataField label="Description" value={localData.description} />
              <DataField label="Status" value={localData.status} />
              <DataField label="Priority" value={localData.priority} />
              <DataField label="Due Date" value={localData.dueDate} />
              <DataField label="Tags" value={localData.tags} />
              <DataField label="Completed" value={localData.completedAt} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="remote">
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-green-500" />
                Remote Version
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <DataField label="Title" value={remoteData.title} />
              <DataField label="Description" value={remoteData.description} />
              <DataField label="Status" value={remoteData.status} />
              <DataField label="Priority" value={remoteData.priority} />
              <DataField label="Due Date" value={remoteData.dueDate} />
              <DataField label="Tags" value={remoteData.tags} />
              <DataField label="Completed" value={remoteData.completedAt} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Resolution Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Resolution</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Button
              variant={resolution === 'local' ? 'default' : 'outline'}
              onClick={() => setResolution('local')}
              className="justify-start"
            >
              Keep Local Changes
            </Button>
            <Button
              variant={resolution === 'remote' ? 'default' : 'outline'}
              onClick={() => setResolution('remote')}
              className="justify-start"
            >
              Keep Remote Changes
            </Button>
            <Button
              variant={resolution === 'merge' ? 'default' : 'outline'}
              onClick={createMerge}
              className="justify-start"
            >
              Auto Merge
            </Button>
            <Button
              variant={resolution === 'manual' ? 'default' : 'outline'}
              onClick={() => setResolution('manual')}
              className="justify-start"
            >
              Manual Edit
            </Button>
          </div>

          <div className="flex justify-end">
            <Button onClick={handleResolve} className="min-w-[120px]">
              Resolve Conflict
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Helper component for displaying data fields
function DataField({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between py-2 border-b border-gray-100 dark:border-gray-800">
      <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
        {label}
      </span>
      <span className="text-sm text-gray-900 dark:text-gray-100">
        {value || '-'}
      </span>
    </div>
  );
}

// Helper function
function formatConflictData(data: any, entityType: string) {
  switch (entityType) {
    case 'task':
      return {
        title: data.title || 'Untitled Task',
        description: data.description || 'No description',
        status: data.status || 'unknown',
        priority: data.priority || 'medium',
        dueDate: data.due_date ? new Date(data.due_date).toLocaleDateString() : 'No due date',
        tags: data.tags?.join(', ') || 'No tags',
        completedAt: data.completed_at ? new Date(data.completed_at).toLocaleDateString() : 'Not completed',
      };
    default:
      return data;
  }
}