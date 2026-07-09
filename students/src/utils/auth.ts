import crypto from 'crypto'

const AUTH_SECRET = process.env.AUTH_SECRET || 'ai-cos-secret-key-1234567890'

export function hashPassword(password: string): string {
  const salt = 'aicos_salt_shared'
  return crypto.createHmac('sha256', salt).update(password).digest('hex')
}

export function generateToken(userId: string): string {
  const payload = JSON.stringify({ userId, expires: Date.now() + 7 * 24 * 60 * 60 * 1000 })
  const cipher = crypto.createCipheriv('aes-256-cbc', crypto.scryptSync(AUTH_SECRET, 'salt', 32), Buffer.alloc(16, 0))
  let encrypted = cipher.update(payload, 'utf8', 'hex')
  encrypted += cipher.final('hex')
  return encrypted
}

export function verifyToken(token: string): string | null {
  try {
    const decipher = crypto.createDecipheriv('aes-256-cbc', crypto.scryptSync(AUTH_SECRET, 'salt', 32), Buffer.alloc(16, 0))
    let decrypted = decipher.update(token, 'hex', 'utf8')
    decrypted += decipher.final('utf8')
    const payload = JSON.parse(decrypted)
    if (payload.expires > Date.now()) {
      return payload.userId
    }
  } catch (err) {
    // Return null on failure
  }
  return null
}
