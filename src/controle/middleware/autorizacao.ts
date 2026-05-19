/**
 * Middleware de Autorização (RBAC)
 * Controla acesso baseado no tipo de usuário
 */

import { Request, Response, NextFunction } from 'express';
import { proibido, naoAutorizado } from '../../util/respostas';
import { TipoUsuario } from '../../modelo';

/**
 * Cria um middleware que verifica se o usuário tem um dos tipos permitidos
 * @param tiposPermitidos - Array de tipos de usuário permitidos
 * @returns Middleware de autorização
 */
export function autorizar(...tiposPermitidos: TipoUsuario[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    // Verifica se o usuário está autenticado
    if (!req.usuario) {
      naoAutorizado(res, 'Usuário não autenticado');
      return;
    }

    // Verifica se o tipo do usuário está na lista de permitidos
    if (!tiposPermitidos.includes(req.usuario.tipo)) {
      proibido(res, 'Você não tem permissão para acessar este recurso');
      return;
    }

    next();
  };
}

/**
 * Middleware que permite apenas DONO
 */
export const apenasDono = autorizar(TipoUsuario.DONO);

/**
 * Middleware que permite apenas FUNCIONARIO
 */
export const apenasFuncionario = autorizar(TipoUsuario.FUNCIONARIO);

/**
 * Middleware que permite DONO ou FUNCIONARIO
 */
export const donoOuFuncionario = autorizar(TipoUsuario.DONO, TipoUsuario.FUNCIONARIO);
