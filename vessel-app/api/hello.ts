import type { VercelRequest, VercelResponse } from '@vercel/node'
import { compose, cors, errorHandler } from './_lib/serverless'

async function handler(req: VercelRequest, res: VercelResponse) {
  res.json({ message: 'Hello from godlyme backend on Vercel' })
}

export default compose(cors, errorHandler)(handler)
