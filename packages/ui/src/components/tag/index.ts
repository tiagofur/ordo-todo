/**
 * Tag Components
 *
 * Platform-agnostic tag management components.
 * All data fetching and mutations are handled via props.
 */

// Platform-agnostic presentational component
export { TagBadge, type TagType } from './tag-badge.js';

// NOTE: The following components have been moved to apps/web/src/components/tag/:
// - create-tag-dialog (uses useState, useEffect)
// - tag-selector (uses useState)
