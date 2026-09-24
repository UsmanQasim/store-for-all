import type { Metadata } from 'next';
import { LegalPage } from '@/components/LegalPage';
import { LEGAL } from '@/lib/legal';

export const metadata: Metadata = {
  title: LEGAL['terms'].title,
  description: 'The rules for using Dukaan as a customer or shop owner.',
  alternates: { canonical: '/terms' },
};

export default function Terms() {
  return <LegalPage slug="terms" />;
}
