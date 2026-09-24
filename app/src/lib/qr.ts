import QRCode from 'qrcode';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import type { PaymentMethod, Shop } from '@/types/models';
import { config } from './config';
import { shopPublicUrl } from './links';
import { formatAccount, PAYMENT_LABELS, PAYMENT_TONE, posterSteps } from './payments';

/** QR as an SVG string (pure JS, no native module). Error-correction H survives print wear and the centre mark. */
export async function qrSvg(text: string, dark = '#12110F', light = '#FFFFFF'): Promise<string> {
  return QRCode.toString(text, { type: 'svg', errorCorrectionLevel: 'H', margin: 1, color: { dark, light } });
}

const esc = (s: string | null | undefined) =>
  (s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!);

const displayUrl = (url: string) => url.replace(/^https?:\/\//, '');

/** P01 — A4 counter poster (designs/p01_counter_qr_poster_print), filled with the shop's real data. */
export async function posterHtml(shop: Shop, methods: PaymentMethod[]): Promise<string> {
  const url = shopPublicUrl(shop.slug);
  const svg = await qrSvg(url, '#00543B');
  const active = methods.filter((m) => m.is_active).sort((a, b) => Number(b.is_primary) - Number(a.is_primary));
  const steps = posterSteps(shop, [...new Set(active.map((m) => PAYMENT_LABELS[m.type]))]);
  const place = [shop.tagline, shop.area && shop.city ? `${shop.area}, ${shop.city}` : shop.area ?? shop.city].filter(Boolean).join(' • ');

  const pays = active
    .slice(0, 3)
    .map((m) => {
      const value = formatAccount(m.iban ?? m.account_number);
      const long = value.length > 16;
      return `<div class="tile"><div class="tl"><b style="color:${PAYMENT_TONE[m.type]}">${esc(m.bank_name ?? PAYMENT_LABELS[m.type])}</b><span>• ${esc(
        m.account_title,
      )}</span></div><div class="num${long ? ' sm' : ''}">${esc(value)}</div></div>`;
    })
    .join('');

  return `<!doctype html><html><head><meta charset="utf-8"/>
<link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet"/>
<style>
  @page { size: A4; margin: 0; }
  * { box-sizing: border-box; }
  body { margin:0; font-family:'Plus Jakarta Sans', -apple-system, Roboto, sans-serif; color:#1d1b18; background:#fff; -webkit-print-color-adjust:exact; print-color-adjust:exact; }
  .page { width:210mm; height:297mm; display:flex; flex-direction:column; overflow:hidden; }
  .hero { flex-shrink:0; background:#00543b; color:#fff; text-align:center; padding:8mm 14mm 9mm; position:relative; overflow:hidden; }
  .hero:before { content:''; position:absolute; top:-30mm; right:-30mm; width:80mm; height:80mm; border-radius:50%; background:#0b6e4f; opacity:.5; }
  .hero:after { content:''; position:absolute; bottom:-24mm; left:-24mm; width:60mm; height:60mm; border-radius:50%; background:#fda60f; opacity:.18; }
  .brand { position:relative; display:inline-flex; align-items:center; gap:8px; background:rgba(255,255,255,.15); padding:6px 18px; border-radius:999px; font-size:20px; }
  .brand b { letter-spacing:1.5px; text-transform:uppercase; }
  .brand i { width:5px; height:5px; border-radius:50%; background:#ffddb6; display:inline-block; }
  .brand span { color:#ffddb6; font-weight:700; font-size:16px; }
  h1 { position:relative; font-size:50px; line-height:1.05; font-weight:800; letter-spacing:-1px; margin:6mm 0 2mm; }
  .place { position:relative; color:#9ff4cc; font-size:20px; margin:0; }
  .chips { position:relative; margin-top:5mm; display:flex; justify-content:center; gap:10px; }
  .chip { padding:4px 14px; border-radius:999px; font-size:16px; font-weight:700; }
  .chip.dark { background:rgba(0,33,21,.3); }
  .chip.soft { background:#DDF4E6; color:#00543b; }
  .mid { flex:1; min-height:0; padding:8mm 16mm 5mm; display:flex; flex-direction:column; align-items:center; }
  .qrcard { position:relative; padding:6mm 10mm 5mm; border-radius:8mm; box-shadow:0 6px 24px rgba(0,0,0,.10); display:flex; flex-direction:column; align-items:center; }
  .qrcard .c { position:absolute; width:7mm; height:7mm; background:rgba(0,84,59,.2); }
  .c1{top:3mm;left:3mm;border-top-left-radius:2mm}.c2{top:3mm;right:3mm;border-top-right-radius:2mm}.c3{bottom:3mm;left:3mm;border-bottom-left-radius:2mm}.c4{bottom:3mm;right:3mm;border-bottom-right-radius:2mm}
  .qr { position:relative; width:66mm; height:66mm; }
  .qr svg { width:100%; height:100%; display:block; }
  .mark { position:absolute; left:50%; top:50%; width:17mm; height:17mm; margin:-8.5mm 0 0 -8.5mm; background:#FAF8F5; border-radius:4mm; display:flex; align-items:center; justify-content:center; }
  .mark div { width:12mm; height:12mm; border-radius:50%; background:#00543b; display:flex; align-items:center; justify-content:center; }
  .url { color:#00543b; font-weight:800; font-size:24px; letter-spacing:.3px; margin-top:4mm; }
  .scan { margin-top:2mm; background:#E8F5EF; color:#00543b; font-weight:700; font-size:16px; padding:5px 16px; border-radius:999px; }
  .label { margin:5mm 0 2.5mm; font-size:14px; font-weight:700; letter-spacing:1.5px; color:#6B645C; text-transform:uppercase; }
  .steps { width:100%; display:grid; grid-template-columns:repeat(3,1fr); gap:3mm; }
  .step { display:flex; flex-direction:column; align-items:flex-start; gap:2mm; background:#f9f2ed; padding:4mm; border-radius:3mm; }
  .step .n { width:9mm; height:9mm; border-radius:50%; background:#E8F5EF; color:#00543b; font-weight:800; font-size:20px; display:flex; align-items:center; justify-content:center; flex-shrink:0; }
  .step b { display:block; font-size:17px; line-height:1.2; }
  .step span { color:#6B645C; font-size:13px; }
  .pay { width:100%; margin-top:5mm; background:#F2EFEA; border-radius:5mm; padding:4mm 5mm; }
  .pay .h { display:flex; justify-content:space-between; align-items:center; margin-bottom:1mm; }
  .pay .h b { font-size:21px; }
  .zero { background:#DDF4E6; color:#1E8E4E; font-weight:700; font-size:14px; padding:3px 12px; border-radius:999px; }
  .tile { background:#fff; border-radius:3mm; padding:2.5mm 5mm; margin-top:2mm; display:flex; justify-content:space-between; align-items:center; gap:4mm; }
  .tl { font-size:14px; min-width:0; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; } .tl b { text-transform:uppercase; margin-right:6px; } .tl span { color:#6B645C; }
  .num { font-family:ui-monospace, 'Roboto Mono', Menlo, monospace; font-size:22px; font-weight:700; white-space:nowrap; }
  .num.sm { font-size:17px; }
  .foot { flex-shrink:0; background:#E8F5EF; color:#00543b; text-align:center; font-weight:600; font-size:15px; padding:4.5mm 10mm; }
</style></head><body><div class="page">
  <div class="hero">
    <div class="brand"><b>${esc(config.brand.name)}</b><i></i><span>Scan • Book • Order • Pay</span></div>
    <h1>${esc(shop.name)}</h1>
    ${place ? `<p class="place">${esc(place)}</p>` : ''}
    <div class="chips">
      ${shop.rating_count > 0 ? `<span class="chip dark">★ ${Number(shop.rating_avg).toFixed(1)} (${shop.rating_count} reviews)</span>` : ''}
      <span class="chip soft">${shop.accepts_bookings ? 'BOOK ONLINE' : 'PRE-ORDER ONLINE'}</span>
    </div>
  </div>
  <div class="mid">
    <div class="qrcard">
      <div class="c c1"></div><div class="c c2"></div><div class="c c3"></div><div class="c c4"></div>
      <div class="qr">${svg}<div class="mark"><div><svg width="26" height="26" viewBox="0 0 24 24"><path d="M6 12.5l4 4 8-8.5" stroke="#fff" stroke-width="2.6" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg></div></div></div>
      <div class="url">${esc(displayUrl(url))}</div>
      <div class="scan">Point Camera • Tap Link</div>
    </div>
    <div class="label">Instant Mobile Self-Service</div>
    <div class="steps">${steps.map((s, i) => `<div class="step"><div class="n">${i + 1}</div><div><b>${esc(s.title)}</b><span>${esc(s.body)}</span></div></div>`).join('')}</div>
    ${pays ? `<div class="pay"><div class="h"><b>Direct Bank &amp; Mobile Wallets</b><span class="zero">Zero Charges</span></div>${pays}</div>` : ''}
  </div>
  <div class="foot">100% direct payment to the shop • ${esc(config.brand.name)} charges zero shop commission</div>
</div></body></html>`;
}

/** Renders the poster to an A4 PDF and opens the share sheet (save / print / WhatsApp). */
export async function printQrPoster(shop: Shop, methods: PaymentMethod[]) {
  const html = await posterHtml(shop, methods);
  const { uri } = await Print.printToFileAsync({ html, width: 595, height: 842 });
  if (await Sharing.isAvailableAsync()) {
    await Sharing.shareAsync(uri, { mimeType: 'application/pdf', dialogTitle: `${shop.name} QR poster`, UTI: 'com.adobe.pdf' });
  } else {
    await Print.printAsync({ uri });
  }
}
