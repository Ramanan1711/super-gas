import AdminInventoryPage from '@/components/AdminInventoryPage';

export const metadata = {
  title: 'Super Gas | Inventory Management',
  description: 'Manage cylinder stock flow across agency warehouse, active partner custody, buffer pools, and live reconciliation logs.',
};

export default function InventoryPage() {
  return <AdminInventoryPage />;
}
