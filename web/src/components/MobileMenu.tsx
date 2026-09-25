'use client';

import { useEffect, useId, useRef, useState } from 'react';

/** Menu button + drop-down panel for screens below 1280px. Closes on Escape, outside tap, or choosing a link. */
export function MobileMenu({ label, closeLabel, children }: { label: string; closeLabel: string; children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const id = useId();
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    const onDown = (e: PointerEvent) => !root.current?.contains(e.target as Node) && setOpen(false);
    document.addEventListener('keydown', onKey);
    document.addEventListener('pointerdown', onDown);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.removeEventListener('pointerdown', onDown);
    };
  }, [open]);

  return (
    <div ref={root} className="xl:hidden">
      <button
        type="button"
        aria-expanded={open}
        aria-controls={id}
        aria-label={open ? closeLabel : label}
        onClick={() => setOpen((o) => !o)}
        className="w-10 h-10 rounded-xl flex items-center justify-center text-on-surface border border-border-hairline bg-white/60 hover:bg-surface-container transition-colors"
      >
        <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
          {open ? <path d="M6 6l12 12M18 6L6 18" /> : <path d="M4 7h16M4 12h16M4 17h16" />}
        </svg>
      </button>
      <div
        id={id}
        hidden={!open}
        onClick={(e) => (e.target as HTMLElement).closest('a') && setOpen(false)}
        className="absolute inset-x-0 top-full bg-[#FAF8F5] border-b border-border-hairline shadow-xl max-h-[calc(100dvh-4rem)] overflow-y-auto"
      >
        {children}
      </div>
    </div>
  );
}
