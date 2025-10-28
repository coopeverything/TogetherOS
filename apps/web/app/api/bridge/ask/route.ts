/**
 * Bridge API Endpoint: POST /api/bridge/ask
 *
 * Streaming Q&A endpoint for Bridge landing pilot
 * Features: Rate limiting, NDJSON logging, privacy-first
 */

import { NextRequest, NextResponse } from 'next/server';
import { checkRateLimit } from '@/lib/bridge/rate-limiter';
import { logBridgeAction, getClientIp, hashIp } from '@/lib/bridge/logger';

const RATE_LIMIT_MAX = parseInt(process.env.BRIDGE_RATE_LIMIT_PER_HOUR || '30', 10);
const RATE_LIMIT_WINDOW = 60 * 60 * 1000; // 1 hour in ms

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const BRIDGE_SYSTEM_PROMPT = `You are Bridge, the assistant of TogetherOS. Speak plainly, avoid jargon, and emphasize cooperation, empathy, and human decision-making. Answer only what was asked. Prefer concrete examples over abstractions and be concise.`;

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
      logBridgeAction({
        action: 'error',
        ip_hash: ipHash,
        q_len: question.length,
        status: 401,
        error: 'API key not configured',
        latency_ms: Date.now() - startTime,
      });
      return NextResponse.json(
        { error: 'Service not configured' },
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
          { role: 'system', content: BRIDGE_SYSTEM_PROMPT },
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
