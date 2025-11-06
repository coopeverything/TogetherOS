/**
 * Shared Markdown Renderer for Bridge responses
 *
 * Supports:
 * - H3 headers (###)
 * - Bullet lists (-, *)
 * - Links ([text](url))
 * - Bold text (**text**)
 * - Horizontal rules (---)
 * - Paragraph spacing
 */

import React from 'react';

/**
 * Parse inline markdown formatting (links, bold) within a line
 * Handles: [text](url), **bold**
 */
function parseInlineMarkdown(text: string, linkClassName?: string): JSX.Element[] {
  const parts: JSX.Element[] = [];
  // Combined regex for links and bold
  const inlineRegex = /\[([^\]]+)\]\(([^)]+)\)|\*\*([^*]+)\*\*/g;
  let lastIndex = 0;
  let match;
  let key = 0;

  while ((match = inlineRegex.exec(text)) !== null) {
    // Add text before the match
    if (match.index > lastIndex) {
      parts.push(
        <span key={`text-${key++}`}>{text.slice(lastIndex, match.index)}</span>
      );
    }

    if (match[1] && match[2]) {
      // Link: [text](url)
      const linkText = match[1];
      const url = match[2];
      parts.push(
        <a
          key={`link-${key++}`}
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className={linkClassName}
        >
          {linkText}
        </a>
      );
    } else if (match[3]) {
      // Bold: **text**
      parts.push(
        <strong key={`bold-${key++}`}>{match[3]}</strong>
      );
    }

    lastIndex = match.index + match[0].length;
  }

  // Add remaining text
  if (lastIndex < text.length) {
    parts.push(<span key={`text-${key++}`}>{text.slice(lastIndex)}</span>);
  }

  return parts.length > 0 ? parts : [<span key="default">{text}</span>];
}

export interface MarkdownRenderOptions {
  linkClassName?: string;
  headingClassName?: string;
  paragraphClassName?: string;
  listClassName?: string;
  sourceClassName?: string;
}

/**
 * Render markdown-formatted text with support for:
 * - H3 headers (###)
 * - Bullet lists (-, *)
 * - Links ([text](url))
 * - Bold text (**text**)
 * - Horizontal rules (---)
 * - Paragraph spacing (empty lines create paragraph breaks)
 * - Source sections with smaller font
 */
export function renderMarkdown(text: string, options?: MarkdownRenderOptions): JSX.Element[] {
  const lines = text.split('\n');
  const elements: JSX.Element[] = [];
  let listItems: JSX.Element[] = [];
  let listKey = 0;
  let paragraphBuffer: string[] = [];
  let isInSourceSection = false;

  const flushParagraph = () => {
    if (paragraphBuffer.length > 0) {
      const paragraphText = paragraphBuffer.join('\n');
      elements.push(
        <p
          key={`p-${elements.length}`}
          className={options?.paragraphClassName}
          style={isInSourceSection ? { fontSize: '0.8125rem', marginTop: '0.5rem' } : undefined}
        >
          {parseInlineMarkdown(paragraphText, isInSourceSection ? options?.sourceClassName : options?.linkClassName)}
        </p>
      );
      paragraphBuffer = [];
    }
  };

  const flushList = () => {
    if (listItems.length > 0) {
      elements.push(
        <ul key={`list-${listKey++}`} className={options?.listClassName}>
          {listItems}
        </ul>
      );
      listItems = [];
    }
  };

  lines.forEach((line, idx) => {
    const trimmedLine = line.trim();

    // Check if we're entering sources section
    if (trimmedLine === '### Sources' || trimmedLine.toLowerCase() === '**sources:**') {
      flushParagraph();
      flushList();
      isInSourceSection = true;

      // Add extra spacing before sources
      elements.push(<div key={`source-spacer-${idx}`} style={{ height: '1rem' }} />);

      elements.push(
        <h3 key={`h3-${idx}`} className={options?.headingClassName}>
          Sources
        </h3>
      );
      return;
    }

    // Horizontal rule
    if (trimmedLine === '---') {
      flushParagraph();
      flushList();
      elements.push(<hr key={`hr-${idx}`} />);
      return;
    }

    // H3 header
    if (trimmedLine.startsWith('###')) {
      flushParagraph();
      flushList();
      const headerText = trimmedLine.slice(3).trim();

      // Check if this is the sources header
      if (headerText.toLowerCase() === 'sources') {
        isInSourceSection = true;
        // Add extra spacing before sources
        elements.push(<div key={`source-spacer-${idx}`} style={{ height: '1rem' }} />);
      }

      elements.push(
        <h3 key={`h3-${idx}`} className={options?.headingClassName}>
          {parseInlineMarkdown(headerText, options?.linkClassName)}
        </h3>
      );
      return;
    }

    // Bullet list item
    if (trimmedLine.startsWith('- ') || trimmedLine.startsWith('* ')) {
      flushParagraph();
      const itemText = trimmedLine.slice(2).trim();
      listItems.push(
        <li
          key={`li-${idx}`}
          style={isInSourceSection ? { fontSize: '0.8125rem', marginTop: '0.25rem' } : undefined}
        >
          {parseInlineMarkdown(itemText, isInSourceSection ? options?.sourceClassName : options?.linkClassName)}
        </li>
      );
      return;
    }

    // Empty line - flush current paragraph
    if (trimmedLine.length === 0) {
      flushParagraph();
      flushList();
      return;
    }

    // Regular text - add to paragraph buffer
    flushList();
    paragraphBuffer.push(line);
  });

  // Flush any remaining content
  flushParagraph();
  flushList();

  return elements.length > 0 ? elements : [<span key="default">{text}</span>];
}
