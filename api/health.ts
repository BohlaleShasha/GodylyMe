import type { VercelRequest, VercelResponse } from '@vercel/node'
import { compose, cors, errorHandler } from './_lib/serverless'
import { getPgPool, getRedis } from './_lib/clients'

async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const pool = getPgPool()
    await pool.query('SELECT 1')

    const redis = getRedis()
    let redisStatus = 'unavailable'

    if (redis) {
      try {
        await redis.connect()
        await redis.ping()
        redisStatus = 'connected'
      } catch (err) {
        console.error('Redis ping failed:', err)
        redisStatus = 'error'
      }
    }

    res.json({ status: 'ok', database: 'connected', redis: redisStatus })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown connectivity issue'
    res.status(503).json({ status: 'error', message })
  }
}

export default compose(cors, errorHandler)(handler)
