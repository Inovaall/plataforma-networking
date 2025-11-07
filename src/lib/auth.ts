import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-key';

export function generateInviteToken(applicationId: string, email: string): string {
  return jwt.sign({ applicationId, email }, JWT_SECRET, { expiresIn: '7d' });
}

export function verifyInviteToken(
  token: string
): { applicationId: string; email: string } | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as {
      applicationId: string;
      email: string;
    };
    return decoded;
  } catch {
    return null;
  }
}

export function isAdmin(token: string | null): boolean {
  if (!token) return false;
  return token === process.env.ADMIN_SECRET_TOKEN;
}