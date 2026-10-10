import { Link } from 'react-router-dom';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { useMetaDescription } from '../hooks/useMetaDescription';

export default function NotFound() {
  useDocumentTitle('Developer Learning Tracker | Page Not Found');
  useMetaDescription('The requested page could not be found in Developer Learning Tracker.');
  return <section className="not-found" aria-labelledby="not-found-title">
    <p className="not-found-code">404</p>
    <h2 id="not-found-title">Page Not Found</h2>
    <p className="not-found-message">The page you're looking for doesn't exist or may have been moved.</p>
    <Link className="primary not-found-link" to="/">Go to Dashboard</Link>
  </section>;
}
