import { redirect } from 'next/navigation';

export const metadata = {
  title: 'Reports | Super Gas Logistics Core',
  description: 'Monitor branch performance, deliveries, financial activity, inventory, and business operations.',
};

export default function ReportRoute() {
  redirect('/admin/reports');
}
