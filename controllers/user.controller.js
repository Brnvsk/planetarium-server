const db = require('../config/my-sql.config')

class UserController {

    getUserByToken = async(req, res) => {
        const { token } = req.body;

        try {
            const [rows] = await db.query('select * from users where email = ?', [token])

            if (rows.length === 0) {
                return res.status(204).json({
                    user: null,
                    message: 'No user found by token provided.'
                })
            }

            const [tags] = await db.query('select * from news_tags')

            let user = formatUserObject(rows[0])
            user.tags = formatUserTags(user, tags)

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
            const conn = await db
            const [rows, fields] = await conn.execute('select * from users where email = ?', [email])

            if (rows.length === 0) {
                return res.status(404).json({
                    user,
                    message: 'No user found with such email.'
                })
            }

            const [tags] = await db.query('select * from news_tags')

            let data = formatUserObject(rows[0])
            data.tags = formatUserTags(data, tags)

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

    register = async(req, res, next) => {
        const { user } = req.body
        const { email, login, password, avatarId, newsTags } = user
        const values = [email, login, password, avatarId, newsTags]

        try {
            const [rows] = await db.query('INSERT INTO users (email, login, password, avatar_id, news_tags) values (?)', [values], true)

            const [users] = await db.execute('select * from users where email = ?', [email])
            const [tags] = await db.query('select * from news_tags')

            let data = formatUserObject(users[0])
            data.tags = formatUserTags(data, tags)

            return res.status(200).json({
                data,
                message: 'Success registration'
            })
        } catch (error) {
            return res.status(500).json({
                error,
                message: 'Error registering user.'
            })
        }
    }
}

function formatUserObject(user) {
    const { email, login, id, role } = user
    try {
        return {
            id,
            email,
            login,
            avatarId: user.avatar_id,
            tags: user.news_tags,
            role,
        }
    } catch (error) {
        console.log('Error formatting user');
        return null
    }
}

function formatUserTags(user, tags) {
    return user.tags.split('-').map(tagId => tags.find(t => t.id === Number(tagId)))
}

const controller = new UserController()
module.exports = controller