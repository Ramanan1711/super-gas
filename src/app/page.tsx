import { Suspense } from 'react';
import { prisma } from '@/lib/prisma';
import DeliveryScreen, { DeliveryStats, Delivery } from '@/components/DeliveryScreen';

async function DeliveryContainer() {
  let stats: DeliveryStats = {
    totalDeliveries: 15,
    completedDeliveries: 10,
    pendingDeliveries: 5,
    cancelledDeliveries: 0,
    emptyCylindersCollected: 8,
    totalCollected: 12000,
    cashInHand: 10500,
    onlineCollected: 1500,
  };
  let deliveries: Delivery[] = [];

  try {
    const dbDeliveries = await prisma.delivery.findMany({
      include: { customer: true },
      orderBy: [
        { status: 'asc' },
        { createdAt: 'desc' },
      ],
    });

    if (dbDeliveries.length > 0) {
      deliveries = JSON.parse(JSON.stringify(dbDeliveries));
      stats = {
        totalDeliveries: deliveries.length,
        completedDeliveries: deliveries.filter((d: Delivery) => d.status === 'DELIVERED').length,
        pendingDeliveries: deliveries.filter((d: Delivery) => d.status === 'PENDING').length,
        cancelledDeliveries: deliveries.filter((d: Delivery) => d.status === 'CANCELLED').length,
        emptyCylindersCollected: deliveries
          .filter((d: Delivery) => d.status === 'DELIVERED')
          .reduce((sum: number, d: Delivery) => sum + (d.emptyCollected || 0), 0),
        totalCollected: deliveries
          .filter((d: Delivery) => d.status === 'DELIVERED')
          .reduce((sum: number, d: Delivery) => sum + d.amount, 0),
        cashInHand: deliveries
          .filter((d: Delivery) => d.status === 'DELIVERED' && d.paymentMethod === 'CASH')
          .reduce((sum: number, d: Delivery) => sum + d.amount, 0),
        onlineCollected: deliveries
          .filter((d: Delivery) => d.status === 'DELIVERED' && (d.paymentMethod === 'UPI' || d.paymentMethod === 'ONLINE'))
          .reduce((sum: number, d: Delivery) => sum + d.amount, 0),
      };
    }
  } catch (err) {
    console.error('Error loading initial deliveries:', err);
  }

  return <DeliveryScreen initialStats={stats} initialDeliveries={deliveries} />;
}

function DeliverySkeleton() {
  return (
    <div className="h-screen max-h-screen bg-slate-100 flex justify-center items-center py-0 sm:py-4 overflow-hidden">
      <div className="w-full sm:max-w-[430px] bg-slate-50 h-[100dvh] sm:h-[880px] sm:max-h-[94vh] sm:rounded-[36px] p-5 space-y-4 flex flex-col justify-between">
        <div className="space-y-4">
          <div className="h-8 bg-slate-200 rounded-lg animate-pulse w-1/3"></div>
          <div className="grid grid-cols-2 gap-3">
            <div className="h-24 bg-slate-200 rounded-2xl animate-pulse"></div>
            <div className="h-24 bg-slate-200 rounded-2xl animate-pulse"></div>
          </div>
          <div className="h-20 bg-slate-200 rounded-2xl animate-pulse"></div>
          <div className="h-24 bg-slate-200 rounded-2xl animate-pulse"></div>
        </div>
        <div className="h-14 bg-slate-200 rounded-xl animate-pulse"></div>
      </div>
    </div>
  );
}

export default function HomePage() {
  return (
    <Suspense fallback={<DeliverySkeleton />}>
      <DeliveryContainer />
    </Suspense>
  );
}
