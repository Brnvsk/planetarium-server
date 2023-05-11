const express = require('express');
const { Router } = require('express');
const cors = require('cors');

const userRouter = require('./routes/user.router')
const newsRouter = require('./routes/news.router')
const showsRouter = require('./routes/shows.router')
const bookingRouter = require('./routes/booking.router')
const uploadRouter = require('./routes/upload.router')

const app = express()
app.use(cors())
app.use(express.json())
app.use(express.static('public'))

const apiRouter = Router()

apiRouter.use('/users', userRouter)
apiRouter.use('/news', newsRouter)
apiRouter.use('/shows', showsRouter)
apiRouter.use('/booking', bookingRouter)
apiRouter.use('/upload', uploadRouter)

app.use('/api', apiRouter)

app.listen(5050, () => {
    console.log('Server is working...');
})