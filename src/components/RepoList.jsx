import { useMemo, useState } from 'react'
import { langColor } from './ProfileCard'

const SORTS = [
  ['pushed', 'Recently updated'],
  ['stars', 'Most stars'],
  ['forks', 'Most forks'],
  ['name', 'Name A-Z'],
]

export default function RepoList({ repos }) {
  const [sort, setSort] = useState('pushed')
  const [filter, setFilter] = useState('')
  const [lang, setLang] = useState('')
  const [copied, setCopied] = useState(0)
  const langs = useMemo(() => [...new Set(repos.map((r) => r.language).filter(Boolean))].sort(), [repos])

  const visible = useMemo(() => {
    const q = filter.trim().toLowerCase()
    const base = lang ? repos.filter((r) => r.language === lang) : repos
    const filtered = q
      ? base.filter((r) => r.name.toLowerCase().includes(q) || (r.description || '').toLowerCase().includes(q))
      : [...base]
    const by = {
      pushed: (a, b) => new Date(b.pushed_at) - new Date(a.pushed_at),
      stars: (a, b) => b.stargazers_count - a.stargazers_count,
      forks: (a, b) => b.forks_count - a.forks_count,
      name: (a, b) => a.name.localeCompare(b.name),
    }
    return filtered.sort(by[sort])
  }, [repos, sort, filter, lang])

  return (
    <section className="panel">
      <div className="repo-toolbar">
        <h3 className="panel-title">Repositories ({visible.length})</h3>
        <div className="repo-controls">
          <input
            className="repo-filter"
            placeholder="Filter repos…"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            aria-label="Filter repositories"
          />
          <select className="repo-sort" value={lang} onChange={(e) => setLang(e.target.value)} aria-label="Filter by language">
            <option value="">All languages</option>
            {langs.map((l) => <option key={l} value={l}>{l}</option>)}
          </select>
          <select className="repo-sort" value={sort} onChange={(e) => setSort(e.target.value)} aria-label="Sort repositories">
            {SORTS.map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
        </div>
      </div>
      {visible.length === 0 && <p className="empty">No repositories match.</p>}
      <ul className="repo-list">
        {visible.map((r) => (
          <li className="repo-card" key={r.id}>
            <div className="repo-top">
              <a className="repo-name" href={r.html_url} target="_blank" rel="noopener">
                {r.name}
              </a>
              {r.fork && <span className="fork-badge">fork</span>}
            </div>
            {r.description && <p className="repo-desc">{r.description}</p>}
            <p className="repo-meta">
              {r.language && (
                <span className="repo-lang">
                  <span className="dot" style={{ background: langColor(r.language) }} />
                  {r.language}
                </span>
              )}
              <span>★ {r.stargazers_count}</span>
              <span>⑂ {r.forks_count}</span>
              <button className="chip" onClick={() => { navigator.clipboard?.writeText(r.clone_url); setCopied(r.id); setTimeout(() => setCopied(0), 1500) }}>
                {copied === r.id ? 'Copied' : 'Copy clone URL'}
              </button>
              <span>Updated {new Date(r.pushed_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
            </p>
          </li>
        ))}
      </ul>
    </section>
  )
}
