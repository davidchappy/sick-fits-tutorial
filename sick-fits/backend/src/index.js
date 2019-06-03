const cookieParser = require('cookie-parser')
require('dotenv').config({ path: 'variables.env' })
const createServer = require('./createServer')
const db = require('./db')
const jwt = require('jsonwebtoken')

const server = createServer()

server.express.use(cookieParser())

// 1. Set user id token on every request (for logging in)
server.express.use((req, res, next) => {
  const { token } = req.cookies
  if (token) {
    const { userID } = jwt.verify(token, process.env.APP_SECRET)
    req.userID = userID
  }

  next()
})

// 2. Set user on every request
server.express.use(async (req, res, next) => {
  if (!req.userID) return next()

  const user = await db.query.user({
    where: { id: req.userID } },
    '{ id, permissions, email, name }'
  )
  if (user) req.user = user

  next()
})

server.start({
  cors: {
    credentials: true,
    origin: process.env.FRONTEND_URL
  },
}, details => {
  console.log(`Server is now running on port http:/localhost:${details.port}`)
})
