// pages/api/cron/check-prices.ts
// Called automatically every Sunday at 9am UTC by Vercel Cron.
// Also callable manually via GET /api/cron/check-prices?secret=YOUR_CRON_SECRET

import type { NextApiRequest, NextApiResponse } from 'next'
import { getMovies, saveMovies } from '../../../lib/db'
import { fetchItunesPrice } from '../../../lib/itunes'
import { sendSMS } from '../../../lib/sms'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Protect the endpoint — Vercel sends the secret automatically, or you can pass it manually
  const authHeader = req.headers.authorization
  const secretParam = req.query.secret
  const secret = process.env.CRON_SECRET

  const authorized =
    authHeader === `Bearer ${secret}` || secretParam === secret

  if (!authorized) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  const movies = await getMovies()
  if (!movies.length) {
    return res.json({ checked: 0, alerts: [] })
  }

  const threshold = parseFloat(process.env.PRICE_THRESHOLD ?? '5.99')
  const alerts: string[] = []

  for (const movie of movies) {
    const newPrice = await fetchItunesPrice(movie.id)
    if (newPrice === null) continue

    const prevPrice = movie.price
    movie.price = newPrice

    // Alert if price dropped and is now at or below the threshold
    if (newPrice !== prevPrice && newPrice <= threshold) {
      alerts.push(`🎬 ${movie.title} dropped to $${newPrice.toFixed(2)}!`)
    }
  }

  await saveMovies(movies)

  if (alerts.length > 0) {
    const message =
      `Movie price alert!\n\n` +
      alerts.join('\n') +
      `\n\nView your watchlist at ${process.env.NEXT_PUBLIC_BASE_URL ?? 'your app'}`
    await sendSMS(message)
  }

  res.json({ checked: movies.length, alerts })
}
