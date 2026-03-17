/**
 * Middleware de Autenticação
 * Verifica se o usuário está autenticado via JWT
 */

import { Request, Response, NextFunction } from 'express';
import { verificarToken, extrairToken } from '../../util/jwt';
import { naoAutorizado } from '../../util/respostas';
import { JwtPayload } from '../../modelo';

// Estende a interface Request do Express para incluir o usuário autenticado
declare global {
  namespace Express {
    interface Request {
      usuario?: JwtPayload;
    }
  }
}

/**
 * Middleware que verifica se o usuário está autenticado
 * Extrai e valida o token JWT do header Authorization
 */
export function autenticar(req: Request, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  const token = extrairToken(authHeader);

  if (!token) {
    naoAutorizado(res, 'Token de autenticação não fornecido');
    return;
  }

  const payload = verificarToken(token);

  if (!payload) {
    naoAutorizado(res, 'Token inválido ou expirado');
    return;
  }

  // Adiciona o usuário decodificado à requisição
  req.usuario = payload;
  next();
}

/**
 * Middleware opcional de autenticação
 * Se houver token, valida e adiciona o usuário
 * Se não houver, continua sem erro
 */
export function autenticarOpcional(req: Request, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  const token = extrairToken(authHeader);

  if (token) {
    const payload = verificarToken(token);
    if (payload) {
      req.usuario = payload;
    }
  }

  next();
}
