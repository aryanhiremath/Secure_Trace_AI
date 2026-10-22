import { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ShieldCheck, LayoutDashboard, Files, Share2, ClipboardList,
  ScanSearch, Search, Bell, Plus, Link2, Copy, Check, Clock3,
  FileText, Download, Eye, X, Shield, ChevronDown, Menu, LogOut,
} from 'lucide-react'

const API_BASE_URL = 'http://127.0.0.1:8000'

const navigation = [
  { label: 'Overview', icon: LayoutDashboard, path: '/dashboard' },
  { label: 'Documents', icon: Files, path: '/documents' },
  { label: 'Shared Files', icon: Share2, path: '/sharing' },
  { label: 'Audit Trail', icon: ClipboardList, path: '/audit' },
  { label: 'Investigation', icon: ScanSearch, path: '/investigation' },
]

const expiryOptions = [
  { label: '1 hour', hours: 1 },
  { label: '24 hours', hours: 24 },
  { label: '7 days', hours: 168 },
  { label: '30 days', hours: 720 },
]

function getCurrentUserEmail() {
  return (localStorage.getItem('securetrace_current_user') || '').trim().toLowerCase()
}

function getUserHeaders() {
  return { 'X-User-Email': getCurrentUserEmail() }
}

function formatExpiry(value) {
  if (!value) return 'No expiry'
  const date = new Date(value)
  return Number.isNaN(date.getTime())
    ? '—'
    : date.toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })
}

function permissionLabel(permission) {
  return permission === 'view_download' ? 'View & Download' : 'View only'
}

