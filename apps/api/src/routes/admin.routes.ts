import { Router } from 'express';
import { AdminController } from '../controllers/admin.controller';
import { EventController } from '../controllers/event.controller';
import { authenticateToken, requireRole } from '../middleware/auth';

const router = Router();

router.use(authenticateToken, requireRole('ADMIN'));

// Events management
router.post('/events', EventController.createEvent);
router.put('/events/:id', EventController.updateEvent);
router.delete('/events/:id', EventController.deleteEvent);

// Admin dashboard & reports
router.get('/analytics', AdminController.getDashboardStats);
router.get('/bookings', AdminController.getMasterBookings);
router.post('/bookings/:bookingId/cancel', AdminController.cancelBooking);
router.get('/customers', AdminController.getCustomersRoster);

export default router;
