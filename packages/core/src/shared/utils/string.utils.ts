/**
 * String utility functions
 * Used across all applications for consistent string manipulation
 */

/**
 * Generate a URL-friendly slug from a string
 */
export function generateSlug(text: string): string {
    return text
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, "") // Remove non-word chars (except spaces and hyphens)
        .replace(/[\s_-]+/g, "-") // Replace spaces, underscores with single hyphen
        .replace(/^-+|-+$/g, ""); // Remove leading/trailing hyphens
}

/**
 * Truncate a string to a maximum length with ellipsis
 */
export function truncate(text: string, maxLength: number, ellipsis: string = "..."): string {
    if (text.length <= maxLength) return text;
    return text.slice(0, maxLength - ellipsis.length) + ellipsis;
}

/**
 * Capitalize the first letter of a string
 */
export function capitalize(text: string): string {
    if (!text) return text;
    return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
}

/**
 * Capitalize the first letter of each word
 */
export function capitalizeWords(text: string): string {
    return text
        .split(" ")
        .map((word) => capitalize(word))
        .join(" ");
}

/**
 * Convert camelCase or PascalCase to Title Case
 */
export function camelToTitle(text: string): string {
    const result = text.replace(/([A-Z])/g, " $1");
    return result.charAt(0).toUpperCase() + result.slice(1);
}

/**
 * Convert snake_case to Title Case
 */
export function snakeToTitle(text: string): string {
    return text
        .split("_")
        .map((word) => capitalize(word))
        .join(" ");
}

/**
 * Extract initials from a name (e.g., "John Doe" -> "JD")
 */
export function getInitials(name: string, maxLength: number = 2): string {
    const words = name.trim().split(/\s+/);
    const initials = words
        .map((word) => word.charAt(0).toUpperCase())
        .join("");
    return initials.slice(0, maxLength);
}

/**
 * Generate a random string of specified length
 */
export function generateRandomString(length: number): string {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let result = "";
    for (let i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
}

/**
 * Check if a string is a valid email
 */
export function isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

/**
 * Check if a string is a valid URL
 */
export function isValidUrl(url: string): boolean {
    try {
        new URL(url);
        return true;
    } catch {
        return false;
    }
}

/**
 * Sanitize a string for use in HTML (basic XSS prevention)
 */
export function sanitizeHtml(text: string): string {
    const map: Record<string, string> = {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#x27;",
        "/": "&#x2F;",
    };
    return text.replace(/[&<>"'/]/g, (char) => map[char] || char);
}

/**
 * Remove extra whitespace from a string
 */
export function normalizeWhitespace(text: string): string {
    return text.replace(/\s+/g, " ").trim();
}

/**
 * Count words in a string
 */
export function countWords(text: string): number {
    return text.trim().split(/\s+/).filter(Boolean).length;
}

/**
 * Pluralize a word based on count
 */
export function pluralize(word: string, count: number, plural?: string): string {
    if (count === 1) return word;
    return plural || `${word}s`;
}

/**
 * Format a number with commas (e.g., 1000 -> "1,000")
 */
export function formatNumber(num: number): string {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

/**
 * Generate a unique ID (simple implementation)
 */
export function generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Check if string contains only alphanumeric characters
 */
export function isAlphanumeric(text: string): boolean {
    return /^[a-zA-Z0-9]+$/.test(text);
}

/**
 * Remove HTML tags from a string
 */
export function stripHtmlTags(html: string): string {
    return html.replace(/<[^>]*>/g, "");
}

/**
 * Highlight search terms in text
 */
export function highlightSearchTerms(text: string, searchTerm: string): string {
    if (!searchTerm) return text;
    const regex = new RegExp(`(${searchTerm})`, "gi");
    return text.replace(regex, "<mark>$1</mark>");
}
