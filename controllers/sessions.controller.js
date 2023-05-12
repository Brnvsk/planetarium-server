const db = require('../config/my-sql.config')
const { handleError } = require('../helpers/common.helper')

class SessionsController {
    
    getAll = async(req, res) => {
        try {
            const [rows, fields] = await db.execute('select date, time, address, sh.title, sh.id as show_id, shs.id as session_id from shows_slots as shs inner join shows as sh on shs.show_id = sh.id;')

            const data = rows.map(item => {
                return {
                    id: item.session_id,
                    date: item.date,
                    time: item.time,
                    address: item.address,
                    showId: item.show_id,
                    showTitle: item.title
                }
            })            

            return res.status(200).json({
                data,
                message: 'Success: Get sessions.'
            })
        } catch (error) {
            return handleError(res, 'Error get sessions.')
        }
    }

    create = async (req, res) => {
        const { showId, date, time, address } = req.body

        try {
            const values = [showId, date, time, address]

            const [existed] = await db.query(
                `SELECT * from shows_slots where show_id = ? AND date = ? AND time = ? AND address = ?`,
                values
            )

            if (existed[0] && existed[0].id) {
                return res.status(404).json({
                    message: 'Session already exists'
                })
            }

            const inserted = await db.query(
                `INSERT into shows_slots (show_id, date, time, address) values (?)`, 
                [values]
            )
            
            let created = null
            const insertId = inserted[0].insertId
            if (insertId) {
                created = (await db.query('SELECT * from shows_slots where id = ?', insertId))[0]
            }

            if (!created) {
                return handleError(res, 'Cannot get newly inserted item')
            }

            const data = created[0]
            data.showId = data.show_id

            return res.status(200).json({
                message: 'Created new show session',
                created: data,
            })
        } catch (error) {
            return handleError(res, 'Error create session.', error)
        }
    }

    update = async (req, res) => {
        const { id } = req.params
        const { update } = req.body

        update.show_id = update.showId
        
        try {
            const [session] = await db.query('SELECT * from shows_slots where id = ?', id)

            const { date, time, address } = {
                ...session[0],
                ...update,
            }

            const [existed] = await db.query(
                `SELECT * from shows_slots where date = ? AND time = ? AND address = ? AND id != ?`,
                [date, time, address, id]
            )

            if (existed[0] && existed[0].id) {
                return res.status(404).json({
                    message: 'Session already exists. You cannot make such update'
                })
            }

            await db.query(`UPDATE shows_slots SET
                date = ?,
                time = ?,
                address = ?
                where id = ?
                `, 
                [date, time, address, id]
            )

            const [updated] = await db.query('SELECT * from shows_slots where id = ?', id)

            updated[0].showId = updated[0].show_id

            const data = {
                ...updated[0],
                showId: updated[0].show_id
            }

            return res.status(200).json({
                message: 'Updated session',
                updated: data,
            })

        } catch (error) {
            return handleError(res, 'Error update session.', error)
        }
    }

    delete = async (req, res) => {
        const { id } = req.params

        try {
            const [deleted] = await db.query('DELETE from shows_slots where id = ?', id)

            return res.status(200).json({
                message: 'Deleted session',
                deleted,
            })
        } catch (error) {
            return handleError(res, 'Error delete session.', error)
        }
    }
}

const controller = new SessionsController()
module.exports = controller