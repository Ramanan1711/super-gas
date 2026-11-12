import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("Seeding delivery partner initial data...");

  // Check if deliveries already exist
  const count = await prisma.delivery.count();
  if (count > 0) {
    console.log(`Database already has ${count} deliveries. Skipping seed.`);
    return;
  }

  const seedData = [
    // 5 Pending deliveries
    {
      name: "Rathina Kumar",
      phone: "+91 98765 43210",
      address: "No. 14, Gandhi Road, Anna Nagar, Chennai",
      type: "Commercial",
      deliveries: [
        {
          cylinderType: "19kg Commercial",
          quantity: 2,
          emptyCollected: 0,
          amount: 3600,
          paymentMethod: "CASH",
          paymentStatus: "PENDING",
          status: "PENDING",
          notes: "Call before reaching location",
        },
      ],
    },
    {
      name: "Saravana Bhavan",
      phone: "+91 98765 43211",
      address: "No. 102, Main Bazaar, T. Nagar, Chennai",
      type: "Commercial",
      deliveries: [
        {
          cylinderType: "19kg Commercial",
          quantity: 3,
          emptyCollected: 0,
          amount: 5400,
          paymentMethod: "CASH",
          paymentStatus: "PENDING",
          status: "PENDING",
          notes: "Kitchen rear entrance delivery",
        },
      ],
    },
    {
      name: "Priya Sharma",
      phone: "+91 98765 43212",
      address: "Flat 4B, Green Valley Apts, Velachery, Chennai",
      type: "Domestic",
      deliveries: [
        {
          cylinderType: "14.2kg Domestic",
          quantity: 1,
          emptyCollected: 0,
          amount: 950,
          paymentMethod: "UPI",
          paymentStatus: "PENDING",
          status: "PENDING",
          notes: "Leave with security if not available",
        },
      ],
    },
    {
      name: "Anand Bakery",
      phone: "+91 98765 43213",
      address: "18, Nehru Street, Tambaram, Chennai",
      type: "Commercial",
      deliveries: [
        {
          cylinderType: "19kg Commercial",
          quantity: 1,
          emptyCollected: 0,
          amount: 1800,
          paymentMethod: "CASH",
          paymentStatus: "PENDING",
          status: "PENDING",
          notes: "Deliver before 2 PM",
        },
      ],
    },
    {
      name: "Muthu Agency",
      phone: "+91 98765 43214",
      address: "7/2, North Usman Road, T. Nagar, Chennai",
      type: "Commercial",
      deliveries: [
        {
          cylinderType: "19kg Commercial",
          quantity: 2,
          emptyCollected: 0,
          amount: 3600,
          paymentMethod: "CASH",
          paymentStatus: "PENDING",
          status: "PENDING",
          notes: "Urgent delivery needed",
        },
      ],
    },
    // 10 Completed/Delivered orders (Totaling 8 empty cylinders collected, ₹ 10,500 Cash + ₹ 1,500 Online = ₹ 12,000 Total)
    {
      name: "Kavitha Stores",
      phone: "+91 98765 43215",
      address: "45, Cross Cut Rd, Chennai",
      type: "Commercial",
      deliveries: [
        {
          cylinderType: "19kg Commercial",
          quantity: 1,
          emptyCollected: 1,
          amount: 1800,
          paymentMethod: "CASH",
          paymentStatus: "PAID",
          status: "DELIVERED",
          deliveredAt: new Date(Date.now() - 1000 * 60 * 180),
        },
      ],
    },
    {
      name: "A2B Sweets",
      phone: "+91 98765 43216",
      address: "88, Mount Road, Chennai",
      type: "Commercial",
      deliveries: [
        {
          cylinderType: "19kg Commercial",
          quantity: 2,
          emptyCollected: 2,
          amount: 3600,
          paymentMethod: "CASH",
          paymentStatus: "PAID",
          status: "DELIVERED",
          deliveredAt: new Date(Date.now() - 1000 * 60 * 150),
        },
      ],
    },
    {
      name: "Vasanth & Co Canteen",
      phone: "+91 98765 43217",
      address: "12, GST Road, Guindy, Chennai",
      type: "Commercial",
      deliveries: [
        {
          cylinderType: "19kg Commercial",
          quantity: 1,
          emptyCollected: 1,
          amount: 1800,
          paymentMethod: "CASH",
          paymentStatus: "PAID",
          status: "DELIVERED",
          deliveredAt: new Date(Date.now() - 1000 * 60 * 120),
        },
      ],
    },
    {
      name: "Hotel Bilal",
      phone: "+91 98765 43218",
      address: "56, Triplicane High Rd, Chennai",
      type: "Commercial",
      deliveries: [
        {
          cylinderType: "19kg Commercial",
          quantity: 1,
          emptyCollected: 1,
          amount: 1800,
          paymentMethod: "CASH",
          paymentStatus: "PAID",
          status: "DELIVERED",
          deliveredAt: new Date(Date.now() - 1000 * 60 * 90),
        },
      ],
    },
    {
      name: "Madras Cafe",
      phone: "+91 98765 43219",
      address: "22, Mylapore Tank, Chennai",
      type: "Commercial",
      deliveries: [
        {
          cylinderType: "19kg Commercial",
          quantity: 1,
          emptyCollected: 1,
          amount: 1500,
          paymentMethod: "UPI",
          paymentStatus: "PAID",
          status: "DELIVERED",
          deliveredAt: new Date(Date.now() - 1000 * 60 * 60),
        },
      ],
    },
    {
      name: "Sri Krishna Sweets",
      phone: "+91 98765 43220",
      address: "31, Pondy Bazaar, T. Nagar, Chennai",
      type: "Commercial",
      deliveries: [
        {
          cylinderType: "19kg Commercial",
          quantity: 1,
          emptyCollected: 1,
          amount: 1500,
          paymentMethod: "CASH",
          paymentStatus: "PAID",
          status: "DELIVERED",
          deliveredAt: new Date(Date.now() - 1000 * 60 * 50),
        },
      ],
    },
  ];

  for (const item of seedData) {
    const { deliveries, ...cust } = item;
    const customer = await prisma.customer.upsert({
      where: { phone: cust.phone },
      update: {},
      create: cust,
    });

    for (const del of deliveries) {
      await prisma.delivery.create({
        data: {
          ...del,
          customerId: customer.id,
        },
      });
    }
  }

  console.log("Seeding completed successfully!");
}

main()
  .catch((e) => {
    console.error("Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
