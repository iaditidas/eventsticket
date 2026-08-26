import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding EventHub Database...');

  // Clean existing data
  await prisma.payment.deleteMany({});
  await prisma.ticket.deleteMany({});
  await prisma.bookingItem.deleteMany({});
  await prisma.booking.deleteMany({});
  await prisma.ticketCategory.deleteMany({});
  await prisma.event.deleteMany({});
  await prisma.user.deleteMany({});

  const passwordHash = await bcrypt.hash('password123', 10);

  // Users
  const admin = await prisma.user.create({
    data: {
      name: 'Sarah Connor (Admin)',
      email: 'admin@eventhub.com',
      passwordHash,
      role: 'ADMIN',
    },
  });

  const customer1 = await prisma.user.create({
    data: {
      name: 'John Doe',
      email: 'john@example.com',
      passwordHash,
      role: 'CUSTOMER',
    },
  });

  const customer2 = await prisma.user.create({
    data: {
      name: 'Emma Watson',
      email: 'emma@example.com',
      passwordHash,
      role: 'CUSTOMER',
    },
  });

  // Events
  const event1 = await prisma.event.create({
    data: {
      organizerId: admin.id,
      title: 'Global Tech & AI Summit 2026',
      description: 'Join industry pioneers, developers, and visionaries for 3 days of cutting-edge keynotes, hands-on workshops, and technical deep-dives into autonomous AI systems.',
      venue: 'Metropolitan Convention Center, San Francisco, CA',
      date: '2026-10-15',
      startTime: '09:00 AM',
      endTime: '06:00 PM',
      bannerImage: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1200',
      status: 'PUBLISHED',
      categories: {
        create: [
          { name: 'General Admission', price: 99.0, totalCapacity: 500, ticketsSold: 42 },
          { name: 'VIP Pass (Includes Afterparty)', price: 299.0, totalCapacity: 50, ticketsSold: 12 },
          { name: 'Student Developer', price: 49.0, totalCapacity: 100, ticketsSold: 25 },
        ],
      },
    },
  });

  const event2 = await prisma.event.create({
    data: {
      organizerId: admin.id,
      title: 'Neon Horizon Music Festival',
      description: 'An immersive 2-night electronic soundscape featuring world-renowned DJs, laser visualizers, and interactive art installations.',
      venue: 'Skyline Open Air Arena, Austin, TX',
      date: '2026-11-20',
      startTime: '07:00 PM',
      endTime: '03:00 AM',
      bannerImage: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=1200',
      status: 'PUBLISHED',
      categories: {
        create: [
          { name: 'Early Bird Tier', price: 75.0, totalCapacity: 300, ticketsSold: 150 },
          { name: 'Backstage VIP Access', price: 450.0, totalCapacity: 20, ticketsSold: 8 },
        ],
      },
    },
  });

  const event3 = await prisma.event.create({
    data: {
      organizerId: admin.id,
      title: 'Modern Architecture & Design Expo',
      description: 'Explore sustainable building innovations, smart urban planning, and interior design trends with leading global architects.',
      venue: 'Design Center Exhibit Hall, Chicago, IL',
      date: '2026-12-05',
      startTime: '10:00 AM',
      endTime: '05:00 PM',
      bannerImage: 'https://images.unsplash.com/photo-1511578314322-379afb476865?w=1200',
      status: 'PUBLISHED',
      categories: {
        create: [
          { name: 'Day Pass', price: 40.0, totalCapacity: 200, ticketsSold: 10 },
        ],
      },
    },
  });

  console.log('✅ Seeding completed!');
  console.log('🔑 Credentials:');
  console.log('   Admin: admin@eventhub.com / password123');
  console.log('   Customer 1: john@example.com / password123');
  console.log('   Customer 2: emma@example.com / password123');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
