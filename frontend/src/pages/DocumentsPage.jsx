
import { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Search,
  Upload,
  FileText,
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

const API_BASE_URL = 'http://127.0.0.1:8000'

const navigation = [
  { label: 'Overview', icon: LayoutDashboard, path: '/dashboard' },
  { label: 'Documents', icon: FileText, path: '/documents' },
  { label: 'Shared Files', icon: Share2, path: '/sharing' },
  { label: 'Audit Trail', icon: ClipboardList, path: '/audit' },
  { label: 'Investigation', icon: ShieldAlert, path: '/investigation' },
]

const ALLOWED_EXTENSIONS = [
  '.pdf',
  '.doc',
  '.docx',
  '.txt',
  '.png',
  '.jpg',
  '.jpeg',
]

const MAX_FILE_SIZE = 10 * 1024 * 1024

function getCurrentUserEmail() {
  return (
    localStorage.getItem('securetrace_current_user') || ''
  ).trim().toLowerCase()
}

function getUserHeaders() {
  return {
    'X-User-Email': getCurrentUserEmail(),
  }
}

function formatFileSize(bytes) {
  if (bytes >= 1024 * 1024) {
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`
  }

  if (bytes >= 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`
  }

  return `${bytes} bytes`
}

function formatDate(dateValue) {
  if (!dateValue) return '—'

  const date = new Date(dateValue)

  if (Number.isNaN(date.getTime())) return '—'

  return date.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

function getFileType(filename, contentType) {
  const extension = filename.split('.').pop()?.toLowerCase()

  const types = {
    pdf: 'PDF Document',
    doc: 'Word Document',
    docx: 'Word Document',
    txt: 'Text Document',
    png: 'PNG Image',
    jpg: 'JPEG Image',
    jpeg: 'JPEG Image',
  }

  return types[extension] || contentType || 'File'
}

function mapApiDocument(document) {
  return {
    id: document.id,
    name: document.filename,
    type: getFileType(document.filename, document.content_type),
    size: formatFileSize(document.file_size),
    date: formatDate(document.uploaded_at),
    status: 'Uploaded',
    contentType: document.content_type,
  }
}

export default function DocumentsPage() {
  const navigate = useNavigate()

  const [documents, setDocuments] = useState([])
  const [search, setSearch] = useState('')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [activeMenu, setActiveMenu] = useState(null)

  const fetchDocuments = useCallback(async () => {
    const email = getCurrentUserEmail()

    if (!email) {
      setDocuments([])
      setError('Please log in to view your documents.')
      setLoading(false)
      return
    }

    setLoading(true)
    setError('')

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/documents`,
        {
          headers: getUserHeaders(),
        }
      )

      if (!response.ok) {
        const body = await response.json().catch(() => ({}))

        throw new Error(
          body.detail || 'Could not load documents from the backend.'
        )
      }

      const data = await response.json()
      setDocuments(data.map(mapApiDocument))
    } catch (err) {
      setError(
        err.message ||
          'Cannot connect to the backend. Make sure FastAPI is running.'
      )
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchDocuments()
  }, [fetchDocuments])

  function handleNavigation(path) {
    setSidebarOpen(false)

    if (path === '/investigation') {
      alert('Investigation page is coming soon.')
      return
    }

    navigate(path)
  }

  async function handleUpload(event) {
    const files = Array.from(event.target.files || [])
    event.target.value = ''

    if (files.length === 0) return

    const email = getCurrentUserEmail()

    if (!email) {
      setError('Please log in before uploading documents.')
      return
    }

    setUploading(true)
    setError('')
    setNotice('')

    const successfulUploads = []
    const failedUploads = []

    try {
      for (const file of files) {
        const extension = `.${file.name.split('.').pop()?.toLowerCase()}`

        if (!ALLOWED_EXTENSIONS.includes(extension)) {
          failedUploads.push(`${file.name}: unsupported file type`)
          continue
        }

        if (file.size > MAX_FILE_SIZE) {
          failedUploads.push(`${file.name}: exceeds the 10 MB limit`)
          continue
        }

        if (file.size === 0) {
          failedUploads.push(`${file.name}: empty files are not allowed`)
          continue
        }

        const formData = new FormData()
        formData.append('file', file)

        try {
          const response = await fetch(
            `${API_BASE_URL}/api/documents/upload`,
            {
              method: 'POST',
              headers: getUserHeaders(),
              body: formData,
            }
          )

          if (!response.ok) {
            let message = `Upload failed (${response.status})`

            try {
              const body = await response.json()

              if (body.detail) {
                message = body.detail
              }
            } catch {
              // Keep the default error message.
            }

            failedUploads.push(`${file.name}: ${message}`)
            continue
          }

          successfulUploads.push(file.name)
        } catch {
          failedUploads.push(
            `${file.name}: backend connection failed`
          )
        }
      }

      if (successfulUploads.length > 0) {
        setNotice(
          `${successfulUploads.length} file(s) uploaded successfully.`
        )

        await fetchDocuments()
      }

      if (failedUploads.length > 0) {
        setError(failedUploads.join('\n'))
      }
    } finally {
      setUploading(false)
    }
  }

  function viewDocument(document) {
    if (!document.id) return

    setError('')
    setNotice('')

    const email = getCurrentUserEmail()

    if (!email) {
      setError('Please log in to preview documents.')
      return
    }

    if (!document.name.toLowerCase().endsWith('.pdf')) {
      setError(
        'Browser preview is currently available for PDF files only.'
      )
      return
    }

    const previewUrl =
      `${API_BASE_URL}/api/documents/${document.id}/preview` +
      `?owner_email=${encodeURIComponent(email)}`

    const previewWindow = window.open(
      previewUrl,
      '_blank',
      'noopener,noreferrer'
    )

    if (!previewWindow) {
      setError('Please allow pop-ups to preview documents.')
    }
  }

  const filteredDocuments = documents.filter((document) =>
    document.name.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-[#080e1c] text-slate-100">
      {sidebarOpen && (
        <button
          type="button"
          aria-label="Close sidebar"
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 z-30 bg-black/60 lg:hidden"
        />
      )}

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
            <p className="text-xs text-cyan-400">
              AI SECURITY PLATFORM
            </p>
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
              <span className="text-sm font-medium">
                System Status
              </span>
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

      <main className="min-h-screen lg:ml-64">
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
            <span className="text-sm text-slate-400">
              Admin Workspace
            </span>
          </div>
        </header>

        <div className="mx-auto max-w-7xl space-y-7 p-4 sm:p-6 lg:p-8">
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

            <label
              className={`flex cursor-pointer items-center justify-center gap-2 rounded-xl px-5 py-3 font-semibold text-slate-950 transition ${
                uploading
                  ? 'cursor-not-allowed bg-cyan-500/60'
                  : 'bg-cyan-500 hover:bg-cyan-400'
              }`}
            >
              <Upload size={18} />
              {uploading ? 'Uploading...' : 'Upload Document'}

              <input
                type="file"
                multiple
                accept=".pdf,.doc,.docx,.txt,.png,.jpg,.jpeg"
                className="hidden"
                disabled={uploading}
                onChange={handleUpload}
              />
            </label>
          </div>

          {error && (
            <div
              role="alert"
              className="whitespace-pre-line rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-300"
            >
              {error}
            </div>
          )}

          {notice && (
            <div
              role="status"
              className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300"
            >
              {notice}
            </div>
          )}

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            <StatCard
              icon={<FileText size={21} />}
              label="Total Documents"
              value={documents.length}
            />

            <StatCard
              icon={<ShieldCheck size={21} />}
              label="Uploaded Documents"
              value={documents.length}
            />

            <StatCard
              icon={<Clock size={21} />}
              label="Pending Verification"
              value={0}
            />
          </div>

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
                  {loading ? (
                    <tr>
                      <td
                        colSpan={5}
                        className="px-5 py-12 text-center text-slate-400"
                      >
                        Loading documents...
                      </td>
                    </tr>
                  ) : filteredDocuments.length === 0 ? (
                    <tr>
                      <td
                        colSpan={5}
                        className="px-5 py-12 text-center text-slate-400"
                      >
                        {error
                          ? 'Documents could not be loaded.'
                          : 'No documents found. Upload your first document.'}
                      </td>
                    </tr>
                  ) : (
                    filteredDocuments.map((document) => (
                      <tr
                        key={document.id}
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
                          <span className="rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-400">
                            {document.status}
                          </span>
                        </td>

                        <td className="px-5 py-4">
                          <div className="flex justify-end gap-2">
                            <button
                              type="button"
                              onClick={() => viewDocument(document)}
                              title="Preview document"
                              className="rounded-lg p-2 text-slate-400 hover:bg-slate-700 hover:text-cyan-400"
                            >
                              <Eye size={17} />
                            </button>

                            <div className="relative">
                              <button
                                type="button"
                                onClick={() =>
                                  setActiveMenu((current) =>
                                    current === document.id
                                      ? null
                                      : document.id
                                  )
                                }
                                title="More actions"
                                aria-label={`More actions for ${document.name}`}
                                aria-expanded={activeMenu === document.id}
                                className="rounded-lg p-2 text-slate-400 hover:bg-slate-700 hover:text-cyan-400"
                              >
                                <MoreHorizontal size={17} />
                              </button>

                              {activeMenu === document.id && (
                                <div className="absolute right-0 top-full z-30 mt-2 w-44 rounded-xl border border-slate-700 bg-[#111b2d] p-1 shadow-xl">
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setActiveMenu(null)
                                      viewDocument(document)
                                    }}
                                    className="w-full rounded-lg px-3 py-2 text-left text-sm text-slate-200 hover:bg-slate-700"
                                  >
                                    <Eye
                                      size={15}
                                      className="mr-2 inline"
                                    />
                                    Preview
                                  </button>

                                  <button
                                    type="button"
                                    onClick={() => {
                                      setActiveMenu(null)
                                      setNotice(
                                        `File: ${document.name} | ID: ${document.id}`
                                      )
                                    }}
                                    className="w-full rounded-lg px-3 py-2 text-left text-sm text-slate-200 hover:bg-slate-700"
                                  >
                                    <FileText
                                      size={15}
                                      className="mr-2 inline"
                                    />
                                    File details
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            <div className="border-t border-slate-800 px-5 py-4 text-xs text-slate-500">
              Files are stored locally by the backend. Encryption, access
              control and integrity verification are not implemented yet.
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
