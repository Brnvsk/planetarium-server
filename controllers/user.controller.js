const db = require('../config/my-sql.config');
const { handleError } = require('../helpers/common.helper');
const tagsController = require('./tags.controller')

class UserController {

    getUserByToken = async(req, res) => {
        const { token } = req.body;

        try {
            const [rows] = await db.query('select * from users where email = ?', [token])

            if (!rows) {
                return res.status(204).json({
                    user: null,
                    message: 'No user found by token provided.'
                })
            }
            const user = rows[0]

            user.tags = await getUserTags(user.id)

            return res.status(200).json({
                user,
                message: 'User found.'
            })
        } catch (error) {
            return res.status(500).json({
                error,
                message: 'Error getting user by token.'
            })
        }
    }

    login = async(req, res, next) => {
        const { user } = req.body
        const { email, password } = user

        try {
            const [rows] = await db.query('select * from users where email = ?', [email])

            if (rows.length === 0) {
                return res.status(404).json({
                    message: 'No user found with such email.'
                })
            }

            const data = rows[0]
            const userTags = await getUserTags(data.id)
            
            data.tags = userTags

            return res.status(200).json({
                user: data,
                message: 'Success login'
            })
        } catch (error) {
            return res.status(500).json({
                error,
                message: 'Error login user.'
            })
        }
    }

    register = async(req, res) => {
        const { user } = req.body
        const { email, login, password, avatarId, tags } = user
        const values = [email, login, password, avatarId]

        try {
            const [rows] = await db.query('INSERT INTO users (email, login, password, avatar_id) values (?)', [values], true)
            const insertId = rows.insertId

            if (!insertId) {
                return handleError(res, 'Error inserting user')
            }

            const [userTags] = await tagsController._insertUserTags(insertId, tags)

            const [user] = await db.query('select * from users where id = ?', [insertId])

            user[0].tags = userTags

            return res.status(200).json({
                data: user[0],
                message: 'Success registration'
            })
        } catch (error) {
            return res.status(500).json({
                error,
                message: 'Error registering user.'
            })
        }
    }

    update = async (req, res) => {
        const { update } = req.body
        const { id } = req.params

        try {
            let [[user]] = await db.query('select * from users where id = ?', [id])

            if (!user) {
                return handleError(res, 'User not found.', error, 304)
            }
            
            user = {
                ...user,
                ...update
            }

            const { tags } = user

            user.tags = await tagsController._updateUserTags(id, tags)

            return res.status(200).json({
                message: 'Updated',
                updated: user,
            })
        } catch (error) {
            return handleError(res, 'Error update user.', error)
        }
    }

    getUserNews = async (req, res) => {
        const { id } = req.params

        try {
            const news = await tagsController._getUserNews(id)

            return res.status(200).json({
                message: 'Get user news',
                data: news
            })
            
        } catch (error) {
            return handleError(res, 'Error get user news.', error)
        }
    }
}

async function getUserTags(id) {
    return await tagsController._getUserTags(id)
}

const controller = new UserController()
module.exports = controller