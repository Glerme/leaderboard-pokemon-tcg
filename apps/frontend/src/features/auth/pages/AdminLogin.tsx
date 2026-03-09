import { useState } from 'react'
import { useNavigate, Navigate } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import { useAuthStore } from '../store/authStore'
import { login } from '../api'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'

export function AdminLogin() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const token = useAuthStore((s) => s.token)
  const setToken = useAuthStore((s) => s.setToken)
  const navigate = useNavigate()

  const mutation = useMutation({
    mutationFn: () => login(email, password),
    onSuccess: (data) => {
      setToken(data.token)
      navigate('/admin/dashboard')
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    mutation.mutate()
  }

  if (token) return <Navigate to="/admin/dashboard" replace />

  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <div className="w-full max-w-sm">
        <div className="pixel-box">
          <div className="border-b-2 border-pokemon-yellow px-6 py-4 text-center">
            <div className="font-pixel text-2xl text-pokemon-yellow mb-2">⚙</div>
            <h1 className="font-pixel text-xs text-pokemon-yellow tracking-widest">
              ADMIN LOGIN
            </h1>
            <p className="font-pixel text-[9px] text-pokemon-gray-light mt-1">
              ACESSO RESTRITO
            </p>
          </div>

          <div className="p-6">
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label
                  htmlFor="email"
                  className="font-pixel text-[9px] text-pokemon-yellow mb-2 block"
                >
                  EMAIL
                </label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@exemplo.com"
                  required
                  className="w-full"
                />
              </div>
              <div>
                <label
                  htmlFor="password"
                  className="font-pixel text-[9px] text-pokemon-yellow mb-2 block"
                >
                  SENHA
                </label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full"
                />
              </div>

              {mutation.isError && (
                <div className="border-2 border-pokemon-red bg-pokemon-darker p-3">
                  <p className="font-pixel text-[9px] text-pokemon-red">
                    ✗ {mutation.error instanceof Error ? mutation.error.message : 'ERRO AO ENTRAR'}
                  </p>
                </div>
              )}

              <Button
                type="submit"
                className="w-full"
                size="lg"
                disabled={mutation.isPending}
              >
                {mutation.isPending ? (
                  <span className="animate-blink">ENTRANDO...</span>
                ) : (
                  '► ENTRAR'
                )}
              </Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
