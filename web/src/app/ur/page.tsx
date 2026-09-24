import type { Metadata } from 'next';
import { Landing } from '@/components/Landing';

export const metadata: Metadata = {
  title: { absolute: 'دکان — آپ کی گلی کی ہر دکان، ایک ایپ میں' },
  description: 'حجام کے پاس باری بک کریں، کریانہ سے راشن کا پری آرڈر دیں اور QR سے دکان کو براہِ راست ادائیگی کریں۔ گاہکوں کے لیے مفت، دکانوں کے لیے 0% کمیشن۔',
  alternates: { canonical: '/ur', languages: { en: '/', ur: '/ur', 'x-default': '/' } },
  openGraph: { url: '/ur', locale: 'ur_PK', alternateLocale: ['en_PK'] },
};

// Google reads language from the content + hreflang; the wrapper sets direction and the Nastaliq rules.
export default function HomeUrdu() {
  return (
    <div lang="ur" dir="rtl">
      <Landing locale="ur" />
    </div>
  );
}
