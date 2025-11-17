/**
 * Bridge AI Rating Service
 * AI-powered proposal quality assessment and content moderation
 */

import type { Proposal } from '@togetheros/types/governance'
import type { BridgeProposalRating, ClarityRating, ConstructivenessRating } from '@togetheros/types/governance'
import { v4 as uuidv4 } from 'uuid'

// Lazy-load Anthropic SDK (optional dependency)
let anthropic: any = null
const MODEL = 'claude-opus-4-20250514'

function getAnthropicClient() {
  if (anthropic) return anthropic

  try {
    const Anthropic = require('@anthropic-ai/sdk')
    anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY || '',
    })
    return anthropic
  } catch (error) {
    console.warn('[BridgeRating] Anthropic SDK not installed, AI ratings disabled')
    return null
  }
}

export class BridgeRatingService {
  /**
   * Auto-rate a proposal using Bridge AI
   * Analyzes clarity, constructiveness, and flags potential issues
   */
  async rateProposal(proposal: Proposal): Promise<BridgeProposalRating | null> {
    try {
      const client = getAnthropicClient()
      if (!client || !process.env.ANTHROPIC_API_KEY) {
        return null
      }

      const prompt = this.buildRatingPrompt(proposal)

      const response = await client.messages.create({
        model: MODEL,
        max_tokens: 1024,
        temperature: 0.3, // Lower temperature for more consistent ratings
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
      })

      const content = response.content[0]
      if (content.type !== 'text') {
        throw new Error('Unexpected response format from Bridge AI')
      }

      // Parse AI response
      const rating = this.parseRatingResponse(content.text, proposal.id)

      console.log(
        `[BridgeRating] Assessed proposal ${proposal.id}: clarity=${rating.clarity}, constructiveness=${rating.constructiveness}, flagged=${rating.flaggedForReview}`
      )

      return rating
    } catch (error) {
      console.error('[BridgeRating] Error rating proposal:', error)
      return null
    }
  }

  /**
   * Build rating prompt for Claude
   */
  private buildRatingPrompt(proposal: Proposal): string {
    return `You are Bridge AI, a governance assistant for TogetherOS. Analyze this proposal and provide quality ratings.

**Proposal Title:** ${proposal.title}

**Summary:**
${proposal.summary}

${(proposal as any).fullText ? `**Full Text:**\n${(proposal as any).fullText}` : ''}

---

**Task:** Rate this proposal on two dimensions:

1. **Clarity** (1-3):
   - 1 (Brown/Unclear): Confusing, vague, lacks structure, difficult to understand
   - 2 (Yellow/Somewhat Clear): Understandable but could be clearer, some ambiguity
   - 3 (Green/Very Clear): Well-written, structured, easy to understand, no ambiguity

2. **Constructiveness** (1-3):
   - 1 (Red/Needs Moderation): Personal attacks, extreme language, inflammatory tone, divisive rhetoric
   - 2 (Yellow/Some Issues): Minor tone issues, could be more collaborative, slightly confrontational
   - 3 (Green/Constructive): Respectful, collaborative, solution-focused, empathetic

3. **Flag for Review** (true/false):
   - Flag if: Personal attacks, extreme ideological language, harassment, threats, or severe tone issues
   - Don't flag for: Policy disagreements, constructive criticism, or minor wording issues

**Response Format (JSON):**
\`\`\`json
{
  "clarity": 1 | 2 | 3,
  "constructiveness": 1 | 2 | 3,
  "flaggedForReview": true | false,
  "reasoning": "Brief explanation of ratings (1-2 sentences)",
  "issues": ["issue1", "issue2"] // Only if flagged or constructiveness < 3
  "suggestions": ["suggestion1", "suggestion2"], // Specific improvement suggestions
  "confidence": 0.0-1.0 // Your confidence in these ratings
}
\`\`\`

Respond ONLY with the JSON object, no other text.`
  }

  /**
   * Parse Claude's rating response
   */
  private parseRatingResponse(responseText: string, proposalId: string): BridgeProposalRating {
    try {
      // Extract JSON from response (handle code blocks)
      let jsonText = responseText.trim()
      const jsonMatch = jsonText.match(/```json\s*([\s\S]*?)\s*```/)
      if (jsonMatch) {
        jsonText = jsonMatch[1]
      } else if (jsonText.startsWith('```') && jsonText.endsWith('```')) {
        jsonText = jsonText.slice(3, -3).trim()
      }

      const parsed = JSON.parse(jsonText)

      // Validate ratings
      const clarity = this.validateRating(parsed.clarity, 2) as ClarityRating
      const constructiveness = this.validateRating(parsed.constructiveness, 3) as ConstructivenessRating

      return {
        id: uuidv4(),
        proposalId,
        clarity,
        constructiveness,
        flaggedForReview: parsed.flaggedForReview === true,
        reasoning: parsed.reasoning || undefined,
        issues: Array.isArray(parsed.issues) ? parsed.issues : undefined,
        suggestions: Array.isArray(parsed.suggestions) ? parsed.suggestions : undefined,
        confidence: typeof parsed.confidence === 'number' ? parsed.confidence : undefined,
        assessedAt: new Date(),
      }
    } catch (error) {
      console.error('[BridgeRating] Failed to parse AI response:', error)
      // Return default neutral rating on parse failure
      return {
        id: uuidv4(),
        proposalId,
        clarity: 2, // Default: somewhat clear
        constructiveness: 3, // Default: constructive (don't flag by default)
        flaggedForReview: false,
        reasoning: 'Parse error - default rating applied',
        confidence: 0,
        assessedAt: new Date(),
      }
    }
  }

  /**
   * Validate rating is 1, 2, or 3
   */
  private validateRating(value: any, defaultValue: 1 | 2 | 3): 1 | 2 | 3 {
    if (value === 1 || value === 2 || value === 3) {
      return value
    }
    console.warn(`[BridgeRating] Invalid rating value: ${value}, using default: ${defaultValue}`)
    return defaultValue
  }

  /**
   * Check if proposal should be flagged based on AI rating
   */
  shouldFlagForModeration(rating: BridgeProposalRating): boolean {
    return (
      rating.flaggedForReview ||
      rating.constructiveness === 1 || // Red rating always flags
      (rating.constructiveness === 2 && (rating.issues?.length || 0) > 2) // Yellow with multiple issues
    )
  }
}

// Singleton instance
export const bridgeRatingService = new BridgeRatingService()
