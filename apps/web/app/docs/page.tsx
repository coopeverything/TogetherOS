import { redirect } from 'next/navigation'

export default function DocsIndexPage() {
  // Redirect /docs to /docs/index (which shows the main docs index)
  redirect('/docs/index')
}
