/**
 * Utilitários para padronização de respostas da API
 */

import { Response } from 'express';

// Interface para resposta padrão
export interface RespostaPadrao<T = unknown> {
  sucesso: boolean;
  mensagem: string;
  dados?: T;
  erro?: string;
}

/**
 * Envia resposta de sucesso
 */
export function sucesso<T>(res: Response, dados: T, mensagem = 'Operação realizada com sucesso', status = 200): Response {
  return res.status(status).json({
    sucesso: true,
    mensagem,
    dados
  } as RespostaPadrao<T>);
}

/**
 * Envia resposta de erro
 */
export function erro(res: Response, mensagem: string, status = 400, detalhe?: string): Response {
  return res.status(status).json({
    sucesso: false,
    mensagem,
    erro: detalhe
  } as RespostaPadrao);
}

/**
 * Envia resposta de não autorizado
 */
export function naoAutorizado(res: Response, mensagem = 'Não autorizado'): Response {
  return erro(res, mensagem, 401);
}

/**
 * Envia resposta de proibido
 */
export function proibido(res: Response, mensagem = 'Acesso negado'): Response {
  return erro(res, mensagem, 403);
}

/**
 * Envia resposta de não encontrado
 */
export function naoEncontrado(res: Response, mensagem = 'Recurso não encontrado'): Response {
  return erro(res, mensagem, 404);
}

/**
 * Envia resposta de erro interno
 */
export function erroInterno(res: Response, mensagem = 'Erro interno do servidor'): Response {
  return erro(res, mensagem, 500);
}
