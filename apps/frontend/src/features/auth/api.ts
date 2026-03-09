import { apiPost } from '@/lib/api'

export interface LoginResponse {
  token: string
}

export function login(email: string, password: string) {
  return apiPost<LoginResponse>('/auth/login', { email, password })
}
