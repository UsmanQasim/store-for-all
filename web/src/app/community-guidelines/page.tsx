import type { Metadata } from 'next';
import { LegalPage } from '@/components/LegalPage';
import { LEGAL } from '@/lib/legal';

export const metadata: Metadata = {
  title: LEGAL['community-guidelines'].title,
  description: 'What is and isn’t allowed in reviews, shop listings, photos and offers on Dukaan.',
  alternates: { canonical: '/community-guidelines' },
};

export default function CommunityGuidelines() {
  return <LegalPage slug="community-guidelines" />;
}
