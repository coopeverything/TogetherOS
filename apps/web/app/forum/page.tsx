import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Community Discussions | TogetherOS',
  description: 'Knowledge building, Q&A, idea exploration, and structured deliberation',
}

export default function ForumPage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Community Discussions</h1>
        <p className="text-muted-foreground">
          Knowledge building, Q&A, idea exploration, and structured deliberation
        </p>
      </div>

      <div className="grid gap-6">
        {/* Topic Categories Overview */}
        <div className="grid gap-4 md:grid-cols-2">
          <CategoryCard
            title="General Discussion"
            description="Share knowledge, best practices, and community wisdom"
            icon="💬"
          />
          <CategoryCard
            title="Questions & Answers"
            description="Ask questions and build searchable community knowledge"
            icon="❓"
          />
          <CategoryCard
            title="Idea Exploration"
            description="Test ideas and gather feedback before formal proposals"
            icon="💡"
          />
          <CategoryCard
            title="Deliberation"
            description="Structured consensus-building for important decisions"
            icon="⚖️"
          />
        </div>

        {/* Coming Soon Notice */}
        <div className="bg-muted/50 border border-border rounded-lg p-6 text-center">
          <h2 className="text-xl font-semibold mb-2">Forum Module In Development</h2>
          <p className="text-muted-foreground mb-4">
            The community discussions module is currently being built.
            This page will soon feature topic listings, search, and discussion threads.
          </p>
          <p className="text-sm text-muted-foreground">
            Progress: <span className="font-mono">0% → 15%</span>
          </p>
        </div>
      </div>
    </div>
  )
}

interface CategoryCardProps {
  title: string
  description: string
  icon: string
}

function CategoryCard({ title, description, icon }: CategoryCardProps) {
  return (
    <div className="border border-border rounded-lg p-4 hover:bg-accent/50 transition-colors">
      <div className="flex items-start gap-3">
        <span className="text-2xl" role="img" aria-label={title}>
          {icon}
        </span>
        <div>
          <h3 className="font-semibold mb-1">{title}</h3>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
      </div>
    </div>
  )
}
