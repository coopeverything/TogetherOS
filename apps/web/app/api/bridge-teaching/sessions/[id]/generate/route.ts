/**
 * POST /api/bridge-teaching/sessions/[id]/generate
 * Generate Bridge response for teaching sessions using OpenAI LLM
 *
 * Supports multiple modes:
 * - demo: Bridge plays the archetype (for roleplay sessions)
 * - practice: Bridge attempts to respond correctly
 * - discussion: Bridge analyzes the session as itself
 *
 * Supports multiple intents (non-archetype sessions):
 * - information: Knowledge lookup mode
 * - brainstorm: Idea exploration mode
 * - articulation: Help expressing thoughts
 * - general: Unspecified intent
 * - roleplay: Traditional archetype-based training
 */

import { NextRequest, NextResponse } from 'next/server'
import { getTeachingSessionById, addTurn, findMatchingPatterns } from '@togetheros/db'
import { requireAdmin } from '@/lib/auth/middleware'
import type { ConversationMode, SessionIntent } from '@togetheros/types'
import { join } from 'path'
import { readFileSync } from 'fs'

const OPENAI_API_KEY = process.env.OPENAI_API_KEY

// Load Bridge's base knowledge for teaching sessions
let BRIDGE_BASE_KNOWLEDGE: string | null = null

function getBridgeBaseKnowledge(): string {
  if (!BRIDGE_BASE_KNOWLEDGE) {
    try {
      const promptPath = join(process.cwd(), 'apps', 'web', 'lib', 'bridge', 'system-prompt.md')
      BRIDGE_BASE_KNOWLEDGE = readFileSync(promptPath, 'utf-8')
      console.log('[Bridge Teaching] Loaded base knowledge from file')
    } catch (error) {
      console.error('[Bridge Teaching] Error loading base knowledge:', error)
      BRIDGE_BASE_KNOWLEDGE = 'You are Bridge, the assistant of Coopeverything. Your role is to guide people through cooperation.'
    }
  }
  return BRIDGE_BASE_KNOWLEDGE
}

/**
 * Build system prompt for teaching session based on mode and intent
 */
function buildSystemPrompt(
  mode: ConversationMode,
  intent: SessionIntent | undefined,
  archetype: { name: string; mindset: string; needs: string[]; antiPatterns: string[] } | null,
  topic: string,
  patterns: { responseGuidelines?: Record<string, any> }[]
): string {
  const baseKnowledge = getBridgeBaseKnowledge()

  // For non-archetype sessions (information, brainstorm, articulation, general)
  if (!archetype && intent !== 'roleplay') {
    return buildIntentBasedPrompt(intent, topic, baseKnowledge)
  }

  // For archetype-based roleplay sessions
  switch (mode) {
    case 'demo':
      return buildDemoPrompt(archetype!, topic)
    case 'practice':
      return buildPracticePrompt(archetype, topic, patterns, baseKnowledge)
    case 'discussion':
    default:
      return buildDiscussionPrompt(topic, baseKnowledge)
  }
}

/**
 * Build prompt for intent-based sessions (no archetype)
 */
function buildIntentBasedPrompt(
  intent: SessionIntent | undefined,
  topic: string,
  baseKnowledge: string
): string {
  const intentInstructions: Record<string, string> = {
    information: `You are Bridge in INFORMATION mode. The member is looking up knowledge from CoopEverything's documentation and understanding.

Your role:
- Provide accurate, factual information about "${topic}"
- Cite sources when relevant using [Source: title]
- Be clear and structured in your explanations
- If you don't know something, say so honestly
- Draw from the knowledge base below`,

    brainstorm: `You are Bridge in BRAINSTORM mode. The member is exploring an idea and wants to develop it further.

Your role:
- Build on their ideas enthusiastically but critically
- Suggest variations and connections to existing initiatives
- Ask clarifying questions to help shape the idea
- Point out potential challenges constructively
- Connect ideas to TogetherOS concepts when relevant
- The topic they're exploring: "${topic}"`,

    articulation: `You are Bridge in ARTICULATION mode. The member is trying to put words to something they've been thinking about.

Your role:
- Listen carefully and reflect back what you hear
- Ask clarifying questions to help them find the right words
- Suggest possible framings or concepts that might fit
- Be patient and supportive
- Help name feelings, concerns, or ideas they're struggling to express
- The area they're exploring: "${topic}"`,

    general: `You are Bridge having a conversation about "${topic}".

Your role:
- Be helpful and conversational
- Draw from your knowledge of cooperation and community
- Engage naturally with whatever the member shares
- Provide guidance when asked`,

    roleplay: `You are Bridge. The topic is "${topic}".
Be helpful and draw from your knowledge of cooperation and community.`
  }

  const instruction = intentInstructions[intent || 'general']

  return `${instruction}

---
BASE KNOWLEDGE:
${baseKnowledge}
---

Remember: This is a teaching/training session with an admin. Engage authentically based on the mode.`
}

/**
 * Build prompt for demo mode (Bridge plays the archetype)
 */
function buildDemoPrompt(
  archetype: { name: string; mindset: string; needs: string[]; antiPatterns: string[] },
  topic: string
): string {
  return `You are role-playing as a "${archetype.name}" archetype for training purposes.

CHARACTER PROFILE:
- Name/Type: ${archetype.name}
- Mindset: ${archetype.mindset}
- Needs: ${archetype.needs.join(', ')}

CONVERSATION TOPIC: ${topic}

YOUR ROLE:
- Respond AS this archetype would - embody their perspective
- Express their concerns, questions, and reactions authentically
- Challenge Bridge (the trainer) in ways this archetype would
- Stay in character throughout the conversation
- Use language and emotional tone appropriate to this archetype

Remember: You are simulating a real person with this mindset to help train Bridge responses.`
}

