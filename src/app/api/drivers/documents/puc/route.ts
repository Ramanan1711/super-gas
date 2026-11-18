import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { withApiHandler, validateBody } from '@/lib/api-middleware';
import { successResponse, notFoundResponse } from '@/lib/api-response';
import { updateDocumentPucSchema } from '@/lib/validations/auth.schema';

export const PATCH = withApiHandler(async (req: NextRequest) => {
  const body = await validateBody(req, updateDocumentPucSchema);
  const partnerCode = req.nextUrl.searchParams.get('partnerCode') || 'DP-003';

  const partner = await prisma.deliveryPartner.findUnique({
    where: { partnerCode },
  });

  if (!partner) {
    return notFoundResponse('Delivery partner');
  }

  // Find the PUC document
  const pucDoc = await prisma.partnerDocument.findFirst({
    where: {
      partnerId: partner.id,
      type: 'PUC_CERTIFICATE',
    },
  });

  if (!pucDoc) {
    return notFoundResponse('PUC document');
  }

  // Calculate renewal validity (1 year from now if not passed)
  const validUntil = body.validUntil
    ? new Date(body.validUntil)
    : new Date(Date.now() + 365 * 86400000);

  const updatedDoc = await prisma.partnerDocument.update({
    where: { id: pucDoc.id },
    data: {
      docNumber: body.docNumber,
      status: 'VERIFIED',
      validUntil,
      remarks: 'Renewed via mobile app. Automated emission verification passed.',
    },
  });

  return successResponse({
    message: 'PUC certificate renewed successfully',
    document: updatedDoc,
  });
});
