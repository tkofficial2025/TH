import { useEffect } from 'react';

/** 常に www 付き正規 URL を指す canonical を head に注入する */
export function SeoHead({ canonicalHref }: { canonicalHref: string }) {
  useEffect(() => {
    let link = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
    if (!link) {
      link = document.createElement('link');
      link.setAttribute('rel', 'canonical');
      document.head.appendChild(link);
    }
    link.setAttribute('href', canonicalHref);
  }, [canonicalHref]);
  return null;
}
