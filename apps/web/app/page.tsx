*
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
      {Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-brand-100 via-bg-1 to-joy-100">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(5,150,105,0.1),transparent_50%),radial-gradient(circle_at_70%_50%,rgba(245,158,11,0.1),transparent_50%)]" />

        <div className="relative max-w-7xl mx-auto px-6 py-24 sm:py-32">
          <div className="text-center">
            <h1 className="text-5xl sm:text-6xl font-bold text-ink-900 mb-6">
              Welcome to TogetherOS
            </h1>
            <p className="text-xl text-ink-700 mb-12 max-w-2xl mx-auto">
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

      {Features Section */}
      <section className="max-w-7xl mx-auto px-6 py-24">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-ink-900 mb-4">
            Eight Paths of Cooperation
          </h2>
          <p className="text-lg text-ink-700 max-w-3xl mx-auto">
            TogetherOS is organized around eight essential cooperation systems,
            each designed to empower collective action and democratic decision-making.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Path 1: Groups */}
          <Card>
            <CardHeader>
              <CardTitle>Groups & Organizations</CardTitle>
              <CardDescription>
                Form collectives, manage membership, and coordinate activities
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-ink-700">
                Create and join groups with democratic governance structures.
                Manage roles, permissions, and collaborative workflows.
              </p>
            </CardContent>
            <CardFooter>
              <Button variant="ghost" size="sm" disabled>
                Coming Soon
              </Button>
            </CardFooter>
          </Card>

          {Path 2: Forum */}
          <Card>
            <CardHeader>
              <CardTitle>Forum & Deliberation</CardTitle>
              <CardDescription>
                Structured discussions with voting and consensus tools
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-ink-700">
                Engage in meaningful dialogue with built-in moderation,
                threading, and democratic decision-making features.
              </p>
            </CardContent>
            <CardFooter>
              <Button variant="ghost" size="sm" disabled>
                Coming Soon
              </Button>
            </CardFooter>
          </Card>

          {Path 3: Proposals */}
          <Card>
            <CardHeader>
              <CardTitle>Proposals & Governance</CardTitle>
              <CardDescription>
                Democratic decision-making with transparent voting
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-ink-700">
                Submit proposals, discuss amendments, and vote on collective
                decisions with full transparency and accountability.
              </p>
            </CardContent>
            <CardFooter>
              <Button variant="ghost" size="sm" disabled>
                Coming Soon
              </Button>
            </CardFooter>
          </Card>

          {Path 4: Bridge */}
          <Card>
            <CardHeader>
              <CardTitle>AI Bridge</CardTitle>
              <CardDescription>
                Cooperative AI assistance for knowledge and tasks
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-ink-700">
                Interact with AI assistants trained on cooperative principles,
                helping groups make informed decisions together.
              </p>
            </CardContent>
            <CardFooter>
              <Link href="/bridge">
                <Button variant="joy" size="sm">
                  Try Now
                </Button>
              </Link>
            </CardFooter>
          </Card>

          {Path 5: Resources */}
          <Card>
            <CardHeader>
              <CardTitle>Resource Sharing</CardTitle>
              <CardDescription>
                Commons-based resource allocation and management
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-ink-700">
                Share tools, spaces, and resources. Track usage,
                coordinate access, and ensure equitable distribution.
              </p>
            </CardContent>
            <CardFooter>
              <Button variant="ghost" size="sm" disabled>
                Coming Soon
              </Button>
            </CardFooter>
          </Card>

          {Path 6: Economic */}
          <Card>
            <CardHeader>
              <CardTitle>Economic Commons</CardTitle>
              <CardDescription>
                Transparent finances and value distribution
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-ink-700">
                Manage shared funds, track contributions, and distribute
                value according to democratic principles.
              </p>
            </CardContent>
            <CardFooter>
              <Button variant="ghost" size="sm" disabled>
                Coming Soon
              </Button>
            </CardFooter>
          </Card>

          {Path 7: Knowledge */}
          <Card>
            <CardHeader>
              <CardTitle>Knowledge Commons</CardTitle>
              <CardDescription>
                Collaborative documentation and learning
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-ink-700">
                Build shared knowledge bases, create learning pathways,
                and document collective wisdom.
              </p>
            </CardContent>
            <CardFooter>
              <Button variant="ghost" size="sm" disabled>
                Coming Soon
              </Button>
            </CardFooter>
          </Card>

          {Path 8: External */}
          <Card>
            <CardHeader>
              <CardTitle>External Relations</CardTitle>
              <CardDescription>
                Connect and collaborate across organizations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-ink-700">
                Build networks, establish partnerships, and coordinate
                activities across multiple cooperatives.
              </p>
            </CardContent>
            <CardFooter>
              <Button variant="ghost" size="sm" disabled>
                Coming Soon
              </Button>
            </CardFooter>
          </Card>
        </div>
      </section>

      {CTA Section */}
      <section className="bg-gradient-to-r from-brand-600 to-brand-500 text-white">
        <div className="max-w-7xl mx-auto px-6 py-16 text-center">
          <h2 className="text-3xl font-bold mb-4">
            Ready to Start Cooperating?
          </h2>
          <p className="text-lg mb-8 opacity-90">
            Join the movement for democratic, transparent, and cooperative technology.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link href="/signup">
              <Button size="lg" variant="secondary">
                Create Account
              </Button>
            </Link>
            <Link href="/admin/status">
              <Button size="lg" variant="ghost" className="border-white/20 text-white hover:bg-bg-1/10">
                View Progress
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {Footer */}
      <footer className="bg-bg-2 border-t border-border">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-ink-700">
              © 2025 TogetherOS. Built with cooperation in mind.
            </p>
            <div className="flex gap-6">
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
