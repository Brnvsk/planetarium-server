const { Router } = require('express')
const userController = require('../controllers/user.controller')

const router = Router()

router.post('/register', userController.register)
router.post('/login/token', userController.getUserByToken)
router.post('/login', userController.login)

router.patch('/:id', userController.update)

module.exports = router