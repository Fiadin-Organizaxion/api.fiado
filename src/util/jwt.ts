/**
 * Utilitários para gerenciamento de tokens JWT
 */

import jwt from 'jsonwebtoken';
import { JwtPayload, TipoUsuario } from '../modelo';

// Chave secreta para assinatura do JWT (em produção, usar variável de ambiente segura)
const JWT_SECRET = process.env.JWT_SECRET || 'sua_chave_secreta_aqui_mude_em_producao';

// Tempo de expiração do token (24 horas)
const JWT_EXPIRATION = '24h';

/**
 * Gera um token JWT para o usuário
 * @param payload - Dados do usuário para incluir no token
 * @returns Token JWT assinado
 */
export function gerarToken(payload: { id: number; nome: string; email: string; tipo: TipoUsuario }): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRATION });
}

/**
 * Verifica e decodifica um token JWT
 * @param token - Token JWT a ser verificado
 * @returns Payload decodificado ou null se inválido
 */
export function verificarToken(token: string): JwtPayload | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;
    return decoded;
  } catch (error) {
    return null;
  }
}

/**
 * Extrai o token do header Authorization
 * @param authHeader - Header Authorization (Bearer token)
 * @returns Token extraído ou null
 */
export function extrairToken(authHeader?: string): string | null {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  return authHeader.substring(7);
}
