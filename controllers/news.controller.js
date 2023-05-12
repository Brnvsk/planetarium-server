const db = require('../config/my-sql.config')
const { handleError } = require('../helpers/common.helper')

class NewsController {

    getAll = async (req, res) => {
        try {
            let [news] = await db.query('SELECT * from news')
            const [tags] = await db.query('SELECT * from news_tags')

            news = news.map(item => {
                const tagsArr = item.tags.split('-').map(tagId => tags.find(t => t.id === Number(tagId))).filter(Boolean)

                return {
                    ...item,
                    tags: tagsArr,
                    text: item.text.split(/[\r\n]+/),
                }
            })

            return res.status(200).json({
                message: 'Get all news',
                data: news
            })
        } catch (error) {
            return handleError(res, 'Get all news')
        }
    }

    create = async (req, res) => {
        let { title, text, photo, tags } = req.body

        tags = Array.isArray(tags) ? tags.join('-') : tags

        try {
            const values = [title, text, photo, tags]
            const inserted = await db.query(
                `INSERT into news (title, text, photo, tags) values (?)`, 
                [values]
            )
            
            let created = null
            const insertId = inserted[0].insertId
            if (insertId) {
                created = (await db.query('SELECT * from news where id = ?', insertId))[0]
            }

            if (!created) {
                return handleError(res, 'Cannot get newly inserted item')
            }

            const data = {
                ...created[0],
                text: created[0].text.split(/[\r\n]+/),
            }

            return res.status(200).json({
                message: 'Created news item',
                created: data,
            })
        } catch (error) {
            return handleError(res, 'Error create news.', error)
        }
    }

    update = async (req, res) => {
        const { id } = req.params
        const { update } = req.body

        try {
            const [item] = await db.query('SELECT * from news where id = ?', id)

            const { title, text, photo, tags } = {
                ...item[0],
                ...update,
            }

            await db.query(`UPDATE news SET
                title = ?,
                text = ?,
                photo = ?,
                tags = ?
                where id = ?
                `, [title, text, photo, tags, id])

            const [updated] = (await db.query('SELECT * from news where id = ?', id))[0]


            const data = {
                ...updated,
                text: updated.text.split(/[\r\n]+/),
            }

            return res.status(200).json({
                message: 'Updated news',
                updated: data,
            })

        } catch (error) {
            return handleError(res, 'Error update news.', error)
        }
    }

    delete = async (req, res) => {
        const { id } = req.params

        try {
            const [deleted] = await db.query('DELETE from news where id = ?', id)

            return res.status(200).json({
                message: 'Deleted news item',
                deleted,
            })
        } catch (error) {
            return handleError(res, 'Error delete news item.', error)
        }
    }

    getTags = async(req, res) => {
        try {
            const [rows, fields] = await db.execute('select * from news_tags', )

            return res.status(200).json({
                data: rows,
                message: 'Get categories success.'
            })
        } catch (error) {
            return res.status(500).json({
                message: 'Error get tags.'
            })
        }
    }
}

const controller = new NewsController()
module.exports = controller