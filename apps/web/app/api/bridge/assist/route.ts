/**
 * Bridge Content Assist API: POST /api/bridge/assist
 *
 * AI-powered content assistance for the learning content editor.
 * Provides suggestions for microlessons, challenges, quizzes, etc.
 *
 * Actions:
 * - suggest_reflection: Generate a reflection question based on content
 * - find_statistic: Suggest a relevant statistic/number
 * - improve_tone: Make content more engaging
 * - expand: Elaborate on the content
 * - shorten: Condense the content
 * - analyze: General content analysis and suggestions
 */

import { NextRequest, NextResponse } from 'next/server';
import { checkRateLimit } from '@/lib/bridge/rate-limiter';
import { logBridgeAction, getClientIp, hashIp } from '@/lib/bridge/logger';
import { getCurrentUser } from '@/lib/auth/middleware';

const RATE_LIMIT_MAX = parseInt(process.env.BRIDGE_RATE_LIMIT_PER_HOUR || '60', 10);
const RATE_LIMIT_WINDOW = 60 * 60 * 1000; // 1 hour in ms

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

type ContentType = 'microlesson' | 'bias_challenge' | 'micro_challenge' | 'quiz' | 'general';
type AssistAction = 'suggest_reflection' | 'find_statistic' | 'improve_tone' | 'expand' | 'shorten' | 'analyze';

interface AssistRequest {
  contentType: ContentType;
  content: string;
  action: AssistAction;
  context?: string; // Additional context like title, category
}

interface AssistResponse {
  suggestion: string;
  confidence: number;
  action: AssistAction;
}

// Content-type specific system prompts
const CONTENT_TYPE_PROMPTS: Record<ContentType, string> = {
  microlesson: `You are assisting with a Microlesson - a 60-90 second learning experience.
Structure: Story (narrative) → Number (striking statistic) → Reflection (question for the user)
The goal is to inspire action through emotional connection and concrete data.`,

  bias_challenge: `You are assisting with a Bias Challenge - a quick 1-2 tap interaction.
Structure: Scenario → Choice A or B → Reveal (the bias explained)
The goal is to help users recognize cognitive biases in everyday situations.`,

  micro_challenge: `You are assisting with a Micro-Challenge - a 3-5 minute action.
Structure: Task → RP Reward → Completion criteria
The goal is to encourage small, reversible cooperative actions.`,

  quiz: `You are assisting with a Quiz Question.
Structure: Question → Multiple choice options → Correct answer → Explanation
The goal is to test understanding while teaching through the explanation.`,

  general: `You are assisting with educational content about cooperation and community building.
The content should be engaging, actionable, and grounded in real examples.`,
};

// Action-specific prompts
const ACTION_PROMPTS: Record<AssistAction, string> = {
  suggest_reflection: `Generate a thought-provoking reflection question based on the content.
The question should:
- Be open-ended (not yes/no)
- Connect to the reader's personal experience
- Encourage deeper thinking about the topic
- Be concise (1-2 sentences max)

Return ONLY the question, nothing else.`,

  find_statistic: `Suggest a relevant, striking statistic or number that supports this content.
The statistic should:
- Be specific and memorable (not vague)
- Support the main message
- Be from a credible source (mention the source if possible)
- Create an emotional impact

Format: "[Number/Statistic] - [Brief source note if applicable]"`,

  improve_tone: `Rewrite this content to be more engaging and conversational.
Guidelines:
- Use active voice
- Add sensory details where appropriate
- Make it feel personal and relatable
- Keep the same length and core message
- Avoid jargon unless necessary

Return the improved version only.`,

  expand: `Expand this content with more detail and examples.
Guidelines:
- Add 2-3 sentences of relevant detail
- Include a concrete example if possible
- Maintain the same tone and style
- Don't add filler - every addition should add value

Return the expanded version only.`,

  shorten: `Condense this content while preserving the core message.
Guidelines:
- Remove redundant phrases
- Combine sentences where possible
- Keep the most impactful elements
- Target about 50-70% of original length

Return the shortened version only.`,

  analyze: `Analyze this content and provide specific suggestions for improvement.
Consider:
- Clarity and readability
- Emotional engagement
- Actionability
- Missing elements (for the content type)

Provide 2-3 concrete, actionable suggestions in a bulleted list.`,
};

