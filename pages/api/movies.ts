// pages/api/movies.ts

import type { NextApiRequest, NextApiResponse } from 'next'
import { getMovies, addMovie, removeMovie } from '../../lib/db'
import { MovieRecord } from '../../lib/itunes'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    const movies = await getMovies()
    return res.json({ movies })
  }

  if (req.method === 'POST') {
    const movie = req.body as MovieRecord
    if (!movie?.id || !movie?.title) return res.status(400).json({ error: 'Invalid movie' })
    const movies = await addMovie(movie)
    return res.json({ movies })
  }

  if (req.method === 'DELETE') {
    const { id } = req.query
    if (!id) return res.status(400).json({ error: 'Missing id' })
    const movies = await removeMovie(Number(id))
    return res.json({ movies })
  }

  res.status(405).end()
}
