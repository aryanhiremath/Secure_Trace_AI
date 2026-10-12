
import { useState } from 'react'
import {
  Search,
  Upload,
  FileText,
  Download,
  Eye,
  ShieldCheck,
  Clock,
  MoreHorizontal,
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

export default function DocumentsPage() {
  const [documents, setDocuments] = useState(initialDocuments)
  const [search, setSearch] = useState('')

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
      alert(
        'This is sample data. Upload a real file to download it here.'
      )
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
      alert(
        'This is sample data. Upload a real file to view it here.'
      )
      return
    }

    const url = URL.createObjectURL(document.file)
    window.open(url, '_blank', 'noopener,noreferrer')
  }

  return (
    <div className="min-h-screen bg-[#080e1c] p-4 text-slate-100 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl space-y-7">

        {/* Page Header */}
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <p className="mb-2 text-sm text-cyan-400">
              SecureTrace AI / Workspace
            </p>

            <h1 className="text-3xl font-bold">
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
        <div className="grid gap-4 sm:grid-cols-3">
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
        <div className="rounded-2xl border border-slate-800 bg-[#0d1526]">
          <div className="flex flex-col justify-between gap-4 border-b border-slate-800 p-5 sm:flex-row sm:items-center">
            <div>
              <h2 className="text-lg font-semibold">
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
                className="w-full rounded-xl border border-slate-700 bg-[#080e1c] py-2.5 pl-10 pr-3 text-sm outline-none focus:border-cyan-500"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[700px] text-left text-sm">
              <thead className="bg-slate-900/60 text-slate-400">
                <tr>
                  <th className="px-5 py-4 font-medium">
                    Document
                  </th>

                  <th className="px-5 py-4 font-medium">
                    File Size
                  </th>

                  <th className="px-5 py-4 font-medium">
                    Uploaded
                  </th>

                  <th className="px-5 py-4 font-medium">
                    Status
                  </th>

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
            Demo interface · Encryption, permanent storage and
            integrity verification are not connected yet.
          </div>
        </div>
      </div>
    </div>
  )
}

function StatCard({ icon, label, value }) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-[#0d1526] p-5">
      <div className="mb-4 inline-flex rounded-xl bg-cyan-500/10 p-3 text-cyan-400">
        {icon}
      </div>

      <p className="text-sm text-slate-400">
        {label}
      </p>

      <p className="mt-2 text-2xl font-bold">
        {value}
      </p>
    </div>
  )
}
