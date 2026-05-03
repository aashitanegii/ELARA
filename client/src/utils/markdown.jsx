/**
 * Lightweight markdown renderer — converts **bold**, ## headers, and line breaks to React elements.
 * Shared utility to eliminate duplication across ChatPanel and JargonBuster.
 * @module utils/markdown
 */

/**
 * Render a block of markdown text into an array of React elements.
 * Supports ## headers, blank-line spacing, and inline bold.
 * @param {string} text - Raw markdown text
 * @returns {Array<JSX.Element>|null} Array of React elements or null
 */
export function renderMarkdown(text) {
  if (!text) return null;
  const lines = text.split('\n');
  const elements = [];
  let key = 0;

  for (const line of lines) {
    key++;
    if (/^#{1,3}\s/.test(line)) {
      const content = line.replace(/^#{1,3}\s*/, '');
      elements.push(<strong key={key} className="md-heading">{renderInline(content)}</strong>);
      elements.push(<br key={key + 'br'} />);
      continue;
    }
    if (line.trim() === '') {
      elements.push(<br key={key} />);
      continue;
    }
    elements.push(<span key={key}>{renderInline(line)}</span>);
    elements.push(<br key={key + 'br'} />);
  }
  return elements;
}

/**
 * Render inline **bold** formatting within a single line of text.
 * @param {string} text - Single line of text
 * @returns {Array|string} Array of text and <strong> elements, or plain string
 */
export function renderInline(text) {
  const parts = [];
  const boldRegex = /\*\*(.+?)\*\*/g;
  let lastIndex = 0;
  let idx = 0;
  let match;

  while ((match = boldRegex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index));
    }
    parts.push(<strong key={`b${idx++}`}>{match[1]}</strong>);
    lastIndex = boldRegex.lastIndex;
  }
  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }
  return parts.length > 0 ? parts : text;
}

/**
 * Parse [BADGE: ...] tags from AI response text.
 * Returns cleaned text and extracted badge labels.
 * @param {string} text - Raw AI response text
 * @returns {{ cleanText: string, badges: string[] }}
 */
export function parseBadges(text) {
  const badgeRegex = /\[BADGE:\s*([^\]]+)\]/g;
  const badges = [];
  let match;
  while ((match = badgeRegex.exec(text)) !== null) {
    badges.push(match[1].trim());
  }
  const cleanText = text.replace(badgeRegex, '').trim();
  return { cleanText, badges };
}
