import { Request, Response } from 'express';
import { prisma } from '../db/prisma';
import { AuthRequest } from '../middleware/auth';

export class EventController {
  // Public listing: search, date filter, venue filter, published only
  static async getEvents(req: Request, res: Response) {
    try {
      const { search, venue, date, page = '1', limit = '10' } = req.query;
      const skip = (Number(page) - 1) * Number(limit);

      const where: any = {
        status: 'PUBLISHED',
      };

      if (search) {
        where.OR = [
          { title: { contains: String(search) } },
          { description: { contains: String(search) } },
        ];
      }

      if (venue) {
        where.venue = { contains: String(venue) };
      }

      if (date) {
        where.date = String(date);
      }

      const [events, total] = await Promise.all([
        prisma.event.findMany({
          where,
          include: {
            categories: true,
          },
          orderBy: { date: 'asc' },
          skip,
          take: Number(limit),
        }),
        prisma.event.count({ where }),
      ]);

      return res.json({
        success: true,
        data: {
          events,
          pagination: {
            total,
            page: Number(page),
            limit: Number(limit),
            pages: Math.ceil(total / Number(limit)),
          },
        },
      });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: err.message });
    }
  }

  // Get single event detail with categories
  static async getEventById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const event = await prisma.event.findUnique({
        where: { id },
        include: {
          categories: true,
          organizer: { select: { id: true, name: true, email: true } },
        },
      });

      if (!event) {
        return res.status(404).json({ success: false, message: 'Event not found' });
      }

      return res.json({ success: true, data: { event } });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: err.message });
    }
  }

  // Admin: Create Event with Categories
  static async createEvent(req: AuthRequest, res: Response) {
    try {
      const { title, description, venue, date, startTime, endTime, bannerImage, categories } = req.body;

      if (!title || !venue || !date) {
        return res.status(400).json({ success: false, message: 'Title, venue, and date are required' });
      }

      const newEvent = await prisma.event.create({
        data: {
          organizerId: req.user!.id,
          title,
          description: description || '',
          venue,
          date,
          startTime: startTime || '09:00',
          endTime: endTime || '17:00',
          bannerImage: bannerImage || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1200',
          status: 'PUBLISHED',
          categories: {
            create: Array.isArray(categories)
              ? categories.map((cat: any) => ({
                  name: cat.name,
                  price: Number(cat.price),
                  totalCapacity: Number(cat.totalCapacity),
                  ticketsSold: 0,
                }))
              : [
                  { name: 'General', price: 50, totalCapacity: 100, ticketsSold: 0 },
                  { name: 'VIP', price: 150, totalCapacity: 25, ticketsSold: 0 },
                ],
          },
        },
        include: { categories: true },
      });

      return res.status(201).json({ success: true, data: { event: newEvent } });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: err.message });
    }
  }

  // Admin: Update Event
  static async updateEvent(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const { title, description, venue, date, startTime, endTime, bannerImage, status } = req.body;

      const updated = await prisma.event.update({
        where: { id },
        data: {
          title,
          description,
          venue,
          date,
          startTime,
          endTime,
          bannerImage,
          status,
        },
        include: { categories: true },
      });

      return res.json({ success: true, data: { event: updated } });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: err.message });
    }
  }

  // Admin: Soft delete / Cancel Event
  static async deleteEvent(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const updated = await prisma.event.update({
        where: { id },
        data: { status: 'CANCELLED' },
      });

      return res.json({ success: true, message: 'Event status updated to CANCELLED', data: { event: updated } });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: err.message });
    }
  }
}
