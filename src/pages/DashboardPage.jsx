
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ShieldCheck,
  LayoutDashboard,
  Files,
  Share2,
  ScrollText,
  Search,
  Bell,
  UserRound,
  FileText,
  ShieldAlert,
  Activity,
  Upload,
  ArrowUpRight,
  Menu,
  X,
} from 'lucide-react'

const navigation = [
  { label: 'Overview', icon: LayoutDashboard },
  { label: 'Documents', icon: Files },
  { label: 'Shared Files', icon: Share2 },
  { label: 'Audit Trail', icon: ScrollText },
  { label: 'Investigation', icon: ShieldAlert },
]

const activities = [
  {
    name: 'Project_Report.pdf',
    action: 'Document uploaded',
    user: 'Admin',
    time: '10:42 AM',
    status: 'Completed',
  },
  {
    name: 'Research_Data.xlsx',
    action: 'File shared',
    user: 'Admin',
    time: '10:18 AM',
    status: 'Completed',
  },
  {
    name: 'Confidential.docx',
    action: 'Document accessed',
    user: 'Recipient',
    time: '09:56 AM',
    status: 'Verified',
  },
  {
    name: 'Financial_Report.pdf',
    action: 'Security scan',
    user: 'Investigator',
    time: '09:31 AM',
    status: 'Verified',
  },
]

function StatCard({ title, value, subtitle, icon: Icon, accent }) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5">
      <div className="flex items-center justify-between">
        <span className="text-sm text-slate-400">{title}</span>
        <div className={`rounded-xl p-2.5 ${accent}`}>
          <Icon size={20} />
        </div>
      </div>

      <p className="mt-5 text-3xl font-semibold text-white">{value}</p>
      <p className="mt-2 text-xs text-slate-500">{subtitle}</p>
    </div>
  )
}

