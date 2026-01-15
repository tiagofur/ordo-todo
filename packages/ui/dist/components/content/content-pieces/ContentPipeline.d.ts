import type { ContentPipelineProps, PipelineColumnProps } from '@ordo-todo/ui-shared';
/**
 * PipelineColumn component for a single pipeline stage
 */
export declare function PipelineColumn({ status, title, color, children, count, onDrop, isDropTarget, className, }: PipelineColumnProps): import("react/jsx-runtime").JSX.Element;
/**
 * ContentPipeline (Kanban board) for content workflow management
 */
export declare function ContentPipeline({ pipeline, onContentClick, onStatusChange, loading, className, }: ContentPipelineProps): import("react/jsx-runtime").JSX.Element;
export default ContentPipeline;
//# sourceMappingURL=ContentPipeline.d.ts.map