import sanitizeHtml from 'sanitize-html';

/**
 * Format latency value with appropriate unit
 * @param ms latency in milliseconds
 * @returns formatted string with unit
 */
export function formatLatency(ms: number): string {
  if (!ms && ms !== 0) return '-';

  if (ms < 200) {
    return `${ms.toFixed(0)} ms`;
  }

  if (ms < 60000) {
    return `${(ms / 1000).toFixed(2)} s`;
  }

  const minutes = Math.floor(ms / 60000);
  const seconds = ((ms % 60000) / 1000).toFixed(1);
  return `${minutes}m ${seconds}s`;
}

/**
 * Format latency value for chart axis display
 * @param ms latency in milliseconds
 * @returns formatted string with unit, more compact than formatLatency
 */
export function formatLatencyForAxis(ms: number): string {
  if (ms <= 200) {
    return `${ms} ms`;
  }

  if (ms < 60000) {
    return `${(ms / 1000).toFixed(2)}s`;
  }

  const minutes = Math.floor(ms / 60000);
  const seconds = ((ms % 60000) / 1000).toFixed(1);
  return `${minutes}m${seconds}s`;
}

/**
 * Get color based on latency value for UI display
 * @param ms latency in milliseconds
 * @returns color key for HeroUI components:
 * - "success" for < 100ms
 * - "warning" for 100ms-1000ms
 * - "danger" for > 1000ms or invalid values
 */
export function getLatencyColor(ms: number): 'success' | 'warning' | 'danger' {
  if (!ms && ms !== 0) return 'danger';
  if (ms < 200) return 'success';
  if (ms < 1000) return 'warning';
  return 'danger';
}

/**
 * Convert date string to timestamp with timezone support
 * @param dateString Date string in ISO format or 'YYYY-MM-DD HH:MM:SS'
 * @param tz Timezone offset in format '+HH:MM' or 'UTC'
 * @returns timestamp in milliseconds
 */
export function dateStringToTimestamp(dateString: string, tz = '+0000'): number {
  if (!dateString) return 0;

  try {
    const dateStr = dateString.trim().replace(' +0000', '');
    const timezone = tz.replace(':', '').replace('UTC', '+0000');

    let timestamp = new Date(`${dateStr} ${timezone}`).getTime();

    if (!Number.isFinite(timestamp)) {
      timestamp = new Date(dateStr).getTime();

      if (Number.isFinite(timestamp) && timezone !== '+0000') {
        const tzOffsetMs =
          Number.parseInt(timezone.slice(1, 3)) * 3600000 +
          Number.parseInt(timezone.slice(3, 5)) * 60000;
        timestamp += timezone.startsWith('-') ? tzOffsetMs : -tzOffsetMs;
      }
    }

    return Number.isFinite(timestamp) ? timestamp : 0;
  } catch {
    return 0;
  }
}

/**
 * Extract the first sentence from a markdown string, skipping the title
 * @param markdown markdown string
 * @returns first sentence of the main content (excluding title)
 */
export function extractSentence(markdown: string): string {
  const noLinks = markdown.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1');
  const noImages = noLinks.replace(/!\[([^\]]*)\]\([^)]+\)/g, '');
  const noCode = noImages.replace(/```[\s\S]*?```/g, '');
  const noInlineCode = noCode.replace(/`[^`]+`/g, '');

  const lines = noInlineCode.split('\n');
  const contentLines = lines.filter((line) => {
    const trimmed = line.trim();
    if (!trimmed) return false;
    if (/^#{1,6}\s/.test(trimmed)) return false;
    if (/^[-*_]{3,}$/.test(trimmed)) return false;
    if (/^[-*+]\s+/.test(trimmed)) return false;
    if (/^>\s+/.test(trimmed)) return false;
    return true;
  });

  const content = contentLines.join(' ');
  const noHtml = sanitizeHtml(content, {
    allowedTags: ['img'],
    allowedAttributes: {
      img: ['src', 'alt'],
    },
  });

  const cleaned = noHtml.replace(/\s+/g, ' ').trim();

  const match = cleaned.match(/[^.!?]+[.!?]/);
  if (match) {
    return `${match[0]} ...`;
  }

  return cleaned.length > 100 ? `${cleaned.slice(0, 100)} ...` : cleaned;
}
