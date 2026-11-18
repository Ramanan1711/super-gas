import DeliveryScreen from '@/components/DeliveryScreen';

export const metadata = {
  title: 'More | Super Gas Logistics Core',
  description: 'Delivery Partner Account, Profile, and Settings',
};

export default function MoreRoute() {
  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center py-0 sm:py-6 sm:px-4">
      <DeliveryScreen initialBottomNav="MORE" />
    </div>
  );
}
