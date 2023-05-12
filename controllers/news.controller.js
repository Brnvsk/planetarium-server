const db = require('../config/my-sql.config')

class NewsController {
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