function validateRequest(body: unknown): { valid: true; data: AssistRequest } | { valid: false; error: string } {
  if (!body || typeof body !== 'object') {
    return { valid: false, error: 'Request body required' };
  }

  const { contentType, content, action, context } = body as Record<string, unknown>;

  if (!contentType || typeof contentType !== 'string') {
    return { valid: false, error: 'contentType required' };
  }

  if (!['microlesson', 'bias_challenge', 'micro_challenge', 'quiz', 'general'].includes(contentType)) {
    return { valid: false, error: 'Invalid contentType' };
  }

  if (!content || typeof content !== 'string') {
    return { valid: false, error: 'content required' };
  }

  if (content.length > 10000) {
    return { valid: false, error: 'content too long (max 10000 chars)' };
  }

  if (!action || typeof action !== 'string') {
    return { valid: false, error: 'action required' };
  }

  if (!['suggest_reflection', 'find_statistic', 'improve_tone', 'expand', 'shorten', 'analyze'].includes(action)) {
    return { valid: false, error: 'Invalid action' };
  }

  return {
    valid: true,
    data: {
      contentType: contentType as ContentType,
      content: content as string,
      action: action as AssistAction,
      context: typeof context === 'string' ? context : undefined,
    },
  };
}

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  const clientIp = getClientIp(request);
  const ipHash = hashIp(clientIp);

  try {
    // Parse and validate request
    const body = await request.json().catch(() => ({}));
    const validation = validateRequest(body);

    if (!validation.valid) {
      logBridgeAction({
        action: 'assist_error',
        ip_hash: ipHash,
        status: 400,
        error: validation.error,
        latency_ms: Date.now() - startTime,
      });
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    const { contentType, content, action, context } = validation.data;

    // Check authentication (assist requires admin access)
    const user = await getCurrentUser(request);
    if (!user?.is_admin) {
      logBridgeAction({
        action: 'assist_unauthorized',
        ip_hash: ipHash,
        status: 401,
        latency_ms: Date.now() - startTime,
      });
      return NextResponse.json({ error: 'Admin access required' }, { status: 401 });
    }

    // Check API key
    if (!OPENAI_API_KEY) {
      logBridgeAction({
        action: 'assist_error',
        ip_hash: ipHash,
        status: 401,
        error: 'OPENAI_API_KEY not configured',
        latency_ms: Date.now() - startTime,
      });
      return NextResponse.json(
        { error: 'Service not configured' },
        { status: 401 }
      );
    }

    // Rate limiting (higher limit for assist since it's admin-only)
    const rateLimit = checkRateLimit(`assist_${ipHash}`, {
      maxRequests: RATE_LIMIT_MAX,
      windowMs: RATE_LIMIT_WINDOW,
    });

    if (!rateLimit.allowed) {
      logBridgeAction({
        action: 'assist_rate_limit',
        ip_hash: ipHash,
        status: 429,
        latency_ms: Date.now() - startTime,
      });
      return NextResponse.json(
        { error: 'Rate limit exceeded', resetAt: rateLimit.resetAt },
        { status: 429 }
      );
    }

    // Build system prompt
    const systemPrompt = `${CONTENT_TYPE_PROMPTS[contentType]}

${ACTION_PROMPTS[action]}

Be concise and practical. Focus on actionable improvements.`;

    // Build user message with context
    let userMessage = `Content to work with:\n\n${content}`;
    if (context) {
      userMessage = `Context: ${context}\n\n${userMessage}`;
    }

    // Call OpenAI API (non-streaming for quick responses)
    const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userMessage },
        ],
        max_tokens: 500,
        temperature: 0.7,
      }),
    });

    if (!openaiResponse.ok) {
      const errorData = await openaiResponse.json().catch(() => ({}));
      const errorMessage = errorData.error?.message || `OpenAI API error: ${openaiResponse.status}`;

      logBridgeAction({
        action: 'assist_error',
        ip_hash: ipHash,
        status: openaiResponse.status,
        error: errorMessage,
        latency_ms: Date.now() - startTime,
      });

      if (openaiResponse.status === 429) {
        return NextResponse.json(
          { error: 'Service temporarily unavailable' },
          { status: 503 }
        );
      }

      return NextResponse.json(
        { error: 'AI service error' },
        { status: 500 }
      );
    }

    const data = await openaiResponse.json();
    const suggestion = data.choices?.[0]?.message?.content?.trim() || '';

    // Calculate confidence based on response characteristics
    let confidence = 0.8; // Base confidence
    if (suggestion.length < 20) confidence -= 0.2; // Too short
    if (suggestion.length > 1000) confidence -= 0.1; // Might be verbose
    if (!suggestion) confidence = 0;

    // Log successful assist
    logBridgeAction({
      action: 'assist',
      ip_hash: ipHash,
      q_len: content.length,
      latency_ms: Date.now() - startTime,
      metadata: { contentType, assistAction: action },
    });

    const response: AssistResponse = {
      suggestion,
      confidence: Math.max(0, Math.min(1, confidence)),
      action,
    };

    return NextResponse.json(response, {
      headers: {
        'X-RateLimit-Remaining': rateLimit.remaining.toString(),
        'X-RateLimit-Reset': rateLimit.resetAt.toString(),
      },
    });
  } catch (error) {
    console.error('Bridge Assist API error:', error);
    logBridgeAction({
      action: 'assist_error',
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
