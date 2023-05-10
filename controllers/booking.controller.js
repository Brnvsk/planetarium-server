const db = require('../config/my-sql.config')
const { handleError } = require('../helpers/common.helper')

class BookingController {

    save = async(req, res) => {
        const { date, time, showId, places, address } = req.body
        let { userId, email } = req.body
        if (!showId) {
            return handleError(res, 'No show id was provided.')
        }

        if (!userId && !email) {
            return handleError(res, 'No user id or email was provided.')
        }

        userId = userId ? userId : null
        email = email ? email : null

        const value = [showId, date, time, address, email, userId, JSON.stringify(places)]

        try {
            const conn = await db;
            const [saved] = await conn.query('INSERT INTO bookings (show_id, date, time, address, email, user_id, places) values (?)', [value], true)

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
            let [bookings] = await conn.query('select * from bookings where show_id = ?', [showId])
            bookings = bookings.map(booking => {
                return {
                    ...booking,
                    places: JSON.parse(booking.places)
                }
            })
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