// pages/api/search.ts

import type { NextApiRequest, NextApiResponse } from 'next'
import { searchItunes } from '../../lib/itunes'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') return res.status(405).end()
  const { q } = req.query
  if (!q || typeof q !== 'string') return res.status(400).json({ error: 'Missing query' })
  const results = await searchItunes(q)
  res.json({ results })
}
