
import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import {
  ShieldCheck,
  LayoutDashboard,
  Files,
  Users,
  Share2,
  ScrollText,
  Menu,
  X,
  UserRound,
} from 'lucide-react'

const links = [
  { label: 'Overview', path: '/dashboard', icon: LayoutDashboard },
  { label: 'Documents', path: '/documents', icon: Files },
  { label: 'Teams', path: '/teams', icon: Users },
  { label: 'Shared Files', path: '/sharing', icon: Share2 },
  { label: 'Audit Trail', path: '/audit', icon: ScrollText },
]

export default function WorkspaceNavbar() {
  const navigate = useNavigate()
  const location = useLocation()
  const [menuOpen, setMenuOpen] = useState(false)

  const currentUser =
    localStorage.getItem('securetrace_current_user') ||
    'admin@securetrace.ai'

  return (
    <>
      {menuOpen && (
        <button
          aria-label="Close navigation"
          onClick={() => setMenuOpen(false)}
          className="fixed inset-0 z-30 bg-black/60 lg:hidden"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r border-slate-800 bg-[#0c1322] transition-transform duration-200 ${
          menuOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0`}
      >
        <div className="flex h-20 items-center gap-3 border-b border-slate-800 px-6">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-400/10 text-cyan-400">
            <ShieldCheck size={25} />
          </div>
          <div>
            <h1 className="font-semibold text-white">SecureTrace</h1>
            <p className="text-xs text-cyan-400">AI SECURITY PLATFORM</p>
          </div>
          <button
            onClick={() => setMenuOpen(false)}
            aria-label="Close menu"
            className="ml-auto text-slate-400 lg:hidden"
          >
            <X size={20} />
          </button>
        </div>

        <div className="px-4 pt-7">
          <p className="mb-3 px-3 text-xs font-semibold uppercase tracking-widest text-slate-500">
            Workspace
          </p>

          <nav className="space-y-1">
            {links.map(({ label, path, icon: Icon }) => {
              const active = location.pathname === path

              return (
                <button
                  key={path}
                  onClick={() => {
                    setMenuOpen(false)
                    navigate(path)
                  }}
                  className={`flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm transition ${
                    active
                      ? 'bg-cyan-400/10 font-medium text-cyan-300'
                      : 'text-slate-400 hover:bg-slate-800/70 hover:text-white'
                  }`}
                >
                  <Icon size={19} />
                  {label}
                </button>
              )
            })}
          </nav>
        </div>

        <div className="mt-auto border-t border-slate-800 p-4">
          <div className="flex items-center gap-3 rounded-xl bg-slate-900 p-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-cyan-400/10 text-cyan-300">
              <UserRound size={19} />
            </div>
            <div className="min-w-0">
              <p className="text-xs text-slate-500">Signed in as</p>
              <p className="break-all text-sm text-white">{currentUser}</p>
            </div>
          </div>
          <p className="mt-4 text-center text-xs text-slate-600">
            SecureTrace AI · Project Demo
          </p>
        </div>
      </aside>

      <header className="sticky top-0 z-20 flex h-20 items-center gap-4 border-b border-slate-800 bg-[#080d19]/95 px-4 backdrop-blur-xl sm:px-8 lg:ml-64">
        <button
          onClick={() => setMenuOpen(true)}
          aria-label="Open navigation"
          className="rounded-lg p-2 text-slate-300 hover:bg-slate-800 lg:hidden"
        >
          <Menu size={22} />
        </button>
        <h2 className="font-semibold text-white">
          {links.find((link) => link.path === location.pathname)?.label ||
            'Workspace'}
        </h2>
      </header>
    </>
  )
}
