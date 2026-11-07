import { Sparkles } from 'lucide-react'
import { Button } from '../../components/Button'
import { Markdown } from '../../components/Markdown'
import { useSummarizeSprint } from '../../hooks/useSprints'
import { formatDateTime } from '../../lib/format'
import type { Sprint } from '../../types/api'

/** Shows the saved AI summary (if any) and lets the user generate or regenerate it. */
export function SprintSummaryPanel({ sprint }: { sprint: Sprint }) {
  const summarize = useSummarizeSprint(sprint.id)
  const summary = sprint.summary
  const planned = sprint.status === 'planned'

  return (
    <section className="summary-panel" aria-label="Sprint summary">
      <header className="summary-head">
        <h2>AI summary</h2>
        {summary && summary.source === 'mock' && <span className="badge badge-mock">Mock AI</span>}
        <Button size="sm" onClick={() => summarize.mutate()} loading={summarize.isPending} disabled={planned}>
          <Sparkles size={14} aria-hidden="true" /> {summary ? 'Regenerate' : 'Summarize'}
        </Button>
      </header>
      {planned && <p className="muted">Start the sprint to summarise it.</p>}
      {summarize.isError && (
        <div className="banner banner-error" role="alert">
          {summarize.error.message}{' '}
          <button type="button" className="link-btn" onClick={() => summarize.mutate()}>
            Try again
          </button>
        </div>
      )}
      {summary ? (
        <>
          <Markdown>{summary.content}</Markdown>
          <p className="muted">Generated {formatDateTime(summary.generatedAt)}</p>
        </>
      ) : (
        !planned && !summarize.isPending && <p className="muted">No summary yet. Summarize the sprint to get highlights and suggestions.</p>
      )}
      <p className="muted disclaimer">AI can make mistakes. Review before saving.</p>
    </section>
  )
}
