import DeliveryScreen from '@/components/DeliveryScreen';

export const metadata = {
  title: 'My Claims | Super Gas Logistics Core',
  description: 'Partner settlement claims & allowances - Delivery Partner',
};

export default function DeliveryExpensesRoute() {
  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center py-0 sm:py-6 sm:px-4">
      <DeliveryScreen initialBottomNav="EXPENSES" />
    </div>
  );
}
