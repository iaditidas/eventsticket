import { Response } from 'express';
import { prisma } from '../db/prisma';
import { AuthRequest } from '../middleware/auth';

export class AdminController {
  // Sales Dashboard Stats & Visual Progress
  static async getDashboardStats(req: AuthRequest, res: Response) {
    try {
      const [totalEvents, totalBookings, categories, bookings] = await Promise.all([
        prisma.event.count({ where: { status: { not: 'CANCELLED' } } }),
        prisma.booking.count({ where: { status: 'CONFIRMED' } }),
        prisma.ticketCategory.findMany({
          include: { event: { select: { title: true } } },
        }),
        prisma.booking.findMany({
          where: { status: 'CONFIRMED' },
          select: { totalAmount: true, createdAt: true },
        }),
      ]);

      const totalRevenue = bookings.reduce((sum, b) => sum + b.totalAmount, 0);
      const totalTicketsSold = categories.reduce((sum, c) => sum + c.ticketsSold, 0);

      const categoryBreakdown = categories.map((c) => ({
        eventName: c.event.title,
        categoryName: c.name,
        sold: c.ticketsSold,
        capacity: c.totalCapacity,
        revenue: c.ticketsSold * c.price,
      }));

      // Timeline aggregation by date
      const timelineMap: Record<string, { revenue: number; tickets: number }> = {};
      bookings.forEach((b) => {
        const dateKey = new Date(b.createdAt).toISOString().split('T')[0];
        if (!timelineMap[dateKey]) {
          timelineMap[dateKey] = { revenue: 0, tickets: 0 };
        }
        timelineMap[dateKey].revenue += b.totalAmount;
        timelineMap[dateKey].tickets += 1;
      });

      const salesTimeline = Object.entries(timelineMap).map(([date, data]) => ({
        date,
        revenue: data.revenue,
        tickets: data.tickets,
      }));

      return res.json({
        success: true,
        data: {
          totalRevenue,
          totalEvents,
          totalBookings,
          totalTicketsSold,
          categoryBreakdown,
          salesTimeline,
        },
      });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: err.message });
    }
  }

  // View All Master Bookings
  static async getMasterBookings(req: AuthRequest, res: Response) {
    try {
      const { status, eventId } = req.query;
      const where: any = {};

      if (status) where.status = String(status);
      if (eventId) where.eventId = String(eventId);

      const bookings = await prisma.booking.findMany({
        where,
        include: {
          user: { select: { id: true, name: true, email: true } },
          event: { select: { id: true, title: true, date: true, venue: true } },
          items: {
            include: {
              ticketCategory: true,
              tickets: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      });

      return res.json({ success: true, data: { bookings } });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: err.message });
    }
  }

  // Cancel/Refund Booking & Release Capacity
  static async cancelBooking(req: AuthRequest, res: Response) {
    try {
      const { bookingId } = req.params;

      const booking = await prisma.booking.findUnique({
        where: { id: bookingId },
        include: { items: true },
      });

      if (!booking) {
        return res.status(404).json({ success: false, message: 'Booking not found' });
      }

      if (booking.status === 'CANCELLED') {
        return res.status(400).json({ success: false, message: 'Booking is already cancelled' });
      }

      // Execute transaction to release capacity
      await prisma.$transaction(async (tx) => {
        if (booking.status === 'CONFIRMED') {
          for (const item of booking.items) {
            await tx.ticketCategory.update({
              where: { id: item.ticketCategoryId },
              data: { ticketsSold: { decrement: item.quantity } },
            });
          }
        }

        await tx.booking.update({
          where: { id: booking.id },
          data: { status: 'CANCELLED' },
        });

        await tx.payment.updateMany({
          where: { bookingId: booking.id },
          data: { status: 'REFUNDED' },
        });
      });

      return res.json({ success: true, message: 'Booking cancelled & capacity released successfully.' });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: err.message });
    }
  }

  // View Customer Roster & Spend Summary
  static async getCustomersRoster(req: AuthRequest, res: Response) {
    try {
      const customers = await prisma.user.findMany({
        where: { role: 'CUSTOMER' },
        select: {
          id: true,
          name: true,
          email: true,
          createdAt: true,
          bookings: {
            where: { status: 'CONFIRMED' },
            select: { totalAmount: true },
          },
        },
      });

      const formatted = customers.map((c) => ({
        id: c.id,
        name: c.name,
        email: c.email,
        createdAt: c.createdAt,
        totalBookings: c.bookings.length,
        totalSpend: c.bookings.reduce((sum, b) => sum + b.totalAmount, 0),
      }));

      return res.json({ success: true, data: { customers: formatted } });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: err.message });
    }
  }
}
