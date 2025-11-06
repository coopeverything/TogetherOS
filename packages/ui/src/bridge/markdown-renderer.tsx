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
 * GitHub icon SVG for source links
 */
function GitHubIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 16 16"
      fill="currentColor"
      style={{ display: 'inline-block', marginRight: '0.375rem', verticalAlign: 'text-bottom' }}
    >
      <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z" />
    </svg>
  );
}

/**
 * Parse inline markdown formatting (links, bold) within a line
 * Handles: [text](url), **bold**
 */
function parseInlineMarkdown(text: string, linkClassName?: string, isSourceLink: boolean = false): JSX.Element[] {
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
          {isSourceLink && <GitHubIcon />}
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
          {parseInlineMarkdown(
            paragraphText,
            isInSourceSection ? options?.sourceClassName : options?.linkClassName,
            isInSourceSection
          )}
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
          {parseInlineMarkdown(headerText, options?.linkClassName, false)}
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
          {parseInlineMarkdown(
            itemText,
            isInSourceSection ? options?.sourceClassName : options?.linkClassName,
            isInSourceSection
          )}
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
