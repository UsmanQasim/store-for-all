import QRCode from 'qrcode';
import { site } from '@/lib/site';

/** Real, scannable QR to the Play Store listing, rendered to SVG on the server. */
export async function PlayQr({ className, label }: { className?: string; label: string }) {
  const svg = await QRCode.toString(site.playUrl, { type: 'svg', errorCorrectionLevel: 'M', margin: 0, color: { dark: '#0B6E4F', light: '#0000' } });
  return <div role="img" aria-label={label} className={`${className ?? ''} [&>svg]:w-full [&>svg]:h-full`} dangerouslySetInnerHTML={{ __html: svg }} />;
}
