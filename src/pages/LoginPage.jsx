
import { useState } from 'react'
import {
  ShieldCheck,
  LockKeyhole,
  Link2,
  BrainCircuit,
  Mail,
  Eye,
  EyeOff,
  ArrowRight,
  FileLock2,
  UserRound,
} from 'lucide-react'

function App() {
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(true)
  const [isSignUp, setIsSignUp] = useState(false)

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#050b19] text-white">
      <div className="pointer-events-none absolute -left-40 top-20 h-96 w-96 rounded-full bg-blue-600/10 blur-[130px]" />
      <div className="pointer-events-none absolute bottom-0 right-0 h-96 w-96 rounded-full bg-indigo-600/10 blur-[130px]" />

      {/* Header */}
      <header className="relative z-10 flex items-center justify-between px-6 py-7 sm:px-10 lg:px-16">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center text-blue-400">
            <ShieldCheck size={46} strokeWidth={2.3} />
          </div>

          <div>
            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
              SecureTrace <span className="text-blue-500">AI</span>
            </h1>
            <p className="mt-1 text-xs tracking-[0.2em] text-blue-200/80">
              DETECT · PROTECT · TRACE
            </p>
          </div>
        </div>

        <p className="hidden text-sm text-blue-200 sm:block">
          Your Documents <span className="mx-2 text-slate-600">|</span>
          Our Priority
        </p>
      </header>

      {/* Main content */}
      <section className="relative z-10 mx-auto grid max-w-[1440px] items-center gap-12 px-6 pb-12 pt-8 sm:px-10 lg:grid-cols-[1.1fr_0.9fr] lg:gap-16 lg:px-16 lg:pb-20 lg:pt-4">

        {/* Left panel */}
        <div className="flex flex-col justify-center">
          <p className="mb-4 text-xs font-semibold tracking-[0.24em] text-blue-400 sm:text-sm">
            INTELLIGENT DOCUMENT SECURITY
          </p>

          <h2 className="max-w-xl text-4xl font-bold leading-tight tracking-tight sm:text-5xl">
            Secure Your Data,
            <br />
            Trace the Truth
          </h2>

          <p className="mt-5 max-w-lg text-base leading-7 text-blue-100/75 sm:text-lg">
            SecureTrace AI combines encryption, blockchain, and artificial
            intelligence to prevent data leaks, track document sharing, and
            help investigate unauthorized access.
          </p>

          {/* Illustration */}
          <div className="relative my-8 flex h-48 items-center justify-center sm:h-56 lg:my-5 lg:h-60">
            <div className="absolute h-40 w-40 rounded-full bg-blue-500/15 blur-3xl" />
            <div className="absolute h-36 w-36 rotate-45 rounded-3xl border border-blue-500/20 bg-blue-500/[0.04]" />
            <div className="absolute h-28 w-28 rotate-45 rounded-2xl border border-indigo-400/30 bg-indigo-500/10" />

            <div className="relative flex h-28 w-24 items-center justify-center rounded-2xl border border-blue-300/50 bg-gradient-to-br from-blue-500/30 to-indigo-700/40 shadow-[0_0_60px_rgba(37,99,235,0.25)] sm:h-32 sm:w-28">
              <FileLock2 size={66} strokeWidth={1.25} className="text-blue-200" />
            </div>

            <div className="absolute left-[22%] top-[24%] h-2 w-2 rounded-full bg-cyan-400 shadow-[0_0_14px_#22d3ee]" />
            <div className="absolute right-[23%] top-[30%] h-2 w-2 rounded-full bg-indigo-400 shadow-[0_0_14px_#818cf8]" />
            <div className="absolute bottom-[18%] left-[32%] h-1.5 w-1.5 rounded-full bg-blue-400" />
          </div>

          <div className="grid gap-5">
            <Feature
              icon={<LockKeyhole size={24} />}
              title="End-to-End Encryption"
              description="Keep your documents safe and private."
            />
            <Feature
              icon={<Link2 size={24} />}
              title="Blockchain Audit Trail"
              description="Tamper-evident logs for transparency."
            />
            <Feature
              icon={<BrainCircuit size={24} />}
              title="AI-Powered Investigation"
              description="Detect leaks, recover evidence, trace sources."
            />
          </div>

          <div className="mt-10 hidden items-center gap-3 text-sm text-blue-200/70 lg:flex">
            <ShieldCheck size={21} className="text-blue-500" />
            Built for a safer digital tomorrow
            <div className="h-px w-24 bg-blue-900" />
          </div>
        </div>

        {/* Login / Signup card */}
        <div className="mx-auto w-full max-w-[540px] rounded-2xl border border-blue-400/25 bg-[#091324]/85 p-6 shadow-[0_20px_80px_rgba(0,0,0,0.25)] backdrop-blur-xl sm:p-10 lg:p-12">

          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            {isSignUp ? 'Create Account' : 'Welcome Back'}
          </h2>

          <p className="mt-3 text-base text-blue-100/65 sm:text-lg">
            {isSignUp
              ? 'Create your SecureTrace AI account'
              : 'Sign in to your SecureTrace AI account'}
          </p>

          {/* Tabs */}
          <div className="mt-9 grid grid-cols-2 rounded-xl border border-blue-400/15 bg-[#0b172b] p-1">
            <button
              type="button"
              onClick={() => setIsSignUp(false)}
              className={`rounded-lg px-4 py-3 font-semibold transition ${
                !isSignUp
                  ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg'
                  : 'text-blue-100/80 hover:bg-white/5'
              }`}
            >
              Login
            </button>

            <button
              type="button"
              onClick={() => setIsSignUp(true)}
              className={`rounded-lg px-4 py-3 transition ${
                isSignUp
                  ? 'bg-gradient-to-r from-blue-500 to-indigo-600 font-semibold text-white shadow-lg'
                  : 'text-blue-100/80 hover:bg-white/5'
              }`}
            >
              Sign Up
            </button>
          </div>

          <form
            className="mt-9 space-y-5"
            onSubmit={(event) => {
              event.preventDefault()
              alert(
                isSignUp
                  ? 'Signup UI ready. Registration will be connected to FastAPI later.'
                  : 'Login UI ready. Authentication will be connected to FastAPI later.'
              )
            }}
          >
            {/* Name: signup only */}
            {isSignUp && (
              <label className="block">
                <span className="sr-only">Full Name</span>
                <div className="flex items-center gap-3 rounded-xl border border-slate-600/80 bg-[#081120]/70 px-4 transition focus-within:border-blue-400 focus-within:ring-2 focus-within:ring-blue-500/15">
                  <UserRound size={21} className="shrink-0 text-blue-200/80" />
                  <input
                    type="text"
                    required
                    placeholder="Full Name"
                    autoComplete="name"
                    className="min-w-0 w-full bg-transparent py-4 text-sm text-white outline-none placeholder:text-slate-400 sm:text-base"
                  />
                </div>
              </label>
            )}

            {/* Email */}
            <label className="block">
              <span className="sr-only">Email Address</span>
              <div className="flex items-center gap-3 rounded-xl border border-slate-600/80 bg-[#081120]/70 px-4 transition focus-within:border-blue-400 focus-within:ring-2 focus-within:ring-blue-500/15">
                <Mail size={21} className="shrink-0 text-blue-200/80" />
                <input
                  type="email"
                  required
                  placeholder="Email Address"
                  autoComplete="email"
                  className="min-w-0 w-full bg-transparent py-4 text-sm text-white outline-none placeholder:text-slate-400 sm:text-base"
                />
              </div>
            </label>

            {/* Password */}
            <label className="block">
              <span className="sr-only">Password</span>
              <div className="flex items-center gap-3 rounded-xl border border-slate-600/80 bg-[#081120]/70 px-4 transition focus-within:border-blue-400 focus-within:ring-2 focus-within:ring-blue-500/15">
                <LockKeyhole size={21} className="shrink-0 text-blue-200/80" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  minLength={8}
                  placeholder="Password (minimum 8 characters)"
                  autoComplete={isSignUp ? 'new-password' : 'current-password'}
                  className="min-w-0 w-full bg-transparent py-4 text-sm text-white outline-none placeholder:text-slate-400 sm:text-base"
                />
                <button
                  type="button"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  onClick={() => setShowPassword(!showPassword)}
                  className="shrink-0 text-slate-400 transition hover:text-blue-300"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </label>

            {/* Login options */}
            {!isSignUp && (
              <div className="flex flex-wrap items-center justify-between gap-3 text-sm">
                <label className="flex cursor-pointer items-center gap-2 text-blue-100/80">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(event) => setRememberMe(event.target.checked)}
                    className="h-4 w-4 accent-blue-500"
                  />
                  Remember me
                </label>

                <button
                  type="button"
                  onClick={() => alert('Password reset will be added later.')}
                  className="text-blue-400 transition hover:text-blue-300"
                >
                  Forgot password?
                </button>
              </div>
            )}

            <button
              type="submit"
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 py-4 font-semibold shadow-lg shadow-blue-950/30 transition hover:brightness-110 active:scale-[0.99]"
            >
              {isSignUp ? 'Create Account' : 'Sign In'}
              <ArrowRight size={19} />
            </button>
          </form>

          {!isSignUp && (
            <>
              <div className="my-7 flex items-center gap-4 text-sm text-slate-500">
                <div className="h-px flex-1 bg-slate-700" />
                OR
                <div className="h-px flex-1 bg-slate-700" />
              </div>

              <button
                type="button"
                onClick={() => alert('GitHub sign-in is not configured.')}
                className="w-full rounded-xl border border-slate-600/80 py-3.5 text-sm font-medium transition hover:border-blue-400/50 hover:bg-white/[0.03]"
              >
                Continue with GitHub
              </button>
            </>
          )}

          <p className="mt-8 text-center text-sm text-blue-100/65">
            {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
            <button
              type="button"
              onClick={() => setIsSignUp(!isSignUp)}
              className="ml-1 font-medium text-blue-400 hover:text-blue-300"
            >
              {isSignUp ? 'Login' : 'Sign Up'}
            </button>
          </p>
        </div>
      </section>
    </main>
  )
}

function Feature({ icon, title, description }) {
  return (
    <div className="flex items-center gap-4">
      <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-blue-400/10 bg-gradient-to-br from-blue-500/15 to-indigo-500/10 text-cyan-300">
        {icon}
      </div>

      <div>
        <h3 className="font-semibold text-blue-100">{title}</h3>
        <p className="mt-1 text-sm leading-5 text-blue-100/65">
          {description}
        </p>
      </div>
    </div>
  )
}

export default App
