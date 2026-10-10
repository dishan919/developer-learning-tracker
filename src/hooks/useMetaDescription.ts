import { useEffect } from 'react';

export function useMetaDescription(description: string): void {
  useEffect(() => {
    let meta = document.head.querySelector<HTMLMetaElement>('meta[name="description"]');
    if (!meta) {
      meta = document.createElement('meta');
      meta.name = 'description';
      document.head.appendChild(meta);
    }
    meta.content = description;
  }, [description]);
}
