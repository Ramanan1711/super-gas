import AdminDeliveryPartnersPage from '@/components/AdminDeliveryPartnersPage';

export const metadata = {
  title: 'Onboard New Delivery Partner | Super Gas Logistics Core',
  description: 'Register a new field delivery executive, configure vehicle & route beat, and authorize terminal app access.',
};

export default function OnboardDeliveryPartnerRoute() {
  return <AdminDeliveryPartnersPage initialViewMode="add" />;
}
