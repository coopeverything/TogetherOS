# Bridge Training Interface - Complete Design Specification

> **Status**: Design Phase - Ready for Implementation
> **Created**: 2025-11-03
> **Last Updated**: 2025-11-03
> **Designed with**: Claude Opus 4.1

---

## Table of Contents

1. [Overview](#overview)
2. [User Workflow](#user-workflow)
3. [Database Schema](#database-schema)
4. [TypeScript Types & Validators](#typescript-types--validators)
5. [API Endpoints](#api-endpoints)
6. [UI Components](#ui-components)
7. [File Structure](#file-structure)
8. [Implementation Phases](#implementation-phases)
9. [Security Model](#security-model)
10. [Training Integration](#training-integration)
11. [Monitoring & Analytics](#monitoring--analytics)

---

## Overview

### Purpose

The Bridge Training Interface allows the TogetherOS operator to improve Bridge AI's responses by:
1. Interacting with Bridge to ask questions
2. Rating Bridge's responses for quality
3. Providing ideal example responses
4. Building a curated training dataset
5. Using that data to enhance Bridge through RAG, fine-tuning, or prompt engineering

### Key Principles

- **Privacy-First**: IP hashing, PII redaction, full audit logs
- **Admin-Only**: Restricted to operator/admin users
- **Accountability**: Complete audit trail of all training actions
- **Iterative**: Continuous improvement through example-based learning
- **Transparent**: All training data visible and exportable

---

## User Workflow

### Approved Workflow (Option 1: Rate First, Then Respond)

```
┌─────────────────────────────────────────────────────────┐
│ Step 1: Ask Question                                    │
│ ┌─────────────────────────────────────────────────────┐ │
│ │ Question: What are the 8 cooperation paths?         │ │
│ │                              [Ask Bridge →]         │ │
│ └─────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────┐
│ Step 2: Bridge Responds (GPT-3.5-turbo)                 │
│ ┌─────────────────────────────────────────────────────┐ │
│ │ The 8 cooperation paths are: Communication,         │ │
│ │ Coordination, Collaboration, Compromise...          │ │
│ │                                                      │ │
│ │ Sources:                                             │ │
│ │ - docs/cooperation-paths.md                          │ │
│ │                                                      │ │
│ │ Response time: 1,234ms                               │ │
│ └─────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────┐
│ Step 3: Rate Bridge's Response                          │
│ ┌─────────────────────────────────────────────────────┐ │
│ │ Helpfulness: ⭐⭐⭐⭐⭐ (3/5)                         │ │
│ │ Accuracy:    ⭐⭐⭐⭐⭐ (2/5)                         │ │
│ │ Tone:        ⭐⭐⭐⭐⭐ (4/5)                         │ │
│ └─────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────┐
│ Step 4: Provide Your Ideal Response                     │
│ ┌─────────────────────────────────────────────────────┐ │
│ │ [Markdown Editor]                                    │ │
│ │                                                      │ │
│ │ The 8 Cooperation Paths in TogetherOS are:          │ │
│ │                                                      │ │
│ │ 1. **Collaborative Education** - Learning together  │ │
│ │ 2. **Social Economy** - Cooperatives & mutual aid   │ │
│ │ 3. **Common Wellbeing** - Health & care networks    │ │
│ │ ...                                                  │ │
│ │                                                      │ │
│ │ [Edit | Preview]                                     │ │
│ └─────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────┐
│ Step 5: Save Training Example                           │
│ ┌─────────────────────────────────────────────────────┐ │
│ │ ✓ Stored in PostgreSQL                               │ │
│ │ ✓ Audit log created                                  │ │
│ │ ✓ Ready for training use                             │ │
│ │                                                      │ │
│ │ [Save Training Example] [Discard] [Start Over]      │ │
│ └─────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────┘
```

### UI States

1. **Idle**: Waiting for question input
2. **Loading**: Bridge is generating response
3. **Rating**: User rates Bridge's response
4. **Editing**: User writes ideal response
5. **Saving**: Storing to database
6. **Success**: Example saved, ready for next question
7. **Error**: Display error message, allow retry

---

## Database Schema

### PostgreSQL Tables

```sql
-- Core training examples table
CREATE TABLE bridge_training_examples (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Question and context
  question TEXT NOT NULL,
  question_embedding VECTOR(1536), -- For semantic search (future)
  context_path TEXT, -- Page where asked (e.g., '/governance')
  question_category VARCHAR(100), -- Tag/category

  -- Bridge's response
  bridge_response TEXT NOT NULL,
  bridge_model VARCHAR(50) NOT NULL DEFAULT 'gpt-3.5-turbo',
  bridge_temperature DECIMAL(2,1),
  bridge_sources JSONB, -- Array of {path, title, url}
  bridge_response_time_ms INTEGER,

  -- User ratings of Bridge's response
  helpfulness_rating INTEGER CHECK (helpfulness_rating BETWEEN 1 AND 5),
  accuracy_rating INTEGER CHECK (accuracy_rating BETWEEN 1 AND 5),
  tone_rating INTEGER CHECK (tone_rating BETWEEN 1 AND 5),

  -- User's ideal response
  ideal_response TEXT,
  ideal_sources JSONB, -- Manually curated citations
  ideal_keywords TEXT[], -- Keywords for retrieval

  -- Training metadata
  training_status VARCHAR(50) DEFAULT 'pending',
    -- pending, reviewed, approved, rejected, used_in_training
  reviewed_by UUID REFERENCES users(id),
  reviewed_at TIMESTAMP,
  review_notes TEXT,

  -- Quality score (calculated from ratings)
  quality_score INTEGER GENERATED ALWAYS AS (
    ROUND((helpfulness_rating + accuracy_rating + tone_rating) * 100.0 / 15.0)
  ) STORED,

  -- Training usage
  used_in_training BOOLEAN DEFAULT FALSE,
  training_batch_id UUID REFERENCES bridge_training_batches(id),

  -- Audit
  created_by UUID NOT NULL REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  ip_hash VARCHAR(64),

  -- Soft delete
  deleted_at TIMESTAMP,
  deleted_by UUID REFERENCES users(id)
);

-- Training batches for organizing training runs
CREATE TABLE bridge_training_batches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  name VARCHAR(255) NOT NULL,
  description TEXT,
  training_type VARCHAR(50), -- 'rag_enhancement', 'fine_tuning', 'prompt_engineering'

  config JSONB NOT NULL,
  example_count INTEGER NOT NULL,

  status VARCHAR(50) DEFAULT 'draft', -- draft, ready, training, completed, failed
  started_at TIMESTAMP,
  completed_at TIMESTAMP,
  error_message TEXT,

  metrics JSONB, -- Training results
  model_artifact_url TEXT,

  created_by UUID NOT NULL REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW()
);

-- User feedback on training examples
CREATE TABLE bridge_training_feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  example_id UUID NOT NULL REFERENCES bridge_training_examples(id) ON DELETE CASCADE,

  feedback_type VARCHAR(50), -- 'helpful', 'incorrect', 'incomplete', 'tone_issue'
  feedback_text TEXT,

  submitted_by UUID NOT NULL REFERENCES users(id),
  submitted_at TIMESTAMP DEFAULT NOW(),
  ip_hash VARCHAR(64)
);

-- Admin training sessions (track work)
CREATE TABLE bridge_training_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  admin_id UUID NOT NULL REFERENCES users(id),
  session_start TIMESTAMP DEFAULT NOW(),
  session_end TIMESTAMP,

  examples_created INTEGER DEFAULT 0,
  examples_approved INTEGER DEFAULT 0,
  examples_rejected INTEGER DEFAULT 0,

  ip_hash VARCHAR(64),
  user_agent TEXT
);

-- Audit log
CREATE TABLE bridge_training_audit (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  timestamp TIMESTAMP DEFAULT NOW(),
  event_type VARCHAR(100) NOT NULL,
  actor_id UUID NOT NULL REFERENCES users(id),
  target_type VARCHAR(50),
  target_id UUID,
  action JSONB NOT NULL,
  metadata JSONB,
  ip_hash VARCHAR(64)
);

-- Indexes
CREATE INDEX idx_training_examples_status ON bridge_training_examples(training_status);
CREATE INDEX idx_training_examples_created_at ON bridge_training_examples(created_at DESC);
CREATE INDEX idx_training_examples_quality ON bridge_training_examples(quality_score DESC);
CREATE INDEX idx_training_examples_category ON bridge_training_examples(question_category);
CREATE INDEX idx_training_batches_status ON bridge_training_batches(status);
CREATE INDEX idx_training_sessions_admin ON bridge_training_sessions(admin_id);

-- Triggers
CREATE TRIGGER update_training_examples_timestamp
  BEFORE UPDATE ON bridge_training_examples
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

---

## TypeScript Types & Validators

### Types (`packages/types/src/bridge-training.ts`)

```typescript
export interface BridgeTrainingExample {
  id: string

  // Question
  question: string
  questionEmbedding?: number[]
  contextPath?: string
  questionCategory?: string

  // Bridge response
  bridgeResponse: string
  bridgeModel: string
  bridgeTemperature?: number
  bridgeSources?: Array<{ path: string; title: string; url: string }>
  bridgeResponseTimeMs?: number

  // User ratings of Bridge
  helpfulnessRating?: number // 1-5
  accuracyRating?: number // 1-5
  toneRating?: number // 1-5

  // Ideal response
  idealResponse?: string
  idealSources?: Array<{ path: string; title: string; url: string }>
  idealKeywords?: string[]

  // Training
  trainingStatus: 'pending' | 'reviewed' | 'approved' | 'rejected' | 'used_in_training'
  reviewedBy?: string
  reviewedAt?: Date
  reviewNotes?: string
  qualityScore?: number // Calculated 0-100

  usedInTraining: boolean
  trainingBatchId?: string

  // Audit
  createdBy: string
  createdAt: Date
  updatedAt: Date
  ipHash?: string

  deletedAt?: Date
  deletedBy?: string
}

export interface BridgeSource {
  path: string
  title: string
  url: string
}

export interface CreateTrainingExampleInput {
  question: string
  contextPath?: string
  questionCategory?: string
  bridgeResponse: string
  bridgeModel: string
  bridgeTemperature?: number
  bridgeSources?: BridgeSource[]
  bridgeResponseTimeMs?: number
}

export interface RateBridgeResponseInput {
  exampleId: string
  helpfulnessRating: number // 1-5
  accuracyRating: number // 1-5
  toneRating: number // 1-5
}

export interface ProvideIdealResponseInput {
  exampleId: string
  idealResponse: string
  idealSources?: BridgeSource[]
  idealKeywords?: string[]
  reviewNotes?: string
}

export interface TrainingExampleFilters {
  status?: 'pending' | 'reviewed' | 'approved' | 'rejected'
  category?: string
  searchQuery?: string
  minQualityScore?: number
  sortBy?: 'createdAt' | 'qualityScore' | 'status'
  sortOrder?: 'asc' | 'desc'
  page?: number
  pageSize?: number
}
```

### Validators (`packages/validators/src/bridge-training.ts`)

```typescript
import { z } from 'zod'

export const bridgeSourceSchema = z.object({
  path: z.string().min(1),
  title: z.string().min(1),
  url: z.string().url(),
})

export const createTrainingExampleSchema = z.object({
  question: z.string().min(5).max(1000),
  contextPath: z.string().optional(),
  questionCategory: z.string().max(100).optional(),
  bridgeResponse: z.string().min(1).max(5000),
  bridgeModel: z.string().max(50),
  bridgeTemperature: z.number().min(0).max(2).optional(),
  bridgeSources: z.array(bridgeSourceSchema).optional(),
  bridgeResponseTimeMs: z.number().positive().int().optional(),
})

export const rateBridgeResponseSchema = z.object({
  exampleId: z.string().uuid(),
  helpfulnessRating: z.number().int().min(1).max(5),
  accuracyRating: z.number().int().min(1).max(5),
  toneRating: z.number().int().min(1).max(5),
})

export const provideIdealResponseSchema = z.object({
  exampleId: z.string().uuid(),
  idealResponse: z.string().min(10).max(5000),
  idealSources: z.array(bridgeSourceSchema).optional(),
  idealKeywords: z.array(z.string().max(50)).max(10).optional(),
  reviewNotes: z.string().max(1000).optional(),
})

export const trainingExampleFiltersSchema = z.object({
  status: z.enum(['pending', 'reviewed', 'approved', 'rejected']).optional(),
  category: z.string().optional(),
  searchQuery: z.string().optional(),
  minQualityScore: z.number().min(0).max(100).optional(),
  sortBy: z.enum(['createdAt', 'qualityScore', 'status']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
  page: z.number().min(1).default(1),
  pageSize: z.number().min(1).max(100).default(20),
})
```

---

## API Endpoints

### tRPC Router (`apps/api/src/modules/bridge-training/handlers/index.ts`)

```typescript
import { router, adminProcedure } from '@/trpc'
import {
  createTrainingExampleSchema,
  rateBridgeResponseSchema,
  provideIdealResponseSchema,
  trainingExampleFiltersSchema,
} from '@togetheros/validators/bridge-training'

export const bridgeTrainingRouter = router({
  // Create training example (captures Bridge interaction)
  createExample: adminProcedure
    .input(createTrainingExampleSchema)
    .mutation(async ({ input, ctx }) => {
      const example = await ctx.repos.bridgeTraining.create({
        ...input,
        createdBy: ctx.session.userId,
        ipHash: hashIP(ctx.req.ip),
        trainingStatus: 'pending',
        usedInTraining: false,
      })

      await ctx.services.auditLogger.write({
        eventType: 'training.example.created',
        actorId: ctx.session.userId,
        targetType: 'example',
        targetId: example.id,
        action: { created: true },
        ipHash: hashIP(ctx.req.ip),
      })

      return example
    }),

  // Rate Bridge's response
  rateResponse: adminProcedure
    .input(rateBridgeResponseSchema)
    .mutation(async ({ input, ctx }) => {
      const { exampleId, ...ratings } = input

      const example = await ctx.repos.bridgeTraining.update(exampleId, ratings)

      await ctx.services.auditLogger.write({
        eventType: 'training.response.rated',
        actorId: ctx.session.userId,
        targetType: 'example',
        targetId: exampleId,
        action: { rated: true, ratings },
        ipHash: hashIP(ctx.req.ip),
      })

      return example
    }),

  // Provide ideal response
  provideIdeal: adminProcedure
    .input(provideIdealResponseSchema)
    .mutation(async ({ input, ctx }) => {
      const { exampleId, ...updates } = input

      const example = await ctx.repos.bridgeTraining.update(exampleId, {
        ...updates,
        trainingStatus: 'reviewed',
        reviewedBy: ctx.session.userId,
        reviewedAt: new Date(),
      })

      await ctx.services.auditLogger.write({
        eventType: 'training.ideal.provided',
        actorId: ctx.session.userId,
        targetType: 'example',
        targetId: exampleId,
        action: { idealProvided: true },
        ipHash: hashIP(ctx.req.ip),
      })

      return example
    }),

  // List examples with filters
  listExamples: adminProcedure
    .input(trainingExampleFiltersSchema)
    .query(async ({ input, ctx }) => {
      const { page, pageSize, ...filters } = input

      const { items, total } = await ctx.repos.bridgeTraining.list({
        ...filters,
        offset: (page - 1) * pageSize,
        limit: pageSize,
      })

      return {
        items,
        total,
        page,
        pageSize,
        totalPages: Math.ceil(total / pageSize),
      }
    }),

  // Get single example
  getExample: adminProcedure
    .input(z.object({ id: z.string().uuid() }))
    .query(async ({ input, ctx }) => {
      const example = await ctx.repos.bridgeTraining.findById(input.id)
      if (!example) throw new TRPCError({ code: 'NOT_FOUND' })
      return example
    }),

  // Approve example for training
  approveExample: adminProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ input, ctx }) => {
      const example = await ctx.repos.bridgeTraining.update(input.id, {
        trainingStatus: 'approved',
        reviewedBy: ctx.session.userId,
        reviewedAt: new Date(),
      })

      await ctx.services.auditLogger.write({
        eventType: 'training.example.approved',
        actorId: ctx.session.userId,
        targetType: 'example',
        targetId: input.id,
        action: { approved: true },
        ipHash: hashIP(ctx.req.ip),
      })

      return example
    }),

  // Get statistics
  getStats: adminProcedure
    .query(async ({ ctx }) => {
      const stats = await ctx.repos.bridgeTraining.getStatistics()
      return stats
    }),
})
```

---

## UI Components

### Page 1: Training Interface (`apps/web/app/admin/bridge/train/page.tsx`)

```typescript
'use client'

import { useState } from 'react'
import { BridgeTrainingInterface } from '@togetheros/ui/bridge-training'
import { trpc } from '@/lib/trpc'

export default function BridgeTrainingPage() {
  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Bridge Training Interface</h1>
          <p className="text-gray-600 mt-2">
            Improve Bridge's responses by providing example Q&A pairs
          </p>
        </div>

        <BridgeTrainingInterface />
      </div>
    </div>
  )
}
```

### Main Training Component (`packages/ui/src/bridge-training/BridgeTrainingInterface.tsx`)

```typescript
'use client'

import { useState } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@togetheros/ui/card'
import { Button } from '@togetheros/ui/button'
import { Textarea } from '@togetheros/ui/textarea'
import { Input } from '@togetheros/ui/input'
import { StarRating } from './StarRating'
import { MarkdownEditor } from './MarkdownEditor'
import { trpc } from '@/lib/trpc'

type TrainingState = 'idle' | 'loading' | 'rating' | 'editing' | 'saving' | 'success' | 'error'

export const BridgeTrainingInterface: React.FC = () => {
  const [state, setState] = useState<TrainingState>('idle')
  const [question, setQuestion] = useState('')
  const [bridgeResponse, setBridgeResponse] = useState('')
  const [bridgeSources, setBridgeSources] = useState<any[]>([])
  const [exampleId, setExampleId] = useState<string | null>(null)

  // Ratings
  const [helpfulness, setHelpfulness] = useState(0)
  const [accuracy, setAccuracy] = useState(0)
  const [tone, setTone] = useState(0)

  // Ideal response
  const [idealResponse, setIdealResponse] = useState('')

  const createExample = trpc.bridgeTraining.createExample.useMutation()
  const rateResponse = trpc.bridgeTraining.rateResponse.useMutation()
  const provideIdeal = trpc.bridgeTraining.provideIdeal.useMutation()

  const handleAskBridge = async () => {
    if (!question.trim()) return

    setState('loading')

    try {
      // Call Bridge API
      const response = await fetch('/api/bridge/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question }),
      })

      const data = await response.text()
      setBridgeResponse(data)

      // Create training example
      const example = await createExample.mutateAsync({
        question,
        bridgeResponse: data,
        bridgeModel: 'gpt-3.5-turbo',
        contextPath: '/admin/bridge/train',
      })

      setExampleId(example.id)
      setState('rating')
    } catch (error) {
      console.error('Error asking Bridge:', error)
      setState('error')
    }
  }

  const handleSaveRatings = async () => {
    if (!exampleId) return

    setState('editing')

    try {
      await rateResponse.mutateAsync({
        exampleId,
        helpfulnessRating: helpfulness,
        accuracyRating: accuracy,
        toneRating: tone,
      })
    } catch (error) {
      console.error('Error saving ratings:', error)
      setState('error')
    }
  }

  const handleSaveIdeal = async () => {
    if (!exampleId || !idealResponse.trim()) return

    setState('saving')

    try {
      await provideIdeal.mutateAsync({
        exampleId,
        idealResponse,
      })

      setState('success')

      // Reset for next question
      setTimeout(() => {
        setQuestion('')
        setBridgeResponse('')
        setExampleId(null)
        setHelpfulness(0)
        setAccuracy(0)
        setTone(0)
        setIdealResponse('')
        setState('idle')
      }, 2000)
    } catch (error) {
      console.error('Error saving ideal response:', error)
      setState('error')
    }
  }

  return (
    <div className="space-y-6">
      {/* Step 1: Ask Question */}
      <Card>
        <CardHeader>
          <CardTitle>Step 1: Ask Bridge a Question</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <Input
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="What would you like to ask Bridge?"
              className="flex-1"
              disabled={state !== 'idle'}
            />
            <Button
              onClick={handleAskBridge}
              disabled={state !== 'idle' || !question.trim()}
            >
              Ask Bridge →
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Step 2: Bridge Response */}
      {(state !== 'idle') && (
        <Card>
          <CardHeader>
            <CardTitle>Step 2: Bridge's Response</CardTitle>
          </CardHeader>
          <CardContent>
            {state === 'loading' ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
                <p className="mt-4 text-gray-600">Bridge is thinking...</p>
              </div>
            ) : (
              <div className="prose max-w-none">
                <div className="bg-orange-50 p-4 rounded-lg">
                  {bridgeResponse}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Step 3: Rate Response */}
      {(state === 'rating' || state === 'editing' || state === 'saving' || state === 'success') && (
        <Card>
          <CardHeader>
            <CardTitle>Step 3: Rate Bridge's Response</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Helpfulness</label>
              <StarRating
                value={helpfulness}
                onChange={setHelpfulness}
                disabled={state !== 'rating'}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Accuracy</label>
              <StarRating
                value={accuracy}
                onChange={setAccuracy}
                disabled={state !== 'rating'}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Tone</label>
              <StarRating
                value={tone}
                onChange={setTone}
                disabled={state !== 'rating'}
              />
            </div>

            {state === 'rating' && (
              <Button
                onClick={handleSaveRatings}
                disabled={helpfulness === 0 || accuracy === 0 || tone === 0}
              >
                Continue to Ideal Response →
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {/* Step 4: Provide Ideal Response */}
      {(state === 'editing' || state === 'saving' || state === 'success') && (
        <Card>
          <CardHeader>
            <CardTitle>Step 4: Provide Your Ideal Response</CardTitle>
          </CardHeader>
          <CardContent>
            <MarkdownEditor
              value={idealResponse}
              onChange={setIdealResponse}
              disabled={state !== 'editing'}
              placeholder="Write how Bridge should have answered..."
            />

            {state === 'editing' && (
              <div className="mt-4 flex gap-4">
                <Button
                  onClick={handleSaveIdeal}
                  disabled={!idealResponse.trim()}
                >
                  Save Training Example
                </Button>
                <Button variant="outline" onClick={() => setState('idle')}>
                  Discard
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Success Message */}
      {state === 'success' && (
        <Card className="bg-green-50 border-green-200">
          <CardContent className="py-6">
            <div className="text-center">
              <div className="text-green-600 text-xl font-semibold mb-2">
                ✓ Training Example Saved!
              </div>
              <p className="text-gray-600">
                Ready for next question...
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Error State */}
      {state === 'error' && (
        <Card className="bg-red-50 border-red-200">
          <CardContent className="py-6">
            <div className="text-center">
              <div className="text-red-600 text-xl font-semibold mb-2">
                Error
              </div>
              <p className="text-gray-600 mb-4">
                Something went wrong. Please try again.
              </p>
              <Button onClick={() => setState('idle')}>
                Start Over
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
```

### Star Rating Component (`packages/ui/src/bridge-training/StarRating.tsx`)

```typescript
'use client'

import { Star } from 'lucide-react'

interface StarRatingProps {
  value: number // 0-5
  onChange: (value: number) => void
  disabled?: boolean
}

export const StarRating: React.FC<StarRatingProps> = ({
  value,
  onChange,
  disabled = false,
}) => {
  return (
    <div className="flex gap-2">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => !disabled && onChange(star)}
          disabled={disabled}
          className={`transition-colors ${disabled ? 'cursor-not-allowed' : 'cursor-pointer hover:scale-110'}`}
        >
          <Star
            className={`w-8 h-8 ${
              star <= value
                ? 'fill-yellow-400 text-yellow-400'
                : 'fill-gray-200 text-gray-300'
            }`}
          />
        </button>
      ))}
      <span className="ml-2 text-sm text-gray-600">
        {value > 0 ? `${value}/5` : 'Not rated'}
      </span>
    </div>
  )
}
```

### Page 2: Training Data Viewer (`apps/web/app/admin/bridge/training-data/page.tsx`)

```typescript
'use client'

import { useState } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@togetheros/ui/card'
import { Button } from '@togetheros/ui/button'
import { Input } from '@togetheros/ui/input'
import { Badge } from '@togetheros/ui/badge'
import { trpc } from '@/lib/trpc'
import Link from 'next/link'

export default function TrainingDataPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string | undefined>()

  const { data, isLoading } = trpc.bridgeTraining.listExamples.useQuery({
    searchQuery,
    status: statusFilter as any,
    sortBy: 'createdAt',
    sortOrder: 'desc',
  })

  const stats = trpc.bridgeTraining.getStats.useQuery()

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Training Data Repository</h1>
          <p className="text-gray-600 mt-2">
            Browse and manage Bridge training examples
          </p>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold">{stats.data?.totalExamples || 0}</div>
              <div className="text-sm text-gray-600">Total Examples</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold">{stats.data?.pendingReview || 0}</div>
              <div className="text-sm text-gray-600">Pending Review</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold">{stats.data?.approved || 0}</div>
              <div className="text-sm text-gray-600">Approved</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold">
                {stats.data?.averageQuality || 0}%
              </div>
              <div className="text-sm text-gray-600">Avg Quality</div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex gap-4">
              <Input
                placeholder="Search questions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1"
              />
              <div className="flex gap-2">
                <Button
                  variant={statusFilter === undefined ? 'default' : 'outline'}
                  onClick={() => setStatusFilter(undefined)}
                >
                  All
                </Button>
                <Button
                  variant={statusFilter === 'pending' ? 'default' : 'outline'}
                  onClick={() => setStatusFilter('pending')}
                >
                  Pending
                </Button>
                <Button
                  variant={statusFilter === 'approved' ? 'default' : 'outline'}
                  onClick={() => setStatusFilter('approved')}
                >
                  Approved
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Examples List */}
        <div className="space-y-4">
          {isLoading ? (
            <div className="text-center py-12">Loading...</div>
          ) : data?.items.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center text-gray-500">
                No training examples yet. <Link href="/admin/bridge/train" className="text-blue-600 hover:underline">Start training →</Link>
              </CardContent>
            </Card>
          ) : (
            data?.items.map((example) => (
              <Card key={example.id} className="hover:shadow-md transition-shadow">
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="font-medium mb-2">{example.question}</div>
                      <div className="flex gap-2 mb-2">
                        <Badge variant={
                          example.trainingStatus === 'approved' ? 'success' :
                          example.trainingStatus === 'pending' ? 'warning' :
                          'default'
                        }>
                          {example.trainingStatus}
                        </Badge>
                        {example.qualityScore && (
                          <Badge variant="outline">
                            Quality: {example.qualityScore}%
                          </Badge>
                        )}
                      </div>
                      <div className="text-sm text-gray-500">
                        Created {new Date(example.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                    <Link href={`/admin/bridge/training-data/${example.id}`}>
                      <Button variant="outline" size="sm">
                        View Details →
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
```

---

## File Structure

```
TogetherOS/
├── apps/
│   ├── api/
│   │   └── src/
│   │       └── modules/
│   │           └── bridge-training/
│   │               ├── entities/
│   │               │   ├── TrainingExample.ts
│   │               │   └── index.ts
│   │               ├── repos/
│   │               │   ├── PostgresTrainingRepo.ts
│   │               │   └── index.ts
│   │               ├── handlers/
│   │               │   └── index.ts (tRPC router)
│   │               └── services/
│   │                   └── AuditLogger.ts
│   └── web/
│       └── app/
│           └── admin/
│               └── bridge/
│                   ├── train/
│                   │   └── page.tsx
│                   └── training-data/
│                       ├── page.tsx
│                       └── [id]/
│                           └── page.tsx
├── packages/
│   ├── types/
│   │   └── src/
│   │       ├── bridge-training.ts
│   │       └── index.ts
│   ├── validators/
│   │   └── src/
│   │       ├── bridge-training.ts
│   │       └── index.ts
│   └── ui/
│       └── src/
│           └── bridge-training/
│               ├── index.ts
│               ├── BridgeTrainingInterface.tsx
│               ├── StarRating.tsx
│               ├── MarkdownEditor.tsx
│               └── __tests__/
│                   └── BridgeTraining.test.tsx
├── db/
│   └── migrations/
│       └── 009_add_bridge_training.sql
├── docs/
│   ├── dev/
│   │   └── pick-up.md (session tracker)
│   └── modules/
│       └── bridge/
│           └── training-interface-design.md (this file)
└── logs/
    └── bridge-training/
        └── audit-YYYY-MM-DD.ndjson
```

---

## Implementation Phases

### Phase 1: Foundation (Week 1)
- [ ] Create database schema and migrations
- [ ] Define TypeScript types and Zod validators
- [ ] Build repository layer (CRUD operations)
- [ ] Set up NDJSON audit logger
- [ ] Write unit tests for repos

**Deliverables**:
- Database tables created
- Types package updated
- Validators package updated
- Basic CRUD working

### Phase 2: API Layer (Week 2)
- [ ] Implement tRPC router
- [ ] Create admin middleware
- [ ] Build all endpoint handlers
- [ ] Add audit logging to all mutations
- [ ] Write API integration tests

**Deliverables**:
- All API endpoints working
- Admin authorization enforced
- Audit logs being written

### Phase 3: Training Interface UI (Week 3)
- [ ] Build training page layout
- [ ] Implement 5-step workflow
- [ ] Create StarRating component
- [ ] Build MarkdownEditor with preview
- [ ] Add loading and error states

**Deliverables**:
- `/admin/bridge/train` page working
- Complete training workflow functional
- Responsive design

### Phase 4: Data Viewer UI (Week 4)
- [ ] Build training data list page
- [ ] Implement search and filters
- [ ] Create example detail view
- [ ] Add side-by-side comparison
- [ ] Build statistics dashboard

**Deliverables**:
- `/admin/bridge/training-data` page working
- Search and filtering functional
- Approval workflow implemented

### Phase 5: Testing & Polish (Week 5)
- [ ] End-to-end testing
- [ ] Performance optimization
- [ ] Accessibility audit
- [ ] Documentation updates
- [ ] Bug fixes

**Deliverables**:
- Full test coverage
- Accessibility compliant
- Production-ready

### Phase 6: Training Integration (Week 6)
- [ ] RAG enhancement using approved examples
- [ ] Embedding generation for semantic search
- [ ] Export functionality (CSV/JSON)
- [ ] Training batch creation
- [ ] Metrics and analytics

**Deliverables**:
- Training data actively improving Bridge
- Analytics dashboard
- Export tools

---

## Security Model

### Access Control

- **Admin-Only**: All training endpoints require admin role
- **Session Tracking**: Each training session tracked with IP, user agent
- **Audit Logging**: Every action logged to NDJSON + database

### Privacy Protection

```typescript
// IP hashing
function hashIP(ip: string): string {
  return createHash('sha256')
    .update(ip + process.env.IP_SALT)
    .digest('hex')
}

// PII redaction in training examples
function redactPII(text: string): string {
  return text
    .replace(/\b[\w\.-]+@[\w\.-]+\.\w{2,4}\b/gi, '[REDACTED_EMAIL]')
    .replace(/\b\d{3}[-.]?\d{3}[-.]?\d{4}\b/g, '[REDACTED_PHONE]')
    .replace(/@[\w-]+/g, '[REDACTED_HANDLE]')
}
```

---

## Training Integration

### How Training Data Will Be Used

#### 1. RAG Enhancement (Immediate)
```typescript
// Add approved examples to documentation index
async function enhanceRAGWithTraining() {
  const approvedExamples = await repo.getApprovedExamples()

  for (const example of approvedExamples) {
    // Add to docs index
    docsIndex.push({
      content: `Q: ${example.question}\nA: ${example.idealResponse}`,
      path: `training/${example.id}`,
      type: 'training_example',
      keywords: example.idealKeywords,
    })
  }
}
```

#### 2. Fine-Tuning (Future)
```typescript
// Export training data for OpenAI fine-tuning
async function exportForFineTuning() {
  const examples = await repo.getApprovedExamples()

  const trainingData = examples.map(e => ({
    messages: [
      { role: 'system', content: BRIDGE_SYSTEM_PROMPT },
      { role: 'user', content: e.question },
      { role: 'assistant', content: e.idealResponse },
    ]
  }))

  // Save as JSONL
  await saveJSONL(trainingData, 'bridge-training.jsonl')
}
```

#### 3. Prompt Engineering (Immediate)
```typescript
// Use high-quality examples in system prompt
async function generateEnhancedPrompt() {
  const topExamples = await repo.getHighQualityExamples(5)

  return `${BRIDGE_SYSTEM_PROMPT}

Here are examples of excellent responses:

${topExamples.map(e => `
Q: ${e.question}
A: ${e.idealResponse}
`).join('\n')}

Follow this style and quality in your responses.`
}
```

---

## Monitoring & Analytics

### Key Metrics

```sql
-- Training activity over time
SELECT
  DATE(created_at) as date,
  COUNT(*) as examples_created,
  AVG(quality_score) as avg_quality
FROM bridge_training_examples
GROUP BY DATE(created_at)
ORDER BY date DESC
LIMIT 30;

-- Quality distribution
SELECT
  CASE
    WHEN quality_score >= 80 THEN 'Excellent'
    WHEN quality_score >= 60 THEN 'Good'
    WHEN quality_score >= 40 THEN 'Fair'
    ELSE 'Poor'
  END as quality_tier,
  COUNT(*) as count
FROM bridge_training_examples
GROUP BY quality_tier;

-- Category coverage
SELECT
  question_category,
  COUNT(*) as examples,
  AVG(quality_score) as avg_quality
FROM bridge_training_examples
WHERE training_status = 'approved'
GROUP BY question_category
ORDER BY examples DESC;
```

---

## Next Steps

1. **Review this design** with operator
2. **Start Phase 1** implementation (database + types)
3. **Test workflow** with operator feedback
4. **Iterate** on UI/UX
5. **Deploy** to production
6. **Start training** Bridge with real examples

---

**Last Updated**: 2025-11-03
**Status**: Ready for implementation
**Estimated Timeline**: 6 weeks to full production deployment
