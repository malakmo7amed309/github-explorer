import { useEffect, useState } from 'react'
import { friendlyError, getRepos, getUser } from '../api'

function stars(repos) {
  return repos.reduce((n, r) => n + r.stargazers_count, 0)
}

export default function Compare({ a, aRepos, b }) {
  const [other, setOther] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    let off = false
    Promise.all([getUser(b), getRepos(b)])
      .then(([u, r]) => { if (!off) { setOther({ user: u, repos: r }); setError('') } })
      .catch((e) => { if (!off) { setOther(null); setError(friendlyError(e, b)) } })
    return () => { off = true }
  }, [b])

  if (error) return <p className="empty" role="alert">{error}</p>
  if (!other) return <p className="empty">Loading @{b}...</p>

  const rows = [
    ['Public repos', a.public_repos, other.user.public_repos],
    ['Followers', a.followers, other.user.followers],
    ['Following', a.following, other.user.following],
    ['Stars (latest 100 repos)', stars(aRepos), stars(other.repos)],
    ['Account created', new Date(a.created_at).getFullYear(), new Date(other.user.created_at).getFullYear(), true],
  ]
  return (
    <section className="panel compare">
      <h3 className="panel-title">Compare</h3>
      <table>
        <thead>
          <tr><th></th><th>@{a.login}</th><th>@{other.user.login}</th></tr>
        </thead>
        <tbody>
          {rows.map(([label, x, y, plain]) => (
            <tr key={label}>
              <th scope="row">{label}</th>
              <td className={!plain && x > y ? 'win' : ''}>{x}</td>
              <td className={!plain && y > x ? 'win' : ''}>{y}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  )
}
