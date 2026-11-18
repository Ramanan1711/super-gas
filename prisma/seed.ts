import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const prisma = new PrismaClient({ adapter }) as any;

async function main() {
  console.log("Starting Super Gas database master seed...");

  // 1. DEPOTS
  console.log("Seeding Depots...");
  const maduraiDepot = await prisma.depot.upsert({
    where: { code: "MDU-HQ" },
    update: {},
    create: {
      code: "MDU-HQ",
      name: "Madurai Central Hub",
      address: "Madurai Logistics Node (HQ), Bypass Road, Madurai",
      city: "Madurai",
      phone: "+91 452 2345678",
    },
  });

  await prisma.depot.upsert({
    where: { code: "CHN-04" },
    update: {},
    create: {
      code: "CHN-04",
      name: "Chennai Hub Node 04",
      address: "Industrial Corridor, Guindy, Chennai",
      city: "Chennai",
      phone: "+91 44 28765432",
    },
  });

  // 2. VEHICLES
  console.log("Seeding Vehicles...");
  const van1 = await prisma.vehicle.upsert({
    where: { regNumber: "TN 58 AX 4821" },
    update: { depotId: maduraiDepot.id },
    create: {
      regNumber: "TN 58 AX 4821",
      model: "Tata Ace Gold Diesel",
      capacity: 30,
      depotId: maduraiDepot.id,
      isActive: true,
    },
  });

  await prisma.vehicle.upsert({
    where: { regNumber: "TN-58-BZ-4412" },
    update: { depotId: maduraiDepot.id },
    create: {
      regNumber: "TN-58-BZ-4412",
      model: "Tata Ace Gold Diesel",
      capacity: 30,
      depotId: maduraiDepot.id,
      isActive: true,
    },
  });

  // 3. USERS & ROLES
  console.log("Seeding Users...");
  await prisma.user.upsert({
    where: { phone: "+919800000001" },
    update: {},
    create: {
      phone: "+919800000001",
      email: "superadmin@supergas.in",
      name: "Executive Management",
      role: "SUPER_ADMIN",
      passwordHash: "pbkdf2_sha256$260000$supergas$hashedpassword",
      isActive: true,
    },
  });

  const depotAdmin = await prisma.user.upsert({
    where: { phone: "+919800000002" },
    update: {},
    create: {
      phone: "+919800000002",
      email: "admin.raman@supergas.in",
      name: "S. Raman (Admin)",
      role: "ADMIN",
      passwordHash: "pbkdf2_sha256$260000$supergas$hashedpassword",
      isActive: true,
    },
  });

  const driverUser = await prisma.user.upsert({
    where: { phone: "+919787654321" },
    update: {},
    create: {
      phone: "+919787654321",
      email: "sureshbabu@gmail.com",
      name: "Suresh Babu",
      role: "DELIVERY_PARTNER",
      passwordHash: "pbkdf2_sha256$260000$supergas$hashedpassword",
      isActive: true,
    },
  });

  // 4. DELIVERY PARTNER
  console.log("Seeding Delivery Partner Profile...");
  const sureshBabu = await prisma.deliveryPartner.upsert({
    where: { partnerCode: "DP-003" },
    update: {
      userId: driverUser.id,
      depotId: maduraiDepot.id,
      assignedVehicleId: van1.id,
    },
    create: {
      partnerCode: "DP-003",
      name: "Suresh Babu",
      phone: "+91 97876 54321",
      altPhone: "+91 94440 90768",
      address: "45/B, Kamarajar Salai, East Gate, Madurai, Tamil Nadu - 625009",
      bloodGroup: "O+ (Rh Pos)",
      dateOfBirth: new Date("1991-08-14"),
      joiningDate: new Date("2023-03-02"),
      status: "ON_DUTY",
      userId: driverUser.id,
      depotId: maduraiDepot.id,
      assignedVehicleId: van1.id,
    },
  });

  // 5. PARTNER KYC DOCUMENTS
  console.log("Seeding Partner Documents...");
  const kycDocs = [
    {
      title: "Identity Proof (Aadhaar)",
      type: "AADHAAR" as const,
      docNumber: "•••• •••• 2754",
      issuedBy: "UIDAI Demographic Auth",
      validUntil: null,
      status: "VERIFIED" as const,
    },
    {
      title: "Permanent Account Number (PAN)",
      type: "AADHAAR" as const,
      docNumber: "•••• •••• 9124-B",
      issuedBy: "NSDL Tax Registry Linked",
      validUntil: null,
      status: "VERIFIED" as const,
    },
    {
      title: "Commercial DL (LMV / HMV)",
      type: "DRIVING_LICENSE" as const,
      docNumber: "TN-58-2015-0048219",
      issuedBy: "Madurai South (TN-58)",
      validUntil: new Date("2028-11-20"),
      status: "VERIFIED" as const,
    },
    {
      title: "Hazardous LPG Endorsement",
      type: "HAZARDOUS_LPG" as const,
      docNumber: "HAZ-LPG-1901",
      issuedBy: "PESO Parivahan Portal",
      validUntil: new Date("2026-11-10"),
      status: "EXPIRING_SOON" as const,
      remarks: "Safety endorsement reaches its valid validity date on 10 Nov 2026. Complete mandated depot refresher training.",
    },
    {
      title: "RC - Tata Ace Gold Diesel",
      type: "VEHICLE_RC" as const,
      docNumber: "VAHAN-RC-TN58-4821",
      issuedBy: "VAHAN Valid",
      validUntil: new Date("2035-03-14"),
      status: "VERIFIED" as const,
    },
    {
      title: "Commercial Fleet Insurance",
      type: "FLEET_INSURANCE" as const,
      docNumber: "HDFC ERGO - 8821",
      issuedBy: "HDFC ERGO",
      validUntil: new Date("2027-10-15"),
      status: "VERIFIED" as const,
    },
    {
      title: "PUC Emission Certificate",
      type: "PUC_CERTIFICATE" as const,
      docNumber: "TN058-PUC-2026-9481",
      issuedBy: "Parivahan Central Server",
      validUntil: new Date("2026-10-22"),
      status: "EXPIRED" as const,
      remarks: "PUC emission record expired on 22 Oct 2026. Complete automated center test and enter renewed test cert.",
    },
    {
      title: "Address / Domicile Record",
      type: "INDEMNITY_BOND" as const,
      docNumber: "MAD-DOM-48120",
      issuedBy: "Madurai District",
      validUntil: null,
      status: "VERIFIED" as const,
    },
    {
      title: "Depot Indemnity Bond",
      type: "INDEMNITY_BOND" as const,
      docNumber: "IND-MDU-2024-484",
      issuedBy: "Super Gas Madurai Hub",
      validUntil: null,
      status: "VERIFIED" as const,
    },
  ];

  for (const doc of kycDocs) {
    const existing = await prisma.partnerDocument.findFirst({
      where: { partnerId: sureshBabu.id, title: doc.title },
    });
    if (!existing) {
      await prisma.partnerDocument.create({
        data: {
          partnerId: sureshBabu.id,
          title: doc.title,
          type: doc.type,
          docNumber: doc.docNumber,
          issuedBy: doc.issuedBy,
          validUntil: doc.validUntil,
          status: doc.status,
          remarks: doc.remarks || null,
        },
      });
    }
  }

  // 6. CYLINDER PRODUCTS
  console.log("Seeding Cylinder Products...");
  const prod19 = await prisma.cylinderProduct.upsert({
    where: { code: "19KG_COMM" },
    update: { unitPrice: 1850 },
    create: {
      code: "19KG_COMM",
      label: "19kg Commercial",
      weightKg: 19.0,
      tareWeightKg: 15.5,
      unitPrice: 1850.0,
      isActive: true,
    },
  });

  const prod47 = await prisma.cylinderProduct.upsert({
    where: { code: "47.5KG_IND" },
    update: { unitPrice: 4250 },
    create: {
      code: "47.5KG_IND",
      label: "47.5kg Industrial",
      weightKg: 47.5,
      tareWeightKg: 36.0,
      unitPrice: 4250.0,
      isActive: true,
    },
  });

  const prod25 = await prisma.cylinderProduct.upsert({
    where: { code: "25KG_COMM" },
    update: { unitPrice: 2450 },
    create: {
      code: "25KG_COMM",
      label: "25kg Commercial",
      weightKg: 25.0,
      tareWeightKg: 20.0,
      unitPrice: 2450.0,
      isActive: true,
    },
  });

  await prisma.cylinderProduct.upsert({
    where: { code: "14.2KG_DOM" },
    update: { unitPrice: 950 },
    create: {
      code: "14.2KG_DOM",
      label: "14.2kg Domestic",
      weightKg: 14.2,
      tareWeightKg: 15.0,
      unitPrice: 950.0,
      isActive: true,
    },
  });

  // 7. INVENTORY (DEPOT & VEHICLE)
  console.log("Seeding Inventory...");
  await prisma.depotInventory.upsert({
    where: { depotId_productId: { depotId: maduraiDepot.id, productId: prod19.id } },
    update: { filledCount: 240, emptyCount: 180, damagedCount: 8 },
    create: { depotId: maduraiDepot.id, productId: prod19.id, filledCount: 240, emptyCount: 180, damagedCount: 8 },
  });
  await prisma.depotInventory.upsert({
    where: { depotId_productId: { depotId: maduraiDepot.id, productId: prod47.id } },
    update: { filledCount: 95, emptyCount: 60, damagedCount: 4 },
    create: { depotId: maduraiDepot.id, productId: prod47.id, filledCount: 95, emptyCount: 60, damagedCount: 4 },
  });
  await prisma.depotInventory.upsert({
    where: { depotId_productId: { depotId: maduraiDepot.id, productId: prod25.id } },
    update: { filledCount: 65, emptyCount: 40, damagedCount: 2 },
    create: { depotId: maduraiDepot.id, productId: prod25.id, filledCount: 65, emptyCount: 40, damagedCount: 2 },
  });

  await prisma.vehicleInventory.upsert({
    where: { vehicleId_productId: { vehicleId: van1.id, productId: prod19.id } },
    update: { filledCount: 16, emptyCount: 8, damagedCount: 1 },
    create: { vehicleId: van1.id, productId: prod19.id, filledCount: 16, emptyCount: 8, damagedCount: 1 },
  });
  await prisma.vehicleInventory.upsert({
    where: { vehicleId_productId: { vehicleId: van1.id, productId: prod47.id } },
    update: { filledCount: 4, emptyCount: 2, damagedCount: 0 },
    create: { vehicleId: van1.id, productId: prod47.id, filledCount: 4, emptyCount: 2, damagedCount: 0 },
  });
  await prisma.vehicleInventory.upsert({
    where: { vehicleId_productId: { vehicleId: van1.id, productId: prod25.id } },
    update: { filledCount: 2, emptyCount: 1, damagedCount: 0 },
    create: { vehicleId: van1.id, productId: prod25.id, filledCount: 2, emptyCount: 1, damagedCount: 0 },
  });

  // 8. CUSTOMERS
  console.log("Seeding Customers...");
  const c1 = await prisma.customer.upsert({
    where: { phone: "+91 98402 33441" },
    update: {},
    create: {
      customerCode: "CUS-00088",
      name: "Sri Krishna Sweets",
      businessName: "Sri Krishna Sweets",
      contactPerson: "Mr. Sundaram",
      phone: "+91 98402 33441",
      address: "12, West Masi Street, Madurai",
      customerType: "COMMERCIAL",
      type: "Commercial",
      creditDays: 15,
      creditLimit: 50000,
      currentBalance: 0,
      route: "Commercial Hub & Madurai North",
    },
  });

  const c2 = await prisma.customer.upsert({
    where: { phone: "+91 99432 11223" },
    update: {},
    create: {
      customerCode: "CUS-00042",
      name: "Hotel Annapoorna",
      businessName: "Hotel Annapoorna",
      contactPerson: "Chef Murugan",
      phone: "+91 99432 11223",
      address: "88, Bypass Junction, Madurai",
      customerType: "COMMERCIAL",
      type: "Commercial",
      creditDays: 7,
      creditLimit: 40000,
      currentBalance: 2550,
      route: "Commercial Hub & Madurai North",
    },
  });

  const c3 = await prisma.customer.upsert({
    where: { phone: "+91 98765 43210" },
    update: {},
    create: {
      customerCode: "CUS-00124",
      name: "Rajesh Kumar",
      businessName: "Rajesh Kumar Mess",
      contactPerson: "Rajesh Kumar",
      phone: "+91 98765 43210",
      address: "4, North Veli Street, Madurai",
      customerType: "COMMERCIAL",
      type: "Commercial",
      creditDays: 0,
      creditLimit: 10000,
      currentBalance: 0,
      route: "Commercial Hub & Madurai North",
    },
  });

  const c4 = await prisma.customer.upsert({
    where: { phone: "+91 98945 12345" },
    update: {},
    create: {
      customerCode: "CUS-00126",
      name: "Priya Stores",
      businessName: "Priya Stores & Sweets",
      contactPerson: "Mrs. Priya",
      phone: "+91 98945 12345",
      address: "77, South Gate Market, Madurai",
      customerType: "COMMERCIAL",
      type: "Commercial",
      creditDays: 15,
      creditLimit: 30000,
      currentBalance: 2250,
      route: "Commercial Hub & Madurai North",
    },
  });

  await prisma.customer.upsert({
    where: { phone: "+91 98765 43211" },
    update: {},
    create: {
      customerCode: "CUS-00015",
      name: "Saravana Bhavan",
      businessName: "Saravana Bhavan Madurai",
      contactPerson: "Manager Selvam",
      phone: "+91 98765 43211",
      address: "No. 102, Main Bazaar, Madurai",
      customerType: "COMMERCIAL",
      type: "Commercial",
      creditDays: 30,
      creditLimit: 100000,
      currentBalance: 0,
      route: "Commercial Hub & Madurai North",
    },
  });

  // 9. DELIVERY TRIP & INVOICES
  console.log("Seeding Delivery Trip & Invoices...");
  const trip = await prisma.deliveryTrip.upsert({
    where: { tripNumber: "TRIP-20261024-01" },
    update: {},
    create: {
      tripNumber: "TRIP-20261024-01",
      shiftDate: new Date("2026-10-24T06:00:00Z"),
      partnerId: sureshBabu.id,
      vehicleId: van1.id,
      routeName: "Commercial Hub & Madurai North",
      status: "COMPLETED",
      startedAt: new Date("2026-10-24T08:30:00Z"),
      completedAt: new Date("2026-10-24T17:30:00Z"),
    },
  });

  const task1 = await prisma.deliveryTask.create({
    data: {
      tripId: trip.id,
      customerId: c1.id,
      sequence: 1,
      status: "COMPLETED",
      deliveredAt: new Date("2026-10-24T15:45:00Z"),
      notes: "Front counter delivery, empty 4 zero balance verified",
      items: {
        create: [
          { productId: prod19.id, filledDelivered: 2, emptyCollected: 2, unitPrice: 1850, totalPrice: 3700 },
          { productId: prod47.id, filledDelivered: 2, emptyCollected: 2, unitPrice: 0, totalPrice: 0 },
        ],
      },
    },
  });

  await prisma.invoice.upsert({
    where: { invoiceNumber: "INV-20261024-085" },
    update: {},
    create: {
      invoiceNumber: "INV-20261024-085",
      customerId: c1.id,
      taskId: task1.id,
      subtotal: 3700,
      taxAmount: 0,
      totalAmount: 3700,
      paidAmount: 3700,
      balanceDue: 0,
      paymentStatus: "PAID",
      createdAt: new Date("2026-10-24T15:45:00Z"),
      payments: {
        create: {
          customerId: c1.id,
          partnerId: sureshBabu.id,
          amount: 3700,
          paymentMethod: "UPI_QR",
          paymentStatus: "PAID",
          referenceNumber: "UPI-98421092",
          transactionDate: new Date("2026-10-24T15:45:00Z"),
          notes: "UPI / QR Settlement",
        },
      },
    },
  });

  const task2 = await prisma.deliveryTask.create({
    data: {
      tripId: trip.id,
      customerId: c2.id,
      sequence: 2,
      status: "COMPLETED",
      deliveredAt: new Date("2026-10-24T13:15:00Z"),
      notes: "Kitchen entrance. Shortage of 1 empty cylinder reported to depot.",
      items: {
        create: [
          { productId: prod19.id, filledDelivered: 2, emptyCollected: 2, unitPrice: 1850, totalPrice: 3700 },
          { productId: prod47.id, filledDelivered: 3, emptyCollected: 3, unitPrice: 1850, totalPrice: 1850 },
        ],
      },
    },
  });

  await prisma.invoice.upsert({
    where: { invoiceNumber: "INV-20261024-084" },
    update: {},
    create: {
      invoiceNumber: "INV-20261024-084",
      customerId: c2.id,
      taskId: task2.id,
      subtotal: 5550,
      totalAmount: 5550,
      paidAmount: 3000,
      balanceDue: 2550,
      paymentStatus: "PARTIALLY_PAID",
      creditDueDate: new Date("2026-10-31"),
      createdAt: new Date("2026-10-24T13:15:00Z"),
      payments: {
        create: {
          customerId: c2.id,
          partnerId: sureshBabu.id,
          amount: 3000,
          paymentMethod: "CASH",
          paymentStatus: "PARTIALLY_PAID",
          referenceNumber: "CASH-MDU-8841",
          transactionDate: new Date("2026-10-24T13:15:00Z"),
          notes: "Partial Cash Advance: Paid ₹3,000 | Due ₹2,550",
        },
      },
    },
  });

  const task3 = await prisma.deliveryTask.create({
    data: {
      tripId: trip.id,
      customerId: c3.id,
      sequence: 3,
      status: "COMPLETED",
      deliveredAt: new Date("2026-10-24T11:30:00Z"),
      notes: "Cash on counter delivery",
      items: {
        create: [
          { productId: prod19.id, filledDelivered: 2, emptyCollected: 2, unitPrice: 600, totalPrice: 1200 },
        ],
      },
    },
  });

  await prisma.invoice.upsert({
    where: { invoiceNumber: "INV-20261024-086" },
    update: {},
    create: {
      invoiceNumber: "INV-20261024-086",
      customerId: c3.id,
      taskId: task3.id,
      subtotal: 1200,
      totalAmount: 1200,
      paidAmount: 1200,
      balanceDue: 0,
      paymentStatus: "PAID",
      createdAt: new Date("2026-10-24T11:30:00Z"),
      payments: {
        create: {
          customerId: c3.id,
          partnerId: sureshBabu.id,
          amount: 1200,
          paymentMethod: "CASH",
          paymentStatus: "PAID",
          referenceNumber: "CASH-REC-086",
          transactionDate: new Date("2026-10-24T11:30:00Z"),
          notes: "Cash on Counter",
        },
      },
    },
  });

  const task4 = await prisma.deliveryTask.create({
    data: {
      tripId: trip.id,
      customerId: c4.id,
      sequence: 4,
      status: "COMPLETED",
      deliveredAt: new Date("2026-10-24T09:50:00Z"),
      notes: "Credit delivery 15 days net",
      items: {
        create: [
          { productId: prod19.id, filledDelivered: 2, emptyCollected: 2, unitPrice: 1000, totalPrice: 2000 },
          { productId: prod25.id, filledDelivered: 1, emptyCollected: 1, unitPrice: 250, totalPrice: 250 },
        ],
      },
    },
  });

  await prisma.invoice.upsert({
    where: { invoiceNumber: "INV-20261024-079" },
    update: {},
    create: {
      invoiceNumber: "INV-20261024-079",
      customerId: c4.id,
      taskId: task4.id,
      subtotal: 2250,
      totalAmount: 2250,
      paidAmount: 0,
      balanceDue: 2250,
      paymentStatus: "UNPAID",
      creditDueDate: new Date("2026-11-08"),
      createdAt: new Date("2026-10-24T09:50:00Z"),
    },
  });

  // 10. EXPENSE CLAIMS
  console.log("Seeding Expense Claims...");
  const claims = [
    {
      claimNumber: "EXP-001",
      category: "FUEL_PETROL" as const,
      categoryLabel: "Diesel / Fuel",
      amount: 1000,
      description: "Vehicle fuel expense - HPCL Madurai bypass refuel (Van TN-58-BZ-4412)",
      status: "APPROVED" as const,
      paymentStatus: "Unpaid",
      claimDate: new Date("2026-11-02T11:30:00Z"),
      reviewedById: depotAdmin.id,
    },
    {
      claimNumber: "EXP-002",
      category: "TOLL_CHARGES" as const,
      categoryLabel: "Toll Charges",
      amount: 500,
      description: "Highway toll payment - Kappalur toll plaza commercial entry",
      status: "PENDING" as const,
      paymentStatus: "Unpaid",
      claimDate: new Date("2026-11-01T14:10:00Z"),
    },
    {
      claimNumber: "EXP-003",
      category: "VEHICLE_MAINTENANCE" as const,
      categoryLabel: "Vehicle Maintenance",
      amount: 2000,
      description: "Vehicle servicing - Rear brake shoe adjustment & oil lubrication",
      status: "REJECTED" as const,
      paymentStatus: "N/A",
      adminRemark: "Unscheduled major service requires prior depot PO approval. Claim not reimbursable under standard field allowance.",
      claimDate: new Date("2026-10-30T16:00:00Z"),
      reviewedById: depotAdmin.id,
    },
    {
      claimNumber: "EXP-004",
      category: "PARKING_CHARGES" as const,
      categoryLabel: "Parking Charges",
      amount: 150,
      description: "Commercial complex entry parking fee - Mattuthavani Wholesale Market",
      status: "APPROVED" as const,
      paymentStatus: "Paid in Full",
      disbursedAmount: 150,
      referenceNumber: "Ref: UPI-992104",
      claimDate: new Date("2026-10-26T10:00:00Z"),
      reviewedById: depotAdmin.id,
    },
    {
      claimNumber: "EXP-005",
      category: "VEHICLE_REPAIR" as const,
      categoryLabel: "Vehicle Repair",
      amount: 350,
      description: "Emergency tyre puncture repair & air top-up on delivery route",
      status: "APPROVED" as const,
      paymentStatus: "Partially Paid",
      disbursedAmount: 200,
      claimDate: new Date("2026-10-22T09:30:00Z"),
      reviewedById: depotAdmin.id,
    },
  ];

  for (const c of claims) {
    await prisma.expenseClaim.upsert({
      where: { claimNumber: c.claimNumber },
      update: {},
      create: {
        claimNumber: c.claimNumber,
        partnerId: sureshBabu.id,
        vehicleId: van1.id,
        category: c.category,
        categoryLabel: c.categoryLabel,
        amount: c.amount,
        description: c.description,
        status: c.status,
        paymentStatus: c.paymentStatus,
        adminRemark: c.adminRemark || null,
        disbursedAmount: c.disbursedAmount || 0,
        referenceNumber: c.referenceNumber || null,
        claimDate: c.claimDate,
        reviewedById: c.reviewedById || null,
      },
    });
  }

  // 11. DAILY SETTLEMENTS & HANDOVERS
  console.log("Seeding Cash Settlements...");
  const todaySettlement = await prisma.dailySettlement.upsert({
    where: {
      businessDate_partnerId: {
        businessDate: new Date("2026-11-02T00:00:00Z"),
        partnerId: sureshBabu.id,
      },
    },
    update: {},
    create: {
      businessDate: new Date("2026-11-02T00:00:00Z"),
      partnerId: sureshBabu.id,
      cashExpected: 5000,
      cashHandedOver: 3000,
      remainingBalance: 2000,
      shortfallAmount: 0,
      status: "PARTIALLY_HANDED_OVER",
      auditRemarks: "Deposit remaining cash at Madurai Depot Counter #2 before shift closing (21:30 IST).",
    },
  });

  await prisma.cashHandoverEvent.upsert({
    where: { handoverCode: "#HND-20261102-01" },
    update: {},
    create: {
      handoverCode: "#HND-20261102-01",
      settlementId: todaySettlement.id,
      partnerId: sureshBabu.id,
      amount: 3000,
      dropType: "AFTERNOON_DROP",
      receivedByAdminId: depotAdmin.id,
      receivedByName: "S. Raman (Admin)",
      stampNumber: "#DPT-MDU-882",
      status: "Verified",
      handoverTime: new Date("2026-11-02T13:45:00Z"),
    },
  });

  await prisma.cashHandoverEvent.upsert({
    where: { handoverCode: "#HND-20261102-02" },
    update: {},
    create: {
      handoverCode: "#HND-20261102-02",
      settlementId: todaySettlement.id,
      partnerId: sureshBabu.id,
      amount: 1500,
      dropType: "EVENING_VAULT",
      receivedByAdminId: depotAdmin.id,
      receivedByName: "S. Raman (Admin)",
      stampNumber: null,
      status: "Pending Verification",
      handoverTime: new Date("2026-11-02T17:15:00Z"),
    },
  });

  await prisma.dailySettlement.upsert({
    where: {
      businessDate_partnerId: {
        businessDate: new Date("2026-11-01T00:00:00Z"),
        partnerId: sureshBabu.id,
      },
    },
    update: {},
    create: {
      businessDate: new Date("2026-11-01T00:00:00Z"),
      partnerId: sureshBabu.id,
      cashExpected: 4500,
      cashHandedOver: 4500,
      remainingBalance: 0,
      shortfallAmount: 0,
      status: "VERIFIED",
      auditRemarks: "Fully Cleared",
    },
  });

  await prisma.dailySettlement.upsert({
    where: {
      businessDate_partnerId: {
        businessDate: new Date("2026-10-31T00:00:00Z"),
        partnerId: sureshBabu.id,
      },
    },
    update: {},
    create: {
      businessDate: new Date("2026-10-31T00:00:00Z"),
      partnerId: sureshBabu.id,
      cashExpected: 3200,
      cashHandedOver: 3200,
      remainingBalance: 0,
      shortfallAmount: 0,
      status: "PENDING_VERIFICATION",
      auditRemarks: "Drop Verification In Progress",
    },
  });

  await prisma.dailySettlement.upsert({
    where: {
      businessDate_partnerId: {
        businessDate: new Date("2026-10-30T00:00:00Z"),
        partnerId: sureshBabu.id,
      },
    },
    update: {},
    create: {
      businessDate: new Date("2026-10-30T00:00:00Z"),
      partnerId: sureshBabu.id,
      cashExpected: 5000,
      cashHandedOver: 4000,
      remainingBalance: 1000,
      shortfallAmount: 0,
      status: "PARTIALLY_HANDED_OVER",
      auditRemarks: "Pending Vault Submission",
    },
  });

  await prisma.dailySettlement.upsert({
    where: {
      businessDate_partnerId: {
        businessDate: new Date("2026-10-29T00:00:00Z"),
        partnerId: sureshBabu.id,
      },
    },
    update: {},
    create: {
      businessDate: new Date("2026-10-29T00:00:00Z"),
      partnerId: sureshBabu.id,
      cashExpected: 6000,
      cashHandedOver: 5800,
      remainingBalance: 200,
      shortfallAmount: 200,
      status: "DIFFERENCE_FOUND",
      auditRemarks: "Shortfall flagged by depot",
    },
  });

  console.log("Super Gas master data seeding completed successfully!");
}

main()
  .catch((e) => {
    console.error("Error during seeding:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
