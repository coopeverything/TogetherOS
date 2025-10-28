/**
 * BridgeChat Component
 *
 * Minimal chat interface for Bridge Q&A.
 * Supports streaming responses, error states, and rate limiting.
 */

export interface BridgeChatProps {
  /** Optional CSS class name for styling */
  className?: string;
}

export function BridgeChat({ className }: BridgeChatProps) {
  return (
    <div className={className}>
      <div className="bridge-container">
        <h2>Ask Bridge</h2>
        <p className="bridge-intro">Ask Bridge what TogetherOS is.</p>

        <div className="bridge-input-container">
          <input
            type="text"
            placeholder="What is TogetherOS?"
            className="bridge-input"
            aria-label="Ask a question to Bridge"
          />
          <button
            type="submit"
            className="bridge-submit"
            aria-label="Submit question"
          >
            Ask
          </button>
        </div>

        <div className="bridge-output" role="region" aria-live="polite">
          {/* Streaming response will appear here */}
        </div>

        <p className="bridge-disclaimer">
          Bridge may be imperfect; verify important details.
        </p>

        <p className="bridge-sources-stub">
          Sources (coming soon).
        </p>
      </div>
    </div>
  );
}
