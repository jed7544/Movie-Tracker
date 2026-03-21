// lib/db.ts — simple movie list storage using Vercel KV

import { kv } from '@vercel/kv'
import { MovieRecord } from './itunes'

const KEY = 'movies'

export async function getMovies(): Promise<MovieRecord[]> {
  const movies = await kv.get<MovieRecord[]>(KEY)
  return movies ?? []
}

export async function saveMovies(movies: MovieRecord[]): Promise<void> {
  await kv.set(KEY, movies)
}

export async function addMovie(movie: MovieRecord): Promise<MovieRecord[]> {
  const movies = await getMovies()
  if (movies.find(m => m.id === movie.id)) return movies
  movies.push(movie)
  await saveMovies(movies)
  return movies
}

export async function removeMovie(id: number): Promise<MovieRecord[]> {
  const movies = await getMovies()
  const updated = movies.filter(m => m.id !== id)
  await saveMovies(updated)
  return updated
}