export default function SharingPage() {
  const navigate = useNavigate()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [documents, setDocuments] = useState([])
  const [documentId, setDocumentId] = useState('')
  const [email, setEmail] = useState('')
  const [permission, setPermission] = useState('view_only')
  const [expiryHours, setExpiryHours] = useState(168)
  const [shares, setShares] = useState([])
  const [receivedShares, setReceivedShares] = useState([])
  const [search, setSearch] = useState('')
  const [notice, setNotice] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [copiedId, setCopiedId] = useState(null)

  const currentEmail = getCurrentUserEmail()

  const fetchAll = useCallback(async () => {
    if (!getCurrentUserEmail()) {
      setError('Please log in to manage shared files.')
      setLoading(false)
      return
    }

    setLoading(true)
    setError('')
    try {
      const [docsResponse, sharesResponse, receivedResponse] = await Promise.all([
        fetch(`${API_BASE_URL}/api/documents`, { headers: getUserHeaders() }),
        fetch(`${API_BASE_URL}/api/shares`, { headers: getUserHeaders() }),
        fetch(`${API_BASE_URL}/api/shares/received`, { headers: getUserHeaders() }),
      ])

      const responses = [docsResponse, sharesResponse, receivedResponse]
      for (const response of responses) {
        if (!response.ok) {
          const body = await response.json().catch(() => ({}))
          throw new Error(body.detail || 'Could not load sharing data.')
        }
      }

      const [docs, created, received] = await Promise.all(
        responses.map((response) => response.json())
      )
      setDocuments(docs)
      setShares(created)
      setReceivedShares(received)
      if (!documentId && docs.length) setDocumentId(String(docs[0].id))
    } catch (err) {
      setError(err.message || 'Cannot connect to the backend. Make sure FastAPI is running.')
    } finally {
      setLoading(false)
    }
  }, [documentId])

  useEffect(() => {
    fetchAll()
  }, [fetchAll])

  const activeShares = shares.filter((share) => share.status === 'Active')
  const filteredShares = useMemo(() => shares.filter((share) =>
    `${share.document} ${share.recipient_email} ${share.id}`.toLowerCase().includes(search.toLowerCase())
  ), [shares, search])

  async function handleCreateShare(event) {
    event.preventDefault()
    setError('')
    setNotice('')

    if (!documentId) {
      setError('Upload a document first, then create a share.')
      return
    }

    const normalizedEmail = email.trim().toLowerCase()
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
      setError('Please enter a valid recipient email address.')
      return
    }

    setCreating(true)
    try {
      const response = await fetch(`${API_BASE_URL}/api/shares`, {
        method: 'POST',
        headers: { ...getUserHeaders(), 'Content-Type': 'application/json' },
        body: JSON.stringify({
          document_id: Number(documentId),
          recipient_email: normalizedEmail,
          permission,
          expiry_hours: Number(expiryHours),
        }),
      })
      const body = await response.json().catch(() => ({}))
      if (!response.ok) throw new Error(body.detail || 'Could not create share.')

      setEmail('')
      setNotice(`Shared ${body.document} with ${body.recipient_email}.`)
      await fetchAll()
    } catch (err) {
      setError(err.message || 'Could not create share.')
    } finally {
      setCreating(false)
    }
  }

  async function handleRevoke(shareId) {
    setError('')
    setNotice('')
    try {
      const response = await fetch(`${API_BASE_URL}/api/shares/${shareId}/revoke`, {
        method: 'POST',
        headers: getUserHeaders(),
      })
      const body = await response.json().catch(() => ({}))
      if (!response.ok) throw new Error(body.detail || 'Could not revoke share.')
      setNotice('Share revoked. Recipient access is now blocked.')
      await fetchAll()
    } catch (err) {
      setError(err.message || 'Could not revoke share.')
    }
  }

  async function handleCopy(share) {
    const link = `${window.location.origin}/sharing`
    try {
      await navigator.clipboard.writeText(link)
      setCopiedId(share.id)
      setNotice(`Sharing page link copied. Ask ${share.recipient_email} to log in with that account to see Shared with me.`)
    } catch {
      setNotice(`Recipient: ${share.recipient_email}. Ask them to log in and open Shared Files.`)
    }
  }

  async function previewSharedDocument(share) {
    setError('')
    setNotice('')
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/documents/${share.document_id}/preview`,
        { headers: getUserHeaders() }
      )
      if (!response.ok) {
        const body = await response.json().catch(() => ({}))
        throw new Error(body.detail || 'Preview access denied.')
      }
      const blob = await response.blob()
      const objectUrl = URL.createObjectURL(blob)
      window.open(objectUrl, '_blank', 'noopener,noreferrer')
      window.setTimeout(() => URL.revokeObjectURL(objectUrl), 60_000)
    } catch (err) {
      setError(err.message || 'Could not preview this file. Browser preview supports PDF only.')
    }
  }

  async function downloadSharedDocument(share) {
    setError('')
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/documents/${share.document_id}/download`,
        { headers: getUserHeaders() }
      )
      if (!response.ok) {
        const body = await response.json().catch(() => ({}))
        throw new Error(body.detail || 'Download permission denied.')
      }
      const blob = await response.blob()
      const objectUrl = URL.createObjectURL(blob)
      const anchor = document.createElement('a')
      anchor.href = objectUrl
      anchor.download = share.document
      document.body.appendChild(anchor)
      anchor.click()
      anchor.remove()
      URL.revokeObjectURL(objectUrl)
    } catch (err) {
      setError(err.message || 'Could not download this file.')
    }
  }

  function SidebarContent() {
    return (
      <>
        <div className="flex items-center gap-3 px-5 py-6">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-400/10 text-cyan-400"><ShieldCheck size={25} /></div>
          <div><h1 className="text-lg font-bold tracking-wide text-white">SecureTrace</h1><p className="text-xs text-slate-500">AI SECURITY PLATFORM</p></div>
        </div>
        <div className="px-5 pb-3 pt-5 text-xs font-semibold uppercase tracking-widest text-slate-500">Workspace</div>
        <nav className="space-y-1 px-3">
          {navigation.map(({ label, icon: Icon, path }) => {
            const active = path === '/sharing'
            return <button key={label} onClick={() => {
              setMobileMenuOpen(false)
              if (path === '/investigation') { setNotice('Investigation page is coming soon.'); return }
              navigate(path)
            }} className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm transition ${active ? 'border border-cyan-400/20 bg-cyan-400/10 font-medium text-cyan-300' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}>
              <Icon size={18} />{label}{active && <span className="ml-auto h-2 w-2 rounded-full bg-cyan-400" />}
            </button>
          })}
        </nav>
        <div className="mt-auto border-t border-slate-800 p-4">
          <div className="flex items-center gap-3 rounded-xl p-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-700 font-semibold text-cyan-300">{currentEmail.charAt(0).toUpperCase() || 'U'}</div>
            <div className="min-w-0 flex-1"><p className="truncate text-sm font-medium text-white">{currentEmail || 'Not logged in'}</p><p className="text-xs text-slate-500">Demo workspace</p></div>
            <button onClick={() => navigate('/login')} title="Log out" className="text-slate-500 hover:text-white"><LogOut size={17} /></button>
          </div>
        </div>
      </>
    )
  }

  return (
    <div className="min-h-screen bg-[#080f1d] text-slate-200">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col border-r border-slate-800 bg-[#0b1424] lg:flex"><SidebarContent /></aside>
      {mobileMenuOpen && <div className="fixed inset-0 z-50 lg:hidden"><button aria-label="Close navigation" className="absolute inset-0 bg-black/60" onClick={() => setMobileMenuOpen(false)} /><aside className="absolute inset-y-0 left-0 flex w-72 flex-col border-r border-slate-800 bg-[#0b1424]"><div className="flex justify-end px-4 pt-4"><button onClick={() => setMobileMenuOpen(false)} aria-label="Close menu"><X size={22} /></button></div><SidebarContent /></aside></div>}

      <main className="min-h-screen lg:ml-64">
        <header className="sticky top-0 z-20 flex h-[76px] items-center justify-between border-b border-slate-800 bg-[#080f1d]/95 px-4 backdrop-blur md:px-8">
          <div className="flex items-center gap-3"><button className="text-slate-300 lg:hidden" onClick={() => setMobileMenuOpen(true)} aria-label="Open navigation"><Menu size={22} /></button><div><p className="text-xs text-slate-500">Workspace / Shared Files</p><h2 className="text-lg font-semibold text-white">Secure Sharing</h2></div></div>
          <div className="flex items-center gap-3"><div className="hidden items-center gap-2 rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-xs text-slate-400 sm:flex"><Shield size={15} className="text-cyan-400" />Backend access control</div><button className="relative rounded-xl border border-slate-800 p-2.5 text-slate-400 hover:text-white" aria-label="Notifications" onClick={() => setNotice('You are all caught up.')}><Bell size={18} /></button></div>
        </header>

        <div className="mx-auto max-w-7xl space-y-7 p-4 md:p-8">
          <section className="relative overflow-hidden rounded-2xl border border-cyan-400/15 bg-gradient-to-br from-[#10283a] via-[#102033] to-[#10182a] p-6 md:p-8">
            <div className="pointer-events-none absolute -right-10 -top-16 h-56 w-56 rounded-full bg-cyan-400/10 blur-3xl" />
            <div className="relative flex flex-col justify-between gap-5 md:flex-row md:items-center">
              <div className="max-w-2xl"><div className="mb-3 inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1.5 text-xs font-medium text-cyan-300"><ShieldCheck size={14} />Controlled document access</div><h1 className="text-2xl font-bold text-white md:text-3xl">Share files with confidence.</h1><p className="mt-3 max-w-xl text-sm leading-6 text-slate-400">Share your uploaded documents with another configured demo user. Permissions, expiry and revocation are checked by the backend.</p></div>
              <div className="flex h-20 w-20 shrink-0 items-center justify-center self-start rounded-2xl border border-cyan-300/20 bg-cyan-400/10 text-cyan-300 md:self-center"><Share2 size={38} strokeWidth={1.5} /></div>
            </div>
          </section>

          {notice && <div role="status" className="flex items-start justify-between gap-3 rounded-xl border border-cyan-400/20 bg-cyan-400/10 px-4 py-3 text-sm text-cyan-200"><span>{notice}</span><button onClick={() => setNotice('')} aria-label="Dismiss notification" className="shrink-0"><X size={16} /></button></div>}
          {error && <div role="alert" className="whitespace-pre-line rounded-xl border border-rose-400/20 bg-rose-400/10 px-4 py-3 text-sm text-rose-200">{error}</div>}

          <section className="grid gap-4 sm:grid-cols-3">
            {[{ label: 'Total shares', value: shares.length, icon: Link2, color: 'text-cyan-300' }, { label: 'Active shares', value: activeShares.length, icon: ShieldCheck, color: 'text-emerald-300' }, { label: 'Received shares', value: receivedShares.filter((s) => s.status === 'Active').length, icon: Eye, color: 'text-violet-300' }].map(({ label, value, icon: Icon, color }) => (
              <div key={label} className="rounded-2xl border border-slate-800 bg-[#0d1728] p-5"><div className="flex items-center justify-between"><p className="text-sm text-slate-400">{label}</p><Icon size={19} className={color} /></div><p className="mt-4 text-3xl font-bold text-white">{value}</p><p className="mt-1 text-xs text-slate-500">Current demo account</p></div>
            ))}
          </section>

          <section className="grid items-start gap-6 xl:grid-cols-[0.9fr_1.1fr]">
            <div className="rounded-2xl border border-slate-800 bg-[#0d1728] p-5 md:p-6">
              <div className="mb-6 flex items-start justify-between gap-3"><div><h3 className="text-lg font-semibold text-white">Create a share</h3><p className="mt-1 text-sm text-slate-500">Choose one of your uploaded documents.</p></div><div className="rounded-xl bg-cyan-400/10 p-2.5 text-cyan-300"><Plus size={20} /></div></div>
              <form onSubmit={handleCreateShare} className="space-y-5">
                <div><label htmlFor="document" className="mb-2 block text-sm font-medium text-slate-300">Select document</label><div className="relative"><FileText className="absolute left-3 top-3.5 text-slate-500" size={17} /><select id="document" value={documentId} onChange={(event) => setDocumentId(event.target.value)} required disabled={!documents.length} className="w-full appearance-none rounded-xl border border-slate-700 bg-[#091221] py-3 pl-10 pr-10 text-sm text-white outline-none focus:border-cyan-400">{documents.length ? documents.map((item) => <option key={item.id} value={item.id}>{item.filename}</option>) : <option value="">No uploaded documents</option>}</select><ChevronDown className="pointer-events-none absolute right-3 top-3.5 text-slate-500" size={17} /></div></div>
                <div><label htmlFor="recipient" className="mb-2 block text-sm font-medium text-slate-300">Recipient email</label><input id="recipient" type="email" required value={email} onChange={(event) => setEmail(event.target.value)} placeholder="aryan@gmail.com" className="w-full rounded-xl border border-slate-700 bg-[#091221] px-4 py-3 text-sm text-white outline-none placeholder:text-slate-600 focus:border-cyan-400" /><p className="mt-2 text-xs leading-5 text-slate-500">Allowed demo users: admin@securetrace.ai, isba@gmail.com, aryan@gmail.com, shreyas@gmail.com, mustakim@gmail.com</p></div>
                <div><label className="mb-2 block text-sm font-medium text-slate-300">Access permission</label><div className="grid grid-cols-2 gap-3">{[{ value: 'view_only', label: 'View only', icon: Eye, detail: 'PDF preview only' }, { value: 'view_download', label: 'View & Download', icon: Download, detail: 'Preview + download' }].map(({ value, label, icon: Icon, detail }) => <button type="button" key={value} onClick={() => setPermission(value)} className={`rounded-xl border p-3 text-left transition ${permission === value ? 'border-cyan-400/60 bg-cyan-400/10 text-cyan-200' : 'border-slate-700 bg-[#091221] text-slate-400 hover:border-slate-500'}`}><Icon size={18} className="mb-3" /><span className="block text-sm font-medium">{label}</span><span className="mt-1 block text-xs text-slate-500">{detail}</span></button>)}</div></div>
                <div><label htmlFor="expiry" className="mb-2 block text-sm font-medium text-slate-300">Access expiry</label><div className="relative"><Clock3 className="absolute left-3 top-3.5 text-slate-500" size={17} /><select id="expiry" value={expiryHours} onChange={(event) => setExpiryHours(Number(event.target.value))} className="w-full appearance-none rounded-xl border border-slate-700 bg-[#091221] py-3 pl-10 pr-10 text-sm text-white outline-none focus:border-cyan-400">{expiryOptions.map((option) => <option key={option.hours} value={option.hours}>{option.label}</option>)}</select><ChevronDown className="pointer-events-none absolute right-3 top-3.5 text-slate-500" size={17} /></div></div>
                <div className="rounded-xl border border-amber-400/15 bg-amber-400/5 p-3 text-xs leading-5 text-amber-200/80">Demo authentication uses a request header, not a verified login token. This is for project demonstration only, not confidential production files.</div>
                <button type="submit" disabled={creating || !documents.length} className="flex w-full items-center justify-center gap-2 rounded-xl bg-cyan-400 px-4 py-3 text-sm font-semibold text-[#06111d] transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-50"><Link2 size={17} />{creating ? 'Creating share...' : 'Share document'}</button>
              </form>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-[#0d1728] p-5 md:p-6">
              <div className="mb-5 flex flex-col justify-between gap-4 sm:flex-row sm:items-center"><div><h3 className="text-lg font-semibold text-white">Shared by me</h3><p className="mt-1 text-sm text-slate-500">Manage your active and revoked permissions.</p></div><span className="w-fit rounded-full border border-slate-700 px-3 py-1 text-xs text-slate-400">{activeShares.length} active</span></div>
              <div className="relative mb-5"><Search className="absolute left-3 top-3 text-slate-500" size={17} /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search files or recipients..." className="w-full rounded-xl border border-slate-700 bg-[#091221] py-2.5 pl-10 pr-4 text-sm text-white outline-none placeholder:text-slate-600 focus:border-cyan-400" /></div>
              {loading ? <p className="py-8 text-center text-sm text-slate-400">Loading shares...</p> : <div className="space-y-3">
                {filteredShares.map((share) => <div key={share.id} className="rounded-xl border border-slate-800 bg-[#091221] p-4">
                  <div className="flex items-start gap-3"><div className="rounded-lg border border-cyan-400/15 bg-cyan-400/10 p-2.5 text-cyan-300"><FileText size={20} /></div><div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-2"><p className="break-all text-sm font-semibold text-white">{share.document}</p><span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${share.status === 'Active' ? 'bg-emerald-400/10 text-emerald-300' : 'bg-rose-400/10 text-rose-300'}`}>{share.status}</span></div><p className="mt-1 break-all text-xs text-slate-500">To: {share.recipient_email}</p></div></div>
                  <div className="mt-4 grid grid-cols-2 gap-3 border-y border-slate-800 py-3"><div><p className="text-[11px] text-slate-500">Permission</p><p className="mt-1 text-xs text-slate-300">{permissionLabel(share.permission)}</p></div><div><p className="text-[11px] text-slate-500">Expires</p><p className="mt-1 text-xs text-slate-300">{formatExpiry(share.expires_at)}</p></div></div>
                  <div className="mt-3 flex flex-wrap items-center justify-between gap-3"><span className="text-[11px] text-slate-500">Share ID: {share.id}</span><div className="flex gap-2">{share.status === 'Active' && <><button onClick={() => handleCopy(share)} className="inline-flex items-center gap-1.5 rounded-lg border border-cyan-400/20 px-3 py-2 text-xs font-medium text-cyan-300 hover:bg-cyan-400/10">{copiedId === share.id ? <Check size={14} /> : <Copy size={14} />}{copiedId === share.id ? 'Copied' : 'Copy page link'}</button><button onClick={() => handleRevoke(share.id)} className="rounded-lg border border-rose-400/20 px-3 py-2 text-xs text-rose-300 hover:bg-rose-400/10">Revoke</button></>}</div></div>
                </div>)}
                {filteredShares.length === 0 && <div className="rounded-xl border border-dashed border-slate-700 p-8 text-center"><Search className="mx-auto text-slate-600" size={26} /><p className="mt-3 text-sm text-slate-300">No matching shares</p><p className="mt-1 text-xs text-slate-500">Create a share or try another search.</p></div>}
              </div>}
            </div>
          </section>

          <section className="rounded-2xl border border-slate-800 bg-[#0d1728] p-5 md:p-6">
            <div className="mb-5"><h3 className="text-lg font-semibold text-white">Shared with me</h3><p className="mt-1 text-sm text-slate-500">Files another demo user has shared with {currentEmail || 'this account'}.</p></div>
            {receivedShares.length === 0 ? <div className="rounded-xl border border-dashed border-slate-700 p-7 text-center text-sm text-slate-400">No files have been shared with this account yet.</div> : <div className="grid gap-3 md:grid-cols-2">{receivedShares.map((share) => <div key={share.id} className="rounded-xl border border-slate-800 bg-[#091221] p-4"><div className="flex items-start gap-3"><div className="rounded-lg bg-violet-400/10 p-2.5 text-violet-300"><FileText size={20} /></div><div className="min-w-0 flex-1"><p className="break-all text-sm font-semibold text-white">{share.document}</p><p className="mt-1 break-all text-xs text-slate-500">From: {share.owner_email}</p><p className="mt-2 text-xs text-slate-400">{permissionLabel(share.permission)} · {share.status}</p><p className="mt-1 text-xs text-slate-500">Expires: {formatExpiry(share.expires_at)}</p></div></div>{share.status === 'Active' && <div className="mt-4 flex gap-2"><button onClick={() => previewSharedDocument(share)} className="inline-flex items-center gap-2 rounded-lg border border-cyan-400/20 px-3 py-2 text-xs text-cyan-300 hover:bg-cyan-400/10"><Eye size={14} />Preview PDF</button>{share.permission === 'view_download' && <button onClick={() => downloadSharedDocument(share)} className="inline-flex items-center gap-2 rounded-lg border border-slate-700 px-3 py-2 text-xs text-slate-200 hover:bg-slate-800"><Download size={14} />Download</button>}</div>}</div>)}</div>}
          </section>

          <footer className="flex flex-col gap-2 border-t border-slate-800 py-5 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between"><p>SecureTrace AI · Document Security Workspace</p><p className="flex items-center gap-2"><ShieldCheck size={14} className="text-cyan-400" />Backend-enforced demo sharing</p></footer>
        </div>
      </main>
    </div>
  )
}
