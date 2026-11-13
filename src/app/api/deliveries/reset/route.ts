import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import type { Delivery } from '@/components/DeliveryScreen';

export async function POST() {
  try {
    const allDeliveries = await prisma.delivery.findMany({
      orderBy: { createdAt: 'desc' },
    });

    if (allDeliveries.length > 0) {
      // Reset the first 5 to PENDING, and the rest to DELIVERED
      for (let i = 0; i < allDeliveries.length; i++) {
        const isPending = i < 5;
        await prisma.delivery.update({
          where: { id: allDeliveries[i].id },
          data: {
            status: isPending ? 'PENDING' : 'DELIVERED',
            emptyCollected: isPending ? 0 : (allDeliveries[i].emptyCollected || 1),
            paymentStatus: isPending ? 'PENDING' : 'PAID',
            deliveredAt: isPending ? null : new Date(),
          },
        });
      }
    }

    const deliveries = (await prisma.delivery.findMany({
      include: { customer: true },
      orderBy: [{ status: 'asc' }, { createdAt: 'desc' }],
    })) as unknown as Delivery[];

    const totalDeliveries = deliveries.length;
    const completedDeliveries = deliveries.filter((d: Delivery) => d.status === 'DELIVERED').length;
    const pendingDeliveries = deliveries.filter((d: Delivery) => d.status === 'PENDING').length;
    const cancelledDeliveries = deliveries.filter((d: Delivery) => d.status === 'CANCELLED').length;

    const emptyCylindersCollected = deliveries
      .filter((d: Delivery) => d.status === 'DELIVERED')
      .reduce((sum: number, d: Delivery) => sum + (d.emptyCollected || 0), 0);

    const totalCollected = deliveries
      .filter((d: Delivery) => d.status === 'DELIVERED')
      .reduce((sum: number, d: Delivery) => sum + d.amount, 0);

    const cashInHand = deliveries
      .filter((d: Delivery) => d.status === 'DELIVERED' && d.paymentMethod === 'CASH')
      .reduce((sum: number, d: Delivery) => sum + d.amount, 0);

    const onlineCollected = deliveries
      .filter((d: Delivery) => d.status === 'DELIVERED' && (d.paymentMethod === 'UPI' || d.paymentMethod === 'ONLINE'))
      .reduce((sum: number, d: Delivery) => sum + d.amount, 0);

    return NextResponse.json({
      stats: {
        totalDeliveries,
        completedDeliveries,
        pendingDeliveries,
        cancelledDeliveries,
        emptyCylindersCollected,
        totalCollected,
        cashInHand,
        onlineCollected,
      },
      deliveries,
    });
  } catch (error) {
    console.error('Error resetting deliveries:', error);
    return NextResponse.json(
      { error: 'Failed to reset deliveries' },
      { status: 500 }
    );
  }
}
