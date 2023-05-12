const { Router } = require('express')
const newsController = require('../controllers/news.controller')

const router = Router()

router.get('/', newsController.getAll)
router.post('/', newsController.create)
router.patch('/:id', newsController.update)
router.delete('/:id', newsController.delete)
router.get('/tags', newsController.getTags)

module.exports = router