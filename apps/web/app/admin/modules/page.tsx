import { ModuleCard } from '@togetheros/ui/docs/ModuleCard'
import type { Metadata } from 'next'
import Link from 'next/link'
import {
  modules,
  getCompleteModules,
  getInProgressModules,
  getPlannedModules,
  GITHUB_BASE,
} from '../../../lib/data/modules-data'

export const metadata: Metadata = {
  title: 'Modules Hub (Admin) | Coopeverything Docs',
  description: 'Admin view of all Coopeverything platform modules',
}

export default function AdminModulesPage() {
  const completeModules = getCompleteModules()
  const inProgressModules = getInProgressModules()
  const plannedModules = getPlannedModules()

  return (
    <div className="min-h-screen bg-gradient-to-br from-bg-1 to-blue-50">
      <div className="max-w-6xl mx-auto px-4 py-12">
        {/* Admin Notice */}
        <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
          <div className="flex items-center gap-2 text-amber-800">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="font-medium">Admin View</span>
          </div>
          <p className="mt-1 text-sm text-amber-700">
            This is the admin modules dashboard. Public view available at{' '}
            <Link href="/modules" className="underline hover:no-underline">/modules</Link>.
          </p>
        </div>

        {/* Header */}
        <div className="mb-12 text-center">
          <h1 className="text-4xl font-bold text-ink-900 mb-4">
            Coopeverything Modules Hub
          </h1>
          <p className="text-lg text-ink-700 max-w-3xl mx-auto leading-relaxed">
            These modules work together as a <strong>unified governance pipeline</strong>: from ideation to decision to execution to continuous improvement. Each module represents a key capability powered by TogetherOS, the technology stack enabling cooperation.
          </p>
          <div className="mt-4">
            <a
              href="/how-we-decide"
              className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium"
            >
              Learn how the pipeline works →
            </a>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          <div className="bg-bg-0 rounded-lg shadow-sm p-6 border border-border">
            <div className="text-3xl font-bold text-blue-600 mb-2">
              {modules.length}
            </div>
            <div className="text-sm text-ink-700">Total Modules</div>
          </div>
          <div className="bg-bg-0 rounded-lg shadow-sm p-6 border border-border">
            <div className="text-3xl font-bold text-green-600 mb-2">
              {completeModules.length}
            </div>
            <div className="text-sm text-ink-700">Production Ready</div>
          </div>
          <div className="bg-bg-0 rounded-lg shadow-sm p-6 border border-border">
            <div className="text-3xl font-bold text-orange-600 mb-2">
              {inProgressModules.length}
            </div>
            <div className="text-sm text-ink-700">In Development</div>
          </div>
          <div className="bg-bg-0 rounded-lg shadow-sm p-6 border border-border">
            <div className="text-3xl font-bold text-ink-700 mb-2">
              {plannedModules.length}
            </div>
            <div className="text-sm text-ink-700">Planned</div>
          </div>
        </div>

        {/* Complete Modules */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-ink-900 mb-6 flex items-center gap-3">
            <span className="w-1 h-8 bg-green-600 rounded-full"></span>
            Production Ready
          </h2>
          <div className="space-y-4">
            {completeModules.map((module) => (
              <ModuleCard key={module.title} {...module} />
            ))}
          </div>
        </section>

        {/* In Progress Modules */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-ink-900 mb-6 flex items-center gap-3">
            <span className="w-1 h-8 bg-orange-600 rounded-full"></span>
            In Development
          </h2>
          <div className="space-y-4">
            {inProgressModules.map((module) => (
              <ModuleCard key={module.title} {...module} />
            ))}
          </div>
        </section>

        {/* Planned Modules */}
        <section>
          <h2 className="text-2xl font-bold text-ink-900 mb-6 flex items-center gap-3">
            <span className="w-1 h-8 bg-ink-400 rounded-full"></span>
            Planned Modules
          </h2>
          <div className="space-y-4">
            {plannedModules.map((module) => (
              <ModuleCard key={module.title} {...module} />
            ))}
          </div>
        </section>

        {/* Footer */}
        <div className="mt-16 p-8 bg-bg-0 rounded-lg shadow-sm border border-border">
          <h3 className="text-lg font-semibold text-ink-900 mb-4">
            Contributing
          </h3>
          <p className="text-ink-700 mb-4 leading-relaxed">
            Each module follows domain-driven design with tiny, verifiable
            increments. See our{' '}
            <a
              href={`${GITHUB_BASE}/docs/OPERATIONS.md`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline"
            >
              Operations Guide
            </a>{' '}
            for contribution workflow and{' '}
            <a
              href={`${GITHUB_BASE}/docs/STATUS_v2.md`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline"
            >
              Status Dashboard
            </a>{' '}
            for authoritative progress tracking.
          </p>
          <div className="flex gap-4">
            <a
              href="https://github.com/coopeverything/TogetherOS"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 bg-ink-900 text-white rounded-lg hover:bg-ink-700 transition-colors font-medium"
            >
              View Repository
            </a>
            <a
              href={`${GITHUB_BASE}/docs/contributors/GETTING_STARTED.md`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              Get Started
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
