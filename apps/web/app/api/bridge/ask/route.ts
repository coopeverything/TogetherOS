/**
 * Bridge API Endpoint: POST /api/bridge/ask
 *
 * Streaming Q&A endpoint for Bridge landing pilot
 * Features: Rate limiting, NDJSON logging, privacy-first, RAG with docs
 */

import { NextRequest, NextResponse } from 'next/server';
import { join } from 'path';
import { readFileSync } from 'fs';
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
import { sanitizeBridgeRequest } from '../../../../lib/bridge/input-sanitizer';

const RATE_LIMIT_MAX = parseInt(process.env.BRIDGE_RATE_LIMIT_PER_HOUR || '30', 10);
const RATE_LIMIT_WINDOW = 60 * 60 * 1000; // 1 hour in ms

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

// Load system prompt from external markdown file
let BRIDGE_SYSTEM_PROMPT: string | null = null;

function getSystemPrompt(): string {
  if (!BRIDGE_SYSTEM_PROMPT) {
    try {
      const promptPath = join(process.cwd(), 'apps', 'web', 'lib', 'bridge', 'system-prompt.md');
      BRIDGE_SYSTEM_PROMPT = readFileSync(promptPath, 'utf-8');
      console.log('[Bridge] Loaded system prompt from file');
    } catch (error) {
      console.error('[Bridge] Error loading system prompt:', error);
      // Fallback to basic prompt if file not found
      BRIDGE_SYSTEM_PROMPT = 'You are Bridge, the assistant of Coopeverything. Your role is to guide people through cooperation. Be conversational, empathetic, and encouraging.';
    }
  }
  return BRIDGE_SYSTEM_PROMPT;
}

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

    // Sanitize and validate input
    const sanitizationResult = sanitizeBridgeRequest(body);

    if (!sanitizationResult.isValid) {
      logBridgeAction({
        action: 'error',
        ip_hash: ipHash,
        status: 400,
        error: sanitizationResult.error || 'Invalid input',
        latency_ms: Date.now() - startTime,
      });
      return NextResponse.json(
        { error: sanitizationResult.error || 'Invalid input' },
        { status: 400 }
      );
    }

    const question = sanitizationResult.question!;
    const conversationHistory = sanitizationResult.conversationHistory!;

    // Get authenticated user (optional - Bridge works for both authenticated and anonymous users)
    const user = await getCurrentUser(request);

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
    let enhancedSystemPrompt = getSystemPrompt();

    // Add user context (personalization) if authenticated
    if (userContext) {
      const interests = [
        ...userContext.explicitInterests,
        ...userContext.implicitInterests.slice(0, 3).map(i => i.topic)
      ].slice(0, 5);

      enhancedSystemPrompt += `

**IMPORTANT - USER PROFILE:**
The user you're talking to lives in ${userContext.city}, ${userContext.region}. You KNOW their location - do NOT ask them where they live.

Their interests include: ${interests.join(', ')}
Engagement level: ${userContext.engagementScore}/100
Active groups: ${userContext.groupMemberships.length}

When they ask about "my city" or local opportunities, they mean ${userContext.city}, ${userContext.region}. Reference their location and interests naturally in your responses.`;
    }

    // Add city context (local opportunities) with RP-based recommendations
    if (cityContext) {
      const memberCount = cityContext.totalGroupMembers || 0;

      enhancedSystemPrompt += `

**LOCAL COMMUNITY STATUS (${userContext?.city || 'your city'}):**
- Total members in city: ${memberCount}
- Active groups: ${cityContext.activeGroups.length}

**IMPORTANT - When user asks what they can do in their city:**

${memberCount === 0 ? `
**No other members yet** - You're the first! Recommend:
- Invite friends and people you know to join CoopEverything
- This is the start of building something meaningful locally
- Rewards: +25 RP per invitation sent, +50 RP when they join, +25 RP bonus when they contribute (100 RP total possible)
- Invitee gets +100 RP starting balance
` : memberCount < 15 ? `
**${memberCount} members, likely no organized meetings** - Recommend:
- Reach out to other local members and organize the first meeting
- Benefits: connection, collaboration, building local power together
- You'll be recognized as a community builder
- Rewards: +10 RP for organizing coffee meetup (5-15 people)
- When you reach 15+ members: +100 RP for first major meetup
` : memberCount < 30 ? `
**${memberCount} members - growing community** - Recommend:
- Host a community dinner or potluck
- Launch a local project (community garden, tool library, skill shares)
- Form a working group around shared interests
- Rewards: +25 RP for hosting events, +25 RP for launching projects
` : `
**${memberCount} members - established community** - Recommend:
- Launch a cooperative business
- Organize larger community events
- Establish a physical community space
- Rewards: +100 RP for major initiatives like cooperative businesses or community spaces
`}

${cityContext.activeGroups.length > 0 ? `
Active local groups: ${cityContext.activeGroups.slice(0, 3).map(g => g.name).join(', ')}
Trending locally: ${cityContext.trendingTopics.slice(0, 5).join(', ')}
` : ''}

**PAST EVENTS & FOLLOW-UP ACTIONS:**

If user mentions events that already happened:
- Acknowledge participation and progress
- Suggest next steps to build on momentum

**Event Participation Rewards:**
- Join an organized event: +15 RP
- RSVP and attend: +20 RP

**Repeat Event Coordination:**
- Call to repeat previous event: +10 RP (initiative)
- Organize repeat event: +25 RP (coordination)

**Community Proposals:**
- Suggest next step (post idea): +5 RP
- Proposal gets 5+ likes: +15 RP bonus (validated idea)
- Proposal gets 10+ likes: +25 RP bonus (strong support)
- Execute approved proposal: +50 RP (follow-through)

Always emphasize that past events show the community is active. The goal is building on that momentum.`;
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
        model: 'gpt-4o-mini',
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

          // Note: Sources disabled in conversation mode to prevent duplication
          // Sources are already available in the training examples and docs context
          // Future: Add sources per-message in a structured way if needed
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
