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
            const { id } = req.params
            const [rows, fields] = await db.execute(`select * from shows where id = ${id}`)

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

    create = async (req, res) => {
        const { title, descr, price, posterPath, director, country } = req.body

        try {
            const values = [title, descr, price, posterPath, director, country]
            const inserted = await db.query(
                `INSERT into shows (title, descr, price, poster_src, director, country) values (?)`, 
                [values]
            )
            
            let created = null
            const insertId = inserted[0].insertId
            if (insertId) {
                created = (await db.query('SELECT * from shows where id = ?', insertId))[0]
            }

            if (!created) {
                return handleError(res, 'Cannot get newly inserted item')
            }

            return res.status(200).json({
                message: 'Created new show',
                created: created[0],
            })
        } catch (error) {
            return handleError(res, 'Error create show.', error)
        }
    }

    update = async (req, res) => {
        const { id } = req.params
        const { update } = req.body

        update.poster_src = update.posterPath

        try {
            const [show] = await db.query('SELECT * from shows where id = ?', id)

            const { title, descr, price, tags, poster_src  } = {
                ...show[0],
                ...update,
            }

            await db.query(`UPDATE shows SET
                title = ?,
                descr = ?,
                price = ?,
                tags = ?,
                poster_src = ?
                where id = ${id}
                `, [title, descr, price, tags, poster_src])

            const [updated] = await db.query('SELECT * from shows where id = ?', id)

            return res.status(200).json({
                message: 'Updated show',
                updated: updated[0],
            })

        } catch (error) {
            return handleError(res, 'Error update show.', error)
        }
    }

    delete = async (req, res) => {
        const { id } = req.params

        try {
            const [deleted] = await db.query('DELETE from shows where id = ?', id)

            return res.status(200).json({
                message: 'Deleted show',
                deleted,
            })
        } catch (error) {
            return handleError(res, 'Error delete show.', error)
        }
    }
}

const controller = new ShowsController()
module.exports = controller