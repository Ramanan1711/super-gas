import CustomerAllDeliveriesScreen from '@/components/CustomerAllDeliveriesScreen';

export const metadata = {
  title: 'All Deliveries | Super Gas',
  description: 'View complete delivery and invoice history for customer',
};

export default function AllDeliveriesPage() {
  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center py-0 sm:py-6 sm:px-4">
      <div className="w-full max-w-[430px] h-[100dvh] sm:h-[880px] sm:max-h-[94vh] bg-white sm:rounded-[36px] shadow-2xl flex flex-col overflow-hidden relative border border-slate-200/80">
        <CustomerAllDeliveriesScreen />
      </div>
    </div>
  );
}
