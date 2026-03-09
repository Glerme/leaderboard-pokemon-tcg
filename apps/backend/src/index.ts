import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import { authRouter } from './routes/auth.js'
import { championshipsRouter } from './routes/championships.js'
import { playersRouter } from './routes/players.js'
import { scoresRouter } from './routes/scores.js'
import { rankingRouter } from './routes/ranking.js'

const app = express()
app.use(cors({ origin: true }))
app.use(express.json())

app.use('/api/auth', authRouter)
app.use('/api/championships', championshipsRouter)
app.use('/api/players', playersRouter)
app.use('/api/scores', scoresRouter)
app.use('/api/ranking', rankingRouter)

const PORT = process.env.PORT ?? 3000
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`)
})
