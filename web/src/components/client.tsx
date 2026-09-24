'use client';

import { useEffect, useState } from 'react';

/** Copies a payment number (without spaces) and confirms inline. */
export function CopyButton({ value, label }: { value: string; label: string }) {
  const [done, setDone] = useState(false);
  return (
    <button
      type="button"
      aria-label={`Copy ${label}`}
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(value.replace(/\s/g, ''));
          setDone(true);
          setTimeout(() => setDone(false), 1800);
        } catch {
          /* clipboard blocked — the number is still selectable */
        }
      }}
      className="h-10 px-4 rounded-lg bg-surface-container text-primary text-xs font-bold shrink-0 hover:bg-surface-container-high"
    >
      {done ? 'COPIED ✓' : 'COPY'}
    </button>
  );
}

/**
 * "Open in app": on Android an intent:// link opens the app, or falls back to the Play Store when it isn't installed.
 * Elsewhere it's the plain https link (App Links / the browser page itself).
 */
export function OpenInApp({ slug, scheme, pkg, playUrl, className, children }: { slug: string; scheme: string; pkg: string; playUrl: string; className?: string; children: React.ReactNode }) {
  const [href, setHref] = useState(playUrl);
  useEffect(() => {
    if (/android/i.test(navigator.userAgent)) {
      setHref(`intent://s/${slug}#Intent;scheme=${scheme};package=${pkg};S.browser_fallback_url=${encodeURIComponent(playUrl)};end`);
    }
  }, [slug, scheme, pkg, playUrl]);
  return (
    <a href={href} className={className}>
      {children}
    </a>
  );
}
