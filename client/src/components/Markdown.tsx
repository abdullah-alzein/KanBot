import ReactMarkdown from 'react-markdown'

/** Raw HTML in AI output is never rendered (react-markdown's default); links open safely. */
export function Markdown({ children }: { children: string }) {
  return (
    <div className="markdown">
      <ReactMarkdown components={{ a: (props) => <a {...props} target="_blank" rel="noopener noreferrer" /> }}>{children}</ReactMarkdown>
    </div>
  )
}
