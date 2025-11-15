import { notFound, redirect } from 'next/navigation'
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

  // Redirect modules INDEX to standalone modules page
  if (slug.length === 2 && slug[0] === 'modules' && slug[1] === 'INDEX') {
    redirect('/modules')
  }

  const doc = await getDocContent(slug)

  if (!doc) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      <div className="max-w-5xl mx-auto px-6 py-12">
        <article
          className="prose prose-lg max-w-none bg-white rounded-xl shadow-lg p-12
                     prose-headings:font-bold prose-headings:tracking-tight
                     prose-h1:text-4xl prose-h1:mb-6 prose-h1:mt-0 prose-h1:pb-4 prose-h1:border-b prose-h1:border-gray-200
                     prose-h2:text-3xl prose-h2:mb-5 prose-h2:mt-10 prose-h2:text-gray-800
                     prose-h3:text-2xl prose-h3:mb-4 prose-h3:mt-8 prose-h3:text-gray-700
                     prose-h4:text-xl prose-h4:mb-3 prose-h4:mt-6
                     prose-p:mb-6 prose-p:mt-0 prose-p:leading-relaxed prose-p:text-gray-700
                     prose-ul:my-6 prose-ul:space-y-2
                     prose-ol:my-6 prose-ol:space-y-2
                     prose-li:my-2 prose-li:text-gray-700
                     prose-code:bg-gray-100 prose-code:px-2 prose-code:py-1 prose-code:rounded prose-code:text-sm prose-code:font-mono prose-code:text-gray-800
                     prose-pre:bg-gray-900 prose-pre:p-6 prose-pre:rounded-lg prose-pre:my-6 prose-pre:overflow-x-auto
                     prose-a:text-blue-600 prose-a:no-underline hover:prose-a:underline prose-a:font-medium
                     prose-strong:text-gray-900 prose-strong:font-semibold
                     prose-blockquote:border-l-4 prose-blockquote:border-blue-500 prose-blockquote:pl-6 prose-blockquote:my-6 prose-blockquote:italic prose-blockquote:text-gray-600
                     prose-hr:my-10 prose-hr:border-gray-300
                     prose-table:my-6 prose-th:bg-gray-100 prose-th:font-semibold prose-th:p-3 prose-td:p-3"
          dangerouslySetInnerHTML={{ __html: doc.html }}
        />
      </div>
    </div>
  )
}
