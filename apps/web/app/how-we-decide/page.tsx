import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'How We Decide Together | Coopeverything',
  description:
    'Learn how Coopeverything makes decisions together through consent-based governance, community deliberation, and continuous improvement.',
}

export default function HowWeDecidePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-orange-50">
      <div className="max-w-5xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="mb-12 text-center">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            How We Decide Together
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Coopeverything uses a <strong>consent-based governance pipeline</strong>{' '}
            that transforms ideas into action, tracks outcomes, and learns from
            experience. Everyone participates. The commons improves the process.
          </p>
        </div>

        {/* Disclaimer */}
        <div className="mb-12 p-6 bg-orange-50 border border-orange-200 rounded-lg">
          <h2 className="text-lg font-semibold text-orange-900 mb-2">
            This is a Living System
          </h2>
          <p className="text-gray-700 leading-relaxed">
            <strong>Important:</strong> These systems are <em>suggestions</em>, not
            mandates. The commons—<strong>all of us together</strong>—will design and
            improve these processes over time. This is a living system that evolves with
            our collective wisdom.
          </p>
        </div>

        {/* The Complete Pipeline */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">
            The Complete Pipeline
          </h2>

          {/* Visual Flow */}
          <div className="bg-white rounded-lg shadow-md p-8 mb-8">
            <div className="flex flex-col md:flex-row items-center justify-between text-center space-y-4 md:space-y-0">
              <PipelineStep number="1" title="Ideation" subtitle="Forum" />
              <Arrow />
              <PipelineStep number="2" title="Deliberation" subtitle="Forum" />
              <Arrow />
              <PipelineStep number="3" title="Proposal" subtitle="Governance" />
              <Arrow />
              <PipelineStep number="4" title="Decision" subtitle="Governance" />
            </div>
            <div className="flex items-center justify-center my-6">
              <div className="text-3xl text-gray-400">↓</div>
            </div>
            <div className="flex flex-col md:flex-row items-center justify-between text-center space-y-4 md:space-y-0">
              <PipelineStep number="5" title="Initiative" subtitle="Execution" />
              <Arrow />
              <PipelineStep number="6" title="Execution" subtitle="Execution" />
              <Arrow />
              <PipelineStep number="7" title="Review" subtitle="Metrics" />
              <Arrow />
              <PipelineStep number="8" title="Improve" subtitle="Governance" />
            </div>
          </div>

          <p className="text-gray-600 leading-relaxed">
            From casual conversation to concrete action to continuous improvement. Each
            phase connects seamlessly to the next, with transparent tracking throughout.
          </p>
        </section>

        {/* The 3 Mega-Modules */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">
            Three Phases of Governance
          </h2>

          <div className="space-y-8">
            {/* Module 1: Discussions & Deliberation */}
            <ModuleCard
              number="1"
              title="Discussions & Deliberation"
              color="blue"
              description="Explore ideas, build knowledge, and reach readiness"
            >
              <h4 className="font-semibold text-gray-900 mb-2">What Happens Here:</h4>
              <ul className="space-y-2 text-gray-700">
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 font-bold mt-0.5">•</span>
                  <span>
                    <strong>Share knowledge:</strong> Document best practices, case
                    studies, how-to guides
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 font-bold mt-0.5">•</span>
                  <span>
                    <strong>Ask & answer questions:</strong> Build a searchable knowledge
                    base
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 font-bold mt-0.5">•</span>
                  <span>
                    <strong>Explore ideas:</strong> Test concepts, gather feedback before
                    formal proposals
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 font-bold mt-0.5">•</span>
                  <span>
                    <strong>Deliberate together:</strong> Structured discussions when
                    decisions loom
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 font-bold mt-0.5">•</span>
                  <span>
                    <strong>Preserve diverse views:</strong> Minority opinions remain
                    visible
                  </span>
                </li>
              </ul>

              <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                <h4 className="font-semibold text-blue-900 mb-2">Key Features:</h4>
                <div className="flex flex-wrap gap-2">
                  <Badge text="Forum & Deliberation" />
                  <Badge text="Bridge AI Assistant" />
                  <Badge text="Search & Discovery" />
                </div>
              </div>
            </ModuleCard>

            {/* Module 2: Governance & Decisions */}
            <ModuleCard
              number="2"
              title="Governance & Decisions"
              color="orange"
              description="Formal proposals, voting, and consent-based decisions"
            >
              <h4 className="font-semibold text-gray-900 mb-2">What Happens Here:</h4>
              <ul className="space-y-2 text-gray-700">
                <li className="flex items-start gap-2">
                  <span className="text-orange-600 font-bold mt-0.5">•</span>
                  <span>
                    <strong>Convert ideas to proposals:</strong> Discussions mature into
                    formal proposals
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-orange-600 font-bold mt-0.5">•</span>
                  <span>
                    <strong>Gather evidence:</strong> Research, data, expert opinions,
                    precedents
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-orange-600 font-bold mt-0.5">•</span>
                  <span>
                    <strong>Explore trade-offs:</strong> Consider alternatives, costs,
                    benefits
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-orange-600 font-bold mt-0.5">•</span>
                  <span>
                    <strong>Vote with consent:</strong> Not majority-rule—seek consent with
                    minority reports
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-orange-600 font-bold mt-0.5">•</span>
                  <span>
                    <strong>Amend & iterate:</strong> Decisions can be revisited and
                    improved
                  </span>
                </li>
              </ul>

              <div className="mt-6 p-4 bg-orange-50 rounded-lg">
                <h4 className="font-semibold text-orange-900 mb-2">Key Features:</h4>
                <div className="flex flex-wrap gap-2">
                  <Badge text="Proposals & Decisions" />
                  <Badge text="Support Points UI" />
                  <Badge text="Moderation Transparency" />
                </div>
              </div>
            </ModuleCard>

            {/* Module 3: Execution & Accountability */}
            <ModuleCard
              number="3"
              title="Execution & Accountability"
              color="green"
              description="Implementation, tracking, review, and continuous improvement"
            >
              <h4 className="font-semibold text-gray-900 mb-2">What Happens Here:</h4>
              <ul className="space-y-2 text-gray-700">
                <li className="flex items-start gap-2">
                  <span className="text-green-600 font-bold mt-0.5">•</span>
                  <span>
                    <strong>Convert to initiatives:</strong> Approved proposals become
                    actionable work
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 font-bold mt-0.5">•</span>
                  <span>
                    <strong>Assign workgroups:</strong> Break down tasks, assign to teams
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 font-bold mt-0.5">•</span>
                  <span>
                    <strong>Track progress:</strong> Transparent reports, deadlines, events,
                    milestones
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 font-bold mt-0.5">•</span>
                  <span>
                    <strong>Measure outcomes:</strong> Success metrics, actual vs expected
                    results
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 font-bold mt-0.5">•</span>
                  <span>
                    <strong>Improve continuously:</strong> Failed initiatives auto-generate
                    improvement proposals
                  </span>
                </li>
              </ul>

              <div className="mt-6 p-4 bg-green-50 rounded-lg">
                <h4 className="font-semibold text-green-900 mb-2">Key Features:</h4>
                <div className="flex flex-wrap gap-2">
                  <Badge text="Admin Accountability" />
                  <Badge text="Events & Calendar" />
                  <Badge text="Metrics & Review" />
                </div>
              </div>
            </ModuleCard>
          </div>
        </section>

        {/* Philosophy */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">
            Our Philosophy
          </h2>

          <div className="grid md:grid-cols-2 gap-6">
            <PhilosophyCard
              title="Consent-Based, Not Majority-Rule"
              description="We seek consent, not 51% approval. Minority reports are codified, preserved, and given equal visibility. Dissenting voices help us make better decisions."
            />
            <PhilosophyCard
              title="Transparent & Traceable"
              description="Every decision links to evidence, every action links to a decision, every outcome links back to metrics. Full audit trail from idea to impact."
            />
            <PhilosophyCard
              title="Learning from Failure"
              description="When initiatives fail metrics, the system auto-generates improvement proposals. Failure becomes feedback. The commons learns collectively."
            />
            <PhilosophyCard
              title="Rotating Roles, Shared Power"
              description="Admins execute decisions, they don't make them. Roles have term limits and are recallable. Power stays distributed."
            />
          </div>
        </section>

        {/* Example Flow */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">
            Example: Community Garden Initiative
          </h2>

          <div className="bg-white rounded-lg shadow-md p-8">
            <ol className="space-y-6">
              <ExampleStep
                number="1"
                phase="Ideation"
                description="Member posts in Forum: 'Should we build a community garden?'"
              />
              <ExampleStep
                number="2"
                phase="Deliberation"
                description="Community discusses: location options, water access concerns (minority view), estimated costs"
              />
              <ExampleStep
                number="3"
                phase="Proposal"
                description="Discussion matures into formal proposal with evidence, budget, minority report on water access"
              />
              <ExampleStep
                number="4"
                phase="Decision"
                description="Community votes: 75% consent, minority report preserved stating 'water access may be insufficient'"
              />
              <ExampleStep
                number="5"
                phase="Initiative"
                description="Proposal converts to initiative: tasks assigned to workgroups, metrics defined (50 participants, 100kg produce)"
              />
              <ExampleStep
                number="6"
                phase="Execution"
                description="Workgroup builds garden over 3 months, posts progress updates, tracks deadlines via calendar"
              />
              <ExampleStep
                number="7"
                phase="Review"
                description="90 days later: Only 15 participants (30% of target), 30kg produce (30% of target). Minority prediction about water was correct."
              />
              <ExampleStep
                number="8"
                phase="Improve"
                description="System auto-generates improvement proposal: 'Add irrigation system.' Includes failed metrics + minority report quote as evidence. Community deliberates → approves → implements → success!"
              />
            </ol>
          </div>
        </section>

        {/* Call to Action */}
        <section className="text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Ready to Participate?
          </h2>
          <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
            Every voice matters. Every decision is transparent. The commons evolves
            together.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/forum"
              className="inline-flex items-center justify-center px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              Start a Discussion
            </Link>
            <Link
              href="/governance"
              className="inline-flex items-center justify-center px-8 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors font-medium"
            >
              Browse Proposals
            </Link>
            <Link
              href="/admin/modules"
              className="inline-flex items-center justify-center px-8 py-3 bg-gray-200 text-gray-900 rounded-lg hover:bg-gray-300 transition-colors font-medium"
            >
              Explore All Modules
            </Link>
          </div>
        </section>
      </div>
    </div>
  )
}

// Helper Components

function PipelineStep({
  number,
  title,
  subtitle,
}: {
  number: string
  title: string
  subtitle: string
}) {
  return (
    <div className="flex flex-col items-center">
      <div className="w-16 h-16 rounded-full bg-gradient-to-br from-orange-500 to-orange-600 text-white flex items-center justify-center text-2xl font-bold mb-2">
        {number}
      </div>
      <div className="font-semibold text-gray-900">{title}</div>
      <div className="text-sm text-gray-500">{subtitle}</div>
    </div>
  )
}

function Arrow() {
  return (
    <div className="hidden md:block text-3xl text-gray-300">→</div>
  )
}

function ModuleCard({
  number,
  title,
  color,
  description,
  children,
}: {
  number: string
  title: string
  color: 'blue' | 'orange' | 'green'
  description: string
  children: React.ReactNode
}) {
  const colorClasses = {
    blue: 'from-blue-500 to-blue-600 border-blue-200',
    orange: 'from-orange-500 to-orange-600 border-orange-200',
    green: 'from-green-500 to-green-600 border-green-200',
  }

  const bgColor = {
    blue: 'bg-blue-50',
    orange: 'bg-orange-50',
    green: 'bg-green-50',
  }

  return (
    <div className={`bg-white rounded-lg shadow-md border-2 ${colorClasses[color]} overflow-hidden`}>
      <div className={`bg-gradient-to-r ${colorClasses[color]} p-6 text-white`}>
        <div className="flex items-center gap-4 mb-2">
          <div className="w-12 h-12 rounded-full bg-white bg-opacity-20 flex items-center justify-center text-2xl font-bold">
            {number}
          </div>
          <h3 className="text-2xl font-bold">{title}</h3>
        </div>
        <p className="text-white text-opacity-90">{description}</p>
      </div>
      <div className={`p-6 ${bgColor[color]}`}>{children}</div>
    </div>
  )
}

function Badge({ text }: { text: string }) {
  return (
    <span className="px-3 py-1 bg-white border border-gray-300 rounded-full text-sm text-gray-700">
      {text}
    </span>
  )
}

function PhilosophyCard({
  title,
  description,
}: {
  title: string
  description: string
}) {
  return (
    <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
      <h3 className="text-xl font-semibold text-gray-900 mb-3">{title}</h3>
      <p className="text-gray-600 leading-relaxed">{description}</p>
    </div>
  )
}

function ExampleStep({
  number,
  phase,
  description,
}: {
  number: string
  phase: string
  description: string
}) {
  return (
    <li className="flex gap-4">
      <div className="flex-shrink-0">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-500 to-orange-600 text-white flex items-center justify-center font-bold">
          {number}
        </div>
      </div>
      <div>
        <div className="font-semibold text-orange-700 mb-1">{phase}</div>
        <div className="text-gray-700">{description}</div>
      </div>
    </li>
  )
}
