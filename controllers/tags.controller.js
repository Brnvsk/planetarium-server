const db = require('../config/my-sql.config')
const { handleError } = require('../helpers/common.helper')

class TagsController {

	create = async (req, res) => {
		const { name } = req.body

		try {
			const values = [name]

			const [created] = await db.query('INSERT into news_tags (name) values (?)', [values])
			if (!created) {
				handleError(res, 'create tag')
			}

			const [inserted] = await db.query('SELECT * from news_tags where id = ?', created.insertId)

			return res.status(200).json({
				origin: 'create tag',
				created: inserted[0]
			})
		} catch (error) {
			handleError(res, 'create tag', error)
		}
	}

	update = async (req, res) => {
		const { name } = req.body.update
		const { id } = req.params

		try {
			const values = [name, id]

			await db.query(`UPDATE news_tags SET
				name = ?
				where id = ?
			`, values)

			const [[updated]] = await db.query('SELECT * from news_tags where id = ?', id)

			return res.status(200).json({
				origin: 'update tag',
				updated
			})
		} catch (error) {
			handleError(res, 'update tag', error)
		}
	}

	delete = async (req, res) => {
		const { id } = req.params

		try {
			const deleted = await db.query(`DELETE from news_tags where id = ?`, [id])

			return res.status(200).json({
				origin: 'delete tag',
				deleted
			})
		} catch (error) {
			handleError(res, 'delete tag', error)
		}
	}
    
	_insertUserTags = async (userId, tags) => {
		if (tags.length === 0) {
			throw new Error('Nothing to insert')
		}
		
		const values = tags.map(t => [userId, t])

		const [inserted] = await db.query('INSERT into users_tags (user_id, tag_id) values ?', [values])

		if (!inserted) {
			return []
		}

		const userTags = await db.query('select * from news_tags where id IN (?)', [tags])
		return userTags
	}

	_getUserTags = async (userId) => {
		const [tagsIds] = await db.query('select tag_id from users_tags where user_id = ?', [userId])
		if (!tagsIds || tagsIds.length === 0) {
			return []
		}

		const [tags] = await db.query('select * from news_tags where id IN (?)', [tagsIds.map(t => t.tag_id)])
    	return tags;
	}

	_updateUserTags = async (userId, newTags) => {
		const deleted = await this._deleteUserTags(userId)

		if (newTags.length === 0) {
			return []
		}

		const [inserted] = await this._insertUserTags(userId, newTags)

		return inserted
	}

	_deleteUserTags = async (userId) => {
		const [deleted] = await db.query('delete from users_tags where user_id = ?', [userId])

		return deleted
	}

	_getUserNews = async (userId) => {
		const userTags = await this._getUserTags(userId)

		if (userTags.length === 0) {
			return []
		}
		const tagsIds = userTags.map(t => t.id)
		let [newsIds] = await db.query('select news_id from news_tags_join where tag_id IN (?)', [tagsIds])
		newsIds = newsIds.map(it => it.news_id)
		newsIds = [...new Set(newsIds)]

		const result = []
		for (const it of newsIds) {
			const [newsItems] = await db.query('select * from news where id = ?', [it])
			const [newsTags] = await db.query('select * from news_tags_join where news_id = ?', newsItems[0].id)
			const [tags] = await db.query('select * from news_tags where id IN (?)', [newsTags.map(it => it.tag_id)])
			result.push({
				...newsItems[0],
				text: newsItems[0].text.split(/[\r\n]+/),
				tags,
			})
		}

		return result;
	}

}

const controller = new TagsController()
module.exports = controller