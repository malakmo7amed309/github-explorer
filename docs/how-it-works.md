# How DevFinder works (plain-language tour)

This note explains how the app is put together, so you can talk about it
confidently in an interview.

## The big picture

DevFinder is a single-page React app: one screen with a search form, a
profile card and a repository list. All data comes from the public GitHub
REST API. There is no backend and no API key: GitHub allows 60 unauthenticated
requests per hour per device, which is plenty for a demo.

## Where the data comes from

`src/api.js` is the only file that talks to GitHub. It exports two functions,
`getUser` (profile data) and `getRepos` (up to 100 repos, most recently
pushed first), plus `friendlyError`, which turns HTTP status codes into
messages a person understands: 404 becomes "no user called X", 403 becomes a
rate-limit explanation. Centralizing error translation keeps the UI code
clean.

## The main state flow

`App.jsx` owns the current **username**, the loaded **user** and **repos**,
and loading/error flags. When the username changes, a `useEffect` loads both
endpoints together with `Promise.all`, so the profile and the repos arrive
in parallel instead of one waiting for the other.

Like the weather app, requests are tagged with a counter (`useRef`): if you
search two usernames quickly, only the newest response is allowed to update
the screen, so a slow first response can never overwrite a newer one.

## Interesting details to explain

- **Top languages chart.** GitHub has no "top languages" endpoint, so the app
  computes it: it counts repos per language (skipping forks, which are other
  people's code), takes the top five, and renders a proportional bar with the
  same colors GitHub itself uses. This is a good example of deriving useful
  information client-side from raw API data.
- **Filter + sort with `useMemo`.** The repo list you see is computed from
  the full list, the filter text and the sort choice. `useMemo` caches that
  computation so React only re-sorts when one of those three inputs changes,
  not on every render.
- **Controlled form.** The search box is a controlled input; submitting
  normalizes the name, updates the username state (which triggers the fetch)
  and records it in the history chips.
- **Persistence.** Search history lives in `localStorage`, so your recent
  lookups survive a refresh without any account.

## Concepts worth mentioning in an interview

- Parallel fetching with `Promise.all`
- Stale-request protection with a request id
- Derived state and `useMemo` for filter/sort
- Separation of concerns: API calls and error translation in `api.js`,
  presentation in components
- Honest error UX: distinct messages for "user not found", "rate limited"
  and "offline", each with a retry button
