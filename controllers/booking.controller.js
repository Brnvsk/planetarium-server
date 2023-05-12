const db = require('../config/my-sql.config')
const { handleError } = require('../helpers/common.helper')
const { sendEmail } = require('../helpers/mail.helper')

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

            if (saved.insertId) {
                this.sendBookingEmail(conn, email, userId, showId, places)
            }

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

    sendBookingEmail = async (conn, email, userId, showId, places) => {
        let emailAddr = ''
        try {
            if (email) {
                emailAddr = email
            } else {
                const [user] = await conn.query('SELECT * from users where id = ?', userId)
                emailAddr = user[0].email
            }
    
            const [ show ] = await conn.query('SELECT * from shows where id = ?', showId)
            console.log('send email to:', emailAddr);
            const placesStr = places.map(place => {
                return `${place.side === 'left' ? 'Слева' : 'Справа'}, ряд ${place.row}, место ${place.place}`
            }).join('; ')
    
            sendEmail({
                to: emailAddr,
                subject: `Ваши билеты на показ "${show[0].title}" успешно забронированы`,
                text: `Вы забронировали билеты на сеанс ${show[0].title}.
                Список мест:
                ${placesStr}
                `
            })
        } catch (error) {
            console.log('Error sending booking email', error);
        }
       
    }
}

const controller = new BookingController()
module.exports = controller