const db = require('../config/my-sql.config')
const { handleError } = require('../helpers/common.helper')

class BookingController {

    save = async(req, res) => {
        const { date, time, showId, places } = req.body
        let { userId, email } = req.body
        if (!showId) {
            return handleError(res, 'No show id was provided.')
        }

        if (!userId && !email) {
            return handleError(res, 'No user id or email was provided.')
        }

        userId = userId ? userId : null
        email = email ? email : null

        const value = [showId, date, time, email, userId, places]

        try {
            const conn = await db;
            const [saved] = await conn.query('INSERT INTO bookings (show_id, date, time, email, user_id, places) values (?)', [value], true)

            return res.status(200).json({
                message: 'Booking saved',
                bookingid: saved.insertId
            })

        } catch (error) {
            handleError(res, 'Error saving booking.', error)
        }
    }

    getBookings = async(req, res) => {
        const { showId } = req.params

        try {
            const conn = await db
            const [bookings] = await conn.query('select * from bookings where show_id = ?', [showId])

            return res.status(200).json({
                message: 'Get bookings',
                data: bookings,
            })

        } catch (error) {
            handleError(res, 'Error saving booking.', error)
        }
    }
}

const controller = new BookingController()
module.exports = controller