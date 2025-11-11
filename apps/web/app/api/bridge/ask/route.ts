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
import { fetchUserContext, fetchCityContext } from '../../../../lib/bridge/context-service';
import { getActivitiesForCitySize } from '../../../../lib/bridge/activities-data';
import type { ActivityRecommendation as ActivityRec, BridgeTrainingExample } from '@togetheros/types';
import { getCurrentUser } from '@/lib/auth/middleware';
import { PostgresBridgeTrainingRepo } from '../../../../../api/src/modules/bridge-training/repos/PostgresBridgeTrainingRepo';

const RATE_LIMIT_MAX = parseInt(process.env.BRIDGE_RATE_LIMIT_PER_HOUR || '30', 10);
const RATE_LIMIT_WINDOW = 60 * 60 * 1000; // 1 hour in ms

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const BRIDGE_SYSTEM_PROMPT = `You are Bridge, the assistant of TogetherOS. Your role is to guide people through cooperation, not just answer questions directly.

When someone asks you a question:
1. First, ask clarifying questions to understand their situation better
2. Guide them step-by-step through their options
3. Help them think through what actions they can take
4. Be conversational, empathetic, and encouraging

For example:
- If someone asks "What can 15 people do?" → Ask: "Are you already in contact with them?"
- If they say "No" → Suggest: "Would you like to reach out to them? 15 people make a nice number for a meeting..."
- If they say "Yes" → Ask: "Have you organized a meeting yet?"

Speak plainly, avoid jargon, emphasize cooperation and empathy. Be concise and use concrete examples.

**FORMATTING GUIDELINES:**
- Use ### for section headings when structuring your response
- Use - or * for bullet lists when presenting options or steps
- Use **bold** for emphasis on key terms or important concepts
- Make links clickable by using [descriptive text](URL) format
- Structure complex answers with clear sections and lists for readability`;

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
    const conversationHistory = body.conversationHistory || []; // Array of {role, content}

    // Get authenticated user (optional - Bridge works for both authenticated and anonymous users)
    const user = await getCurrentUser(request);

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

    // Fetch user and city context (only for authenticated users)
    let userContext = null;
    let cityContext = null;
    const suggestedActivities: ActivityRec[] = [];

    if (user) {
      try {
        // Fetch user context with personalized interests
        userContext = await fetchUserContext({ userId: user.id });

        // Fetch city context if user has location data
        if (userContext.city && userContext.region) {
          cityContext = await fetchCityContext({
            city: userContext.city,
            region: userContext.region,
          });
        }
      } catch (error) {
        console.warn('Failed to fetch user/city context, continuing without it:', error);
        // Continue without context - Bridge still works for anonymous users
      }
    }

    // Get relevant documentation context (RAG)
    const index = getDocsIndex();
    const context = getRelevantExcerpts(index, question, 1500);
    const sources = getSources(index, question, 3);

    // Build enhanced system prompt with context
    let enhancedSystemPrompt = BRIDGE_SYSTEM_PROMPT;

    // Add user context (personalization) if authenticated
    if (userContext) {
      const interests = [
        ...userContext.explicitInterests,
        ...userContext.implicitInterests.slice(0, 3).map(i => i.topic)
      ].slice(0, 5);

      enhancedSystemPrompt += `

User context (for personalization):
- Location: ${userContext.city}, ${userContext.region}
- Interests: ${interests.join(', ')}
- Engagement level: ${userContext.engagementScore}/100
- Active groups: ${userContext.groupMemberships.length}

Use this context to provide more relevant, personalized guidance.`;
    }

    // Add city context (local opportunities) if available
    if (cityContext && cityContext.activeGroups.length > 0) {
      const topGroups = cityContext.activeGroups.slice(0, 3);
      enhancedSystemPrompt += `

Local context (${cityContext.city}):
- Active groups: ${topGroups.map(g => g.name).join(', ')}
- Trending topics: ${cityContext.trendingTopics.slice(0, 5).join(', ')}

Mention relevant local groups or events when appropriate.`;
    }

    // Add documentation context (RAG)
    if (context) {
      enhancedSystemPrompt += `

Use the following documentation to inform your answer:

${context}

Cite sources when relevant using the format [Source: title].`;
    }

    // Fetch relevant training examples (RAG for training data)
    // Uses reviewed examples that have ideal responses
    // Note: Ratings measure Bridge's ORIGINAL answer quality, not the ideal response
    // Low ratings mean Bridge needs to learn from the ideal response!
    try {
      console.log('[Bridge Training] Searching for examples with question:', question);
      const trainingRepo = new PostgresBridgeTrainingRepo();
      const relevantTrainingExamples = await trainingRepo.findSimilar(question, {
        status: 'reviewed', // Accepts 'reviewed' or 'approved' examples
        limit: 3,
      });
      console.log('[Bridge Training] Found examples:', relevantTrainingExamples.length);

      if (relevantTrainingExamples.length > 0) {
        console.log('[Bridge Training] Adding to prompt:', relevantTrainingExamples.map(ex => ex.question));
        enhancedSystemPrompt += `

**TRAINING EXAMPLES - Learn from these approved responses:**

${relevantTrainingExamples.map((ex: BridgeTrainingExample, idx: number) => `
Example ${idx + 1}:
Q: ${ex.question}
Approved response style: ${ex.idealResponse || ex.bridgeResponse}
`).join('\n')}

When answering similar questions:
- Use these examples as templates for style, tone, and level of detail
- Extract the key approach and recommendations shown
- DO NOT copy the exact text - instead, understand the pattern and apply it freshly
- Personalize your response based on the user's specific situation
- Maintain the same helpful, concrete, action-oriented tone`;
      }
    } catch (error) {
      console.error('[Bridge Training] Failed to fetch training examples:', error);
      // Continue without training data - Bridge still works
    }

    // Build messages array with conversation history
    const messages = [
      { role: 'system', content: enhancedSystemPrompt },
      ...conversationHistory, // Previous messages in the conversation
      { role: 'user', content: question }, // Current question
    ];

    // Call OpenAI API with streaming
    const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages,
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

          // Append sources at the end with structured formatting
          if (sources.length > 0) {
            const sourcesText = '\n\n---\n\n### Sources\n\n' +
              sources.map(s => `- [${s.title}](https://github.com/coopeverything/TogetherOS/blob/yolo/docs/${s.path})`).join('\n');
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
