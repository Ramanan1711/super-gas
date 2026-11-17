import AdminSettlementsPage from '@/components/AdminSettlementsPage';

export const metadata = {
  title: 'Settlements | Super Gas Logistics Core',
  description: 'Review and reconcile daily cash collected by delivery partners against digital run sheets.',
};

export default function SettlementsRoute() {
  return <AdminSettlementsPage />;
}
