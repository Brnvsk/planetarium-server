const { format } = require('date-fns')
const db = require('../config/my-sql.config')
const { handleError } = require('../helpers/common.helper')
const { sendEmail } = require('../helpers/mail.helper')
const { dateFormat } = require('../config/common')

class BookingController {

    save = async(req, res) => {
        const { time, showId, places, address } = req.body
        let { date } = req.body
        let { userId, email } = req.body
        if (!showId) {
            return handleError(res, 'No show id was provided.')
        }

        if (!userId && !email) {
            return handleError(res, 'No user id or email was provided.')
        }

        userId = userId ? userId : null
        email = email ? email : null
        
        date = format(new Date(date), dateFormat)
        const [session] = await db.query('SELECT * from shows_slots where show_id = ? AND date = ? AND time = ? AND address = ?', [showId, date, time, address])

        if (!session[0] || !session[0].id) {
            return res.status(404).json({
                message: 'No such session for passed session info.'
            })
        }

        const sessionId = session[0].id

        const value = [sessionId, email, userId, JSON.stringify(places)]

        try {
            const conn = await db;
            const [saved] = await conn.query('INSERT INTO bookings (session_id, email, user_id, places) values (?)', [value], true)

            // if (saved.insertId) {
            //     this.sendBookingEmail(conn, email, userId, showId, places)
            // }

            return res.status(200).json({
                message: 'Booking saved',
                bookingId: saved.insertId
            })

        } catch (error) {
            handleError(res, 'Error saving booking.', error)
        }
    }

    getBookings = async(req, res) => {
        const { showId } = req.params

        try {
            const [showSessions] = await db.query('SELECT * from shows_slots where show_id = ?', showId)
            
            const ids = showSessions.map(session => session.id)

            let [bookings] = await db.query('select * from bookings as b inner join shows_slots as shs on b.session_id = shs.id where session_id IN (?)', [ids])
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
            handleError(res, 'Error get bookings.', error)
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