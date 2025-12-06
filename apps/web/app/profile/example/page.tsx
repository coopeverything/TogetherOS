/**
 * Example Profile Page
 * Public page showing a template profile for inspiration
 */

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export const metadata = {
  title: 'Example Profile - TogetherOS',
  description: 'A template profile showing what a complete TogetherOS profile looks like',
};

export default function ExampleProfilePage() {
  return (
    <div className="min-h-screen bg-bg-0">
      {/* Header */}
      <header className="bg-bg-1 border-b border-border">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="text-brand-600 hover:text-brand-500 font-semibold">
            ← Back to Home
          </Link>
          <div className="flex gap-3">
            <Link href="/login">
              <Button variant="secondary" size="sm">Sign In</Button>
            </Link>
            <Link href="/signup">
              <Button size="sm">Create Profile</Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-4">
        {/* Notice */}
        <div className="bg-joy-100 border border-joy-600/20 rounded-lg p-4 mb-3">
          <p className="text-sm text-ink-900">
            <span className="font-semibold">📋 This is an example profile.</span> Use it as inspiration when creating your own TogetherOS profile.
          </p>
        </div>

        {/* Profile Header */}
        <Card className="mb-3">
          <CardContent className="pt-8">
            <div className="flex items-start gap-4">
              {/* Avatar */}
              <div className="flex-shrink-0">
                <div className="w-32 h-32 rounded-full bg-gradient-to-br from-brand-500 to-joy-500 flex items-center justify-center text-6xl">
                  👤
                </div>
              </div>

              {/* Basic Info */}
              <div className="flex-1">
                <h1 className="text-sm font-bold text-ink-900 mb-2">Alex Rivera</h1>
                <div className="flex flex-wrap gap-4 text-ink-700 mb-4">
                  <span>📍 Portland, Oregon, USA</span>
                  <span>•</span>
                  <span>👤 they/them</span>
                  <span>•</span>
                  <span>📅 Member since January 2025</span>
                </div>

                {/* Badges */}
                <div className="flex flex-wrap gap-2 mb-4">
                  <span className="px-3 py-1 bg-brand-100 text-brand-600 rounded-full text-sm font-medium">
                    🏆 Active Contributor
                  </span>
                  <span className="px-3 py-1 bg-joy-100 text-joy-600 rounded-full text-sm font-medium">
                    ⭐ Early Adopter
                  </span>
                  <span className="px-3 py-1 bg-brand-100 text-brand-600 rounded-full text-sm font-medium">
                    🤝 Collaborative
                  </span>
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-3 gap-4 pt-4 border-t border-border">
                  <div>
                    <div className="text-sm font-bold text-ink-900">15</div>
                    <div className="text-sm text-ink-700">Proposals Voted</div>
                  </div>
                  <div>
                    <div className="text-sm font-bold text-ink-900">47</div>
                    <div className="text-sm text-ink-700">Forum Posts</div>
                  </div>
                  <div>
                    <div className="text-sm font-bold text-ink-900">2</div>
                    <div className="text-sm text-ink-700">Cooperatives</div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-2">
            {/* Bio */}
            <Card>
              <CardHeader className="pb-6">
                <CardTitle>About</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-ink-700 leading-relaxed mb-4">
                  I'm a software developer and community organizer passionate about cooperative technology and democratic decision-making. For the past five years, I've been building tools that help communities self-organize and make decisions together.
                </p>
                <p className="text-ink-700 leading-relaxed">
                  I believe technology should serve people, not profit. I'm here to connect with others who are building alternative economic systems and to contribute my skills to cooperative projects.
                </p>
              </CardContent>
            </Card>

            {/* Skills */}
            <Card>
              <CardHeader className="pb-6">
                <CardTitle>Skills & Expertise</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div>
                    <h4 className="font-semibold text-ink-900 mb-3">Technical Skills</h4>
                    <div className="flex flex-wrap gap-2">
                      {['JavaScript', 'Python', 'React', 'Node.js', 'PostgreSQL', 'Docker'].map(skill => (
                        <span key={skill} className="px-3 py-1 bg-bg-2 text-ink-700 rounded-md text-sm">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h4 className="font-semibold text-ink-900 mb-3">Cooperative Skills</h4>
                    <div className="flex flex-wrap gap-2">
                      {['Facilitation', 'Community Organizing', 'Democratic Governance', 'Technical Writing'].map(skill => (
                        <span key={skill} className="px-3 py-1 bg-brand-100 text-brand-600 rounded-md text-sm">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h4 className="font-semibold text-ink-900 mb-3">Languages</h4>
                    <div className="flex flex-wrap gap-2">
                      <span className="px-3 py-1 bg-bg-2 text-ink-700 rounded-md text-sm">English (native)</span>
                      <span className="px-3 py-1 bg-bg-2 text-ink-700 rounded-md text-sm">Spanish (conversational)</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Current Projects */}
            <Card>
              <CardHeader className="pb-6">
                <CardTitle>Current Projects</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  <li className="flex items-start gap-2">
                    <span className="text-brand-600">•</span>
                    <span className="text-ink-700">Building a decision-making tool for housing co-ops</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-brand-600">•</span>
                    <span className="text-ink-700">Organizing monthly "Coop Tech" meetups in Portland</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-brand-600">•</span>
                    <span className="text-ink-700">Contributing to TogetherOS documentation</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            {/* References */}
            <Card>
              <CardHeader className="pb-6">
                <CardTitle>References</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <blockquote className="border-l-4 border-brand-500 pl-4 italic text-ink-700">
                  "Alex built our cooperative's entire voting system and trained our whole team on how to use it. Incredibly patient teacher and skilled developer."
                  <footer className="mt-2 text-sm font-semibold text-ink-900">— Maria Santos, Portland Tech Co-op</footer>
                </blockquote>
                <blockquote className="border-l-4 border-joy-500 pl-4 italic text-ink-700">
                  "Their facilitation skills transformed our meetings. We actually get things done now while maintaining consensus."
                  <footer className="mt-2 text-sm font-semibold text-ink-900">— Jordan Lee, Mutual Aid PDX</footer>
                </blockquote>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-2">
            {/* Cooperation Paths */}
            <Card>
              <CardHeader className="pb-6">
                <CardTitle>Cooperation Paths</CardTitle>
                <CardDescription>Active areas of interest</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-ink-700">
                    <span>💻</span>
                    <span className="text-sm">Cooperative Technology</span>
                  </div>
                  <div className="flex items-center gap-2 text-ink-700">
                    <span>💰</span>
                    <span className="text-sm">Social Economy</span>
                  </div>
                  <div className="flex items-center gap-2 text-ink-700">
                    <span>🏛️</span>
                    <span className="text-sm">Collective Governance</span>
                  </div>
                  <div className="flex items-center gap-2 text-ink-700">
                    <span>🤝</span>
                    <span className="text-sm">Community Connection</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Availability */}
            <Card>
              <CardHeader className="pb-6">
                <CardTitle>How I Can Help</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-ink-700">
                  <li className="flex items-start gap-2">
                    <span className="text-brand-600">✓</span>
                    <span>Code review and technical mentorship</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-brand-600">✓</span>
                    <span>Setting up tech infrastructure for new cooperatives</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-brand-600">✓</span>
                    <span>Running workshops on democratic governance tools</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            {/* Memberships */}
            <Card>
              <CardHeader className="pb-6">
                <CardTitle>Cooperative Memberships</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div>
                  <div className="font-semibold text-ink-900 text-sm">Portland Tech Co-op</div>
                  <div className="text-xs text-ink-700">Tech Committee Member</div>
                  <div className="text-xs text-ink-400">2023 - present</div>
                </div>
                <div>
                  <div className="font-semibold text-ink-900 text-sm">Mutual Aid PDX</div>
                  <div className="text-xs text-ink-700">Tech Coordinator</div>
                  <div className="text-xs text-ink-400">2022 - present</div>
                </div>
              </CardContent>
            </Card>

            {/* Contact */}
            <Card>
              <CardHeader className="pb-6">
                <CardTitle>Connect</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <a href="#" className="flex items-center gap-2 text-brand-600 hover:text-brand-500">
                    <span>🐙</span>
                    <span>GitHub</span>
                  </a>
                  <a href="#" className="flex items-center gap-2 text-brand-600 hover:text-brand-500">
                    <span>🐘</span>
                    <span>Mastodon</span>
                  </a>
                  <a href="#" className="flex items-center gap-2 text-brand-600 hover:text-brand-500">
                    <span>🌐</span>
                    <span>Website</span>
                  </a>
                </div>
                <div className="mt-4 pt-4 border-t border-border">
                  <div className="text-xs text-ink-700 mb-2">Availability</div>
                  <div className="text-sm text-ink-900 font-medium">~10 hours/week</div>
                  <div className="text-xs text-ink-700">Pacific Time (UTC-8)</div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* CTA */}
        <Card className="mt-4 bg-gradient-to-r from-brand-50 to-joy-50 border-brand-200">
          <CardContent className="pt-6 text-center">
            <h3 className="text-sm font-bold text-ink-900 mb-2">Ready to create your profile?</h3>
            <p className="text-ink-700 mb-4">Join TogetherOS and start cooperating with others</p>
            <div className="flex gap-3 justify-center">
              <Link href="/signup">
                <Button size="lg">Create Your Profile</Button>
              </Link>
              <Link href="/">
                <Button size="lg" variant="secondary">Learn More</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
