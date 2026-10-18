/**
 * Converts ISO date string or timestamp into human-readable relative duration.
 */
export function timeAgo(dateStr: string | number | Date): string {
  try {
    const timestamp = typeof dateStr === 'number' ? dateStr : new Date(dateStr).getTime();
    if (isNaN(timestamp)) return '';
    const diffSec = Math.floor((Date.now() - timestamp) / 1000);
    if (diffSec < 60) return 'just now';
    const diffMin = Math.floor(diffSec / 60);
    if (diffMin < 60) return `${diffMin}m ago`;
    const diffHours = Math.floor(diffMin / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays < 30) return `${diffDays}d ago`;
    return new Date(timestamp).toLocaleDateString();
  } catch {
    return '';
  }
}
