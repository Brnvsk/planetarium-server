const db = require('../config/my-sql.config')

class UserController {

    getUserByToken = async(req, res) => {
        const { token } = req.body;

        try {
            const [rows] = await (await db).query('select * from users where email = ?', [token])

            if (rows.length === 0) {
                return res.status(204).json({
                    user: null,
                    message: 'No user found by token provided.'
                })
            }

            return res.status(200).json({
                user: formatUserObject(rows[0]),
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
            console.log(rows[0]);

            return res.status(200).json({
                user: formatUserObject(rows[0]),
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
            const conn = await db;
            const [rows] = await conn.query('INSERT INTO users (email, login, password, avatar_id, news_tags) values (?)', [values], true)

            const [user] = await conn.execute('select * from users where email = ?', [email])

            return res.status(200).json({
                data: formatUserObject(user[0]),
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
    const { email, login, id, } = user
    try {
        return {
            id,
            email,
            login,
            avatarId: user.avatar_id,
            interests: user.news_tags,
        }
    } catch (error) {
        console.log('Error formatting user');
        return null
    }
}

const controller = new UserController()
module.exports = controller