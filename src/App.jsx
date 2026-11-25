import { useCallback, useEffect, useRef, useState } from 'react'
import { friendlyError, getRepos, getUser } from './api'
import ProfileCard from './components/ProfileCard'
import RepoList from './components/RepoList'
import Spinner from './components/Spinner'
import ErrorBox from './components/ErrorBox'

const HISTORY_KEY = 'github-explorer-history'
const DEFAULT_USER = 'malakmo7amed309'

function loadHistory() {
  try {
    return JSON.parse(localStorage.getItem(HISTORY_KEY)) || []
  } catch {
    return []
  }
}

export default function App() {
  const [input, setInput] = useState('')
  const [username, setUsername] = useState(DEFAULT_USER)
  const [history, setHistory] = useState(loadHistory)
  const [user, setUser] = useState(null)
  const [repos, setRepos] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
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
          <span aria-hidden="true"><span aria-hidden="true">🐙</span> DevFinderlt;/<span aria-hidden="true">🐙</span> DevFindergt;</span> DevFinder
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
