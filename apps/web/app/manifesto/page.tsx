import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'TogetherOS Manifesto',
  description: 'An operating system for cooperation - helping people unlearn division and learn coordination.',
}

export default function ManifestoPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-green-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            TogetherOS Manifesto
          </h1>
          <p className="text-xl text-gray-600">
            An operating system for cooperation - helping people unlearn division and learn coordination.
          </p>
        </div>

        {/* Content */}
        <div className="prose prose-lg prose-orange max-w-none">
          <section className="mb-10">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">The Problem</h2>
            <p className="text-gray-700 leading-relaxed">
              Power concentrated in a few hands routes wealth and political power upward and pain downward. The results are familiar: struggle, poverty, wars, famine, exploitation, and ecological breakdown—along with anxiety, loss of meaning, isolation, and social disconnection.
            </p>
          </section>

          <section className="mb-10">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">The Opening</h2>
            <p className="text-gray-700 leading-relaxed">
              Whenever everyday people are asked, at scale, to propose and choose solutions, they produce <em>more rational, humane, and effective</em> plans—and they innovate more creatively, with greater care for those in need. So you would think "We the people" should be making the decisions. Democracy works—when systems let people decide and deliver.
            </p>
          </section>

          <section className="mb-10">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">The Obstacle</h2>
            <p className="text-gray-700 leading-relaxed">
              The barrier isn't human capacity—it's fragmentation: ideology, trauma, isolation, manipulative narratives, and a culture trained for competition and obedience to "strong leaders" and pyramidal institutions. Though we evolved as cooperators over hundreds of thousands of years, recent systems have convinced us otherwise.
            </p>
          </section>

          <section className="mb-10">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">The Answer: An Operating System for Cooperation</h2>
            <p className="text-gray-700 leading-relaxed mb-6">
              <strong>TogetherOS</strong> is a full-stack social and technological system that helps people unlearn division and learn coordination. It resets default assumptions (individualism, zero-sum thinking) and cultivates cooperative habits—then channels them into real delivery.
            </p>

            <h3 className="text-2xl font-semibold text-gray-800 mb-3">Core mechanics</h3>
            <ul className="space-y-3 text-gray-700">
              <li>
                <strong>Shared decisions, shared power:</strong> Transparent, participatory governance built on consent, rotating and recallable roles, and traceable actions. Open proposals → evidence & options → deliberation → vote → delivery → review, with minority-interest protection and independent audits.
              </li>
              <li>
                <strong>Cooperative economy:</strong> We redirect locally produced surplus back into the community so people and places thrive. TogetherOS enables social-economy practices and stewards a cooperative treasury anchored by the <em>Social Horizon</em> currency.
              </li>
              <li>
                <strong>Tiny, verifiable steps:</strong> Every initiative is decomposed into shippable increments with public proofs of delivery so trust grows by doing and results are continuously audited.
              </li>
            </ul>
          </section>

          <section className="mb-10">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">How TogetherOS Changes Behavior</h2>
            <ul className="space-y-3 text-gray-700">
              <li>
                <strong>Learning & Unlearning Layer:</strong> Short, scenario-based lessons and micro-challenges teach civic reasoning (claims → evidence → tradeoffs), negotiation, and cooperative habits. Completing them unlocks capabilities and Support Points.
              </li>
              <li>
                <strong>Behavior & disposition shift:</strong> TogetherOS meets anxiety and mistrust with tiny wins: clear next steps, quick feedback, and visible collective progress. We emphasize clear, pleasurable interfaces and a felt sense of belonging to a global human community.
              </li>
              <li>
                <strong>Archetype Paths (fluid):</strong> Members choose a starting path—<em>Builder, Community Heart, Guided Contributor, Steady Cultivator</em>, etc.—and may blend skills. Each path has skill trees and badges. <strong>Reputation</strong> is earned by public contributions to the common good.
              </li>
              <li>
                <strong>Support Points Bank:</strong> Everyone starts with 100 points to allocate (max 10 per idea). Participation unlocks more points. Portfolios and trend dashboards surface what the community values and prioritizes.
              </li>
              <li>
                <strong>Deliberation by Design:</strong> Threads and rooms follow a research → options → deliberation template. Prompts and checklists keep discourse on topic and solution-oriented.
              </li>
              <li>
                <strong>Empathy-First Moderation + AI assistance:</strong> Rotating moderators apply de-escalation and fairness rules. AI helps summarize, surface common ground, rate-limit spikes, require restatements, and run structured compromise labs.
              </li>
            </ul>
          </section>

          <section className="mb-10">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Gamification & Immersive Experience</h2>
            <p className="text-gray-700 leading-relaxed">
              We create an immersive, role-play–style environment to help people imagine and visualize growth at local, national, and global scales. Seed → Seedling → Young Tree → Majestic Tree animations and a 3D globe that visualizes live projects and human achievements will make TogetherOS feel like a global-scale RPG—except every node represents real people and contactable projects. Play leads directly to collaboration and delivery.
            </p>
          </section>

          <section className="mb-10">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Eight Paths of Cooperation for Resilience and Prosperity</h2>
            <ol className="space-y-3 text-gray-700">
              <li>
                <strong>Collaborative Education</strong> — Civic studios, skill trees, peer cohorts, and a global repository of best practices. Learning is project-tethered and immediately useful.
              </li>
              <li>
                <strong>Social Economy</strong> — Mutual aid, time-banking, fair-price marketplaces, crowdfunding and microloans, collective purchasing, CSAs, repair/reuse networks, community investment pools, cooperative housing and enterprises, intentional communities, member-owned credit unions, circular-economy practices, and the <em>Social Horizon</em> currency for equitable wealth distribution, retirement security, and community reserves.
              </li>
              <li>
                <strong>Common Wellbeing</strong> — Peer support, mental-health circles, community clinics, integrative care, food-security ladders, and emergency relief protocols.
              </li>
              <li>
                <strong>Cooperative Technology</strong> — Open, auditable infrastructure; privacy-preserving identity; resilient, modular tools any community can fork and deploy.
              </li>
              <li>
                <strong>Collective Governance</strong> — Consent-based charters, quorum rules, minority reports, post-decision reviews, and civic jury tools; legislation drafting and initiative pipelines.
              </li>
              <li>
                <strong>Community Connection</strong> — Local/thematic groups, mutual-aid boards, events, and a live map of efforts and needs.
              </li>
              <li>
                <strong>Collaborative Media & Culture</strong> — Member-made films, music, writing, and documentation; positive narratives and a living archive of cooperative achievements.
              </li>
              <li>
                <strong>Common Planet</strong> — Regenerative projects, energy co-ops, circular materials, modular sustainable tech, and resilience networks tied to measurable ecological goals.
              </li>
            </ol>
          </section>

          <section className="mb-10">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">From Scarcity to Prosperity — Practical Intent</h2>
            <p className="text-gray-700 leading-relaxed">
              We are not another abstract political theory. Theory is important, but people need housing, food, fair wages, reliable healthcare, meaningful work, and community <em>now</em>. Extractive economics have systematically denied those needs. TogetherOS organizes practical, scalable pathways—combining cooperative production, local value capture, mutual aid, commons stewardship, and durable governance—so communities can meet basic needs and then prosper.
            </p>
            <p className="text-gray-600 italic mt-4">
              <strong>A note on humility:</strong> These are the best plans we have developed so far, not final truths. Everything here is open to reassessment and improvement through TogetherOS's deliberative processes. With broad participation and continuous testing, better solutions will emerge.
            </p>
          </section>

          <section className="mb-10">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Culture & Promise</h2>
            <p className="text-gray-700 leading-relaxed">
              We reject pyramidal authority and the worship of concentrated wealth. Cooperation is our original nature; TogetherOS is practice and structure to re-awaken it. Tiny, verifiable steps compound into dignity, connection, and shared prosperity for people and planet.
            </p>
          </section>

          {/* Call to Action */}
          <section className="mt-12 p-6 bg-orange-50 border-l-4 border-orange-500 rounded-r-lg">
            <h2 className="text-2xl font-bold text-gray-900 mb-3">Help Build TogetherOS</h2>
            <p className="text-gray-700 mb-4">
              Make cooperation inevitable! Your choice of module raises its priority. The build is dynamic and community-steered—tell us what you want to ship next.
            </p>
            <div className="space-y-2">
              <a
                href="https://github.com/coopeverything/TogetherOS"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block text-orange-600 hover:text-orange-700 font-medium"
              >
                → View on GitHub
              </a>
              <br />
              <a
                href="/modules"
                className="inline-block text-orange-600 hover:text-orange-700 font-medium"
              >
                → Explore Modules
              </a>
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}
