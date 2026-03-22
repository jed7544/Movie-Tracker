// lib/db.ts — simple movie list storage using Upstash Redis

import { Redis } from '@upstash/redis'
import { MovieRecord } from './itunes'

const redis = new Redis({
  url: process.env.KV_REST_API_URL!,
  token: process.env.KV_REST_API_TOKEN!,
})

const KEY = 'movies'

export async function getMovies(): Promise<MovieRecord[]> {
  const movies = await redis.get<MovieRecord[]>(KEY)
  return movies ?? []
}

export async function saveMovies(movies: MovieRecord[]): Promise<void> {
  await redis.set(KEY, movies)
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
