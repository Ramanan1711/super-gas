import AdminDeliveryPartnersPage from '@/components/AdminDeliveryPartnersPage';

export const metadata = {
  title: 'Delivery Partners | Super Gas Logistics Core',
  description: 'Manage delivery partner fleet, custody matrix, and dispatch gate passes.',
};

export default function DeliveryPartnerRoute() {
  return <AdminDeliveryPartnersPage />;
}
