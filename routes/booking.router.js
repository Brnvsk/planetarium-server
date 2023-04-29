const { Router } = require('express')
const bookingController = require('../controllers/booking.controller')

const router = Router()

router.post('/', bookingController.save)
router.get('/bookings/:showId', bookingController.getBookings)

module.exports = router