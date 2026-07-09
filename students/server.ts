import express from 'express'
import next from 'next'
import apiRouter from './src/backend/index'

const dev = process.env.NODE_ENV !== 'production'
const app = next({ dev })
const handle = app.getRequestHandler()
const port = process.env.PORT || 3000

app.prepare().then(() => {
  const server = express()

  server.use(express.json())
  server.use(express.urlencoded({ extended: true }))

  // Mount backend API routes
  server.use('/api', apiRouter)

  // Delegate all UI/Page requests to Next.js handler
  server.all(/.*/, (req, res) => {
    return handle(req, res)
  })

  server.listen(port, () => {
    console.log(`> AI-COS System Ready on http://localhost:${port}`)
  })
}).catch((ex) => {
  console.error(ex.stack)
  process.exit(1)
})
