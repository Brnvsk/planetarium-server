const db = require('../config/my-sql.config')
const { handleError } = require('../helpers/common.helper')

class NewsController {

    getAll = async (req, res) => {

        try {
            let [news] = await db.query('SELECT * from news')

            for (const item of news) {
                item.tags = await getNewsTags(item.id)
                item.text = item.text.split(/[\r\n]+/)
            }

            return res.status(200).json({
                message: 'Get all news',
                data: news
            })
        } catch (error) {
            return handleError(res, 'Get all news', error)
        }
    }

    create = async (req, res) => {
        let { title, text, photo, tags } = req.body

        try {
            const values = [title, text, photo]
            const inserted = await db.query(
                `INSERT into news (title, text, photo) values (?)`, 
                [values]
            )
            const insertId = inserted[0].insertId
            
            let newsTags = []
            if (tags && tags.length > 0) {
                const tagsInserted = await insertNewsTags(insertId, tags)
                if (!tagsInserted) {
                    return handleError(res, 'Cannot save news tags.')
                }
                newsTags = tagsInserted.slice()
            }

            let created = null
            if (insertId != null) {
                created = (await db.query('SELECT * from news where id = ?', insertId))[0]
            }

            if (!created) {
                return handleError(res, 'Cannot get newly inserted item')
            }

            const data = {
                ...created[0],
                text: created[0].text.split(/[\r\n]+/),
                tags: newsTags
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
        const { tags } = update

        try {
            const [item] = await db.query('SELECT * from news where id = ?', id)

            const { title, text, photo } = {
                ...item[0],
                ...update,
            }

            await deleteNewsTags(id)

            await db.query(`UPDATE news SET
                title = ?,
                text = ?,
                photo = ?
                where id = ?
                `, [title, text, photo, id])

            const [updated] = (await db.query('SELECT * from news where id = ?', id))[0]
            if (!updated) {
                return handleError(res, 'Error update news.')
            }

            let tagsUpdate = []
            if (tags && tags.length > 0) {
                tagsUpdate = await insertNewsTags(id, tags)
            }

            const data = {
                ...updated,
                text: updated.text.split(/[\r\n]+/),
                tags: tagsUpdate
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

async function insertNewsTags(newsId, tags) {
    const newsTagsInsertData = tags.map(tagId => [Number(tagId), newsId])
    const [newsTagsInserted] = await db.query(
        `INSERT into news_tags_join (tag_id, news_id) values ?`, 
        [newsTagsInsertData]
    )

    if (!newsTagsInserted) {
        return []
    }

    return await getNewsTags(newsId)
}

async function getNewsTags(newsId) {
    const [tagsJoins] = await db.query('SELECT tag_id from news_tags_join where news_id = ?', [newsId])
    const tagsIds = tagsJoins.map(join => join.tag_id)
    if (tagsIds.length === 0) {
        return []
    }
    const [ tags ] = await db.query('select * from news_tags where id IN (?)', [tagsIds])
    return tags
}

async function deleteNewsTags(newsId) {
    const [deleted] = await db.query('delete from news_tags_join where news_id = ?', [newsId])

    return deleted
}

const controller = new NewsController()
module.exports = controller