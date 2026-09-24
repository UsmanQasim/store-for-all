import { ICONS } from './icon-paths';

/** Material Symbol as inline SVG (no icon font download). Sized by font-size (1em) and coloured by `currentColor`. */
export function Icon({ name, className = '', fill = false, label }: { name: string; className?: string; fill?: boolean; label?: string }) {
  const p = ICONS[name];
  if (!p) return null;
  return (
    <svg
      viewBox="0 -960 960 960"
      width="1em"
      height="1em"
      fill="currentColor"
      className={`inline-block shrink-0 ${/\btext-\[\d/.test(className) || /\btext-(xs|sm|base|lg|xl|\dxl)\b/.test(className) ? '' : 'text-[24px]'} ${className}`}
      aria-hidden={label ? undefined : true}
      role={label ? 'img' : undefined}
      aria-label={label}
    >
      <path d={(fill && p[1]) || p[0]} />
    </svg>
  );
}
