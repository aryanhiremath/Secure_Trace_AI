
import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ShieldCheck,
  LayoutDashboard,
  Files,
  Share2,
  ScrollText,
  Search,
  Bell,
  Menu,
  X,
  FileText,
  Upload,
  Download,
  Eye,
  Link2,
  ShieldAlert,
  Clock3,
  CheckCircle2,
  AlertTriangle,
  Filter,
  ChevronDown,
  ArrowUpRight,
  Activity,
} from 'lucide-react'

const navigation = [
  { label: 'Overview', icon: LayoutDashboard, path: '/dashboard' },
  { label: 'Documents', icon: Files, path: '/documents' },
  { label: 'Shared Files', icon: Share2, path: '/sharing' },
  { label: 'Audit Trail', icon: ScrollText, path: '/audit' },
  { label: 'Investigation', icon: ShieldAlert, path: '/investigation' },
]

const initialEvents = [
  {
    id: 'AUD-1048',
    action: 'Document uploaded',
    document: 'Project_Report.pdf',
    user: 'Admin User',
    type: 'Upload',
    status: 'Success',
    time: '10:42:18 AM',
    date: '15 Oct 2026',
    details: 'A document was added to the workspace.',
    ip: '192.168.1.10',
  },
  {
    id: 'AUD-1047',
    action: 'Secure share created',
    document: 'Research_Notes.docx',
    user: 'Admin User',
    type: 'Sharing',
    status: 'Success',
    time: '10:18:42 AM',
    date: '15 Oct 2026',
    details: 'A demo sharing link was created for a recipient.',
    ip: '192.168.1.10',
  },
  {
    id: 'AUD-1046',
    action: 'Document accessed',
    document: 'Confidential.docx',
    user: 'Recipient',
    type: 'Access',
    status: 'Verified',
    time: '09:56:03 AM',
    date: '15 Oct 2026',
    details: 'A sample recipient access event.',
    ip: '192.168.1.24',
  },
  {
    id: 'AUD-1045',
    action: 'Integrity check completed',
    document: 'Security_Policy.pdf',
    user: 'System',
    type: 'Security',
    status: 'Verified',
    time: '09:31:27 AM',
    date: '15 Oct 2026',
    details: 'Sample integrity check event. No real hash verification was performed.',
    ip: 'Internal demo',
  },
  {
    id: 'AUD-1044',
    action: 'Download attempt',
    document: 'Financial_Report.pdf',
    user: 'Unknown Recipient',
    type: 'Access',
    status: 'Review',
    time: '09:14:51 AM',
    date: '15 Oct 2026',
    details: 'A sample event flagged for manual review.',
    ip: '203.0.113.42',
  },
  {
    id: 'AUD-1043',
    action: 'Share link revoked',
    document: 'Research_Data.xlsx',
    user: 'Admin User',
    type: 'Sharing',
    status: 'Success',
    time: '08:45:16 AM',
    date: '15 Oct 2026',
    details: 'A demo share was marked as revoked.',
    ip: '192.168.1.10',
  },
  {
    id: 'AUD-1042',
    action: 'Login successful',
    document: 'SecureTrace Workspace',
    user: 'Admin User',
    type: 'Authentication',
    status: 'Success',
    time: '08:30:08 AM',
    date: '15 Oct 2026',
    details: 'Sample sign-in activity for the demo workspace.',
    ip: '192.168.1.10',
  },
]

const typeStyles = {
  Upload: 'bg-cyan-400/10 text-cyan-300',
  Sharing: 'bg-violet-400/10 text-violet-300',
  Access: 'bg-amber-400/10 text-amber-300',
  Security: 'bg-emerald-400/10 text-emerald-300',
  Authentication: 'bg-sky-400/10 text-sky-300',
}

function statusStyle(status) {
  if (status === 'Success') return 'bg-emerald-400/10 text-emerald-300'
  if (status === 'Verified') return 'bg-cyan-400/10 text-cyan-300'
  return 'bg-amber-400/10 text-amber-300'
}

