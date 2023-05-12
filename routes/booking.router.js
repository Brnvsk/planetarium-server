const { Router } = require('express')
const bookingController = require('../controllers/booking.controller')

const router = Router()

router.post('/', bookingController.save)
router.get('/admin/all', bookingController.getAdminBookings)
router.get('/:showId', bookingController.getShowBooking)

module.exports = router