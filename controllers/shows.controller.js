const db = require('../config/my-sql.config')
const { handleError } = require('../helpers/common.helper')

class ShowsController {
    getAll = async(req, res) => {
        try {
            const conn = await db;
            const [rows, fields] = await conn.execute('select * from shows')

            return res.status(200).json({
                data: rows,
                message: 'Success: Get shows.'
            })
        } catch (error) {
            return handleError(res, 'Error get shows.')
        }
    }

    getById = async(req, res) => {
        try {
            const conn = await db;
            const { id } = req.params
            const [rows, fields] = await conn.execute(`select * from shows where id = ${id}`)

            return res.status(200).json(rows[0])
        } catch (error) {
            return handleError(res, 'Error get shows.')
        }
    }

    getTimeslots = async(req, res) => {
        const { showId } = req.params

        try {
            const conn = await db;
            const [rows, fields] = await conn.execute('SELECT *, show_id as "showId" FROM shows_slots where show_id = ?', [showId])

            return res.status(200).json({
                data: rows,
                message: 'Success: Get show timeslots.'
            })
        } catch (error) {
            return handleError(res, 'Error get timeslost for show.')
        }
    }
}

const controller = new ShowsController()
module.exports = controller