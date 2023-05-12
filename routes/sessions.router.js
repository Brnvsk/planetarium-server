const { Router } = require('express')
const sessionsController = require('../controllers/sessions.controller')

const router = Router()

router.get('/', sessionsController.getAll)
// router.get('/:id', showsController.getById)

router.post('/', sessionsController.create)
router.patch('/:id', sessionsController.update)
router.delete('/:id', sessionsController.delete)

module.exports = router