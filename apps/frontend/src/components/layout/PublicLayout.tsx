import { Outlet, Link, useLocation } from 'react-router-dom'

export function PublicLayout() {
  const { pathname } = useLocation()

  const navLinks = [
    { to: '/', label: 'RANKING' },
    { to: '/championships', label: 'CAMPEONATOS' },
    { to: '/admin/login', label: 'ADMIN' },
  ]

  return (
    <div className="min-h-screen bg-pokemon-dark flex flex-col">
      <header className="bg-pokemon-blue border-b-4 border-pokemon-yellow shadow-[0_4px_0_#C8A800]">
        <div className="mx-auto max-w-6xl px-4 py-3">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <Link to="/" className="flex items-center gap-3 group">
              <span className="text-white font-pixel text-base animate-bounce-pixel">⬤</span>
              <div>
                <span className="font-pixel text-white text-xs tracking-widest uppercase block">
                  POKEMON TCG
                </span>
                <span className="font-pixel text-pokemon-yellow text-[10px] tracking-widest">
                  LEADERBOARD
                </span>
              </div>
            </Link>

            <nav className="flex items-center gap-1">
              {navLinks.map((link) => {
                const isActive = link.to === '/' ? pathname === '/' : pathname.startsWith(link.to)

                return (
                  <Link
                    key={link.to}
                    to={link.to}
                    className={[
                      'font-pixel text-[9px] px-3 py-2 border-2 transition-all duration-75',
                      'flex items-center gap-1',
                      isActive
                        ? 'bg-pokemon-yellow text-pokemon-darker border-pokemon-yellow-dark shadow-pixel-yellow'
                        : 'bg-transparent text-white border-transparent hover:border-white hover:bg-pokemon-blue-dark',
                    ].join(' ')}
                  >
                    {isActive && <span className="text-pokemon-darker">►</span>}
                    {link.label}
                  </Link>
                )
              })}
            </nav>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl px-4 py-6 flex-1">
        <Outlet />
      </main>

      <footer className="border-t-4 border-pokemon-gray-light bg-pokemon-darker py-4">
        <div className="mx-auto max-w-6xl px-4 flex items-center justify-center gap-6">
          <span className="font-pixel text-[9px] text-pokemon-gray-light">
            © POKEMON TCG LEADERBOARD
          </span>
          <span className="font-pixel text-[9px] text-pokemon-yellow animate-blink">
            INSERT COIN
          </span>
        </div>
      </footer>
    </div>
  )
}
