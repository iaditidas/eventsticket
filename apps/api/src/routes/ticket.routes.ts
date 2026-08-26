import { Router } from 'express';
import { TicketController } from '../controllers/ticket.controller';
import { authenticateToken, requireRole } from '../middleware/auth';

const router = Router();

router.get('/:ticketId/pdf', TicketController.downloadTicketPDF);
router.post('/check-in', authenticateToken, requireRole('ADMIN'), TicketController.checkInTicket);

export default router;
