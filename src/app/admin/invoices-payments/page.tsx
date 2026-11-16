import AdminInvoicesPage from '@/components/AdminInvoicesPage';

export const metadata = {
  title: 'Invoices & Payments | Super Gas Logistics Core',
  description: 'Manage customer invoices, collections, FIFO payment allocation, and cash reconciliation.',
};

export default function InvoicesPaymentsRoute() {
  return <AdminInvoicesPage />;
}
