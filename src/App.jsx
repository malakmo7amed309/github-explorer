import { useCallback, useEffect, useRef, useState } from 'react'
import { friendlyError, getRepos, getUser } from './api'
import ProfileCard from './components/ProfileCard'
import Compare from './components/Compare'
import RepoList from './components/RepoList'
import Spinner from './components/Spinner'
import ErrorBox from './components/ErrorBox'

const HISTORY_KEY = 'github-explorer-history'
const DEFAULT_USER = 'malakmo7amed309'
const initialUser = () => new URLSearchParams(window.location.search).get('u') || DEFAULT_USER
const initialCompare = () => new URLSearchParams(window.location.search).get('vs') || ''

function loadHistory() {
  try {
    return JSON.parse(localStorage.getItem(HISTORY_KEY)) || []
  } catch {
    return []
  }
}

export default function App() {
  const [input, setInput] = useState('')
  const [username, setUsername] = useState(initialUser)
  const [history, setHistory] = useState(loadHistory)
  const [user, setUser] = useState(null)
  const [repos, setRepos] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [vs, setVs] = useState(initialCompare)
  const [vsInput, setVsInput] = useState('')
  const [copied, setCopied] = useState(false)
  const requestId = useRef(0)

  const load = useCallback(async (name) => {
    const id = ++requestId.current
    setLoading(true)
    setError('')
    try {
      const [u, r] = await Promise.all([getUser(name), getRepos(name)])
      if (id !== requestId.current) return
      setUser(u)
      setRepos(r)
    } catch (err) {
      if (id !== requestId.current) return
      setUser(null)
      setRepos([])
      setError(friendlyError(err, name))
    } finally {
      if (id === requestId.current) setLoading(false)
    }
  }, [])

  useEffect(() => {
    const p = new URLSearchParams()
    p.set('u', username)
    if (vs) p.set('vs', vs)
    window.history.replaceState(null, '', `?${p.toString()}`)
  }, [username, vs])

  function copyLink() {
    navigator.clipboard?.writeText(window.location.href).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    })
  }

  useEffect(() => {
    load(username)
  }, [username, load])

  function submit(e) {
    e.preventDefault()
    const name = input.trim()
    if (!name) return
    setInput('')
    setUsername(name)
    setHistory((prev) => {
      const next = [name, ...prev.filter((h) => h.toLowerCase() !== name.toLowerCase())].slice(0, 6)
      localStorage.setItem(HISTORY_KEY, JSON.stringify(next))
      return next
    })
  }

  return (
    <div className="app">
      <header className="topbar container">
        <h1 className="brand">
          <svg viewBox="0 0 24 24" width="28" height="28" aria-hidden="true"><path d="M8 7l-5 5 5 5M16 7l5 5-5 5M14 4l-4 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg> DevFinder
        </h1>
        <p className="tagline">Explore any GitHub profile</p>
      </header>

      <main className="container">
        <form className="search-form" onSubmit={submit}>
          <input
            className="search-input"
            placeholder="Type a GitHub username… (e.g. torvalds)"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            aria-label="GitHub username"
          />
          <button className="search-btn" type="submit">
            Search
          </button>
        </form>

        {history.length > 0 && (
          <div className="recents">
            {history.map((h) => (
              <button key={h} className="chip" onClick={() => setUsername(h)}>
                {h}
              </button>
            ))}
          </div>
        )}

        {loading && <Spinner label={`Fetching @${username}…`} />}
        {error && !loading && <ErrorBox message={error} onRetry={() => load(username)} />}

        {user && !loading && !error && (
          <>
            <div className="share-row">
              <button className="chip" onClick={copyLink}>{copied ? 'Link copied' : 'Copy share link'}</button>
              <form className="vs-form" onSubmit={(e) => { e.preventDefault(); if (vsInput.trim()) { setVs(vsInput.trim()); setVsInput('') } }}>
                <input className="repo-filter" placeholder="Compare with…" value={vsInput} onChange={(e) => setVsInput(e.target.value)} aria-label="Compare with username" />
                <button className="chip" type="submit">Compare</button>
                {vs && <button className="chip" type="button" onClick={() => setVs('')}>Clear</button>}
              </form>
            </div>
            {vs && <Compare a={user} aRepos={repos} b={vs} />}
            <ProfileCard user={user} repos={repos} />
            <RepoList repos={repos} />
          </>
        )}
      </main>

      <footer className="footer">
        <p>
          Built with React + the{' '}
          <a href="https://docs.github.com/rest" target="_blank" rel="noopener">
            GitHub REST API
          </a>
          . Not affiliated with GitHub.
        </p>
      </footer>
    </div>
  )
}
