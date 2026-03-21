// lib/itunes.ts  — fetch current price for a movie from iTunes

export interface MovieRecord {
  id: number
  title: string
  poster: string
  year: string
  genre: string
  price: number | null
  originalPrice: number | null
  addedAt: number
}

export async function fetchItunesPrice(movieId: number): Promise<number | null> {
  try {
    const res = await fetch(
      `https://itunes.apple.com/lookup?id=${movieId}&country=us`,
      { next: { revalidate: 0 } }
    )
    const data = await res.json()
    const result = data.results?.[0]
    if (!result) return null
    return result.trackPrice ?? result.collectionPrice ?? null
  } catch {
    return null
  }
}

export async function searchItunes(query: string): Promise<any[]> {
  try {
    const res = await fetch(
      `https://itunes.apple.com/search?term=${encodeURIComponent(query)}&media=movie&limit=5&country=us`,
      { next: { revalidate: 60 } }
    )
    const data = await res.json()
    return data.results ?? []
  } catch {
    return []
  }
}
