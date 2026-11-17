import DeliveryScreen from '@/components/DeliveryScreen';

export const metadata = {
  title: 'My Stocks | Super Gas Logistics Core',
  description: 'View your filled and empty stock by category - Delivery Partner',
};

export default function StocksRoute() {
  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center py-0 sm:py-6 sm:px-4">
      <DeliveryScreen initialBottomNav="STOCKS" />
    </div>
  );
}
