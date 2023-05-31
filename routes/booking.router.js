const { Router } = require('express')
const bookingController = require('../controllers/booking.controller')

const router = Router()

router.post('/', bookingController.save)
router.delete('/:id', bookingController.delete)
router.get('/admin/all', bookingController.getAdminBookings)
router.get('/:showId', bookingController.getShowBooking)
router.get('/user/:userId', bookingController.getUserBookings)

router.get('/qr/:id', bookingController.getBookingInfo)

module.exports = router