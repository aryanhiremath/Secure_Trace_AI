
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Search,
  Upload,
  FileText,
  Download,
  Eye,
  ShieldCheck,
  Clock,
  MoreHorizontal,
  LayoutDashboard,
  Share2,
  ClipboardList,
  ShieldAlert,
  Menu,
  X,
} from 'lucide-react'

const initialDocuments = [
  {
    name: 'Project_Report.pdf',
    type: 'PDF Document',
    size: '2.4 MB',
    date: '11 Oct 2026',
    status: 'Secured',
  },
  {
    name: 'Research_Data.xlsx',
    type: 'Excel Spreadsheet',
    size: '1.8 MB',
    date: '10 Oct 2026',
    status: 'Secured',
  },
  {
    name: 'Confidential_Notes.docx',
    type: 'Word Document',
    size: '840 KB',
    date: '09 Oct 2026',
    status: 'Pending',
  },
]

const navigation = [
  { label: 'Overview', icon: LayoutDashboard, path: '/dashboard' },
  { label: 'Documents', icon: FileText, path: '/documents' },
  { label: 'Shared Files', icon: Share2, path: '/sharing' },
  { label: 'Audit Trail', icon: ClipboardList, path: '/audit' },
  { label: 'Investigation', icon: ShieldAlert, path: '/investigation' },
]

