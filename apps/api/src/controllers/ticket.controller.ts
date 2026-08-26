import { Request, Response } from 'express';
import { prisma } from '../db/prisma';
import { AuthRequest } from '../middleware/auth';
import { TicketService } from '../services/ticket.service';

export class TicketController {
  // Download formatted PDF e-ticket
  static async downloadTicketPDF(req: Request, res: Response) {
    try {
      const { ticketId } = req.params;

      const ticket = await prisma.ticket.findUnique({
        where: { id: ticketId },
        include: {
          bookingItem: {
            include: {
              ticketCategory: true,
              booking: {
                include: {
                  user: true,
                  event: true,
                },
              },
            },
          },
        },
      });

      if (!ticket) {
        return res.status(404).json({ success: false, message: 'Ticket not found' });
      }

      const bookingItem = ticket.bookingItem;
      const booking = bookingItem.booking;

      const pdfStream = await TicketService.generateTicketPDFStream({
        ticketCode: ticket.ticketCode,
        eventName: booking.event.title,
        venue: booking.event.venue,
        eventDate: `${booking.event.date} (${booking.event.startTime} - ${booking.event.endTime})`,
        categoryName: bookingItem.ticketCategory.name,
        customerName: booking.user.name,
        customerEmail: booking.user.email,
        price: bookingItem.unitPrice,
      });

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="ticket-${ticket.ticketCode}.pdf"`);

      pdfStream.pipe(res);
    } catch (err: any) {
      return res.status(500).json({ success: false, message: err.message });
    }
  }

  // Admin / Check-in Scanner Endpoint
  static async checkInTicket(req: AuthRequest, res: Response) {
    try {
      const { ticketCode } = req.body;

      if (!ticketCode) {
        return res.status(400).json({ success: false, message: 'Ticket code required' });
      }

      const ticket = await prisma.ticket.findUnique({
        where: { ticketCode: String(ticketCode).trim() },
        include: {
          bookingItem: {
            include: {
              ticketCategory: true,
              booking: {
                include: { user: true, event: true },
              },
            },
          },
        },
      });

      if (!ticket) {
        return res.status(404).json({ success: false, message: 'Invalid Ticket Code: Ticket not found' });
      }

      if (ticket.isCheckedIn) {
        return res.status(400).json({
          success: false,
          message: `Ticket already checked in at ${ticket.checkedInAt?.toLocaleString()}`,
          data: { ticket },
        });
      }

      const updated = await prisma.ticket.update({
        where: { id: ticket.id },
        data: {
          isCheckedIn: true,
          checkedInAt: new Date(),
        },
      });

      return res.json({
        success: true,
        message: 'Ticket checked in successfully! Valid admission.',
        data: {
          ticket: updated,
          attendee: ticket.bookingItem.booking.user.name,
          event: ticket.bookingItem.booking.event.title,
          category: ticket.bookingItem.ticketCategory.name,
        },
      });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: err.message });
    }
  }
}
