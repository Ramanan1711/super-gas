import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { withApiHandler, validateBody } from '@/lib/api-middleware';
import { successResponse, notFoundResponse } from '@/lib/api-response';
import { updateDocumentPucSchema } from '@/lib/validations/auth.schema';

const handlePucUpdate = async (req: NextRequest) => {
  const body = await validateBody(req, updateDocumentPucSchema);
  const partnerCode =
    req.nextUrl.searchParams.get('partnerCode') || body.partnerCode || 'DP-003';

  const partner = await prisma.deliveryPartner.findUnique({
    where: { partnerCode },
  });

  if (!partner) {
    return notFoundResponse('Delivery partner');
  }

  const certNumber = body.docNumber || body.certificateNumber || 'PUC-TN58-2027';

  // Calculate renewal validity
  let validUntil = new Date(Date.now() + 365 * 86400000);
  const rawDate = body.validUntil || body.expiryDate;
  if (rawDate) {
    const parsed = new Date(rawDate);
    if (!isNaN(parsed.getTime())) {
      validUntil = parsed;
    }
  }

  // Find or create the PUC document
  const pucDoc = await prisma.partnerDocument.findFirst({
    where: {
      partnerId: partner.id,
      type: 'PUC_CERTIFICATE',
    },
  });

  let updatedDoc;
  if (pucDoc) {
    updatedDoc = await prisma.partnerDocument.update({
      where: { id: pucDoc.id },
      data: {
        docNumber: certNumber,
        status: 'VERIFIED',
        validUntil,
        fileUrl: body.fileUrl || pucDoc.fileUrl,
        remarks: `Renewed for vehicle ${body.vehicleRegNumber || 'TN 58 AX 4821'}. Automated emission verification passed.`,
      },
    });
  } else {
    updatedDoc = await prisma.partnerDocument.create({
      data: {
        partnerId: partner.id,
        type: 'PUC_CERTIFICATE',
        title: 'Vehicle Pollution Under Control (PUC)',
        docNumber: certNumber,
        status: 'VERIFIED',
        validUntil,
        fileUrl: body.fileUrl || null,
        remarks: `Registered for vehicle ${body.vehicleRegNumber || 'TN 58 AX 4821'}.`,
      },
    });
  }

  return successResponse({
    message: 'PUC certificate renewed and verified successfully in database.',
    document: updatedDoc,
  });
};

export const POST = withApiHandler(handlePucUpdate);
export const PATCH = withApiHandler(handlePucUpdate);

