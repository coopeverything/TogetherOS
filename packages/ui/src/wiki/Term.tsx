'use client'

import { useState, useRef, useEffect } from 'react'

export interface TermProps {
  /** The term word to display */
  word: string
  /** Short definition shown in tooltip */
  definition: string
  /** URL slug for the glossary term (defaults to word lowercase) */
  slug?: string
  /** Optional link to wiki article slug */
  wikiSlug?: string
  /** Optional link to forum discussion */
  discussionUrl?: string
  /** Children to wrap (if not provided, word is used) */
  children?: React.ReactNode
  /** Base URL for glossary (defaults to /glossary) */
  glossaryBase?: string
  /** Base URL for wiki (defaults to /wiki) */
  wikiBase?: string
}

/**
 * Term Component - Inline term with hover tooltip
 *
 * Renders a term with a dotted underline that shows a tooltip on hover.
 * The tooltip contains the definition and links to learn more.
 *
 * Usage:
 * <Term word="coordinator" definition="Implements collective decisions..." />
 *
 * Or with custom display text:
 * <Term word="SP" definition="Support Points..." slug="support-points">
 *   Support Points
 * </Term>
 */
export function Term({
  word,
  definition,
  slug,
  wikiSlug,
  discussionUrl,
  children,
  glossaryBase = '/glossary',
  wikiBase = '/wiki',
}: TermProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [position, setPosition] = useState<'above' | 'below'>('below')
  const termRef = useRef<HTMLSpanElement>(null)
  const tooltipRef = useRef<HTMLDivElement>(null)

  const termSlug = slug || word.toLowerCase().replace(/\s+/g, '-')
  const displayText = children || word
  const glossaryUrl = `${glossaryBase}/${termSlug}`
  const wikiUrl = wikiSlug ? `${wikiBase}/${wikiSlug}` : null

  // Calculate tooltip position
  useEffect(() => {
    if (isOpen && termRef.current && tooltipRef.current) {
      const termRect = termRef.current.getBoundingClientRect()
      const tooltipRect = tooltipRef.current.getBoundingClientRect()
      const viewportHeight = window.innerHeight

      // If tooltip would go below viewport, show above
      if (termRect.bottom + tooltipRect.height + 8 > viewportHeight) {
        setPosition('above')
      } else {
        setPosition('below')
      }
    }
  }, [isOpen])

  return (
    <span
      ref={termRef}
      className="relative inline"
      onMouseEnter={() => setIsOpen(true)}
      onMouseLeave={() => setIsOpen(false)}
      onFocus={() => setIsOpen(true)}
      onBlur={() => setIsOpen(false)}
    >
      <a
        href={glossaryUrl}
        className="border-b border-dotted border-gray-400 text-gray-900 hover:border-blue-500 hover:text-blue-600 transition-colors cursor-help"
      >
        {displayText}
      </a>

      {/* Tooltip */}
      {isOpen && (
        <div
          ref={tooltipRef}
          className={`absolute z-50 w-72 p-4 bg-white rounded-lg shadow-lg border border-gray-200 ${
            position === 'above' ? 'bottom-full mb-2' : 'top-full mt-2'
          } left-1/2 -translate-x-1/2`}
          role="tooltip"
        >
          {/* Arrow */}
          <div
            className={`absolute left-1/2 -translate-x-1/2 w-3 h-3 bg-white border-gray-200 rotate-45 ${
              position === 'above'
                ? 'bottom-[-6px] border-r border-b'
                : 'top-[-6px] border-l border-t'
            }`}
          />

          {/* Content */}
          <div className="relative">
            <h4 className="font-semibold text-gray-900 mb-1">{word}</h4>
            <p className="text-sm text-gray-600 leading-relaxed mb-3">
              {definition}
            </p>

            <div className="flex flex-wrap gap-2">
              <a
                href={glossaryUrl}
                className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-100 text-emerald-700 rounded text-xs font-medium hover:bg-emerald-200 transition-colors"
                onClick={(e) => e.stopPropagation()}
              >
                <svg
                  className="w-3 h-3"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 7l5 5m0 0l-5 5m5-5H6"
                  />
                </svg>
                Learn more
              </a>

              {wikiUrl && (
                <a
                  href={wikiUrl}
                  className="inline-flex items-center gap-1 px-2.5 py-1 bg-blue-100 text-blue-700 rounded text-xs font-medium hover:bg-blue-200 transition-colors"
                  onClick={(e) => e.stopPropagation()}
                >
                  <svg
                    className="w-3 h-3"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                    />
                  </svg>
                  Wiki
                </a>
              )}

              {discussionUrl && (
                <a
                  href={discussionUrl}
                  className="inline-flex items-center gap-1 px-2.5 py-1 bg-gray-100 text-gray-700 rounded text-xs font-medium hover:bg-gray-200 transition-colors"
                  onClick={(e) => e.stopPropagation()}
                >
                  <svg
                    className="w-3 h-3"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                    />
                  </svg>
                  Discuss
                </a>
              )}
            </div>
          </div>
        </div>
      )}
    </span>
  )
}

export default Term
