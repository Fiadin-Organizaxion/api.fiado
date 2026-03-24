/**
 * Controller de Autenticação
 * Gerencia login e registro de usuários
 */

import { Request, Response } from 'express';
import { usuarioDAO, logDAO } from '../dao';
import { hashSenha, compararSenha } from '../util/criptografia';
import { gerarToken } from '../util/jwt';
import { sucesso, erro, naoAutorizado } from '../util/respostas';
import { TipoUsuario, TipoAcao, UsuarioPublico, Log } from '../modelo';
import type { LoginResposta } from '../modelo';

/**
 * Classe Controller para autenticação
 */
export class AuthController {
  /**
   * POST /login
   * Realiza login do usuário
   */
  async login(req: Request, res: Response): Promise<void> {
    try {
      const { email, senha } = req.body;

      if (!email || !senha) {
        erro(res, 'Email e senha são obrigatórios');
        return;
      }

      const usuario = await usuarioDAO.buscarPorEmail(email);

      if (!usuario) {
        naoAutorizado(res, 'Credenciais inválidas');
        return;
      }

      const senhaValida = await compararSenha(senha, usuario.senha);

      if (!senhaValida) {
        naoAutorizado(res, 'Credenciais inválidas');
        return;
      }

      const token = gerarToken({
        id: usuario.id!,
        nome: usuario.nome,
        email: usuario.email,
        tipo: usuario.tipo
      });

      // ✅ LOG CORRIGIDO
      const log = Log.build(
        usuario.id!,
        TipoAcao.LOGIN,
        `Usuário ${usuario.nome} realizou login`,
        'usuarios',
        usuario.id!
      );

      await logDAO.registrar(log);

      const resposta: LoginResposta = {
        token,
        usuario: {
          id: usuario.id!,
          nome: usuario.nome,
          tipo: usuario.tipo
        }
      };

      sucesso(res, resposta, 'Login realizado com sucesso');
    } catch (error) {
      console.error('Erro no login:', error);
      erro(res, 'Erro ao realizar login', 500);
    }
  }

  /**
   * POST /usuarios
   * Cadastra um novo usuário
   */
  async cadastrar(req: Request, res: Response): Promise<void> {
    try {
      const { nome, email, senha, tipo } = req.body;
      const usuarioLogado = req.usuario;

      if (!nome || !email || !senha || !tipo) {
        erro(res, 'Nome, email, senha e tipo são obrigatórios');
        return;
      }

      if (!Object.values(TipoUsuario).includes(tipo)) {
        erro(res, 'Tipo de usuário inválido. Use DONO ou FUNCIONARIO');
        return;
      }

      const usuarioExistente = await usuarioDAO.buscarPorEmail(email);
      if (usuarioExistente) {
        erro(res, 'Este email já está cadastrado');
        return;
      }

      const existeDono = await usuarioDAO.existeDono();

      if (tipo === TipoUsuario.DONO) {
        if (existeDono && (!usuarioLogado || usuarioLogado.tipo !== TipoUsuario.DONO)) {
          erro(res, 'Já existe um dono cadastrado. Apenas o dono pode cadastrar outro dono.', 403);
          return;
        }
      }

      if (tipo === TipoUsuario.FUNCIONARIO) {
        if (!usuarioLogado || usuarioLogado.tipo !== TipoUsuario.DONO) {
          erro(res, 'Apenas o dono pode cadastrar funcionários', 403);
          return;
        }
      }

      const senhaCriptografada = await hashSenha(senha);

      const novoId = await usuarioDAO.criar({
        nome,
        email,
        senha: senhaCriptografada,
        tipo
      });

      // ✅ LOG CORRIGIDO
      const log = Log.build(
        usuarioLogado?.id || novoId,
        TipoAcao.CADASTRO_USUARIO,
        `Usuário ${nome} (${tipo}) cadastrado`,
        'usuarios',
        novoId
      );

      await logDAO.registrar(log);

      const usuarioCriado = await usuarioDAO.buscarPorId(novoId);

      const usuarioPublico: UsuarioPublico = {
        id: usuarioCriado!.id!,
        nome: usuarioCriado!.nome,
        email: usuarioCriado!.email,
        tipo: usuarioCriado!.tipo,
        dataCriacao: usuarioCriado!.dataCriacao
      };

      sucesso(res, usuarioPublico, 'Usuário cadastrado com sucesso', 201);
    } catch (error) {
      console.error('Erro no cadastro:', error);
      erro(res, 'Erro ao cadastrar usuário', 500);
    }
  }

  /**
   * GET /usuarios/me
   * Retorna dados do usuário autenticado
   */
  async perfil(req: Request, res: Response): Promise<void> {
    try {
      const usuarioId = req.usuario?.id;

      if (!usuarioId) {
        naoAutorizado(res, 'Usuário não autenticado');
        return;
      }

      const usuario = await usuarioDAO.buscarPorId(usuarioId);

      if (!usuario) {
        erro(res, 'Usuário não encontrado', 404);
        return;
      }

      const usuarioPublico: UsuarioPublico = {
        id: usuario.id!,
        nome: usuario.nome,
        email: usuario.email,
        tipo: usuario.tipo,
        dataCriacao: usuario.dataCriacao
      };

      sucesso(res, usuarioPublico, 'Perfil obtido com sucesso');
    } catch (error) {
      console.error('Erro ao obter perfil:', error);
      erro(res, 'Erro ao obter perfil', 500);
    }
  }
}

export const authController = new AuthController();