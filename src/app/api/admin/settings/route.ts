import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { withApiHandler } from '@/lib/api-middleware';
import { successResponse } from '@/lib/api-response';

// Default project settings
const projectSettings = {
  agency: {
    name: 'Super Gas Logistics Private Limited',
    brandName: 'Super Gas Direct Dispatch',
    gstin: '33AAACH1234F1Z8',
    pan: 'AAACH1234F',
    cin: 'U40200TN2022PTC148921',
    headOfficeAddress: 'Plot 18/A, Logistics Corridor, Ring Road Bypass, Madurai - 625020, Tamil Nadu',
    contactPhone: '+91 452 2345678',
    dispatchHotline: '+91 98421 54321',
    accountsEmail: 'accounts@supergas.in',
    supportEmail: 'care@supergas.in',
  },
  commercialPricing: {
    cylinder19kgCommercial: 1850.0,
    cylinder47kgIndustrial: 4200.0,
    cylinder14kgDomestic: 850.0,
    cylinder5kgMiniCommercial: 620.0,
    commercialGstPercent: 18,
    domesticGstPercent: 5,
    cylinderDeposit19kg: 2500.0,
    cylinderDeposit47kg: 6000.0,
    cylinderDeposit14kg: 1500.0,
    defaultCreditDays: 15,
    defaultCreditLimit: 25000.0,
  },
  fleetControls: {
    maxVanCapacity: 30,
    dailyCashHandoverCutoffTime: '19:30',
    mandatorySignaturePod: true,
    emptyCylinderAuditRequired: true,
    autoRescheduleFailedDrops: true,
    expenseAutoApprovalLimit: 500.0,
  },
  systemInfo: {
    appVersion: 'v2.4.0-production',
    framework: 'Next.js 16 (App Router) + Prisma ORM',
    databaseProvider: 'PostgreSQL Serverless (AWS Neon)',
    environment: process.env.NODE_ENV || 'production',
    lastSyncTimestamp: new Date().toISOString(),
  },
};

export const GET = withApiHandler(async (req: NextRequest) => {
  const action = req.nextUrl.searchParams.get('action');

  // Database Backup export provision
  if (action === 'backup') {
    const [customers, partners, invoices, payments, expenses, depots, vehicles] =
      await Promise.all([
        prisma.customer.findMany({ take: 1000 }),
        prisma.deliveryPartner.findMany({ take: 1000 }),
        prisma.invoice.findMany({ take: 1000 }),
        prisma.paymentTransaction.findMany({ take: 1000 }),
        prisma.expenseClaim.findMany({ take: 1000 }),
        prisma.depot.findMany(),
        prisma.vehicle.findMany(),
      ]);

    const backupDump = {
      exportTimestamp: new Date().toISOString(),
      metadata: {
        system: 'Super Gas Enterprise System Backup',
        version: projectSettings.systemInfo.appVersion,
        totalCustomers: customers.length,
        totalPartners: partners.length,
        totalInvoices: invoices.length,
        totalPayments: payments.length,
        totalExpenses: expenses.length,
      },
      data: {
        customers,
        partners,
        invoices,
        payments,
        expenses,
        depots,
        vehicles,
      },
    };

    return successResponse(backupDump);
  }

  // Count active stats for health verification
  const [customerCount, partnerCount, vehicleCount, depotCount] = await Promise.all([
    prisma.customer.count(),
    prisma.deliveryPartner.count(),
    prisma.vehicle.count(),
    prisma.depot.count(),
  ]);

  return successResponse({
    settings: projectSettings,
    stats: {
      customerCount,
      partnerCount,
      vehicleCount,
      depotCount,
      dbStatus: 'CONNECTED',
    },
  });
});

export const POST = withApiHandler(async (req: NextRequest) => {
  const body = await req.json().catch(() => ({}));
  const { agency, commercialPricing, fleetControls } = body;

  if (agency) {
    projectSettings.agency = { ...projectSettings.agency, ...agency };
  }
  if (commercialPricing) {
    projectSettings.commercialPricing = {
      ...projectSettings.commercialPricing,
      ...commercialPricing,
    };
  }
  if (fleetControls) {
    projectSettings.fleetControls = {
      ...projectSettings.fleetControls,
      ...fleetControls,
    };
  }

  projectSettings.systemInfo.lastSyncTimestamp = new Date().toISOString();

  return successResponse({
    message: 'Agency settings saved successfully.',
    settings: projectSettings,
  });
});
