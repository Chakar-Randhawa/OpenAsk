/**
 * Read-time estimator utility for community questions, peer answers, and discussions.
 * Calculates reading duration based on typical adult reading speed (~200 words per minute),
 * with adjusted pacing for technical code snippets (~120 words per minute).
 */

export interface ReadTimeResult {
  minutes: number;
  text: string;
  wordCount: number;
  hasCode: boolean;
}

const WORDS_PER_MINUTE_TEXT = 200;
const WORDS_PER_MINUTE_CODE = 120;

/**
 * Calculates words and estimated read time from raw text or markdown content.
 */
export function getReadTimeDetails(content: string | undefined | null): ReadTimeResult {
  if (!content || typeof content !== 'string') {
    return {
      minutes: 1,
      text: '< 1 min read',
      wordCount: 0,
      hasCode: false,
    };
  }

  const raw = content.trim();
  if (raw.length === 0) {
    return {
      minutes: 1,
      text: '< 1 min read',
      wordCount: 0,
      hasCode: false,
    };
  }

  // Detect code blocks
  const codeBlockRegex = /```[\s\S]*?```/g;
  const codeMatches = raw.match(codeBlockRegex) || [];
  const hasCode = codeMatches.length > 0;

  // Extract code text and regular text
  let codeWords = 0;
  for (const block of codeMatches) {
    const codeContent = block.replace(/```[a-zA-Z]*/g, '').replace(/```/g, '').trim();
    const tokens = codeContent.split(/\s+/).filter((w) => w.length > 0);
    codeWords += tokens.length;
  }

  // Strip code blocks and markdown symbols for regular text word count
  const textWithoutCode = raw
    .replace(codeBlockRegex, ' ')
    .replace(/!\[.*?\]\(.*?\)/g, ' ') // images
    .replace(/\[.*?\]\(.*?\)/g, '$1') // links
    .replace(/[`#*_~>[\]-]/g, ' ') // markdown formatting characters
    .trim();

  const textTokens = textWithoutCode.split(/\s+/).filter((w) => w.length > 0);
  const textWords = textTokens.length;

  const totalWords = textWords + codeWords;

  // Compute weighted read minutes
  const textMinutes = textWords / WORDS_PER_MINUTE_TEXT;
  const codeMinutes = codeWords / WORDS_PER_MINUTE_CODE;
  const totalMinutes = textMinutes + codeMinutes;

  let minutes = Math.round(totalMinutes);
  let text = '';

  if (totalMinutes < 0.6) {
    minutes = 1;
    text = '< 1 min read';
  } else if (minutes <= 1) {
    minutes = 1;
    text = '1 min read';
  } else {
    text = `${minutes} min read`;
  }

  return {
    minutes: Math.max(1, minutes),
    text,
    wordCount: totalWords,
    hasCode,
  };
}

/**
 * Quick helper returning human-friendly read time string, e.g. "2 min read" or "< 1 min read"
 */
export function estimateReadTime(content: string | undefined | null): string {
  return getReadTimeDetails(content).text;
}