function AuditTrailPage() {
  const navigate = useNavigate()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState('All types')
  const [statusFilter, setStatusFilter] = useState('All statuses')
  const [selectedEvent, setSelectedEvent] = useState(null)

  const events = useMemo(() => {
    return initialEvents.filter((event) => {
      const matchesSearch = `${event.id} ${event.action} ${event.document} ${event.user} ${event.type}`
        .toLowerCase()
        .includes(search.toLowerCase())

      const matchesType =
        typeFilter === 'All types' || event.type === typeFilter

      const matchesStatus =
        statusFilter === 'All statuses' || event.status === statusFilter

      return matchesSearch && matchesType && matchesStatus
    })
  }, [search, typeFilter, statusFilter])

  const reviewCount = initialEvents.filter(
    (event) => event.status === 'Review',
  ).length

  function SidebarContent() {
    return (
      <>
        <div className="flex h-20 items-center gap-3 border-b border-slate-800 px-6">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-400/10 text-cyan-400">
            <ShieldCheck size={25} />
          </div>
          <div>
            <h1 className="font-semibold tracking-wide text-white">SecureTrace</h1>
            <p className="text-xs text-cyan-400">AI SECURITY PLATFORM</p>
          </div>
        </div>

        <div className="px-4 pt-7">
          <p className="mb-3 px-3 text-xs font-semibold uppercase tracking-widest text-slate-500">
            Workspace
          </p>
          <nav className="space-y-1">
            {navigation.map(({ label, icon: Icon, path }) => (
              <button
                key={label}
                onClick={() => {
                  setSidebarOpen(false)
                  if (path === '/investigation') {
                    navigate('/investigation')
                    return
                  }
                  navigate(path)
                }}
                className={`flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm transition ${
                  label === 'Audit Trail'
                    ? 'bg-cyan-400/10 font-medium text-cyan-300'
                    : 'text-slate-400 hover:bg-slate-800/70 hover:text-white'
                }`}
              >
                <Icon size={19} />
                {label}
                {label === 'Audit Trail' && (
                  <span className="ml-auto h-2 w-2 rounded-full bg-cyan-400" />
                )}
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
              <span className="text-sm font-medium">Audit Status</span>
            </div>
            <p className="text-xs leading-5 text-slate-400">
              Showing sample audit events. Backend logging is not connected.
            </p>
            <div className="mt-3 flex items-center gap-2 text-xs text-amber-300">
              <span className="h-2 w-2 rounded-full bg-amber-300" />
              Demo data
            </div>
          </div>
          <p className="mt-4 text-center text-xs text-slate-600">
            SecureTrace AI · Project Demo
          </p>
        </div>
      </>
    )
  }

  return (
    <div className="min-h-screen bg-[#080d19] text-slate-200">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col border-r border-slate-800 bg-[#0c1322] lg:flex">
        <SidebarContent />
      </aside>

      {sidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            aria-label="Close sidebar"
            onClick={() => setSidebarOpen(false)}
            className="absolute inset-0 bg-black/60"
          />
          <aside className="absolute inset-y-0 left-0 flex w-72 flex-col border-r border-slate-800 bg-[#0c1322]">
            <div className="flex justify-end p-3">
              <button onClick={() => setSidebarOpen(false)} aria-label="Close menu">
                <X size={21} />
              </button>
            </div>
            <SidebarContent />
          </aside>
        </div>
      )}

      <main className="min-h-screen lg:ml-64">
        <header className="sticky top-0 z-20 flex h-20 items-center justify-between gap-4 border-b border-slate-800 bg-[#080d19]/90 px-4 backdrop-blur-xl sm:px-8">
          <div className="flex min-w-0 items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="rounded-lg p-2 text-slate-300 hover:bg-slate-800 lg:hidden"
              aria-label="Open menu"
            >
              <Menu size={22} />
            </button>
            <div>
              <p className="text-xs text-slate-500">Workspace / Security</p>
              <h2 className="text-lg font-semibold text-white">Audit Trail</h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="hidden items-center gap-2 rounded-lg border border-amber-400/20 bg-amber-400/5 px-3 py-2 text-xs text-amber-200 sm:flex">
              <Activity size={14} />
              Demo records
            </span>
            <button
              onClick={() => setSelectedEvent({
                id: 'AUDIT-INFO',
                action: 'About this audit trail',
                document: 'SecureTrace AI',
                user: 'Demo workspace',
                type: 'Security',
                status: 'Review',
                time: 'Not applicable',
                date: 'Not applicable',
                details: 'These events are hard-coded frontend examples. They are not real, tamper-proof, or generated by a backend.',
                ip: 'Not recorded',
              })}
              className="relative rounded-xl border border-slate-800 p-2.5 text-slate-400 hover:bg-slate-900"
              aria-label="Audit information"
            >
              <Bell size={18} />
            </button>
          </div>
        </header>

        <div className="space-y-7 p-4 sm:p-8">
          <section className="relative overflow-hidden rounded-2xl border border-cyan-400/15 bg-gradient-to-br from-[#10283a] via-[#102033] to-[#10182a] p-6 md:p-8">
            <div className="pointer-events-none absolute -right-10 -top-16 h-56 w-56 rounded-full bg-cyan-400/10 blur-3xl" />
            <div className="relative flex flex-col justify-between gap-5 md:flex-row md:items-center">
              <div className="max-w-2xl">
                <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1.5 text-xs font-medium text-cyan-300">
                  <ScrollText size={14} />
                  Activity & event history
                </div>
                <h1 className="text-2xl font-bold text-white md:text-3xl">
                  Audit Trail
                </h1>
                <p className="mt-3 max-w-xl text-sm leading-6 text-slate-400">
                  Review sample document activity, sharing actions and security
                  events in one place.
                </p>
              </div>
              <div className="flex h-20 w-20 shrink-0 items-center justify-center self-start rounded-2xl border border-cyan-300/20 bg-cyan-400/10 text-cyan-300 md:self-center">
                <Activity size={38} strokeWidth={1.5} />
              </div>
            </div>
          </section>

          <div className="flex items-start gap-3 rounded-xl border border-amber-400/20 bg-amber-400/5 p-4">
            <AlertTriangle className="mt-0.5 shrink-0 text-amber-300" size={18} />
            <div>
              <p className="text-sm font-medium text-amber-200">Frontend demo only</p>
              <p className="mt-1 text-xs leading-5 text-slate-400">
                The records below are sample data. A real audit ledger,
                trusted timestamps and tamper-evidence will require backend
                implementation.
              </p>
            </div>
          </div>

          <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {[
              {
                label: 'Total events',
                value: initialEvents.length,
                icon: ScrollText,
                color: 'text-cyan-300',
              },
              {
                label: 'Successful actions',
                value: initialEvents.filter((event) => event.status === 'Success').length,
                icon: CheckCircle2,
                color: 'text-emerald-300',
              },
              {
                label: 'Verified events',
                value: initialEvents.filter((event) => event.status === 'Verified').length,
                icon: ShieldCheck,
                color: 'text-sky-300',
              },
              {
                label: 'Needs review',
                value: reviewCount,
                icon: AlertTriangle,
                color: 'text-amber-300',
              },
            ].map(({ label, value, icon: Icon, color }) => (
              <div key={label} className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-400">{label}</span>
                  <Icon size={19} className={color} />
                </div>
                <p className="mt-5 text-3xl font-semibold text-white">{value}</p>
                <p className="mt-2 text-xs text-slate-500">Sample records</p>
              </div>
            ))}
          </section>

          <section className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/50">
            <div className="flex flex-col justify-between gap-4 border-b border-slate-800 p-5 lg:flex-row lg:items-center">
              <div>
                <h3 className="font-semibold text-white">Event history</h3>
                <p className="mt-1 text-xs text-slate-500">
                  Select an event to inspect its details.
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                <label className="flex items-center gap-2 rounded-xl border border-slate-700 bg-[#091221] px-3">
                  <Search size={16} className="shrink-0 text-slate-500" />
                  <input
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder="Search events..."
                    className="w-full bg-transparent py-2.5 text-sm text-white outline-none placeholder:text-slate-500 sm:w-40"
                  />
                </label>

                <label className="relative flex items-center">
                  <Filter size={15} className="absolute left-3 text-slate-500" />
                  <select
                    value={typeFilter}
                    onChange={(event) => setTypeFilter(event.target.value)}
                    className="w-full appearance-none rounded-xl border border-slate-700 bg-[#091221] py-2.5 pl-9 pr-8 text-sm text-slate-300 outline-none focus:border-cyan-400"
                  >
                    <option>All types</option>
                    <option>Upload</option>
                    <option>Sharing</option>
                    <option>Access</option>
                    <option>Security</option>
                    <option>Authentication</option>
                  </select>
                  <ChevronDown size={15} className="pointer-events-none absolute right-3 text-slate-500" />
                </label>

                <label className="relative flex items-center">
                  <select
                    value={statusFilter}
                    onChange={(event) => setStatusFilter(event.target.value)}
                    className="w-full appearance-none rounded-xl border border-slate-700 bg-[#091221] px-3 py-2.5 pr-8 text-sm text-slate-300 outline-none focus:border-cyan-400"
                  >
                    <option>All statuses</option>
                    <option>Success</option>
                    <option>Verified</option>
                    <option>Review</option>
                  </select>
                  <ChevronDown size={15} className="pointer-events-none absolute right-3 text-slate-500" />
                </label>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[850px] text-left text-sm">
                <thead className="bg-slate-950/50 text-xs uppercase tracking-wider text-slate-500">
                  <tr>
                    <th className="px-5 py-4 font-medium">Event</th>
                    <th className="px-5 py-4 font-medium">User</th>
                    <th className="px-5 py-4 font-medium">Type</th>
                    <th className="px-5 py-4 font-medium">Timestamp</th>
                    <th className="px-5 py-4 font-medium">Status</th>
                    <th className="px-5 py-4 font-medium">Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80">
                  {events.map((event) => (
                    <tr key={event.id} className="transition hover:bg-slate-800/30">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="rounded-lg bg-slate-800 p-2 text-cyan-300">
                            <FileText size={17} />
                          </div>
                          <div>
                            <p className="font-medium text-white">{event.action}</p>
                            <p className="mt-1 text-xs text-slate-500">{event.document}</p>
                            <p className="mt-1 text-[10px] text-slate-600">{event.id}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-slate-400">{event.user}</td>
                      <td className="px-5 py-4">
                        <span className={`rounded-full px-2.5 py-1 text-xs ${typeStyles[event.type] || 'bg-slate-700 text-slate-300'}`}>
                          {event.type}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <p className="text-slate-300">{event.time}</p>
                        <p className="mt-1 text-xs text-slate-500">{event.date}</p>
                      </td>
                      <td className="px-5 py-4">
                        <span className={`rounded-full px-2.5 py-1 text-xs ${statusStyle(event.status)}`}>
                          {event.status}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <button
                          onClick={() => setSelectedEvent(event)}
                          className="inline-flex items-center gap-1.5 rounded-lg border border-slate-700 px-3 py-2 text-xs text-slate-300 transition hover:border-cyan-400/40 hover:text-cyan-300"
                        >
                          View <ArrowUpRight size={13} />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {events.length === 0 && (
                    <tr>
                      <td colSpan={6} className="px-5 py-12 text-center">
                        <Search className="mx-auto text-slate-600" size={26} />
                        <p className="mt-3 text-sm text-slate-300">No events found</p>
                        <p className="mt-1 text-xs text-slate-500">Change your search or filters.</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="flex flex-col justify-between gap-2 border-t border-slate-800 px-5 py-4 text-xs text-slate-500 sm:flex-row">
              <span>Showing {events.length} of {initialEvents.length} sample events</span>
              <span>Frontend demo · No backend records</span>
            </div>
          </section>

          <footer className="flex flex-col gap-2 border-t border-slate-800 py-5 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between">
            <p>SecureTrace AI · Document Security Workspace</p>
            <p className="flex items-center gap-2">
              <ShieldCheck size={14} className="text-cyan-400" />
              Sample events only · Backend not connected
            </p>
          </footer>
        </div>
      </main>

      {selectedEvent && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 p-4">
          <button
            aria-label="Close event details"
            onClick={() => setSelectedEvent(null)}
            className="absolute inset-0"
          />
          <section className="relative z-10 w-full max-w-lg rounded-2xl border border-slate-700 bg-[#0c1627] p-6 shadow-2xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-widest text-cyan-300">Audit event details</p>
                <h3 className="mt-2 text-xl font-semibold text-white">{selectedEvent.action}</h3>
                <p className="mt-1 text-sm text-slate-400">{selectedEvent.id}</p>
              </div>
              <button
                onClick={() => setSelectedEvent(null)}
                aria-label="Close details"
                className="rounded-lg p-2 text-slate-400 hover:bg-slate-800 hover:text-white"
              >
                <X size={19} />
              </button>
            </div>

            <div className="mt-6 space-y-4">
              {[
                ['Document / resource', selectedEvent.document],
                ['User', selectedEvent.user],
                ['Event type', selectedEvent.type],
                ['Status', selectedEvent.status],
                ['Date', selectedEvent.date],
                ['Time', selectedEvent.time],
                ['Source / IP', selectedEvent.ip],
              ].map(([label, value]) => (
                <div key={label} className="flex flex-col gap-1 border-b border-slate-800 pb-3 sm:flex-row sm:justify-between">
                  <span className="text-sm text-slate-500">{label}</span>
                  <span className="break-all text-sm text-slate-200 sm:max-w-[60%] sm:text-right">{value}</span>
                </div>
              ))}
              <div>
                <p className="text-sm text-slate-500">Description</p>
                <p className="mt-2 text-sm leading-6 text-slate-300">{selectedEvent.details}</p>
              </div>
            </div>

            <button
              onClick={() => setSelectedEvent(null)}
              className="mt-6 w-full rounded-xl bg-cyan-400 px-4 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300"
            >
              Close details
            </button>
          </section>
        </div>
      )}
    </div>
  )
}

export default AuditTrailPage
