import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import { authRouter } from './routes/auth.js'
import { championshipsRouter } from './routes/championships.js'
import { playersRouter } from './routes/players.js'
import { scoresRouter } from './routes/scores.js'
import { rankingRouter } from './routes/ranking.js'

const app = express()

const allowedOrigins = process.env.FRONTEND_URL
  ? process.env.FRONTEND_URL.split(',').map((o) => o.trim())
  : true

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  })
)
app.use(express.json())

app.use('/api/auth', authRouter)
app.use('/api/championships', championshipsRouter)
app.use('/api/players', playersRouter)
app.use('/api/scores', scoresRouter)
app.use('/api/ranking', rankingRouter)

const PORT = Number(process.env.PORT) || 3001
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on http://0.0.0.0:${PORT}`)
})
