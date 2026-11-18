import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import type { Delivery } from '@/components/DeliveryScreen';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl;
    const driverCode = searchParams.get('driverCode') || searchParams.get('partnerCode');
    const dateParam = searchParams.get('date');
    const statusParam = searchParams.get('status');

    // 1. Try querying realistic DeliveryTask records
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const taskWhere: any = {};
    if (driverCode) {
      taskWhere.trip = {
        partner: {
          partnerCode: driverCode,
        },
      };
    }
    if (statusParam) {
      taskWhere.status = statusParam === 'DELIVERED' ? 'COMPLETED' : statusParam;
    }
    if (dateParam) {
      const d = new Date(dateParam);
      const nextDay = new Date(d);
      nextDay.setDate(nextDay.getDate() + 1);
      taskWhere.createdAt = { gte: d, lt: nextDay };
    }

    const tasks = await prisma.deliveryTask.findMany({
      where: taskWhere,
      include: {
        customer: true,
        items: {
          include: {
            product: true,
          },
        },
        invoice: {
          include: {
            payments: true,
          },
        },
        trip: {
          include: {
            partner: true,
            vehicle: true,
          },
        },
      },
      orderBy: [
        { sequence: 'asc' },
        { createdAt: 'desc' },
      ],
    });

    if (tasks.length > 0) {
      // Map to frontend Delivery interface
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const mappedDeliveries: Delivery[] = tasks.map((t: any, idx: number) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const totalDelivered = t.items.reduce((sum: number, item: any) => sum + item.filledDelivered, 0) || 1;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const totalEmpty = t.items.reduce((sum: number, item: any) => sum + item.emptyCollected, 0);
        const cylinderDesc = t.items.length > 0
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          ? t.items.map((i: any) => `${i.filledDelivered}x ${i.product?.label || i.product?.name || 'Cylinder'}`).join(', ')
          : '19kg Commercial';
        const inv = t.invoice;
        const payment = inv?.payments?.[0];
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const amount = inv?.totalAmount ?? t.items.reduce((sum: number, item: any) => sum + item.totalPrice, 0);

        let deliveryStatus: 'PENDING' | 'DELIVERED' | 'CANCELLED' = 'PENDING';
        if (t.status === 'COMPLETED') deliveryStatus = 'DELIVERED';
        else if (t.status === 'CANCELLED' || t.status === 'RESCHEDULED') deliveryStatus = 'CANCELLED';

        return {
          id: t.id,
          sequence: t.sequence || idx + 1,
          customerId: t.customerId,
          customer: {
            id: t.customer.id,
            name: t.customer.name,
            phone: t.customer.phone,
            address: t.customer.address,
            type: t.customer.type || 'Commercial',
            customerCode: t.customer.customerCode || undefined,
          },
          status: deliveryStatus,
          taskStatus: t.status,
          cylinderType: cylinderDesc,
          quantity: totalDelivered,
          emptyCollected: totalEmpty,
          amount,
          paymentMethod: payment?.paymentMethod === 'UPI_QR' ? 'UPI' : (payment?.paymentMethod || 'CASH'),
          paymentStatus: inv?.paymentStatus || (deliveryStatus === 'DELIVERED' ? 'PAID' : 'PENDING'),
          notes: t.notes,
          deliveredAt: t.deliveredAt ? t.deliveredAt.toISOString() : null,
          createdAt: t.createdAt.toISOString(),
          updatedAt: t.updatedAt.toISOString(),
        };
      });

      const totalDeliveries = mappedDeliveries.length;
      const completedDeliveries = mappedDeliveries.filter((d) => d.status === 'DELIVERED').length;
      const pendingDeliveries = mappedDeliveries.filter((d) => d.status === 'PENDING').length;
      const cancelledDeliveries = mappedDeliveries.filter((d) => d.status === 'CANCELLED').length;

      const emptyCylindersCollected = mappedDeliveries
        .filter((d) => d.status === 'DELIVERED')
        .reduce((sum, d) => sum + (d.emptyCollected || 0), 0);

      const totalCollected = mappedDeliveries
        .filter((d) => d.status === 'DELIVERED')
        .reduce((sum, d) => sum + d.amount, 0);

      const cashInHand = mappedDeliveries
        .filter((d) => d.status === 'DELIVERED' && d.paymentMethod === 'CASH')
        .reduce((sum, d) => sum + d.amount, 0);

      const onlineCollected = mappedDeliveries
        .filter((d) => d.status === 'DELIVERED' && (d.paymentMethod === 'UPI' || d.paymentMethod === 'ONLINE'))
        .reduce((sum, d) => sum + d.amount, 0);

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
        deliveries: mappedDeliveries,
      });
    }

    // 2. Fallback to legacy delivery table if no DeliveryTask found
    const deliveries = (await prisma.delivery.findMany({
      include: {
        customer: true,
      },
      orderBy: [
        { status: 'asc' },
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
