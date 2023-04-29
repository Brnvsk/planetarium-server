const { Router } = require('express')
const newsController = require('../controllers/news.controller')

const router = Router()

router.get('/tags', newsController.getTags)

module.exports = router