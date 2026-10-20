import { useEffect, useState } from 'react'
import {
  Users,
  Plus,
  Search,
  X,
  Mail,
  ShieldCheck,
  FolderLock,
  Trash2,
  UserPlus,
  ArrowLeft,
  UsersRound,
  CheckCircle2,
  CircleUserRound,
  Menu,
  LayoutDashboard,
  Files,
  Share2,
  ScrollText,
} from 'lucide-react'
import { useLocation, useNavigate } from 'react-router-dom'

const STORAGE_KEY = 'securetrace_teams'

const NAV_ITEMS = [
  { label: 'Overview', path: '/dashboard', icon: LayoutDashboard },
  { label: 'Documents', path: '/documents', icon: Files },
  { label: 'Teams', path: '/teams', icon: Users },
  { label: 'Shared Files', path: '/sharing', icon: Share2 },
  { label: 'Audit Trail', path: '/audit', icon: ScrollText },
]

function normalizeEmail(email) {
  return (email || '').trim().toLowerCase()
}

function getCurrentUser() {
  return (
    localStorage.getItem('securetrace_current_user') ||
    'admin@securetrace.ai'
  ).trim().toLowerCase()
}

function loadTeams() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    const parsed = saved ? JSON.parse(saved) : []

    if (!Array.isArray(parsed)) return []

    return parsed.map((team) => ({
      ...team,
      members: Array.isArray(team.members) ? team.members : [],
    }))
  } catch {
    return []
  }
}

