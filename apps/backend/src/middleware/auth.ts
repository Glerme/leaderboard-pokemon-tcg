import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET ?? ''

export interface AuthPayload {
  userId: string
  email: string
}

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization
  const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null
  if (!token) {
    res.status(401).json({ error: 'Token ausente' })
    return
  }
  try {
    const payload = jwt.verify(token, JWT_SECRET) as AuthPayload
    ;(req as Request & { auth?: AuthPayload }).auth = payload
    next()
  } catch {
    res.status(401).json({ error: 'Token inválido' })
  }
}
