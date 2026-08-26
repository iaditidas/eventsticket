import { Router } from 'express';
import { BookingController } from '../controllers/booking.controller';
import { authenticateToken } from '../middleware/auth';

const router = Router();

router.use(authenticateToken);

router.post('/', BookingController.createBooking);
router.get('/confirm', BookingController.confirmPayment);
router.get('/my-bookings', BookingController.getCustomerBookings);

export default router;
