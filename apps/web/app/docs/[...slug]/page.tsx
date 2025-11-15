import { notFound } from 'next/navigation'
import { readFileSync } from 'fs'
import { join } from 'path'
import { marked } from 'marked'
import type { Metadata } from 'next'

interface DocsPageProps {
  params: Promise<{
    slug: string[]
  }>
}

async function getDocContent(slug: string[]) {
  try {
    // Build file path from slug
    const filePath = join(process.cwd(), '..', '..', 'docs', ...slug) + '.md'

    // Read markdown file
    const content = readFileSync(filePath, 'utf-8')

    // Convert to HTML
    const html = marked(content)

    // Extract title from first H1 or use filename
    const titleMatch = content.match(/^#\s+(.+)$/m)
    const title = titleMatch ? titleMatch[1] : slug[slug.length - 1]

    return { html, title }
  } catch (error) {
    return null
  }
}

export async function generateMetadata({ params }: DocsPageProps): Promise<Metadata> {
  const { slug } = await params
  const doc = await getDocContent(slug)

  if (!doc) {
    return {
      title: 'Page Not Found | TogetherOS',
    }
  }

  return {
    title: `${doc.title} | TogetherOS Docs`,
    description: `Documentation: ${doc.title}`,
  }
}

export default async function DocsPage({ params }: DocsPageProps) {
  const { slug } = await params

  // Special handling for modules INDEX - use custom component
  if (slug.length === 2 && slug[0] === 'modules' && slug[1] === 'INDEX') {
    // Import and render the custom modules index page
    const ModulesIndexPage = (await import('../modules/INDEX/page')).default
    return <ModulesIndexPage />
  }

  const doc = await getDocContent(slug)

  if (!doc) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <article
          className="prose prose-lg max-w-none bg-white rounded-lg shadow-sm p-8 prose-headings:mb-4 prose-headings:mt-6 prose-p:mb-4 prose-p:mt-0 prose-p:leading-relaxed"
          dangerouslySetInnerHTML={{ __html: doc.html }}
        />
      </div>
    </div>
  )
}
