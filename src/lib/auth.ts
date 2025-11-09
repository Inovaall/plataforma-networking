// src/lib/auth.ts
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'jwt_dev_secret_change_in_production';
const ADMIN_TOKEN = process.env.ADMIN_SECRET_TOKEN || 'admin_super_secret_token_change_me_in_production';

/**
 * Verifica se o token fornecido é válido para admin
 */
export function isAdmin(token: string | null): boolean {
  if (!token) return false;
  return token === ADMIN_TOKEN;
}

/**
 * Gera um token JWT para convite de membro
 */
export function generateInviteToken(applicationId: string, email: string): string {
  return jwt.sign(
    { applicationId, email, type: 'invite' },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
}

/**
 * Valida e decodifica um token de convite
 */
export function verifyInviteToken(token: string): { 
  applicationId: string; 
  email: string; 
  type: string 
} | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { 
      applicationId: string; 
      email: string; 
      type: string 
    };
    
    if (decoded.type !== 'invite') {
      return null;
    }
    
    return decoded;
  } catch (error) {
    return null;
  }
}

/**
 * Calcula a data de expiração do token (7 dias)
 */
export function getInviteTokenExpiry(): Date {
  return new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 dias
}