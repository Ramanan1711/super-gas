import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const updated = await prisma.delivery.update({
      where: { id },
      data: {
        status: body.status || 'DELIVERED',
        emptyCollected: typeof body.emptyCollected === 'number' ? body.emptyCollected : undefined,
        paymentMethod: body.paymentMethod || undefined,
        paymentStatus: body.paymentStatus || 'PAID',
        notes: body.notes || undefined,
        deliveredAt: body.status === 'DELIVERED' ? new Date() : undefined,
      },
      include: {
        customer: true,
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error('Error updating delivery:', error);
    return NextResponse.json({ error: 'Failed to update delivery' }, { status: 500 });
  }
}
