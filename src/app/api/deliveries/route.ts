import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import type { Delivery } from '@/components/DeliveryScreen';

export async function GET() {
  try {
    const deliveries = (await prisma.delivery.findMany({
      include: {
        customer: true,
      },
      orderBy: [
        { status: 'asc' }, // PENDING first, then DELIVERED
        { createdAt: 'desc' },
      ],
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
    console.error('Error fetching deliveries:', error);
    return NextResponse.json({ error: 'Failed to fetch deliveries' }, { status: 500 });
  }
}
