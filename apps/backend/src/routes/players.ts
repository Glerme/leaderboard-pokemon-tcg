import { Router } from 'express'
import { z } from 'zod'
import { prisma } from '../lib/prisma.js'
import { requireAuth } from '../middleware/auth.js'

const createSchema = z.object({ name: z.string().min(1) })

export const playersRouter = Router()

playersRouter.get('/', async (_req, res) => {
  const list = await prisma.player.findMany({ orderBy: { name: 'asc' } })
  res.json(list)
})

playersRouter.post('/', requireAuth, async (req, res) => {
  const parsed = createSchema.safeParse(req.body)
  if (!parsed.success) {
    res.status(400).json({ error: 'Nome obrigatório' })
    return
  }
  const player = await prisma.player.create({ data: { name: parsed.data.name } })
  res.status(201).json(player)
})

playersRouter.patch('/:id', requireAuth, async (req, res) => {
  const id = req.params.id
  const name = (req.body as { name?: string }).name
  if (typeof name !== 'string' || name.length === 0) {
    res.status(400).json({ error: 'Nome obrigatório' })
    return
  }
  const player = await prisma.player.update({ where: { id }, data: { name } }).catch(() => null)
  if (!player) {
    res.status(404).json({ error: 'Jogador não encontrado' })
    return
  }
  res.json(player)
})

playersRouter.delete('/:id', requireAuth, async (req, res) => {
  const id = req.params.id
  await prisma.player.delete({ where: { id } }).catch(() => null)
  res.status(204).send()
})
