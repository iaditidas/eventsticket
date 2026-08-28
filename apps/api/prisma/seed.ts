import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding EventHub Database with 5 Events (₹500 Ticket Price)...');

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

  // 5 Published Events with ₹500 ticket prices
  await prisma.event.create({
    data: {
      organizerId: admin.id,
      title: 'Global Tech & AI Summit 2026',
      description: 'Join industry pioneers, developers, and visionaries for keynotes, workshops, and technical deep-dives into autonomous AI systems.',
      venue: 'Palace Grounds, Bengaluru, India',
      date: '2026-10-15',
      startTime: '09:00 AM',
      endTime: '06:00 PM',
      bannerImage: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1200',
      status: 'PUBLISHED',
      categories: {
        create: [
          { name: 'General Admission', price: 500.0, totalCapacity: 500, ticketsSold: 42 },
          { name: 'VIP Pass (Includes Afterparty)', price: 500.0, totalCapacity: 100, ticketsSold: 12 },
        ],
      },
    },
  });

  await prisma.event.create({
    data: {
      organizerId: admin.id,
      title: 'Sunburn Neon EDM Music Festival',
      description: 'An immersive 2-night electronic soundscape featuring world-renowned DJs, laser visualizers, and interactive art installations.',
      venue: 'JLN Open Air Arena, New Delhi, India',
      date: '2026-11-20',
      startTime: '06:00 PM',
      endTime: '02:00 AM',
      bannerImage: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=1200',
      status: 'PUBLISHED',
      categories: {
        create: [
          { name: 'Early Bird Pass', price: 500.0, totalCapacity: 300, ticketsSold: 150 },
          { name: 'Fan Pit Pass', price: 500.0, totalCapacity: 50, ticketsSold: 8 },
        ],
      },
    },
  });

  await prisma.event.create({
    data: {
      organizerId: admin.id,
      title: 'International Food & Culinary Expo',
      description: 'Experience gourmet food tastings, live celebrity chef demonstrations, and artisan food stalls from across the globe.',
      venue: 'NESCO Exhibition Centre, Mumbai, India',
      date: '2026-12-05',
      startTime: '11:00 AM',
      endTime: '09:00 PM',
      bannerImage: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=1200',
      status: 'PUBLISHED',
      categories: {
        create: [
          { name: 'Gourmet Entry Ticket', price: 500.0, totalCapacity: 400, ticketsSold: 30 },
        ],
      },
    },
  });

  await prisma.event.create({
    data: {
      organizerId: admin.id,
      title: 'Modern Architecture & Urban Design Conclave',
      description: 'Explore sustainable building innovations, smart urban planning, and interior design trends with leading global architects.',
      venue: 'HITEX Exhibition Center, Hyderabad, India',
      date: '2026-12-18',
      startTime: '10:00 AM',
      endTime: '05:00 PM',
      bannerImage: 'https://images.unsplash.com/photo-1511578314322-379afb476865?w=1200',
      status: 'PUBLISHED',
      categories: {
        create: [
          { name: 'Delegate Pass', price: 500.0, totalCapacity: 250, ticketsSold: 15 },
        ],
      },
    },
  });

  await prisma.event.create({
    data: {
      organizerId: admin.id,
      title: 'Indie Rock & Jazz Live Concert',
      description: 'An unforgettable evening of live acoustic melodies, indie rock anthems, and soulful jazz performances under the stars.',
      venue: 'Chowdiah Memorial Hall, Bengaluru, India',
      date: '2027-01-10',
      startTime: '06:30 PM',
      endTime: '10:30 PM',
      bannerImage: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=1200',
      status: 'PUBLISHED',
      categories: {
        create: [
          { name: 'Auditorium Pass', price: 500.0, totalCapacity: 200, ticketsSold: 25 },
        ],
      },
    },
  });

  console.log('✅ Seeding completed! 5 Events created with ₹500 ticket prices.');
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
