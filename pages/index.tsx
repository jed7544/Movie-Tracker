// pages/index.tsx — Movie Price Tracker frontend

import { useState, useEffect } from 'react'
import Head from 'next/head'

interface Movie {
  id: number
  title: string
  poster: string
  year: string
  genre: string
  price: number | null
  originalPrice: number | null
  addedAt: number
}

export default function Home() {
  const [movies, setMovies] = useState<Movie[]>([])
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<any[]>([])
  const [searching, setSearching] = useState(false)
  const [checking, setChecking] = useState(false)
  const [toast, setToast] = useState<{ msg: string; ok: boolean } | null>(null)
  const [threshold, setThreshold] = useState('5.99')

  useEffect(() => {
    fetch('/api/movies').then(r => r.json()).then(d => setMovies(d.movies ?? []))
  }, [])

  function showToast(msg: string, ok = true) {
    setToast({ msg, ok })
    setTimeout(() => setToast(null), 3500)
  }

  async function search() {
    if (!query.trim()) return
    setSearching(true)
    setResults([])
    const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`)
    const data = await res.json()
    setResults(data.results ?? [])
    setSearching(false)
  }

  async function addMovie(m: any) {
    const movie: Movie = {
      id: m.trackId ?? m.collectionId,
      title: m.trackName ?? m.collectionName,
      poster: m.artworkUrl100 ?? '',
      year: m.releaseDate?.slice(0, 4) ?? '',
      genre: m.primaryGenreName ?? '',
      price: m.trackPrice ?? m.collectionPrice ?? null,
      originalPrice: m.trackPrice ?? m.collectionPrice ?? null,
      addedAt: Date.now(),
    }
    const res = await fetch('/api/movies', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(movie),
    })
    const data = await res.json()
    setMovies(data.movies)
    setResults([])
    setQuery('')
    showToast(`Added "${movie.title}" to your watchlist.`)
  }

  async function removeMovie(id: number) {
    const res = await fetch(`/api/movies?id=${id}`, { method: 'DELETE' })
    const data = await res.json()
    setMovies(data.movies)
  }

  async function checkNow() {
    setChecking(true)
    const secret = prompt('Enter your CRON_SECRET to run a manual check:')
    if (!secret) { setChecking(false); return }
    const res = await fetch(`/api/cron/check-prices?secret=${secret}`)
    const data = await res.json()
    if (res.ok) {
      const { checked, alerts } = data
      if (alerts.length) {
        showToast(`${alerts.length} sale(s) found! SMS sent.`)
      } else {
        showToast(`Checked ${checked} movies — no sales yet.`, false)
      }
      const refresh = await fetch('/api/movies')
      setMovies((await refresh.json()).movies ?? [])
    } else {
      showToast('Check failed. Wrong secret?', false)
    }
    setChecking(false)
  }

  return (
    <>
      <Head>
        <title>Movie Price Tracker</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <style>{`
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #f5f5f7; color: #1d1d1f; min-height: 100vh; }
        .wrap { max-width: 640px; margin: 0 auto; padding: 2rem 1rem 4rem; }
        h1 { font-size: 28px; font-weight: 700; letter-spacing: -0.5px; margin-bottom: 4px; }
        .sub { font-size: 15px; color: #6e6e73; margin-bottom: 2rem; }
        .card { background: #fff; border-radius: 14px; padding: 1.25rem; margin-bottom: 12px; display: flex; align-items: center; gap: 14px; box-shadow: 0 1px 3px rgba(0,0,0,0.08); }
        .poster { width: 50px; height: 70px; border-radius: 6px; object-fit: cover; background: #e5e5ea; flex-shrink: 0; }
        .info { flex: 1; min-width: 0; }
        .movie-title { font-size: 15px; font-weight: 600; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .meta { font-size: 12px; color: #6e6e73; margin-top: 2px; }
        .price { text-align: right; flex-shrink: 0; }
        .price-val { font-size: 17px; font-weight: 700; }
        .sale-pill { background: #34c759; color: #fff; font-size: 11px; font-weight: 600; padding: 2px 8px; border-radius: 20px; display: inline-block; margin-top: 3px; }
        .rm-btn { background: none; border: none; color: #c7c7cc; cursor: pointer; font-size: 20px; line-height: 1; padding: 4px 6px; border-radius: 6px; }
        .rm-btn:hover { color: #ff3b30; background: #fff0ef; }
        .row { display: flex; gap: 8px; margin-bottom: 1.25rem; }
        input[type=text], input[type=number] { border: 1.5px solid #d1d1d6; border-radius: 10px; padding: 10px 14px; font-size: 15px; background: #fff; outline: none; width: 100%; transition: border-color .15s; }
        input:focus { border-color: #0071e3; }
        button.primary { background: #0071e3; color: #fff; border: none; border-radius: 10px; padding: 10px 18px; font-size: 15px; font-weight: 600; cursor: pointer; white-space: nowrap; }
        button.primary:hover { background: #0077ed; }
        button.primary:disabled { opacity: 0.5; cursor: not-allowed; }
        button.secondary { background: #fff; color: #0071e3; border: 1.5px solid #0071e3; border-radius: 10px; padding: 10px 18px; font-size: 15px; font-weight: 600; cursor: pointer; width: 100%; margin-top: 1rem; }
        button.secondary:hover { background: #f0f6ff; }
        .result-card { cursor: pointer; transition: background .1s; }
        .result-card:hover { background: #f5f5f7; }
        .label { font-size: 12px; font-weight: 600; color: #6e6e73; text-transform: uppercase; letter-spacing: 0.06em; margin: 1.5rem 0 10px; }
        .threshold-row { background: #fff; border-radius: 14px; padding: 14px 1.25rem; margin-bottom: 1.25rem; display: flex; align-items: center; gap: 10px; box-shadow: 0 1px 3px rgba(0,0,0,0.08); }
        .threshold-row label { font-size: 14px; color: #6e6e73; flex: 1; }
        .threshold-row input { width: 80px; }
        .toast { position: fixed; bottom: 1.5rem; left: 50%; transform: translateX(-50%); background: #1d1d1f; color: #fff; padding: 12px 20px; border-radius: 14px; font-size: 14px; font-weight: 500; z-index: 100; white-space: nowrap; }
        .toast.warn { background: #6e6e73; }
        .empty { text-align: center; padding: 3rem 1rem; color: #6e6e73; font-size: 15px; }
        @media (prefers-color-scheme: dark) {
          body { background: #000; color: #f5f5f7; }
          .card { background: #1c1c1e; box-shadow: none; }
          .result-card:hover { background: #2c2c2e; }
          .threshold-row { background: #1c1c1e; box-shadow: none; }
          input[type=text], input[type=number] { background: #1c1c1e; color: #f5f5f7; border-color: #3a3a3c; }
          button.secondary { background: transparent; color: #0a84ff; border-color: #0a84ff; }
          button.primary { background: #0a84ff; }
        }
      `}</style>

      <div className="wrap">
        <h1>🎬 Movie Price Tracker</h1>
        <p className="sub">Get an SMS when your movies go on sale on Apple TV.</p>

        {/* Search */}
        <div className="row">
          <input
            type="text"
            placeholder="Search a movie title..."
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && search()}
          />
          <button className="primary" onClick={search} disabled={searching}>
            {searching ? '...' : 'Search'}
          </button>
        </div>

        {/* Search results */}
        {results.length > 0 && (
          <>
            <div className="label">Results — tap to track</div>
            {results.map(m => (
              <div key={m.trackId ?? m.collectionId} className="card result-card" onClick={() => addMovie(m)}>
                {m.artworkUrl100
                  ? <img src={m.artworkUrl100} className="poster" alt={m.trackName} />
                  : <div className="poster" />}
                <div className="info">
                  <div className="movie-title">{m.trackName ?? m.collectionName}</div>
                  <div className="meta">{m.releaseDate?.slice(0, 4)}{m.primaryGenreName ? ` · ${m.primaryGenreName}` : ''}</div>
                </div>
                <div className="price">
                  <div className="price-val">
                    {m.trackPrice != null ? `$${m.trackPrice.toFixed(2)}` : '—'}
                  </div>
                </div>
              </div>
            ))}
          </>
        )}

        {/* Threshold */}
        <div className="threshold-row">
          <label>Alert me when price drops below</label>
          <input type="number" value={threshold} min="0" step="0.99" style={{ width: 80 }} onChange={e => setThreshold(e.target.value)} />
          <span style={{ fontSize: 14, color: '#6e6e73' }}>USD</span>
        </div>

        {/* Watchlist */}
        {movies.length > 0 ? (
          <>
            <div className="label">Your watchlist ({movies.length})</div>
            {movies.map(m => (
              <div key={m.id} className="card">
                {m.poster
                  ? <img src={m.poster} className="poster" alt={m.title} />
                  : <div className="poster" />}
                <div className="info">
                  <div className="movie-title">{m.title}</div>
                  <div className="meta">{m.year}{m.genre ? ` · ${m.genre}` : ''}</div>
                  {m.price !== null && m.originalPrice !== null && m.price < m.originalPrice && (
                    <span className="sale-pill">On sale</span>
                  )}
                </div>
                <div className="price">
                  <div className="price-val">{m.price != null ? `$${m.price.toFixed(2)}` : '—'}</div>
                  {m.originalPrice !== null && m.price !== m.originalPrice && (
                    <div style={{ fontSize: 12, color: '#6e6e73', textDecoration: 'line-through' }}>
                      ${m.originalPrice?.toFixed(2)}
                    </div>
                  )}
                </div>
                <button className="rm-btn" onClick={() => removeMovie(m.id)}>×</button>
              </div>
            ))}
            <button className="secondary" onClick={checkNow} disabled={checking}>
              {checking ? 'Checking prices...' : 'Check prices now'}
            </button>
          </>
        ) : (
          !results.length && (
            <div className="empty">No movies tracked yet.<br />Search above to add some.</div>
          )
        )}
      </div>

      {toast && <div className={`toast${toast.ok ? '' : ' warn'}`}>{toast.msg}</div>}
    </>
  )
}
