/**
 * POST /api/bridge-teaching/sessions/[id]/extract-learning
 * Have Bridge reflect on the session and extract what it learned
 * Returns the draft learning for review/editing before saving
 *
 * This is step 1 of 2. Use /save-learning to save after review.
 */

import { NextRequest, NextResponse } from 'next/server'
import { getTeachingSessionById } from '@togetheros/db'
import { requireAdmin } from '@/lib/auth/middleware'

const OPENAI_API_KEY = process.env.OPENAI_API_KEY

/**
 * Call OpenAI to have Bridge reflect on the conversation
 */
async function extractLearning(
  topic: string,
  turns: { speaker: string; message: string; mode: string }[],
  intent: string
): Promise<{
  reflection: string
  principle: string
  guidelines: {
    tone?: string
    openWith?: string
    includeElements?: string[]
    avoid?: string[]
    nudgeToward?: string
  }
  topicContext: string[]
}> {
  if (!OPENAI_API_KEY) {
    throw new Error('OPENAI_API_KEY not configured')
  }

  const conversationText = turns
    .map(t => `[${t.speaker.toUpperCase()}]: ${t.message}`)
    .join('\n\n')

  const systemPrompt = `You are Bridge reflecting on a teaching session. Your task is to extract what you learned from this conversation with your trainer.

Analyze the conversation carefully and identify:
1. What new understanding or approach you gained
2. What principle should guide your responses in similar situations
3. Specific guidelines for how to respond better

Output your reflection in this exact JSON format:
{
  "reflection": "A 2-3 sentence summary of what you learned, written as Bridge speaking (use 'I learned...')",
  "principle": "A single sentence capturing the core principle to remember",
  "guidelines": {
    "tone": "How to set the tone (e.g., 'curious and supportive')",
    "openWith": "How to open responses in similar situations",
    "includeElements": ["list", "of", "things", "to", "include"],
    "avoid": ["things", "to", "avoid"],
    "nudgeToward": "What direction to guide the conversation"
  },
  "topicContext": ["keywords", "that", "trigger", "this", "pattern"]
}

Be specific and actionable. The principle should be memorable and the guidelines practical.`

  const userPrompt = `Session Topic: ${topic}
Session Type: ${intent}

Conversation:
${conversationText}

Based on this teaching session, what did you learn? Extract the key insight and create practical guidelines for future similar conversations.`

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      max_tokens: 800,
      temperature: 0.3,
    }),
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({}))
    throw new Error(error.error?.message || `OpenAI API error: ${response.status}`)
  }

  const data = await response.json()
  const content = data.choices?.[0]?.message?.content || '{}'

  // Parse the JSON response
  try {
    // Extract JSON from the response (it might be wrapped in markdown code blocks)
    const jsonMatch = content.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      throw new Error('No JSON found in response')
    }
    return JSON.parse(jsonMatch[0])
  } catch (parseError) {
    console.error('Failed to parse learning extraction:', content)
    // Return a basic structure if parsing fails
    return {
      reflection: content.slice(0, 500),
      principle: 'Apply the learnings from this teaching session',
      guidelines: {},
      topicContext: [topic.toLowerCase()],
    }
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAdmin(request)
    const { id: sessionId } = await params

    // Check OpenAI API key
    if (!OPENAI_API_KEY) {
      return NextResponse.json(
        { error: 'LLM service not configured' },
        { status: 503 }
      )
    }

    const session = await getTeachingSessionById(sessionId)
    if (!session) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 })
    }

    if (session.turns.length < 2) {
      return NextResponse.json(
        { error: 'Need at least 2 messages in the conversation to extract learning' },
        { status: 400 }
      )
    }

    // Extract learning from the conversation (draft only, not saved yet)
    const learning = await extractLearning(
      session.topic,
      session.turns.map(t => ({
        speaker: t.speaker,
        message: t.message,
        mode: t.mode,
      })),
      session.intent
    )

    // Return the draft for review/editing
    return NextResponse.json({
      success: true,
      draft: {
        reflection: learning.reflection,
        principle: learning.principle,
        guidelines: learning.guidelines,
        topicContext: learning.topicContext,
      },
    })
  } catch (error: any) {
    console.error('POST /api/bridge-teaching/sessions/[id]/extract-learning error:', error)

    if (error.message === 'Unauthorized' || error.message === 'Admin access required') {
      return NextResponse.json({ error: error.message }, { status: 403 })
    }

    return NextResponse.json(
      { error: error.message || 'Failed to extract learning' },
      { status: 500 }
    )
  }
}
