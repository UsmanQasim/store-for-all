import type { Metadata } from 'next';
import { LegalPage } from '@/components/LegalPage';
import { LEGAL } from '@/lib/legal';

export const metadata: Metadata = {
  title: LEGAL['privacy'].title,
  description: 'What data Dukaan collects, why, who it is shared with, and how to delete it.',
  alternates: { canonical: '/privacy' },
};

export default function Privacy() {
  return <LegalPage slug="privacy" />;
}
