import axios from 'axios'

const api = axios.create({ baseURL: 'https://api.github.com' })

export async function getUser(username) {
  const { data } = await api.get(`/users/${encodeURIComponent(username)}`)
  return data
}

// 100 most recently pushed repos; sorting/filtering happens client-side
export async function getRepos(username) {
  const { data } = await api.get(`/users/${encodeURIComponent(username)}/repos`, {
    params: { per_page: 100, sort: 'pushed' },
  })
  return data
}

// Turn axios/GitHub errors into one friendly message
export function friendlyError(err, username) {
  if (err?.response?.status === 404) return `No GitHub user called "${username}".`
  if (err?.response?.status === 403)
    return 'GitHub rate limit reached for this device. Try again in a little while.'
  return 'Could not reach GitHub. Check your connection and try again.'
}