function DashboardPage() {
  const navigate = useNavigate()

  const [activePage, setActivePage] = useState('Overview')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [search, setSearch] = useState('')

  
function handleNavigation(label) {
  setSidebarOpen(false)

  if (label === 'Documents') {
    navigate('/documents')
    return
  }

  if (label === 'Shared Files') {
    navigate('/sharing')
    return
  }

  if (label === 'Audit Trail') {
    navigate('/audit')
    return
  }
  setActivePage(label)
}


  const filteredActivities = activities.filter((activity) =>
    `${activity.name} ${activity.action} ${activity.user}`
      .toLowerCase()
      .includes(search.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-[#080d19] text-slate-200">
      {sidebarOpen && (
        <button
          aria-label="Close sidebar"
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 z-30 bg-black/60 lg:hidden"
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r border-slate-800 bg-[#0c1322] transition-transform duration-200 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0`}
      >
        <div className="flex h-20 items-center gap-3 border-b border-slate-800 px-6">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-400/10 text-cyan-400">
            <ShieldCheck size={25} />
          </div>

          <div>
            <h1 className="font-semibold tracking-wide text-white">
              SecureTrace
            </h1>
            <p className="text-xs text-cyan-400">AI SECURITY PLATFORM</p>
          </div>

          <button
            onClick={() => setSidebarOpen(false)}
            className="ml-auto text-slate-400 lg:hidden"
            aria-label="Close menu"
          >
            <X size={20} />
          </button>
        </div>

        <div className="px-4 pt-7">
          <p className="mb-3 px-3 text-xs font-semibold uppercase tracking-widest text-slate-500">
            Workspace
          </p>

          <nav className="space-y-1">
            {navigation.map(({ label, icon: Icon }) => (
              <button
                key={label}
                onClick={() => handleNavigation(label)}
                className={`flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm transition ${
                  activePage === label
                    ? 'bg-cyan-400/10 font-medium text-cyan-300'
                    : 'text-slate-400 hover:bg-slate-800/70 hover:text-white'
                }`}
              >
                <Icon size={19} />
                {label}

                {label === 'Investigation' && (
                  <span className="ml-auto rounded-md bg-rose-400/10 px-2 py-0.5 text-xs text-rose-300">
                    AI
                  </span>
                )}
              </button>
            ))}
          </nav>
        </div>

        <div className="mt-auto p-4">
          <div className="rounded-xl border border-slate-800 bg-slate-900 p-4">
            <div className="mb-2 flex items-center gap-2 text-cyan-300">
              <ShieldCheck size={18} />
              <span className="text-sm font-medium">System Status</span>
            </div>

            <p className="text-xs leading-5 text-slate-400">
              SecureTrace interface is running.
            </p>

            <div className="mt-3 flex items-center gap-2 text-xs text-emerald-400">
              <span className="h-2 w-2 rounded-full bg-emerald-400" />
              Frontend active
            </div>
          </div>

          <p className="mt-4 text-center text-xs text-slate-600">
            SecureTrace AI · Project Demo
          </p>
        </div>
      </aside>

      {/* Main Content */}
      <main className="min-h-screen lg:ml-64">
        {/* Header */}
        <header className="sticky top-0 z-20 flex h-20 items-center justify-between gap-4 border-b border-slate-800 bg-[#080d19]/90 px-4 backdrop-blur-xl sm:px-8">
          <div className="flex min-w-0 items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="rounded-lg p-2 text-slate-300 hover:bg-slate-800 lg:hidden"
              aria-label="Open menu"
            >
              <Menu size={22} />
            </button>

            <div className="min-w-0">
              <h2 className="truncate text-lg font-semibold text-white">
                {activePage}
              </h2>

              <p className="hidden text-xs text-slate-500 sm:block">
                Secure document management workspace
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-4">
            <label className="hidden items-center gap-2 rounded-xl border border-slate-800 bg-slate-900 px-3 sm:flex">
              <Search size={17} className="text-slate-500" />

              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search activity..."
                className="w-36 bg-transparent py-2.5 text-sm text-white outline-none placeholder:text-slate-500 lg:w-48"
              />
            </label>

            <button
              aria-label="Notifications"
              className="relative rounded-xl border border-slate-800 p-2.5 text-slate-400 hover:bg-slate-900"
            >
              <Bell size={19} />
              <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-cyan-400" />
            </button>

            <div className="flex items-center gap-2 border-l border-slate-800 pl-3 sm:pl-4">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-cyan-400/10 text-cyan-300">
                <UserRound size={19} />
              </div>

              <div className="hidden sm:block">
                <p className="text-sm font-medium text-white">
                  Administrator
                </p>
                <p className="text-xs text-slate-500">Admin Account</p>
              </div>
            </div>
          </div>
        </header>

        {/* Dashboard Overview */}
        <div className="p-4 sm:p-8">
          <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <div>
              <p className="text-sm text-cyan-400">
                SECURETRACE AI / WORKSPACE
              </p>

              <h1 className="mt-2 text-2xl font-semibold tracking-tight text-white sm:text-3xl">
                Security Overview
              </h1>

              <p className="mt-2 text-sm text-slate-400">
                Monitor documents, sharing activity and security events.
              </p>
            </div>

            <button
              onClick={() => navigate('/documents')}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-cyan-400 px-4 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300"
            >
              <Upload size={18} />
              Manage Documents
              <ArrowUpRight size={16} />
            </button>
          </div>

          {/* Statistics */}
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard
              title="Total Documents"
              value="128"
              subtitle="Demo data · All stored documents"
              icon={FileText}
              accent="bg-cyan-400/10 text-cyan-300"
            />

            <StatCard
              title="Shared Documents"
              value="46"
              subtitle="Demo data · Shared with recipients"
              icon={Share2}
              accent="bg-violet-400/10 text-violet-300"
            />

            <StatCard
              title="Security Alerts"
              value="03"
              subtitle="Demo data · Requires review"
              icon={ShieldAlert}
              accent="bg-rose-400/10 text-rose-300"
            />

            <StatCard
              title="Audit Events"
              value="1,284"
              subtitle="Demo data · Recorded activities"
              icon={Activity}
              accent="bg-emerald-400/10 text-emerald-300"
            />
          </div>

          {/* Activity and Security Panels */}
          <div className="mt-8 grid gap-6 xl:grid-cols-[1.6fr_1fr]">
            <section className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/50">
              <div className="flex flex-col justify-between gap-3 border-b border-slate-800 p-5 sm:flex-row sm:items-center">
                <div>
                  <h3 className="font-semibold text-white">
                    Recent Activity
                  </h3>

                  <p className="mt-1 text-xs text-slate-500">
                    Latest document-related events
                  </p>
                </div>

                <span className="w-fit rounded-lg border border-slate-700 px-3 py-1.5 text-xs text-slate-400">
                  Demo records
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full min-w-[600px] text-left text-sm">
                  <thead className="bg-slate-950/50 text-xs uppercase tracking-wider text-slate-500">
                    <tr>
                      <th className="px-5 py-4 font-medium">
                        Document / Event
                      </th>
                      <th className="px-5 py-4 font-medium">User</th>
                      <th className="px-5 py-4 font-medium">Time</th>
                      <th className="px-5 py-4 font-medium">Status</th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-slate-800/80">
                    {filteredActivities.map((activity) => (
                      <tr
                        key={`${activity.name}-${activity.time}`}
                        className="hover:bg-slate-800/30"
                      >
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div className="rounded-lg bg-slate-800 p-2 text-cyan-300">
                              <FileText size={17} />
                            </div>

                            <div>
                              <p className="font-medium text-slate-200">
                                {activity.name}
                              </p>

                              <p className="mt-1 text-xs text-slate-500">
                                {activity.action}
                              </p>
                            </div>
                          </div>
                        </td>

                        <td className="px-5 py-4 text-slate-400">
                          {activity.user}
                        </td>

                        <td className="px-5 py-4 text-slate-400">
                          {activity.time}
                        </td>

                        <td className="px-5 py-4">
                          <span
                            className={`rounded-full px-2.5 py-1 text-xs ${
                              activity.status === 'Verified'
                                ? 'bg-emerald-400/10 text-emerald-300'
                                : 'bg-cyan-400/10 text-cyan-300'
                            }`}
                          >
                            {activity.status}
                          </span>
                        </td>
                      </tr>
                    ))}

                    {filteredActivities.length === 0 && (
                      <tr>
                        <td
                          colSpan={4}
                          className="px-5 py-8 text-center text-slate-500"
                        >
                          No matching activities found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </section>

            {/* Security Status */}
            <section className="rounded-2xl border border-slate-800 bg-slate-900/50 p-5">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-white">
                    Security Status
                  </h3>
                  <p className="mt-1 text-xs text-slate-500">
                    Interface preview
                  </p>
                </div>

                <ShieldCheck className="text-cyan-300" size={22} />
              </div>

              <div className="mt-6 rounded-xl border border-emerald-400/20 bg-emerald-400/5 p-4">
                <div className="flex items-center gap-2 text-emerald-300">
                  <ShieldCheck size={18} />
                  <span className="text-sm font-medium">
                    Dashboard UI Active
                  </span>
                </div>

                <p className="mt-2 text-xs leading-5 text-slate-400">
                  Backend verification, encryption and audit integrity
                  checks are not connected yet.
                </p>
              </div>

              <div className="mt-5 space-y-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-400">
                    Document protection
                  </span>
                  <span className="text-slate-300">UI preview</span>
                </div>

                <div className="h-2 overflow-hidden rounded-full bg-slate-800">
                  <div className="h-full w-3/4 rounded-full bg-cyan-400/70" />
                </div>

                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-400">Audit ledger</span>
                  <span className="text-slate-300">Not connected</span>
                </div>

                <div className="h-2 overflow-hidden rounded-full bg-slate-800">
                  <div className="h-full w-1/4 rounded-full bg-violet-400/70" />
                </div>
              </div>

              <button
                onClick={() => handleNavigation('Audit Trail')}
                className="mt-6 w-full rounded-xl border border-slate-700 px-4 py-3 text-sm font-medium text-slate-300 transition hover:border-cyan-400/50 hover:text-cyan-300"
              >
                View Audit Trail
              </button>
            </section>
          </div>

          <p className="mt-8 text-center text-xs text-slate-600">
            SecureTrace AI · Frontend demo · Statistics and activity are
            sample data
          </p>
        </div>
      </main>
    </div>
  )
}

export default DashboardPage
