import { Router } from 'express';
import { BookingController } from '../controllers/booking.controller';
import { authenticateToken } from '../middleware/auth';

const router = Router();

router.use(authenticateToken);

router.post('/', BookingController.createBooking);
router.get('/confirm', BookingController.confirmPayment);
router.get('/my-bookings', BookingController.getCustomerBookings);
router.get('/success', BookingController.handleSuccessRedirect);
router.get('/cancel', (req, res) => {
  const clientUrl = req.headers.origin || process.env.CLIENT_URL || 'http://localhost:3000';
  res.redirect(`${clientUrl}/events`);
});

export default router;
