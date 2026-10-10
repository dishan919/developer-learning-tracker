// GitHub Pages' 404 document sends the original URL through the app root.
// Restore it before BrowserRouter reads the initial browser location.
export function restoreSpaRoute(baseUrl: string): void {
  const base = baseUrl.endsWith('/') ? baseUrl : `${baseUrl}/`;
  if (window.location.pathname !== base) return;
  const route = new URLSearchParams(window.location.search).get('__spa');
  if (!route || !route.startsWith(base) || route.startsWith('//')) return;
  const target = new URL(route, window.location.origin);
  if (target.origin !== window.location.origin || !target.pathname.startsWith(base)) return;
  window.history.replaceState(window.history.state, '', target.pathname + target.search + target.hash);
}
