/**
 * Controller de Usuários
 * Gerencia operações CRUD de usuários
 */

import { Request, Response } from 'express';
import { usuarioDAO } from '../dao';
import { sucesso, erro, naoEncontrado } from '../util/respostas';
import { TipoUsuario, UsuarioPublico } from '../modelo';

/**
 * Classe Controller para gerenciamento de usuários
 */
export class UsuarioController {
  /**
   * GET /usuarios
   * Lista todos os usuários (apenas para DONO)
   */
  async listar(req: Request, res: Response): Promise<void> {
    try {
      const { tipo } = req.query;

      let usuarios: UsuarioPublico[];

      if (tipo && Object.values(TipoUsuario).includes(tipo as TipoUsuario)) {
        usuarios = await usuarioDAO.listarPorTipo(tipo as TipoUsuario);
      } else {
        usuarios = await usuarioDAO.listarTodos();
      }

      sucesso(res, usuarios, 'Usuários listados com sucesso');
    } catch (error) {
      console.error('Erro ao listar usuários:', error);
      erro(res, 'Erro ao listar usuários', 500);
    }
  }

  /**
   * GET /usuarios/:id
   * Busca usuário por ID (apenas para DONO)
   */
  async buscarPorId(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id);

      if (isNaN(id)) {
        erro(res, 'ID inválido');
        return;
      }

      const usuario = await usuarioDAO.buscarPorId(id);

      if (!usuario) {
        naoEncontrado(res, 'Usuário não encontrado');
        return;
      }

      const usuarioPublico: UsuarioPublico = {
        id: usuario.id!,
        nome: usuario.nome,
        email: usuario.email,
        tipo: usuario.tipo,
        data_criacao: usuario.data_criacao!
      };

      sucesso(res, usuarioPublico, 'Usuário encontrado');
    } catch (error) {
      console.error('Erro ao buscar usuário:', error);
      erro(res, 'Erro ao buscar usuário', 500);
    }
  }

  /**
   * DELETE /usuarios/:id
   * Remove um usuário (apenas para DONO)
   */
  async remover(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id);
      const usuarioLogado = req.usuario;

      if (isNaN(id)) {
        erro(res, 'ID inválido');
        return;
      }

      // Não permite que o dono delete a si mesmo
      if (usuarioLogado?.id === id) {
        erro(res, 'Você não pode remover sua própria conta', 403);
        return;
      }

      const usuario = await usuarioDAO.buscarPorId(id);

      if (!usuario) {
        naoEncontrado(res, 'Usuário não encontrado');
        return;
      }

      // Não permite deletar outro DONO
      if (usuario.tipo === TipoUsuario.DONO && usuarioLogado?.tipo === TipoUsuario.DONO) {
        erro(res, 'Não é permitido remover outro dono', 403);
        return;
      }

      await usuarioDAO.remover(id);

      sucesso(res, null, 'Usuário removido com sucesso');
    } catch (error) {
      console.error('Erro ao remover usuário:', error);
      erro(res, 'Erro ao remover usuário', 500);
    }
  }

  /**
   * GET /usuarios/estatisticas
   * Retorna estatísticas de usuários (apenas para DONO)
   */
  async estatisticas(req: Request, res: Response): Promise<void> {
    try {
      const total = await usuarioDAO.contarTotal();
      const donos = await usuarioDAO.listarPorTipo(TipoUsuario.DONO);
      const funcionarios = await usuarioDAO.listarPorTipo(TipoUsuario.FUNCIONARIO);

      sucesso(res, {
        total,
        donos: donos.length,
        funcionarios: funcionarios.length
      }, 'Estatísticas obtidas com sucesso');
    } catch (error) {
      console.error('Erro ao obter estatísticas:', error);
      erro(res, 'Erro ao obter estatísticas', 500);
    }
  }
}

// Exporta instância singleton
export const usuarioController = new UsuarioController();
