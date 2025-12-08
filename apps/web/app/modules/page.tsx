import { ModuleCard } from '@togetheros/ui/docs/ModuleCard'
import type { Metadata } from 'next'
import {
  getCompleteModules,
  getInProgressModules,
  getPlannedModules,
} from '../../lib/data/modules-data'

export const metadata: Metadata = {
  title: 'What You Can Do | CoopEverything',
  description: 'Explore all the ways you can participate in your cooperative community',
}

export default function ModulesPage() {
  const completeModules = getCompleteModules()
  const inProgressModules = getInProgressModules()
  const plannedModules = getPlannedModules()

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-900 dark:to-gray-800">
      <div className="max-w-6xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="mb-12 text-center">
          <h1 className="text-sm font-bold text-gray-900 dark:text-white mb-4">
            What You Can Do
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 max-w-3xl mx-auto leading-relaxed">
            Everything you need to participate in your cooperative community.
            Make decisions together, connect with members, and build something meaningful.
          </p>
          <div className="mt-4">
            <a
              href="/how-we-decide"
              className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium"
            >
              Learn how we make decisions together →
            </a>
          </div>
        </div>

        {/* Available Now */}
        <section className="mb-12">
          <h2 className="text-sm font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-3">
            <span className="w-1 h-8 bg-green-600 rounded-full"></span>
            Available Now
          </h2>
          <div className="space-y-2">
            {completeModules.map((module) => (
              <ModuleCard key={module.title} {...module} />
            ))}
          </div>
        </section>

        {/* In Progress */}
        {inProgressModules.length > 0 && (
          <section className="mb-12">
            <h2 className="text-sm font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-3">
              <span className="w-1 h-8 bg-orange-600 rounded-full"></span>
              Coming Soon
            </h2>
            <div className="space-y-2">
              {inProgressModules.map((module) => (
                <ModuleCard key={module.title} {...module} />
              ))}
            </div>
          </section>
        )}

        {/* Planned */}
        {plannedModules.length > 0 && (
          <section>
            <h2 className="text-sm font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-3">
              <span className="w-1 h-8 bg-gray-400 rounded-full"></span>
              On the Roadmap
            </h2>
            <div className="space-y-2">
              {plannedModules.map((module) => (
                <ModuleCard key={module.title} {...module} />
              ))}
            </div>
          </section>
        )}

        {/* Minimal Developer Footer */}
        <div className="mt-16 pt-8 border-t border-gray-200 dark:border-gray-700 text-center">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            CoopEverything is open source.{' '}
            <a
              href="https://github.com/coopeverything/TogetherOS"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline"
            >
              View the code on GitHub
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}
