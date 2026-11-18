import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { withApiHandler } from '@/lib/api-middleware';
import { successResponse, notFoundResponse, badRequestResponse } from '@/lib/api-response';
import { rescheduleDeliverySchema } from '@/lib/validations/delivery.schema';

export const POST = withApiHandler(async (
  req: NextRequest,
  context?: { params?: Promise<Record<string, string | string[]>> }
) => {
  const params = await context?.params;
  const id = Array.isArray(params?.id) ? params?.id[0] : params?.id;

  if (!id) {
    return badRequestResponse('Task ID is required');
  }

  const body = await req.json();
  const validated = rescheduleDeliverySchema.parse({
    ...body,
    taskId: id,
  });

  const task = await prisma.deliveryTask.findUnique({
    where: { id },
  });

  if (!task) {
    return notFoundResponse('Delivery task');
  }

  const updated = await prisma.deliveryTask.update({
    where: { id },
    data: {
      status: 'RESCHEDULED',
      rescheduledReason: validated.reason,
      notes: `${task.notes || ''} [Rescheduled: ${validated.reason}]`.trim(),
    },
  });

  return successResponse({
    message: 'Delivery rescheduled successfully',
    task: updated,
  });
});
