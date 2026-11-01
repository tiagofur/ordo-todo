/**
 * Backwards-compatible re-export of the canonical `cn` utility.
 * The single implementation lives in `../utils/index.js`; this module only
 * preserves the historical `lib/utils` import path within the package.
 */
export { cn } from '../utils/index.js';
