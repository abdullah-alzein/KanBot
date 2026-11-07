import { Link } from 'react-router'
import { EmptyState } from '../components/states'

export function NotFoundPage() {
  return (
    <div className="full-page">
      <EmptyState title="Page not found" description="The page you are looking for doesn't exist or has moved.">
        <Link to="/" className="btn btn-primary btn-md">
          Back to projects
        </Link>
      </EmptyState>
    </div>
  )
}
