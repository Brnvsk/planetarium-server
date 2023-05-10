const { Router } = require('express')
const showsController = require('../controllers/shows.controller')

const router = Router()

router.get('/', showsController.getAll)
router.get('/:id', showsController.getById)
router.get('/timeslots/:showId', showsController.getTimeslots)

module.exports = router