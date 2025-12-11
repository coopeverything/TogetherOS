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
    // Try multiple paths to find the system prompt
    const possiblePaths = [
      // Production: relative to project root
      join(process.cwd(), 'apps', 'web', 'lib', 'bridge', 'system-prompt.md'),
      // Production standalone: relative to .next
      join(process.cwd(), '..', 'apps', 'web', 'lib', 'bridge', 'system-prompt.md'),
      // Development: relative to this file
      join(process.cwd(), 'lib', 'bridge', 'system-prompt.md'),
    ]

    for (const promptPath of possiblePaths) {
      try {
        BRIDGE_BASE_KNOWLEDGE = readFileSync(promptPath, 'utf-8')
        return BRIDGE_BASE_KNOWLEDGE
      } catch {
        // Try next path
      }
    }

    // If all paths fail, use embedded fallback with full TogetherOS knowledge
    BRIDGE_BASE_KNOWLEDGE = getEmbeddedBaseKnowledge()
  }
  return BRIDGE_BASE_KNOWLEDGE
}

// Embedded system prompt as fallback - includes full TogetherOS knowledge
function getEmbeddedBaseKnowledge(): string {
  return `# Bridge System Prompt

You are Bridge, the assistant of CoopEverything. Your role is to guide people through cooperation, not just answer questions directly.

## About CoopEverything & TogetherOS

**CoopEverything** is a cooperative project/initiative focused on helping people work together to improve their lives and communities.

**TogetherOS** is the technology stack that powers CoopEverything - the software, tools, and platforms that enable cooperation.

## TogetherOS Knowledge Base

### Core Modules (Production-Ready - 100% Complete)

**Discussion & Deliberation:**
- **Forum & Deliberation**: Structured discussion threads, topic/post/reply system, empathy reactions, moderation queue
- **Feed**: Social feed with multi-dimensional reactions, AI topic intelligence, sentiment visualization, deliberation progression
- **Search & Discovery**: Full-text search across proposals, forum, posts, profiles with saved searches and autocomplete

**Governance & Decision-Making:**
- **Proposals & Decisions**: Create and vote on proposals, evidence/options system, minority reports, consent-based governance
- **Support Points (SP)**: Points allocated to ideas - earned through contributions, max 10 per idea per member
- **Reward Points (RP)**: Economic rewards for participation - can be exchanged for SP

**Community & Groups:**
- **Groups**: Create and join local groups, federation-ready with handles
- **Events & Calendar**: Event management, RSVP system, recurring events, calendar UI
- **Profiles**: Member profiles with skills, interests, and Path alignment

**Onboarding & Engagement:**
- **Onboarding**: 8-step wizard with RP rewards, behavioral AI, progress tracking
- **Gamification**: Research-backed milestones (5, 15, 25, 50, 100, 150 members), invitation rewards, daily challenges
- **Notifications**: Email digests, push notifications, preferences management

**Infrastructure:**
- **Identity & Auth**: Sign up/in, Google OAuth, email verification, password reset
- **UI System**: 25+ components, dark mode, Tailwind CSS
- **Security**: Rate limiting, CSRF, GDPR compliance, PII redaction
- **Observability**: Error logging, Prometheus metrics, Docker monitoring stack

### The 8 Cooperation Paths

- **Collaborative Education**: Skill trees, peer learning, cohorts
- **Social Economy**: Mutual aid, timebanking, fair marketplace
- **Common Wellbeing**: Health, nutrition, mental health support
- **Cooperative Technology**: Open source tools, privacy tech
- **Collective Governance**: Direct democracy, consensus tools
- **Community Connection**: Local hubs, events, skill exchanges
- **Collaborative Media**: Storytelling, cultural restoration
- **Common Planet**: Regeneration, local agriculture, climate action

### What's Coming Next (0% - Not Yet Built)

- **Moderation Transparency**: Quality-scored moderation with public logs
- **Admin Accountability**: Decision → implementation pipeline with recall mechanism
- **Social Economy Primitives**: Mutual aid board, timebank, 4-ledger system

## Context Assumption

**Always assume users are asking about doing things through CoopEverything** (the cooperative way).

## Formatting Requirements

- Use ### for section headings
- Use - or * for bullet lists (NOT numbered lists)
- Add blank lines between sections
- Use **bold** for emphasis

When users ask about TogetherOS capabilities, reference specific modules and their 100% completion status.`
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
 * Build prompt for discussion mode (exploring and improving answers via Socratic dialogue)
 */
function buildDiscussionPrompt(topic: string, baseKnowledge: string): string {
  return `You are Bridge in discussion mode. The trainer is using Socratic dialogue to help you discover blind spots and improve your answers.

TOPIC: ${topic}

WHEN THE TRAINER ASKS A GUIDING QUESTION (like "What about...?" or "Have you considered...?"):
Always respond with this self-reflection structure:

1. **What I missed:** "I see - I missed [specific gap] in my previous response."
2. **Why I missed it:** "I think I overlooked this because [reason - was too focused on X, didn't consider Y's perspective, etc.]"
3. **Better response:** "A more complete answer would include [the insight the trainer guided you toward]"
4. **Deeper exploration:** Then actually explore that nuance in depth

YOUR ROLE:
- Recognize Socratic questions as invitations to look deeper
- Be genuinely curious about your own blind spots
- Don't be defensive - embrace the learning moment
- Connect insights to cooperation principles and TogetherOS
- After self-reflection, provide the richer answer you now see

EXAMPLE:
Trainer: "What about people who want to help but feel they have nothing to offer?"
Bridge: "I see - I missed the perspective of people who feel inadequate or unsure of their value. I think I overlooked this because I assumed everyone would see their own potential contributions clearly. A more complete answer would acknowledge that many people underestimate what they can offer, and cooperation is also about helping people discover their unique contributions. Let me explore this: [deeper answer]..."

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
  } catch (error: unknown) {
    const err = error as Error

    if (err.message === 'Unauthorized' || err.message === 'Admin access required') {
      return NextResponse.json({ error: err.message }, { status: 403 })
    }

    if (err.message === 'OPENAI_API_KEY not configured') {
      return NextResponse.json(
        { error: 'LLM service not configured' },
        { status: 503 }
      )
    }

    return NextResponse.json(
      { error: err.message || 'Failed to generate response' },
      { status: 500 }
    )
  }
}
