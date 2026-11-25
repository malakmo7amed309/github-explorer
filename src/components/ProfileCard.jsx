const LANG_COLORS = {
  JavaScript: '#f1e05a', TypeScript: '#3178c6', Python: '#3572A5', HTML: '#e34c26',
  CSS: '#563d7c', Java: '#b07219', 'C++': '#f34b7d', C: '#555555', Go: '#00ADD8',
  Rust: '#dea584', PHP: '#4F5D95', Ruby: '#701516', Dart: '#00B4AB', Kotlin: '#A97BFF',
  Swift: '#F05138', Shell: '#89e051',
}

export function langColor(lang) {
  return LANG_COLORS[lang] || '#8b9bb4'
}

export default function ProfileCard({ user, repos }) {
  const joined = new Date(user.created_at).toLocaleDateString('en-GB', {
    month: 'long',
    year: 'numeric',
  })
  // top languages across the user's own repos, by repo count
  const counts = {}
  repos.filter((r) => !r.fork && r.language).forEach((r) => {
    counts[r.language] = (counts[r.language] || 0) + 1
  })
  const topLangs = Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 5)
  const total = topLangs.reduce((s, [, n]) => s + n, 0) || 1

  return (
    <section className="profile-card">
      <div className="profile-head">
        <img className="avatar" src={user.avatar_url} alt={`${user.login}'s avatar`} />
        <div className="profile-id">
          <h2>{user.name || user.login}</h2>
          <a className="login" href={user.html_url} target="_blank" rel="noopener">
            @{user.login}
          </a>
          <p className="joined">Joined {joined}</p>
        </div>
      </div>
      {user.bio && <p className="bio">{user.bio}</p>}
      <ul className="meta">
        {user.location && <li>{user.location}</li>}
        {user.company && <li>{user.company}</li>}
        {user.blog && (
          <li>
                        <a href={user.blog.startsWith('http') ? user.blog : `https://${user.blog}`} target="_blank" rel="noopener">
              {user.blog}
            </a>
          </li>
        )}
      </ul>
      <ul className="stats">
        <li><strong>{user.public_repos}</strong><span>Repos</span></li>
        <li><strong>{user.followers}</strong><span>Followers</span></li>
        <li><strong>{user.following}</strong><span>Following</span></li>
        <li><strong>{user.public_gists}</strong><span>Gists</span></li>
      </ul>
      {topLangs.length > 0 && (
        <div className="langs">
          <h3>Top languages</h3>
          <div className="lang-bar">
            {topLangs.map(([lang, n]) => (
              <span
                key={lang}
                className="lang-seg"
                style={{ width: `${(n / total) * 100}%`, background: langColor(lang) }}
                title={`${lang}: ${n} repos`}
              />
            ))}
          </div>
          <ul className="lang-legend">
            {topLangs.map(([lang, n]) => (
              <li key={lang}>
                <span className="dot" style={{ background: langColor(lang) }} />
                {lang} <span className="pct">{Math.round((n / total) * 100)}%</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  )
}
