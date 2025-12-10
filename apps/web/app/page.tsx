/**
 * TogetherOS Home Page
 *
 * Welcome page showcasing the UI foundation and core features
 */

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

export default function HomePage() {
  return (
    <main className="min-h-screen bg-bg-0">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-brand-100 via-bg-1 to-joy-100">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(5,150,105,0.1),transparent_50%),radial-gradient(circle_at_70%_50%,rgba(245,158,11,0.1),transparent_50%)]" />

        <div className="relative max-w-7xl mx-auto px-4 py-24 sm:py-32">
          <div className="text-center">
            <h1 className="text-sm sm:text-6xl font-bold text-ink-900 mb-3">
              Welcome to TogetherOS
            </h1>
            <p className="text-sm text-ink-700 mb-12 max-w-2xl mx-auto">
              A cooperative operating system for collective action. Built on principles of
              democracy, transparency, and shared prosperity.
            </p>

            <div className="flex flex-wrap gap-4 justify-center">
              <Link href="/signup">
                <Button size="lg" variant="default">
                  Get Started
                </Button>
              </Link>
              <Link href="/login">
                <Button size="lg" variant="secondary">
                  Sign In
                </Button>
              </Link>
              <Link href="/bridge">
                <Button size="lg" variant="joy">
                  Try AI Bridge
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Cooperation Paths Section */}
      <section className="max-w-7xl mx-auto px-4 py-24">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-ink-900 mb-4">
            Eight Paths of Cooperation
          </h2>
          <p className="text-lg text-ink-700 max-w-3xl mx-auto mb-2">
            Imagine being part of a vast network of aligned individuals
            building common prosperity together. What would you mobilize for first?
          </p>
          <p className="text-base text-ink-500">
            Here are our 8 Cooperation Paths:
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Path 1: Collective Governance */}
          <Card className="flex flex-col">
            <CardHeader>
              <CardTitle>Collective Governance</CardTitle>
              <CardDescription className="text-base font-medium text-brand-600 dark:text-brand-400">
                "I want my voice to matter in decisions"
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-grow">
              <p className="text-sm text-ink-700">
                Submit proposals, deliberate together, and vote on collective
                decisions with full transparency and accountability.
              </p>
            </CardContent>
            <CardFooter className="pt-4">
              <Link href="/proposals" className="text-sm font-medium text-brand-600 hover:text-brand-700 dark:text-brand-400 dark:hover:text-brand-300">
                Explore →
              </Link>
            </CardFooter>
          </Card>

          {/* Path 2: Social Economy */}
          <Card className="flex flex-col">
            <CardHeader>
              <CardTitle>Social Economy</CardTitle>
              <CardDescription className="text-base font-medium text-brand-600 dark:text-brand-400">
                "I want mutual support, not extraction"
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-grow">
              <p className="text-sm text-ink-700">
                Build timebanks, mutual aid networks, and cooperative enterprises
                that keep value circulating in communities.
              </p>
            </CardContent>
            <CardFooter className="pt-4">
              <Link href="/economy" className="text-sm font-medium text-brand-600 hover:text-brand-700 dark:text-brand-400 dark:hover:text-brand-300">
                Explore →
              </Link>
            </CardFooter>
          </Card>

          {/* Path 3: Community Connection */}
          <Card className="flex flex-col">
            <CardHeader>
              <CardTitle>Community Connection</CardTitle>
              <CardDescription className="text-base font-medium text-brand-600 dark:text-brand-400">
                "I want to belong, to find my people"
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-grow">
              <p className="text-sm text-ink-700">
                Form groups, coordinate events, and build relationships
                with aligned individuals in your area and beyond.
              </p>
            </CardContent>
            <CardFooter className="pt-4">
              <Link href="/groups" className="text-sm font-medium text-brand-600 hover:text-brand-700 dark:text-brand-400 dark:hover:text-brand-300">
                Explore →
              </Link>
            </CardFooter>
          </Card>

          {/* Path 4: Collaborative Education */}
          <Card className="flex flex-col">
            <CardHeader>
              <CardTitle>Collaborative Education</CardTitle>
              <CardDescription className="text-base font-medium text-brand-600 dark:text-brand-400">
                "I want to learn and share what I know"
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-grow">
              <p className="text-sm text-ink-700">
                Join learning cohorts, teach what you know, and build
                shared knowledge bases together.
              </p>
            </CardContent>
            <CardFooter className="pt-4">
              <Link href="/learn" className="text-sm font-medium text-brand-600 hover:text-brand-700 dark:text-brand-400 dark:hover:text-brand-300">
                Explore →
              </Link>
            </CardFooter>
          </Card>

          {/* Path 5: Common Wellbeing */}
          <Card className="flex flex-col opacity-75">
            <CardHeader>
              <CardTitle>Common Wellbeing</CardTitle>
              <CardDescription className="text-base font-medium text-brand-600 dark:text-brand-400">
                "I want health and care for everyone"
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-grow">
              <p className="text-sm text-ink-700">
                Create peer support networks, coordinate care, and ensure
                no one faces hardship alone.
              </p>
            </CardContent>
            <CardFooter className="pt-4">
              <span className="text-sm text-ink-400">Coming Soon</span>
            </CardFooter>
          </Card>

          {/* Path 6: Cooperative Technology */}
          <Card className="flex flex-col">
            <CardHeader>
              <CardTitle>Cooperative Technology</CardTitle>
              <CardDescription className="text-base font-medium text-brand-600 dark:text-brand-400">
                "I want tools that serve us, not surveil us"
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-grow">
              <p className="text-sm text-ink-700">
                Use and build privacy-respecting infrastructure owned
                by communities, not corporations.
              </p>
            </CardContent>
            <CardFooter className="pt-4">
              <Link href="/bridge" className="text-sm font-medium text-joy-600 hover:text-joy-700 dark:text-joy-400 dark:hover:text-joy-300">
                Try AI Bridge →
              </Link>
            </CardFooter>
          </Card>

          {/* Path 7: Collaborative Media & Culture */}
          <Card className="flex flex-col opacity-75">
            <CardHeader>
              <CardTitle>Collaborative Media & Culture</CardTitle>
              <CardDescription className="text-base font-medium text-brand-600 dark:text-brand-400">
                "I want stories that inspire, not divide"
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-grow">
              <p className="text-sm text-ink-700">
                Create and share media that celebrates cooperation
                and documents our collective achievements.
              </p>
            </CardContent>
            <CardFooter className="pt-4">
              <span className="text-sm text-ink-400">Coming Soon</span>
            </CardFooter>
          </Card>

          {/* Path 8: Common Planet */}
          <Card className="flex flex-col opacity-75">
            <CardHeader>
              <CardTitle>Common Planet</CardTitle>
              <CardDescription className="text-base font-medium text-brand-600 dark:text-brand-400">
                "I want to heal the earth, not exploit it"
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-grow">
              <p className="text-sm text-ink-700">
                Coordinate regeneration projects, circular economy initiatives,
                and climate resilience efforts.
              </p>
            </CardContent>
            <CardFooter className="pt-4">
              <span className="text-sm text-ink-400">Coming Soon</span>
            </CardFooter>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-brand-600 to-brand-500 text-white">
        <div className="max-w-7xl mx-auto px-4 py-16 text-center">
          <h2 className="text-sm font-bold mb-4">
            Ready to Start Cooperating?
          </h2>
          <p className="text-sm mb-4 opacity-90">
            Join the movement for democratic, transparent, and cooperative technology.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link href="/signup">
              <Button size="lg" variant="secondary">
                Create Account
              </Button>
            </Link>
            <Link href="/admin/status">
              <Button size="lg" variant="ghost" className="border-white/20 text-white hover:bg-white dark:bg-gray-800/10">
                View Progress
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-bg-2 border-t border-border">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-ink-700">
              © 2025 TogetherOS. Built with cooperation in mind.
            </p>
            <div className="flex gap-4">
              <Link href="/admin/design" className="text-sm text-ink-700 hover:text-brand-600">
                Design System
              </Link>
              <Link href="/admin/status" className="text-sm text-ink-700 hover:text-brand-600">
                Status
              </Link>
              <Link href="/bridge" className="text-sm text-ink-700 hover:text-brand-600">
                AI Bridge
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}
