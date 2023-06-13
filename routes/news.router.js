const { Router } = require('express')
const newsController = require('../controllers/news.controller')
const tagsController = require('../controllers/tags.controller')

const router = Router()

router.get('/', newsController.getAll)
router.post('/', newsController.create)
router.patch('/:id', newsController.update)
router.delete('/:id', newsController.delete)

router.get('/tags', newsController.getTags)
router.post('/tags', tagsController.create)
router.patch('/tags/:id', tagsController.update)
router.delete('/tags/:id', tagsController.delete)

module.exports = router