import { Router } from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { z } from 'zod'
import { prisma } from '../lib/prisma.js'
import type { AuthPayload } from '../middleware/auth.js'

const JWT_SECRET = process.env.JWT_SECRET ?? ''
const loginSchema = z.object({ email: z.string().email(), password: z.string().min(1) })

export const authRouter = Router()

authRouter.post('/login', async (req, res) => {
  const parsed = loginSchema.safeParse(req.body)
  if (!parsed.success) {
    res.status(400).json({ error: 'Email e senha obrigatórios' })
    return
  }
  const { email, password } = parsed.data
  const user = await prisma.user.findUnique({ where: { email } })
  if (!user || !(await bcrypt.compare(password, user.password))) {
    res.status(401).json({ error: 'Credenciais inválidas' })
    return
  }
  const payload: AuthPayload = { userId: user.id, email: user.email }
  const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' })
  res.json({ token })
})