function TeamsPage() {
  const navigate = useNavigate()
  const location = useLocation()

  const [teams, setTeams] = useState(loadTeams)
  const [search, setSearch] = useState('')
  const [showCreate, setShowCreate] = useState(false)
  const [selectedTeamId, setSelectedTeamId] = useState(null)
  const [teamName, setTeamName] = useState('')
  const [description, setDescription] = useState('')
  const [memberEmail, setMemberEmail] = useState('')
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [menuOpen, setMenuOpen] = useState(false)

  const currentUser = getCurrentUser()

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(teams))
  }, [teams])

  function isTeamCreator(team) {
    return normalizeEmail(team?.creator) === currentUser
  }

  function isTeamMember(team) {
    return (
      team?.members?.some(
        (member) => normalizeEmail(member.email) === currentUser
      ) ?? false
    )
  }

  const visibleTeams = teams.filter(
    (team) => isTeamCreator(team) || isTeamMember(team)
  )

  const selectedTeam = visibleTeams.find(
    (team) => team.id === selectedTeamId
  )

  const filteredTeams = visibleTeams.filter((team) =>
    `${team.name || ''} ${team.description || ''}`
      .toLowerCase()
      .includes(search.toLowerCase())
  )

  function createTeam(event) {
    event.preventDefault()
    setError('')
    setNotice('')

    const name = teamName.trim()

    if (!name) {
      setError('Please enter a team name.')
      return
    }

    const duplicate = teams.some(
      (team) =>
        isTeamCreator(team) &&
        (team.name || '').trim().toLowerCase() === name.toLowerCase()
    )

    if (duplicate) {
      setError('You already created a team with this name.')
      return
    }

    const newTeam = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      name,
      description: description.trim(),
      creator: currentUser,
      createdAt: new Date().toISOString(),
      members: [
        {
          id: currentUser,
          email: currentUser,
          role: 'Creator',
        },
      ],
    }

    setTeams((previous) => [newTeam, ...previous])
    setTeamName('')
    setDescription('')
    setShowCreate(false)
    setNotice(`"${name}" has been created.`)
  }

  function addMember(event) {
    event.preventDefault()
    setError('')
    setNotice('')

    if (!selectedTeam) {
      setError('Team not found or you do not have access.')
      return
    }

    if (!isTeamCreator(selectedTeam)) {
      setError('Only the team creator can manage members.')
      return
    }

    const email = normalizeEmail(memberEmail)

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Please enter a valid email address.')
      return
    }

    if (email === currentUser) {
      setError('You are already the creator of this team.')
      return
    }

    if (
      selectedTeam.members.some(
        (member) => normalizeEmail(member.email) === email
      )
    ) {
      setError('This email is already in the team.')
      return
    }

    setTeams((previous) =>
      previous.map((team) =>
        team.id === selectedTeam.id && isTeamCreator(team)
          ? {
              ...team,
              members: [
                ...team.members,
                {
                  id: `${Date.now()}-${email}`,
                  email,
                  role: 'Member',
                },
              ],
            }
          : team
      )
    )

    setMemberEmail('')
    setNotice(`${email} was added to the demo team.`)
  }

  function removeMember(member) {
    if (!selectedTeam) {
      setError('Team not found or you do not have access.')
      return
    }

    if (!isTeamCreator(selectedTeam)) {
      setError('Only the team creator can manage members.')
      return
    }

    if (member.role === 'Creator') {
      setError('The team creator cannot be removed.')
      return
    }

    if (
      !window.confirm(
        `Remove ${member.email} from ${selectedTeam.name}?`
      )
    ) {
      return
    }

    setTeams((previous) =>
      previous.map((team) =>
        team.id === selectedTeam.id && isTeamCreator(team)
          ? {
              ...team,
              members: team.members.filter(
                (item) => item.id !== member.id
              ),
            }
          : team
      )
    )

    setError('')
    setNotice(`${member.email} was removed from the demo team.`)
  }

  function deleteTeam(team) {
    if (!isTeamCreator(team)) {
      setError('Only the team creator can delete this team.')
      return
    }

    if (
      !window.confirm(`Delete "${team.name}" and its team data?`)
    ) {
      return
    }

    setTeams((previous) =>
      previous.filter(
        (item) => item.id !== team.id || !isTeamCreator(item)
      )
    )

    setSelectedTeamId(null)
    setError('')
    setNotice(`"${team.name}" has been deleted.`)
  }

  function closeCreate() {
    setShowCreate(false)
    setTeamName('')
    setDescription('')
    setError('')
  }

  function openTeam(team) {
    if (!isTeamCreator(team) && !isTeamMember(team)) {
      setError('You do not have access to this team.')
      return
    }

    setSelectedTeamId(team.id)
    setError('')
    setNotice('')
    setMemberEmail('')
  }

  function handlePageNavigation(path) {
    setMenuOpen(false)
    navigate(path)
  }

  return (
    <div className="min-h-screen bg-[#080d19] text-slate-200">
      {menuOpen && (
        <button
          aria-label="Close navigation"
          onClick={() => setMenuOpen(false)}
          className="fixed inset-0 z-30 bg-black/60 lg:hidden"
        />
      )}

      {/* Sidebar Navbar */}
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
            <h1 className="font-semibold tracking-wide text-white">
              SecureTrace
            </h1>
            <p className="text-xs text-cyan-400">AI SECURITY PLATFORM</p>
          </div>
        </div>

        <div className="px-4 pt-7">
          <p className="mb-3 px-3 text-xs font-semibold uppercase tracking-widest text-slate-500">
            Workspace
          </p>

          <nav className="space-y-1">
            {NAV_ITEMS.map(({ label, path, icon: Icon }) => (
              <button
                key={path}
                onClick={() => handlePageNavigation(path)}
                className={`flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm transition ${
                  location.pathname === path
                    ? 'bg-cyan-400/10 font-medium text-cyan-300'
                    : 'text-slate-400 hover:bg-slate-800/70 hover:text-white'
                }`}
              >
                <Icon size={19} />
                {label}
              </button>
            ))}
          </nav>
        </div>

        <div className="mt-auto border-t border-slate-800 p-4">
          <div className="rounded-xl border border-slate-800 bg-slate-900 p-3">
            <div className="mb-2 flex items-center gap-2 text-cyan-300">
              <CircleUserRound size={18} />
              <span className="text-sm font-medium">Signed in as</span>
            </div>
            <p className="break-all text-xs text-slate-400">
              {currentUser}
            </p>
          </div>

          <p className="mt-4 text-center text-xs text-slate-600">
            SecureTrace AI · Project Demo
          </p>
        </div>
      </aside>

      {/* Top Navbar and Main Content */}
      <div className="lg:ml-64">
        <header className="sticky top-0 z-20 flex h-20 items-center gap-4 border-b border-slate-800 bg-[#080d19]/95 px-4 backdrop-blur-xl sm:px-8">
          <button
            onClick={() => setMenuOpen(true)}
            aria-label="Open navigation"
            className="rounded-lg p-2 text-slate-300 hover:bg-slate-800 lg:hidden"
          >
            <Menu size={22} />
          </button>

          <h2 className="font-semibold text-white">
            {NAV_ITEMS.find((item) => item.path === location.pathname)?.label ||
              'Workspace'}
          </h2>

          <div className="ml-auto flex items-center gap-2 text-sm text-slate-400">
            <CircleUserRound size={19} className="text-cyan-300" />
            <span className="hidden max-w-52 truncate sm:inline">
              {currentUser}
            </span>
          </div>
        </header>

        <main className="p-4 sm:p-8">
          <div className="mx-auto max-w-6xl">
            {selectedTeam ? (
              <>
                <button
                  onClick={() => {
                    setSelectedTeamId(null)
                    setError('')
                    setNotice('')
                  }}
                  className="mb-6 inline-flex items-center gap-2 text-sm text-slate-400 transition hover:text-cyan-300"
                >
                  <ArrowLeft size={18} />
                  Back to Teams
                </button>

                <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
                  <div>
                    <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl border border-cyan-400/20 bg-cyan-400/10 text-cyan-300">
                      <UsersRound size={28} />
                    </div>

                    <h1 className="text-3xl font-bold text-white">
                      {selectedTeam.name}
                    </h1>

                    <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">
                      {selectedTeam.description ||
                        'A secure document-sharing group.'}
                    </p>
                  </div>

                  {isTeamCreator(selectedTeam) && (
                    <button
                      onClick={() => deleteTeam(selectedTeam)}
                      className="inline-flex items-center justify-center gap-2 self-start rounded-xl border border-rose-400/20 px-4 py-3 text-sm text-rose-300 transition hover:bg-rose-400/10"
                    >
                      <Trash2 size={17} />
                      Delete Team
                    </button>
                  )}
                </div>

                <div className="mb-6 grid gap-4 sm:grid-cols-2">
                  <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5">
                    <div className="flex items-center gap-3">
                      <div className="rounded-xl bg-cyan-400/10 p-3 text-cyan-300">
                        <Users size={21} />
                      </div>
                      <div>
                        <p className="text-sm text-slate-400">Team Members</p>
                        <p className="mt-1 text-2xl font-semibold text-white">
                          {selectedTeam.members.length}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5">
                    <div className="flex items-center gap-3">
                      <div className="rounded-xl bg-emerald-400/10 p-3 text-emerald-300">
                        <ShieldCheck size={21} />
                      </div>
                      <div>
                        <p className="text-sm text-slate-400">Team Creator</p>
                        <p className="mt-1 break-all text-sm font-medium text-white">
                          {selectedTeam.creator}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid items-start gap-6 lg:grid-cols-[1.2fr_0.8fr]">
                  <section className="rounded-2xl border border-slate-800 bg-slate-900/60">
                    <div className="flex items-center justify-between border-b border-slate-800 p-5">
                      <div>
                        <h2 className="font-semibold text-white">
                          Team Members
                        </h2>
                        <p className="mt-1 text-xs text-slate-500">
                          People included in this group
                        </p>
                      </div>
                      <Users size={21} className="text-cyan-300" />
                    </div>

                    <div className="divide-y divide-slate-800">
                      {selectedTeam.members.map((member) => (
                        <div
                          key={member.id}
                          className="flex items-center gap-3 p-4 sm:p-5"
                        >
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-800 text-cyan-300">
                            <CircleUserRound size={21} />
                          </div>

                          <div className="min-w-0 flex-1">
                            <p className="break-all text-sm font-medium text-white">
                              {member.email}
                            </p>
                            <p className="mt-1 text-xs text-slate-500">
                              {member.role}
                            </p>
                          </div>

                          {member.role === 'Creator' ? (
                            <span className="shrink-0 rounded-lg bg-cyan-400/10 px-2 py-1 text-xs text-cyan-300">
                              Owner
                            </span>
                          ) : isTeamCreator(selectedTeam) ? (
                            <button
                              title="Remove member"
                              aria-label={`Remove ${member.email}`}
                              onClick={() => removeMember(member)}
                              className="rounded-lg p-2 text-slate-500 transition hover:bg-rose-400/10 hover:text-rose-300"
                            >
                              <Trash2 size={17} />
                            </button>
                          ) : null}
                        </div>
                      ))}
                    </div>
                  </section>

                  {isTeamCreator(selectedTeam) && (
                    <section className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5">
                      <div className="mb-5 flex items-center gap-3">
                        <div className="rounded-xl bg-cyan-400/10 p-3 text-cyan-300">
                          <UserPlus size={21} />
                        </div>
                        <div>
                          <h2 className="font-semibold text-white">
                            Add Members
                          </h2>
                          <p className="mt-1 text-xs text-slate-500">
                            Add members one at a time
                          </p>
                        </div>
                      </div>

                      <form onSubmit={addMember}>
                        <label
                          htmlFor="member-email"
                          className="mb-2 block text-sm text-slate-300"
                        >
                          Email address
                        </label>

                        <div className="flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-950 px-3 focus-within:border-cyan-400/60">
                          <Mail size={17} className="shrink-0 text-slate-500" />
                          <input
                            id="member-email"
                            type="email"
                            value={memberEmail}
                            onChange={(event) =>
                              setMemberEmail(event.target.value)
                            }
                            placeholder="member@example.com"
                            className="min-w-0 flex-1 bg-transparent py-3 text-sm text-white outline-none placeholder:text-slate-600"
                            required
                          />
                        </div>

                        <button
                          type="submit"
                          className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-cyan-400 px-4 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300"
                        >
                          <Plus size={18} />
                          Add to Team
                        </button>
                      </form>

                      <div className="mt-5 rounded-xl border border-slate-800 bg-slate-950/60 p-3">
                        <p className="text-xs leading-5 text-slate-400">
                          Demo mode: adding an email does not send an
                          invitation or create a real user account.
                        </p>
                      </div>
                    </section>
                  )}
                </div>

                {error && (
                  <p role="alert" className="mt-5 text-sm text-rose-300">
                    {error}
                  </p>
                )}

                {notice && (
                  <p role="status" className="mt-5 text-sm text-emerald-300">
                    {notice}
                  </p>
                )}
              </>
            ) : (
              <>
                <div className="mb-8 flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
                  <div>
                    <div className="mb-3 flex items-center gap-3">
                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-cyan-400/20 bg-cyan-400/10 text-cyan-300">
                        <Users size={27} />
                      </div>
                      <h1 className="text-3xl font-bold text-white">Teams</h1>
                    </div>

                    <p className="text-sm text-slate-400">
                      Create and manage your secure document-sharing groups.
                    </p>
                  </div>

                  <button
                    onClick={() => {
                      setShowCreate(true)
                      setError('')
                      setNotice('')
                    }}
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-cyan-400 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300"
                  >
                    <Plus size={19} />
                    Create Team
                  </button>
                </div>

                {notice && (
                  <div
                    role="status"
                    className="mb-5 flex items-center gap-2 rounded-xl border border-emerald-400/20 bg-emerald-400/5 p-4 text-sm text-emerald-300"
                  >
                    <CheckCircle2 size={18} />
                    {notice}
                  </div>
                )}

                {error && (
                  <p role="alert" className="mb-5 text-sm text-rose-300">
                    {error}
                  </p>
                )}

                <div className="mb-6 grid gap-4 sm:grid-cols-2">
                  <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5">
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-slate-400">Total Teams</p>
                      <FolderLock size={20} className="text-cyan-300" />
                    </div>
                    <p className="mt-4 text-3xl font-semibold text-white">
                      {visibleTeams.length}
                    </p>
                  </div>

                  <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5">
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-slate-400">
                        Total Memberships
                      </p>
                      <UsersRound size={20} className="text-violet-300" />
                    </div>
                    <p className="mt-4 text-3xl font-semibold text-white">
                      {visibleTeams.reduce(
                        (total, team) =>
                          total + (team.members?.length || 0),
                        0
                      )}
                    </p>
                  </div>
                </div>

                <div className="mb-5 flex items-center gap-3 rounded-xl border border-slate-800 bg-slate-900/70 px-4">
                  <Search size={19} className="text-slate-500" />
                  <input
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder="Search your teams..."
                    aria-label="Search teams"
                    className="w-full bg-transparent py-3.5 text-sm text-white outline-none placeholder:text-slate-500"
                  />
                </div>

                {filteredTeams.length > 0 ? (
                  <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                    {filteredTeams.map((team) => (
                      <article
                        key={team.id}
                        className="flex flex-col rounded-2xl border border-slate-800 bg-slate-900/70 p-5 transition hover:border-cyan-400/30"
                      >
                        <div className="mb-4 flex items-start justify-between gap-3">
                          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-cyan-400/10 text-cyan-300">
                            <UsersRound size={24} />
                          </div>

                          <span className="rounded-lg border border-slate-700 px-2.5 py-1 text-xs text-slate-400">
                            {team.members.length}{' '}
                            {team.members.length === 1 ? 'member' : 'members'}
                          </span>
                        </div>

                        <h2 className="text-lg font-semibold text-white">
                          {team.name}
                        </h2>

                        <p className="mt-2 min-h-10 break-words text-sm leading-5 text-slate-400">
                          {team.description ||
                            'Secure document-sharing group.'}
                        </p>

                        <div className="mt-5 flex items-center gap-2 border-t border-slate-800 pt-4 text-xs text-slate-500">
                          <ShieldCheck size={15} className="text-cyan-300" />
                          Created by {team.creator}
                        </div>

                        <button
                          onClick={() => openTeam(team)}
                          className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl border border-slate-700 px-4 py-3 text-sm font-medium text-slate-200 transition hover:border-cyan-400/50 hover:bg-cyan-400/5 hover:text-cyan-300"
                        >
                          <Users size={17} />
                          Manage Team
                        </button>
                      </article>
                    ))}
                  </div>
                ) : (
                  <div className="rounded-2xl border border-slate-800 bg-slate-900/60 px-6 py-14 text-center">
                    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-800 text-slate-400">
                      <Users size={30} />
                    </div>

                    <h2 className="mt-5 text-lg font-semibold text-white">
                      {visibleTeams.length === 0
                        ? 'No teams available'
                        : 'No matching teams'}
                    </h2>

                    <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-400">
                      {visibleTeams.length === 0
                        ? 'Teams you create or are added to will appear here.'
                        : 'Try a different search term.'}
                    </p>

                    {visibleTeams.length === 0 && (
                      <button
                        onClick={() => setShowCreate(true)}
                        className="mt-6 inline-flex items-center gap-2 rounded-xl bg-cyan-400 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300"
                      >
                        <Plus size={18} />
                        Create Your First Team
                      </button>
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        </main>
      </div>

      {/* Create Team Modal */}
      {showCreate && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/70 p-4 backdrop-blur-sm"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) closeCreate()
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="create-team-title"
            className="my-auto w-full max-w-lg rounded-2xl border border-slate-700 bg-[#0c1322] p-6 shadow-2xl sm:p-8"
          >
            <div className="mb-6 flex items-start justify-between">
              <div>
                <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-cyan-400/10 text-cyan-300">
                  <UsersRound size={25} />
                </div>
                <h2
                  id="create-team-title"
                  className="text-xl font-semibold text-white"
                >
                  Create New Team
                </h2>
                <p className="mt-2 text-sm text-slate-400">
                  Set up a group for secure collaboration.
                </p>
              </div>

              <button
                onClick={closeCreate}
                aria-label="Close create team dialog"
                className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-800 hover:text-white"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={createTeam} className="space-y-5">
              <div>
                <label
                  htmlFor="team-name"
                  className="mb-2 block text-sm font-medium text-slate-300"
                >
                  Team Name <span className="text-rose-300">*</span>
                </label>

                <input
                  id="team-name"
                  value={teamName}
                  onChange={(event) => setTeamName(event.target.value)}
                  placeholder="e.g. Research Team"
                  maxLength={60}
                  required
                  autoFocus
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-cyan-400/60"
                />
              </div>

              <div>
                <label
                  htmlFor="team-description"
                  className="mb-2 block text-sm font-medium text-slate-300"
                >
                  Description
                </label>

                <textarea
                  id="team-description"
                  value={description}
                  onChange={(event) => setDescription(event.target.value)}
                  placeholder="What will this team work on?"
                  rows={3}
                  maxLength={240}
                  className="w-full resize-none rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-cyan-400/60"
                />
              </div>

              {error && (
                <p role="alert" className="text-sm text-rose-300">
                  {error}
                </p>
              )}

              <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={closeCreate}
                  className="rounded-xl border border-slate-700 px-5 py-3 text-sm font-medium text-slate-300 transition hover:bg-slate-800"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-cyan-400 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300"
                >
                  <Plus size={18} />
                  Create Team
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default TeamsPage
