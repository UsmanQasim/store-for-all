import type { Metadata } from 'next';
import { LegalPage } from '@/components/LegalPage';
import { LEGAL } from '@/lib/legal';

export const metadata: Metadata = {
  title: LEGAL['delete-account'].title,
  description: 'How to permanently delete your Dukaan account and data — in the app or by email.',
  alternates: { canonical: '/delete-account' },
};

export default function DeleteAccount() {
  return <LegalPage slug="delete-account" />;
}
