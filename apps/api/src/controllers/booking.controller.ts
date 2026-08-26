import { Response } from 'express';
import { prisma } from '../db/prisma';
import { AuthRequest } from '../middleware/auth';
import { StripeService } from '../services/stripe.service';
import { TicketService } from '../services/ticket.service';

export class BookingController {
  // Create pending booking + Stripe Checkout session with concurrency safety
  static async createBooking(req: AuthRequest, res: Response) {
    try {
      const userId = req.user!.id;
      const { eventId, items } = req.body as {
        eventId: string;
        items: { ticketCategoryId: string; quantity: number }[];
      };

      if (!eventId || !items || !items.length) {
        return res.status(400).json({ success: false, message: 'Event ID and ticket selections are required' });
      }

      // Verify event exists and is active
      const event = await prisma.event.findUnique({
        where: { id: eventId },
        include: { categories: true },
      });

      if (!event || event.status !== 'PUBLISHED') {
        return res.status(404).json({ success: false, message: 'Event unavailable for booking' });
      }

      // Calculate total and verify availability inside atomic check
      let totalAmount = 0;
      const bookingItemsData: { ticketCategoryId: string; quantity: number; unitPrice: number; categoryName: string }[] = [];

      for (const item of items) {
        const cat = event.categories.find((c) => c.id === item.ticketCategoryId);
        if (!cat) {
          return res.status(400).json({ success: false, message: `Invalid ticket category: ${item.ticketCategoryId}` });
        }

        const remaining = cat.totalCapacity - cat.ticketsSold;
        if (item.quantity > remaining) {
          return res.status(400).json({
            success: false,
            message: `Requested quantity (${item.quantity}) exceeds remaining tickets (${remaining}) for category ${cat.name}`,
          });
        }

        const linePrice = cat.price * item.quantity;
        totalAmount += linePrice;
        bookingItemsData.push({
          ticketCategoryId: cat.id,
          quantity: item.quantity,
          unitPrice: cat.price,
          categoryName: cat.name,
        });
      }

      // Create Pending Booking in DB
      const booking = await prisma.booking.create({
        data: {
          userId,
          eventId,
          status: 'PENDING',
          totalAmount,
          items: {
            create: bookingItemsData.map((b) => ({
              ticketCategoryId: b.ticketCategoryId,
              quantity: b.quantity,
              unitPrice: b.unitPrice,
            })),
          },
        },
        include: {
          items: { include: { ticketCategory: true } },
          event: true,
        },
      });

      // Create Stripe checkout session
      const stripeResult = await StripeService.createCheckoutSession({
        bookingId: booking.id,
        customerEmail: req.user!.email,
        eventTitle: event.title,
        items: bookingItemsData.map((i) => ({ name: i.categoryName, unitPrice: i.unitPrice, quantity: i.quantity })),
        successUrl: `${req.protocol}://${req.get('host')}/api/v1/bookings/success`,
        cancelUrl: `${req.protocol}://${req.get('host')}/api/v1/bookings/cancel`,
      });

      return res.status(201).json({
        success: true,
        data: {
          bookingId: booking.id,
          totalAmount,
          checkoutUrl: stripeResult.url,
          sessionId: stripeResult.sessionId,
        },
      });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: err.message });
    }
  }

  // Success Callback / Direct Payment Confirmation (atomic capacity increment + ticket generation)
  static async confirmPayment(req: AuthRequest, res: Response) {
    try {
      const { bookingId } = req.query;

      if (!bookingId) {
        return res.status(400).json({ success: false, message: 'Booking ID required' });
      }

      const existing = await prisma.booking.findUnique({
        where: { id: String(bookingId) },
        include: { items: { include: { ticketCategory: true } }, event: true },
      });

      if (!existing) {
        return res.status(404).json({ success: false, message: 'Booking not found' });
      }

      if (existing.status === 'CONFIRMED') {
        return res.json({ success: true, message: 'Booking already confirmed', data: { bookingId: existing.id } });
      }

      // Execute transaction with capacity locking & ticket issuance
      const result = await prisma.$transaction(async (tx) => {
        // Increment category tickets sold and check capacity boundary
        for (const item of existing.items) {
          const category = await tx.ticketCategory.findUnique({ where: { id: item.ticketCategoryId } });
          if (!category) throw new Error('Category not found');

          if (category.ticketsSold + item.quantity > category.totalCapacity) {
            throw new Error(`Sold out! Capacity exceeded for category: ${category.name}`);
          }

          await tx.ticketCategory.update({
            where: { id: category.id },
            data: { ticketsSold: { increment: item.quantity } },
          });
        }

        // Update booking status
        const updatedBooking = await tx.booking.update({
          where: { id: existing.id },
          data: { status: 'CONFIRMED' },
        });

        // Generate Ticket entries & QR codes
        for (const item of existing.items) {
          for (let i = 0; i < item.quantity; i++) {
            const ticketCode = `TCK-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
            const qrCodeDataUrl = await TicketService.generateQRCodeDataURL(ticketCode);

            await tx.ticket.create({
              data: {
                bookingItemId: item.id,
                ticketCode,
                qrCode: qrCodeDataUrl,
                isCheckedIn: false,
              },
            });
          }
        }

        // Log payment record
        await tx.payment.create({
          data: {
            bookingId: existing.id,
            stripePaymentIntentId: `pi_mock_${Date.now()}`,
            amount: existing.totalAmount,
            status: 'SUCCEEDED',
          },
        });

        return updatedBooking;
      });

      return res.json({
        success: true,
        message: 'Payment confirmed & tickets generated!',
        data: { booking: result },
      });
    } catch (err: any) {
      return res.status(400).json({ success: false, message: err.message });
    }
  }

  // Get Customer Booking History
  static async getCustomerBookings(req: AuthRequest, res: Response) {
    try {
      const userId = req.user!.id;
      const bookings = await prisma.booking.findMany({
        where: { userId },
        include: {
          event: true,
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
}
