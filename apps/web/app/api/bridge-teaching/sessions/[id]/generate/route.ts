/**
 * POST /api/bridge-teaching/sessions/[id]/generate
 * Generate Bridge response for practice mode
 */

import { NextRequest, NextResponse } from 'next/server'
import { getTeachingSessionById, addTurn, findMatchingPatterns } from '@togetheros/db'
import { requireAdmin } from '@/lib/auth/middleware'
import type { ConversationMode } from '@togetheros/types'

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

    // Generate response based on mode
    let bridgeMessage: string
    let role: string

    if (mode === 'demo') {
      // In demo mode, Bridge plays the archetype
      role = `as ${session.archetype?.name || 'user'}`
      bridgeMessage = await generateArchetypeMessage(
        session.archetype,
        session.topic,
        trainerMessage,
        session.turns
      )
    } else if (mode === 'practice') {
      // In practice mode, Bridge attempts to respond like a trained assistant
      role = 'practicing response'
      bridgeMessage = await generatePracticeResponse(
        session.archetype,
        session.topic,
        trainerMessage,
        session.turns,
        patterns
      )
    } else {
      // Discussion mode - Bridge as itself
      role = 'discussing'
      bridgeMessage = await generateDiscussionResponse(
        session.topic,
        trainerMessage,
        session.turns
      )
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

    return NextResponse.json(
      { error: error.message || 'Failed to generate response' },
      { status: 500 }
    )
  }
}

/**
 * Generate archetype message (Demo mode - Bridge plays the user archetype)
 */
async function generateArchetypeMessage(
  archetype: any,
  topic: string,
  lastTrainerResponse: string,
  conversationHistory: any[]
): Promise<string> {
  // TODO: Replace with actual LLM call when API key is configured
  // For now, generate a contextual placeholder based on archetype

  const archetypeName = archetype?.name || 'User'
  const mindset = archetype?.mindset || 'curious about this topic'

  // Simple rule-based response for demo purposes
  const turnCount = conversationHistory.length

  if (turnCount === 0) {
    // Opening question
    return getArchetypeOpener(archetypeName, topic, mindset)
  }

  // Follow-up based on archetype style
  return getArchetypeFollowUp(archetypeName, topic, lastTrainerResponse, mindset)
}

/**
 * Generate practice response (Practice mode - Bridge tries to respond correctly)
 */
async function generatePracticeResponse(
  archetype: any,
  topic: string,
  trainerMessage: string,
  conversationHistory: any[],
  patterns: any[]
): Promise<string> {
  // TODO: Replace with actual LLM call
  // For now, use patterns to guide a template response

  const archetypeName = archetype?.name || 'User'

  if (patterns.length > 0) {
    const pattern = patterns[0]
    const guidelines = pattern.responseGuidelines || {}

    let response = guidelines.openWith || "I understand your perspective."

    if (guidelines.tone === 'empathetic') {
      response += " It sounds like you have some valid concerns."
    }

    if (guidelines.includeElements?.includes('concrete examples')) {
      response += ` In TogetherOS, we address this through ${topic.toLowerCase()}.`
    }

    if (guidelines.nudgeToward) {
      response += ` Would you like to explore ${guidelines.nudgeToward}?`
    }

    return response
  }

  // Fallback template responses based on archetype
  return getPracticeResponse(archetypeName, trainerMessage, topic)
}

/**
 * Generate discussion response (Discussion mode - analyzing the session)
 */
async function generateDiscussionResponse(
  topic: string,
  trainerMessage: string,
  conversationHistory: any[]
): Promise<string> {
  // Simple acknowledgment for discussion mode
  const demoTurns = conversationHistory.filter(t => t.mode === 'demo').length
  const practiceTurns = conversationHistory.filter(t => t.mode === 'practice').length

  return `Good point about "${trainerMessage.slice(0, 50)}...". Looking at this session on "${topic}", we have ${demoTurns} demo turns and ${practiceTurns} practice turns. What patterns do you see emerging?`
}

// Helper functions for rule-based responses (temporary until LLM integration)

function getArchetypeOpener(archetype: string, topic: string, mindset: string): string {
  const openers: Record<string, string> = {
    'Skeptic': `I've heard about ${topic}, but honestly, it sounds too good to be true. What's the catch?`,
    'Enthusiast': `This ${topic} concept is fascinating! I've been looking for exactly this kind of approach. Tell me everything!`,
    'Pragmatist': `Interesting. But how does ${topic} actually work in practice? I need concrete examples.`,
    'Wounded Helper': `I used to believe in cooperative systems, but I've been burned before. Why would ${topic} be any different?`,
    'Curious Observer': `I'm not sure I fully understand ${topic}. Could you explain it in simple terms?`,
  }

  return openers[archetype] || `I'd like to learn more about ${topic}. ${mindset}`
}

function getArchetypeFollowUp(archetype: string, topic: string, lastResponse: string, mindset: string): string {
  const followUps: Record<string, string[]> = {
    'Skeptic': [
      "That sounds nice in theory, but who enforces these rules?",
      "And what happens when someone abuses the system?",
      "I'm still not convinced. What's in it for the people running this?",
    ],
    'Enthusiast': [
      "That's amazing! How can I get started right away?",
      "I love this approach! Can I share this with my community?",
      "This aligns perfectly with my values. What else should I know?",
    ],
    'Pragmatist': [
      "Okay, but how does that scale?",
      "What's the timeline for seeing results?",
      "Can you give me a specific example of this working?",
    ],
    'Wounded Helper': [
      "I've heard promises like this before...",
      "What happens when the initial enthusiasm fades?",
      "How do you prevent burnout in your core contributors?",
    ],
    'Curious Observer': [
      "That makes sense. What about [related topic]?",
      "I see. So if I understand correctly...",
      "Interesting. How does this connect to everyday life?",
    ],
  }

  const options = followUps[archetype] || [`Tell me more about ${topic}.`]
  return options[Math.floor(Math.random() * options.length)]
}

function getPracticeResponse(archetype: string, userMessage: string, topic: string): string {
  // Generic empathetic response template
  const lowerMessage = userMessage.toLowerCase()

  if (lowerMessage.includes('catch') || lowerMessage.includes('skeptic') || lowerMessage.includes('suspicious')) {
    return `That's a fair question, and healthy skepticism is valuable. In ${topic}, transparency is built into the design - all decisions are logged, all finances are visible, and any member can audit any process. Would you like me to walk you through a specific example?`
  }

  if (lowerMessage.includes('burned') || lowerMessage.includes('hurt') || lowerMessage.includes('before')) {
    return `I hear that you've had difficult experiences with cooperative efforts before. That pain is real and valid. What TogetherOS tries to do differently is build in safeguards from the start - things like graduated trust, small reversible steps, and clear exit paths. What specifically concerned you in past experiences?`
  }

  if (lowerMessage.includes('how') || lowerMessage.includes('work') || lowerMessage.includes('example')) {
    return `Great question about the practical side. Let me give you a concrete example: when a community uses ${topic}, they might start with something small like coordinating a skill share. Members log their contributions, and the system tracks reciprocity without requiring perfect balance. Would a walkthrough of that process help?`
  }

  return `Thank you for sharing that. I want to make sure I understand your perspective on ${topic}. Could you tell me more about what's most important to you in this area?`
}
