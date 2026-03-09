import axios from 'axios'
import { useAuthStore } from '@/features/auth/store/authStore'

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: { 'Content-Type': 'application/json' },
})

apiClient.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const message =
      error.response?.data?.error ?? error.message ?? 'Erro na requisição'
    return Promise.reject(new Error(message))
  },
)

export const apiGet = <T>(path: string) =>
  apiClient.get<T>(path).then((r) => r.data)

export const apiPost = <T>(path: string, body: unknown) =>
  apiClient.post<T>(path, body).then((r) => r.data)

export const apiPatch = <T>(path: string, body: unknown) =>
  apiClient.patch<T>(path, body).then((r) => r.data)

export const apiPut = <T>(path: string, body: unknown) =>
  apiClient.put<T>(path, body).then((r) => r.data)

export const apiDelete = (path: string) =>
  apiClient.delete(path).then(() => undefined)
