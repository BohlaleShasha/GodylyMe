import { Pool, PoolConfig } from 'pg'
import Redis from 'ioredis'

let pgPool: Pool | null = null
let redisClient: Redis | null = null

function sanitizeDatabaseUrl(url: string | undefined): string | undefined {
  if (!url) return url
  try {
    const parsed = new URL(url)
    parsed.searchParams.delete('sslmode')
    return parsed.toString()
  } catch {
    return url
  }
}

function resolvePgConfig(): PoolConfig {
  const databaseUrl = sanitizeDatabaseUrl(process.env.DATABASE_URL)

  if (!databaseUrl) {
    throw new Error('DATABASE_URL is not defined')
  }

  const base: PoolConfig = {
    connectionString: databaseUrl,
    max: 1, // Serverless functions need minimal connections
  }

  const sslMode = (process.env.PGSSLMODE ?? '').toLowerCase()
  if (sslMode === 'disable') {
    return base
  }

  return {
    ...base,
    ssl: {
      rejectUnauthorized: sslMode === 'verify-full',
    },
  }
}

export function getPgPool(): Pool {
  if (!pgPool) {
    pgPool = new Pool(resolvePgConfig())
  }
  return pgPool
}

export function getRedis(): Redis | null {
  if (!redisClient) {
    const redisUrl = process.env.REDIS_URL
    if (!redisUrl) {
      console.warn('REDIS_URL is not configured, Redis will be unavailable')
      return null
    }
    redisClient = new Redis(redisUrl, {
      maxRetriesPerRequest: 1,
      connectTimeout: 5000,
      lazyConnect: true, // Don't connect immediately
    })

    // Suppress unhandled error events
    redisClient.on('error', (err) => {
      console.error('Redis connection error:', err.message)
    })
  }
  return redisClient
}