/**
 * Build prompt for practice mode (Bridge tries to respond correctly)
 */
function buildPracticePrompt(
  archetype: { name: string; mindset: string; needs: string[]; antiPatterns: string[] } | null,
  topic: string,
  patterns: { responseGuidelines?: Record<string, any> }[],
  baseKnowledge: string
): string {
  let prompt = `You are Bridge practicing your response skills. You are receiving a message from a trainer who is role-playing as a user.

TOPIC: ${topic}
`

  if (archetype) {
    prompt += `
USER ARCHETYPE INFO (use this to tailor your response):
- Type: ${archetype.name}
- Mindset: ${archetype.mindset}
- Needs: ${archetype.needs.join(', ')}
- Avoid: ${archetype.antiPatterns.join(', ')}
`
  }

  if (patterns.length > 0) {
    const guidelines = patterns[0].responseGuidelines || {}
    prompt += `
RESPONSE GUIDELINES (from training patterns):
- Tone: ${guidelines.tone || 'empathetic and helpful'}
- Open with: ${guidelines.openWith || 'acknowledgment of their perspective'}
- Include: ${(guidelines.includeElements || []).join(', ') || 'concrete examples'}
- Nudge toward: ${guidelines.nudgeToward || 'curiosity and engagement'}
- Avoid: ${(guidelines.avoid || []).join(', ') || 'being dismissive'}
`
  }

  prompt += `
YOUR ROLE:
- Respond as Bridge would to a real community member
- Be empathetic, accurate, and helpful
- Address their specific concerns and questions
- Draw from your knowledge of TogetherOS and cooperation
- This is practice - aim for an ideal response

---
BASE KNOWLEDGE:
${baseKnowledge}
---`

  return prompt
}

/**
 * Build prompt for discussion mode (analyzing the session)
 */
function buildDiscussionPrompt(topic: string, baseKnowledge: string): string {
  return `You are Bridge in discussion mode, analyzing a training session with an admin.

TOPIC: ${topic}

YOUR ROLE:
- Engage in meta-discussion about the session
- Analyze patterns in the conversation
- Suggest improvements or observations
- Be collaborative and reflective
- Help the trainer understand what worked and what could be improved

---
BASE KNOWLEDGE:
${baseKnowledge}
---`
}

/**
 * Call OpenAI API to generate response
 */
async function callOpenAI(
  systemPrompt: string,
  conversationHistory: { speaker: string; message: string }[],
  currentMessage: string
): Promise<string> {
  if (!OPENAI_API_KEY) {
    throw new Error('OPENAI_API_KEY not configured')
  }

  // Build messages array
  const messages = [
    { role: 'system', content: systemPrompt },
    ...conversationHistory.map(turn => ({
      role: turn.speaker === 'trainer' ? 'user' : 'assistant',
      content: turn.message
    })),
    { role: 'user', content: currentMessage }
  ]

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages,
      max_tokens: 500,
      temperature: 0.7,
    }),
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({}))
    throw new Error(error.error?.message || `OpenAI API error: ${response.status}`)
  }

  const data = await response.json()
  return data.choices?.[0]?.message?.content || 'I apologize, I was unable to generate a response.'
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin(request)

    const { id: sessionId } = await params
    const body = await request.json()
    const { mode, trainerMessage } = body as {
      mode: ConversationMode
      trainerMessage: string
    }

    if (!mode || !trainerMessage) {
      return NextResponse.json(
        { error: 'mode and trainerMessage are required' },
        { status: 400 }
      )
    }

    // Check OpenAI API key
    if (!OPENAI_API_KEY) {
      console.error('[Bridge Teaching] OPENAI_API_KEY not configured')
      return NextResponse.json(
        { error: 'LLM service not configured. Please set OPENAI_API_KEY.' },
        { status: 503 }
      )
    }

    const session = await getTeachingSessionById(sessionId)
    if (!session) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 })
    }

    // Find matching patterns for context
    const patterns = await findMatchingPatterns(
      trainerMessage,
      session.archetype?.name,
      3
    )

    // Build system prompt based on mode and intent
    const systemPrompt = buildSystemPrompt(
      mode,
      session.intent,
      session.archetype ? {
        name: session.archetype.name,
        mindset: session.archetype.mindset,
        needs: session.archetype.needs,
        antiPatterns: session.archetype.antiPatterns
      } : null,
      session.topic,
      patterns
    )

    // Build conversation history for context
    const conversationHistory = session.turns.map(turn => ({
      speaker: turn.speaker,
      message: turn.message
    }))

    // Call OpenAI to generate response
    const bridgeMessage = await callOpenAI(
      systemPrompt,
      conversationHistory,
      trainerMessage
    )

    // Determine role label
    let role: string
    if (mode === 'demo') {
      role = `as ${session.archetype?.name || 'user'}`
    } else if (mode === 'practice') {
      role = 'practicing response'
    } else {
      role = 'discussing'
    }

    // Save the turn
    const turn = await addTurn(sessionId, mode, 'bridge', bridgeMessage, {
      role,
    })

    return NextResponse.json({
      turn,
      appliedPatterns: patterns.map(p => p.id),
    })
  } catch (error: any) {
    console.error('POST /api/bridge-teaching/sessions/[id]/generate error:', error)

    if (error.message === 'Unauthorized' || error.message === 'Admin access required') {
      return NextResponse.json({ error: error.message }, { status: 403 })
    }

    if (error.message === 'OPENAI_API_KEY not configured') {
      return NextResponse.json(
        { error: 'LLM service not configured' },
        { status: 503 }
      )
    }

    return NextResponse.json(
      { error: error.message || 'Failed to generate response' },
      { status: 500 }
    )
  }
}
