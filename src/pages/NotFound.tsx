import { Link } from 'react-router-dom';

export default function NotFound() {
  return <section className="not-found" aria-labelledby="not-found-title">
    <p className="not-found-code">404</p>
    <h2 id="not-found-title">Page Not Found</h2>
    <p className="not-found-message">The page you're looking for doesn't exist or may have been moved.</p>
    <Link className="primary not-found-link" to="/">Go to Dashboard</Link>
  </section>;
}
