/**
 * Bridge API Endpoint: POST /api/bridge/ask
 *
 * Streaming Q&A endpoint for Bridge landing pilot
 * Features: Rate limiting, NDJSON logging, privacy-first, RAG with docs
 */

import { NextRequest, NextResponse } from 'next/server';
import { join } from 'path';
import { checkRateLimit } from '@/lib/bridge/rate-limiter';
import { logBridgeAction, getClientIp, hashIp } from '@/lib/bridge/logger';
import {
  buildIndex,
  getRelevantExcerpts,
  getSources,
  type DocEntry,
} from '@/lib/bridge/docs-indexer';

const RATE_LIMIT_MAX = parseInt(process.env.BRIDGE_RATE_LIMIT_PER_HOUR || '30', 10);
const RATE_LIMIT_WINDOW = 60 * 60 * 1000; // 1 hour in ms

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const BRIDGE_SYSTEM_PROMPT = `You are Bridge, the assistant of TogetherOS. Speak plainly, avoid jargon, and emphasize cooperation, empathy, and human decision-making. Answer only what was asked. Prefer concrete examples over abstractions and be concise.`;

// Cache the document index in memory
let docsIndex: DocEntry[] | null = null;

function getDocsIndex(): DocEntry[] {
  if (!docsIndex) {
    try {
      // Build index from /docs directory
      // Use environment variable or intelligent fallbacks based on deployment context
      const docsPath = process.env.BRIDGE_DOCS_PATH ||
        (process.env.NODE_ENV === 'production'
          ? join(process.cwd(), 'docs')  // Production: docs at root level
          : join(process.cwd(), '..', '..', 'docs'));  // Development: monorepo structure

      docsIndex = buildIndex(docsPath);
      console.log(`[Bridge] Indexed ${docsIndex.length} documents from ${docsPath}`);
    } catch (error) {
      console.error('[Bridge] Error building docs index:', error);
      docsIndex = [];
    }
  }
  return docsIndex;
}

export async function POST(request: NextRequest) {
  const startTime = Date.now();

  // Get client IP
  const clientIp = getClientIp(request);
  const ipHash = hashIp(clientIp);

  try {
    // Parse request body
    const body = await request.json().catch(() => ({}));
    const question = body.question?.trim();

    // Validate input - 204 for empty
    if (!question || question.length === 0) {
      logBridgeAction({
        action: 'error',
        ip_hash: ipHash,
        status: 204,
        latency_ms: Date.now() - startTime,
      });
      return new NextResponse(null, { status: 204 });
    }

    // Check API key - 401 for missing/invalid
    if (!OPENAI_API_KEY) {
      console.error('[Bridge] OPENAI_API_KEY environment variable is not set. Please configure it in your .env file.');
      logBridgeAction({
        action: 'error',
        ip_hash: ipHash,
        q_len: question.length,
        status: 401,
        error: 'OPENAI_API_KEY not configured',
        latency_ms: Date.now() - startTime,
      });
      return NextResponse.json(
        { error: 'Service not configured. Please contact the administrator.' },
        { status: 401 }
      );
    }

    // Rate limiting - 429 for exceeded
    const rateLimit = checkRateLimit(ipHash, {
      maxRequests: RATE_LIMIT_MAX,
      windowMs: RATE_LIMIT_WINDOW,
    });

    if (!rateLimit.allowed) {
      logBridgeAction({
        action: 'rate_limit',
        ip_hash: ipHash,
        q_len: question.length,
        status: 429,
        latency_ms: Date.now() - startTime,
      });

      const resetInSeconds = Math.ceil((rateLimit.resetAt - Date.now()) / 1000);
      return NextResponse.json(
        {
          error: 'Rate limit exceeded',
          message: `Please wait ${resetInSeconds} seconds before trying again`,
          resetAt: rateLimit.resetAt,
        },
        {
          status: 429,
          headers: {
            'X-RateLimit-Limit': RATE_LIMIT_MAX.toString(),
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': rateLimit.resetAt.toString(),
          },
        }
      );
    }

    // Get relevant documentation context (RAG)
    const index = getDocsIndex();
    const context = getRelevantExcerpts(index, question, 1500);
    const sources = getSources(index, question, 3);

    // Build enhanced system prompt with context
    const enhancedSystemPrompt = context
      ? `${BRIDGE_SYSTEM_PROMPT}

Use the following documentation to inform your answer:

${context}

Cite sources when relevant using the format [Source: title].`
      : BRIDGE_SYSTEM_PROMPT;

    // Call OpenAI API with streaming
    const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          { role: 'system', content: enhancedSystemPrompt },
          { role: 'user', content: question },
        ],
        stream: true,
        max_tokens: 500,
        temperature: 0.7,
      }),
    });

    if (!openaiResponse.ok) {
      const errorData = await openaiResponse.json().catch(() => ({}));
      const errorMessage = errorData.error?.message || `OpenAI API error: ${openaiResponse.status}`;

      // Handle specific OpenAI errors
      if (openaiResponse.status === 401) {
        logBridgeAction({
          action: 'error',
          ip_hash: ipHash,
          q_len: question.length,
          status: 401,
          error: 'Invalid OpenAI API key',
          latency_ms: Date.now() - startTime,
        });
        return NextResponse.json(
          { error: 'Service authentication failed' },
          { status: 401 }
        );
      }

      if (openaiResponse.status === 429) {
        logBridgeAction({
          action: 'error',
          ip_hash: ipHash,
          q_len: question.length,
          status: 429,
          error: 'OpenAI rate limit exceeded',
          latency_ms: Date.now() - startTime,
        });
        return NextResponse.json(
          { error: 'Service temporarily unavailable. Please try again later.' },
          { status: 503 }
        );
      }

      throw new Error(errorMessage);
    }

    // Log successful request
    logBridgeAction({
      action: 'ask',
      ip_hash: ipHash,
      q_len: question.length,
      latency_ms: Date.now() - startTime,
    });

    // Stream response back to client
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        const reader = openaiResponse.body?.getReader();
        if (!reader) {
          controller.close();
          return;
        }

        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            // Parse SSE format from OpenAI
            const text = new TextDecoder().decode(value);
            const lines = text.split('\n').filter((line) => line.trim() !== '');

            for (const line of lines) {
              if (line.startsWith('data: ')) {
                const data = line.slice(6);
                if (data === '[DONE]') continue;

                try {
                  const json = JSON.parse(data);
                  const content = json.choices?.[0]?.delta?.content;
                  if (content) {
                    controller.enqueue(encoder.encode(content));
                  }
                } catch (e) {
                  // Skip malformed JSON
                }
              }
            }
          }

          // Append sources at the end
          if (sources.length > 0) {
            const sourcesText = '\n\n---\n\n**Sources:**\n' +
              sources.map(s => `- [${s.title}](https://github.com/coopeverything/TogetherOS/blob/main/docs/${s.path})`).join('\n');
            controller.enqueue(encoder.encode(sourcesText));
          }
        } catch (error) {
          console.error('Stream error:', error);
        } finally {
          controller.close();
        }
      },
    });

    return new NextResponse(stream, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'X-RateLimit-Limit': RATE_LIMIT_MAX.toString(),
        'X-RateLimit-Remaining': rateLimit.remaining.toString(),
        'X-RateLimit-Reset': rateLimit.resetAt.toString(),
      },
    });
  } catch (error) {
    // 500 for unexpected errors
    console.error('Bridge API error:', error);
    logBridgeAction({
      action: 'error',
      ip_hash: ipHash,
      status: 500,
      error: error instanceof Error ? error.message : 'Unknown error',
      latency_ms: Date.now() - startTime,
    });

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
