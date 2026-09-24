import QRCode from 'qrcode';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import type { PaymentMethod, Shop } from '@/types/models';
import { config } from './config';
import { shopPublicUrl } from './links';
import { PAYMENT_LABELS } from './payments';

/** QR as an SVG string (pure JS, no native module). Error-correction H survives print wear. */
export async function qrSvg(text: string, dark = '#12110F', light = '#FFFFFF'): Promise<string> {
  return QRCode.toString(text, { type: 'svg', errorCorrectionLevel: 'H', margin: 1, color: { dark, light } });
}

const esc = (s: string | null | undefined) =>
  (s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!);

/** A4 counter poster: shop name, big QR, "Scan to book · order · pay", payment summary. */
export async function printQrPoster(shop: Shop, methods: PaymentMethod[]) {
  const url = shopPublicUrl(shop.slug);
  const svg = await qrSvg(url, '#04291E');
  const primary = config.brand.primaryColor;
  const payRows = methods
    .slice(0, 3)
    .map(
      (m) => `<div class="pay"><b>${esc(PAYMENT_LABELS[m.type])}</b> · ${esc(m.account_title)}<br/><span>${esc(
        m.account_number ?? m.iban ?? '',
      )}</span></div>`,
    )
    .join('');

  const html = `<!doctype html><html><head><meta charset="utf-8"/>
<style>
  @page { size: A4; margin: 0; }
  body { margin:0; font-family: -apple-system, Roboto, 'Segoe UI', sans-serif; color:#12110F; }
  .page { width:210mm; height:297mm; box-sizing:border-box; padding:18mm 16mm; display:flex; flex-direction:column; align-items:center; }
  .brand { background:${primary}; color:#fff; border-radius:999px; padding:6px 18px; font-weight:700; letter-spacing:.5px; }
  h1 { font-size:40px; margin:18px 0 4px; text-align:center; }
  .tag { color:#6B645C; font-size:18px; margin:0 0 18px; text-align:center; }
  .qr { width:120mm; height:120mm; padding:6mm; border:3px solid ${primary}; border-radius:10mm; }
  .qr svg { width:100%; height:100%; }
  .cta { font-size:26px; font-weight:800; margin:16px 0 4px; }
  .steps { font-size:18px; color:#2E2A26; }
  .pays { margin-top:14px; display:flex; gap:10px; flex-wrap:wrap; justify-content:center; }
  .pay { border:1px solid #E6E1D9; border-radius:10px; padding:8px 12px; font-size:14px; }
  .pay span { font-family: monospace; font-size:15px; }
  .url { margin-top:auto; color:#6B645C; font-size:14px; }
</style></head><body><div class="page">
  <div class="brand">${esc(config.brand.name)}</div>
  <h1>${esc(shop.name)}</h1>
  <p class="tag">${esc(shop.tagline ?? '')}</p>
  <div class="qr">${svg}</div>
  <div class="cta">Scan to book · order · pay</div>
  <div class="steps">Open your camera → scan → tap the link</div>
  <div class="pays">${payRows}</div>
  <div class="url">${esc(url)}</div>
</div></body></html>`;

  const { uri } = await Print.printToFileAsync({ html, width: 595, height: 842 });
  if (await Sharing.isAvailableAsync()) {
    await Sharing.shareAsync(uri, { mimeType: 'application/pdf', dialogTitle: `${shop.name} QR poster`, UTI: 'com.adobe.pdf' });
  } else {
    await Print.printAsync({ uri });
  }
}