export default function DocumentsPage() {
  const navigate = useNavigate()

  const [documents, setDocuments] = useState(initialDocuments)
  const [search, setSearch] = useState('')
  const [sidebarOpen, setSidebarOpen] = useState(false)

  function handleNavigation(path) {
    setSidebarOpen(false)

    if (path === '/investigation') {
      alert('Investigation page is coming soon.')
      return
    }

    navigate(path)
  }

  function handleUpload(event) {
    const files = Array.from(event.target.files || [])

    const newDocuments = files.map((file) => ({
      name: file.name,
      type: file.type || 'File',
      size:
        file.size >= 1024 * 1024
          ? `${(file.size / (1024 * 1024)).toFixed(2)} MB`
          : `${Math.max(1, Math.round(file.size / 1024))} KB`,
      date: new Date().toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      }),
      status: 'Pending',
      file,
    }))

    setDocuments((current) => [...newDocuments, ...current])
    event.target.value = ''
  }

  const filteredDocuments = documents.filter((document) =>
    document.name.toLowerCase().includes(search.toLowerCase())
  )

  function downloadDocument(document) {
    if (!document.file) {
      alert('This is sample data. Upload a real file to download it here.')
      return
    }

    const url = URL.createObjectURL(document.file)
    const link = window.document.createElement('a')

    link.href = url
    link.download = document.name
    link.click()

    URL.revokeObjectURL(url)
  }

  function viewDocument(document) {
    if (!document.file) {
      alert('This is sample data. Upload a real file to view it here.')
      return
    }

    const url = URL.createObjectURL(document.file)
    window.open(url, '_blank', 'noopener,noreferrer')
  }

  return (
    <div className="min-h-screen bg-[#080e1c] text-slate-100">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <button
          type="button"
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
            type="button"
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
            {navigation.map(({ label, icon: Icon, path }) => (
              <button
                type="button"
                key={label}
                onClick={() => handleNavigation(path)}
                className={`flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm transition ${
                  path === '/documents'
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
        {/* Top Header */}
        <header className="sticky top-0 z-20 flex h-20 items-center justify-between gap-4 border-b border-slate-800 bg-[#080e1c]/95 px-4 backdrop-blur-xl sm:px-6 lg:px-8">
          <div className="flex min-w-0 items-center gap-3">
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              className="rounded-lg p-2 text-slate-300 hover:bg-slate-800 lg:hidden"
              aria-label="Open menu"
            >
              <Menu size={22} />
            </button>

            <div>
              <p className="text-xs text-slate-500">
                SecureTrace AI / Workspace
              </p>
              <h2 className="mt-1 text-lg font-semibold text-white">
                Documents
              </h2>
            </div>
          </div>

          <div className="hidden items-center gap-3 sm:flex">
            <ShieldCheck size={19} className="text-cyan-400" />
            <span className="text-sm text-slate-400">Admin Workspace</span>
          </div>
        </header>

        <div className="mx-auto max-w-7xl space-y-7 p-4 sm:p-6 lg:p-8">
          {/* Page Header */}
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <div>
              <p className="mb-2 text-sm text-cyan-400">
                SecureTrace AI / Workspace
              </p>

              <h1 className="text-3xl font-bold text-white">
                Documents
              </h1>

              <p className="mt-2 text-sm text-slate-400">
                Manage and monitor your secure documents.
              </p>
            </div>

            <label className="flex cursor-pointer items-center justify-center gap-2 rounded-xl bg-cyan-500 px-5 py-3 font-semibold text-slate-950 transition hover:bg-cyan-400">
              <Upload size={18} />
              Upload Document

              <input
                type="file"
                multiple
                className="hidden"
                onChange={handleUpload}
              />
            </label>
          </div>

          {/* Statistics Cards */}
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            <StatCard
              icon={<FileText size={21} />}
              label="Total Documents"
              value={documents.length}
            />

            <StatCard
              icon={<ShieldCheck size={21} />}
              label="Secured Documents"
              value={
                documents.filter(
                  (document) => document.status === 'Secured'
                ).length
              }
            />

            <StatCard
              icon={<Clock size={21} />}
              label="Pending Verification"
              value={
                documents.filter(
                  (document) => document.status === 'Pending'
                ).length
              }
            />
          </div>

          {/* Documents Table */}
          <div className="overflow-hidden rounded-2xl border border-slate-800 bg-[#0d1526]">
            <div className="flex flex-col justify-between gap-4 border-b border-slate-800 p-5 sm:flex-row sm:items-center">
              <div>
                <h2 className="text-lg font-semibold text-white">
                  All Documents
                </h2>

                <p className="mt-1 text-sm text-slate-400">
                  Uploaded files and their current status
                </p>
              </div>

              <div className="relative sm:w-72">
                <Search
                  size={18}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
                />

                <input
                  type="text"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search documents..."
                  className="w-full rounded-xl border border-slate-700 bg-[#080e1c] py-2.5 pl-10 pr-3 text-sm text-white outline-none placeholder:text-slate-500 focus:border-cyan-500"
                />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[700px] text-left text-sm">
                <thead className="bg-slate-900/60 text-slate-400">
                  <tr>
                    <th className="px-5 py-4 font-medium">Document</th>
                    <th className="px-5 py-4 font-medium">File Size</th>
                    <th className="px-5 py-4 font-medium">Uploaded</th>
                    <th className="px-5 py-4 font-medium">Status</th>
                    <th className="px-5 py-4 text-right font-medium">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-800">
                  {filteredDocuments.map((document, index) => (
                    <tr
                      key={`${document.name}-${index}`}
                      className="transition hover:bg-slate-800/30"
                    >
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="rounded-lg bg-cyan-500/10 p-2.5 text-cyan-400">
                            <FileText size={21} />
                          </div>

                          <div>
                            <p className="font-medium text-slate-100">
                              {document.name}
                            </p>

                            <p className="mt-1 text-xs text-slate-500">
                              {document.type}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="px-5 py-4 text-slate-300">
                        {document.size}
                      </td>

                      <td className="px-5 py-4 text-slate-300">
                        {document.date}
                      </td>

                      <td className="px-5 py-4">
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-medium ${
                            document.status === 'Secured'
                              ? 'bg-emerald-500/10 text-emerald-400'
                              : 'bg-amber-500/10 text-amber-400'
                          }`}
                        >
                          {document.status}
                        </span>
                      </td>

                      <td className="px-5 py-4">
                        <div className="flex justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => downloadDocument(document)}
                            title="Download"
                            className="rounded-lg p-2 text-slate-400 hover:bg-slate-700 hover:text-cyan-400"
                          >
                            <Download size={17} />
                          </button>

                          <button
                            type="button"
                            onClick={() => viewDocument(document)}
                            title="View document"
                            className="rounded-lg p-2 text-slate-400 hover:bg-slate-700 hover:text-cyan-400"
                          >
                            <Eye size={17} />
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              alert(
                                'More document actions will be added later.'
                              )
                            }
                            title="More actions"
                            className="rounded-lg p-2 text-slate-400 hover:bg-slate-700 hover:text-cyan-400"
                          >
                            <MoreHorizontal size={17} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}

                  {filteredDocuments.length === 0 && (
                    <tr>
                      <td
                        colSpan={5}
                        className="px-5 py-12 text-center text-slate-400"
                      >
                        No documents found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Demo Notice */}
            <div className="border-t border-slate-800 px-5 py-4 text-xs text-slate-500">
              Demo interface · Encryption, permanent storage and integrity
              verification are not connected yet.
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

function StatCard({ icon, label, value }) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-[#0d1526] p-5">
      <div className="mb-4 inline-flex rounded-xl bg-cyan-500/10 p-3 text-cyan-400">
        {icon}
      </div>

      <p className="text-sm text-slate-400">{label}</p>

      <p className="mt-2 text-2xl font-bold text-white">{value}</p>
    </div>
  )
}
