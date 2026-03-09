import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuthStore } from '@/features/auth/store/authStore'

export function AdminLayout() {
  const logout = useAuthStore((s) => s.logout)
  const navigate = useNavigate()
  const { pathname } = useLocation()

  const handleLogout = () => {
    logout()
    navigate('/admin/login')
  }

  const navLinks = [
    { to: '/admin/dashboard', label: 'DASHBOARD' },
    { to: '/admin/championships', label: 'CAMPEONATOS' },
    { to: '/admin/players', label: 'JOGADORES' },
  ]

  return (
    <div className="min-h-screen bg-pokemon-dark flex flex-col">
      <header className="bg-pokemon-blue-dark border-b-4 border-pokemon-blue shadow-[0_4px_0_#2a4080]">
        <div className="mx-auto max-w-6xl px-4 py-3">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <Link to="/admin/dashboard" className="flex items-center gap-3">
              <span className="font-pixel text-white text-base">⚙</span>
              <div>
                <span className="font-pixel text-white text-xs tracking-widest uppercase block">
                  ADMIN PANEL
                </span>
                <span className="font-pixel text-pokemon-yellow text-[9px] animate-blink">
                  ● ADMIN MODE
                </span>
              </div>
            </Link>

            <div className="flex items-center gap-1">
              {navLinks.map((link) => {
                const isActive = pathname.startsWith(link.to)
                return (
                  <Link
                    key={link.to}
                    to={link.to}
                    className={[
                      'font-pixel text-[9px] px-3 py-2 border-2 transition-all duration-75',
                      'flex items-center gap-1',
                      isActive
                        ? 'bg-pokemon-blue text-white border-pokemon-blue-dark shadow-pixel-blue'
                        : 'bg-transparent text-white border-transparent hover:border-white hover:bg-pokemon-blue-dark',
                    ].join(' ')}
                  >
                    {isActive && <span>►</span>}
                    {link.label}
                  </Link>
                )
              })}

              <button
                type="button"
                onClick={handleLogout}
                className="font-pixel text-[9px] px-3 py-2 border-2 border-pokemon-red bg-pokemon-red text-white shadow-pixel-red hover:bg-pokemon-red-dark transition-all duration-75 active:translate-y-[2px] active:shadow-none ml-2"
              >
                SAIR
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl px-4 py-6 flex-1">
        <Outlet />
      </main>

      <footer className="border-t-4 border-pokemon-gray-light bg-pokemon-darker py-4">
        <div className="mx-auto max-w-6xl px-4 flex items-center justify-center gap-6">
          <span className="font-pixel text-[9px] text-pokemon-gray-light">
            ADMIN CONSOLE v1.0
          </span>
          <span className="font-pixel text-[9px] text-pokemon-blue animate-blink-slow">
            ● CONNECTED
          </span>
        </div>
      </footer>
    </div>
  )
}
