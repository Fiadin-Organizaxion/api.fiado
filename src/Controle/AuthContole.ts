/**
 * Controller de Autenticação
 * Gerencia login e registro de usuários
 */

import { Request, Response } from 'express';
import { usuarioDAO, logDAO } from '../dao';
import { hashSenha, compararSenha } from '../util/criptografia';
import { gerarToken } from '../util/jwt';
import { sucesso, erro, naoAutorizado } from '../util/respostas';
import { TipoUsuario, TipoAcao, LoginResposta, UsuarioPublico } from '../modelo';

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

      // Validação básica
      if (!email || !senha) {
        erro(res, 'Email e senha são obrigatórios');
        return;
      }

      // Busca usuário por email
      const usuario = await usuarioDAO.buscarPorEmail(email);

      if (!usuario) {
        naoAutorizado(res, 'Credenciais inválidas');
        return;
      }

      // Verifica senha
      const senhaValida = await compararSenha(senha, usuario.senha);

      if (!senhaValida) {
        naoAutorizado(res, 'Credenciais inválidas');
        return;
      }

      // Gera token JWT
      const token = gerarToken({
        id: usuario.id!,
        nome: usuario.nome,
        email: usuario.email,
        tipo: usuario.tipo
      });

      // Registra log de login
      await logDAO.registrar({
        usuario_id: usuario.id!,
        acao: TipoAcao.LOGIN,
        descricao: `Usuário ${usuario.nome} realizou login`,
        entidade: 'usuarios',
        entidade_id: usuario.id
      });

      // Retorna resposta de sucesso
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

      // Validação básica
      if (!nome || !email || !senha || !tipo) {
        erro(res, 'Nome, email, senha e tipo são obrigatórios');
        return;
      }

      // Valida tipo de usuário
      if (!Object.values(TipoUsuario).includes(tipo)) {
        erro(res, 'Tipo de usuário inválido. Use DONO ou FUNCIONARIO');
        return;
      }

      // Verifica se email já existe
      const usuarioExistente = await usuarioDAO.buscarPorEmail(email);
      if (usuarioExistente) {
        erro(res, 'Este email já está cadastrado');
        return;
      }

      // Regras de criação de usuários
      const existeDono = await usuarioDAO.existeDono();

      if (tipo === TipoUsuario.DONO) {
        // Só permite criar DONO se não existir nenhum ainda
        // Ou se um DONO autenticado estiver criando
        if (existeDono && (!usuarioLogado || usuarioLogado.tipo !== TipoUsuario.DONO)) {
          erro(res, 'Já existe um dono cadastrado. Apenas o dono pode cadastrar outro dono.', 403);
          return;
        }
      }

      if (tipo === TipoUsuario.FUNCIONARIO) {
        // Funcionário só pode ser criado por um DONO autenticado
        if (!usuarioLogado || usuarioLogado.tipo !== TipoUsuario.DONO) {
          erro(res, 'Apenas o dono pode cadastrar funcionários', 403);
          return;
        }
      }

      // Criptografa a senha
      const senhaCriptografada = await hashSenha(senha);

      // Cria o usuário
      const novoId = await usuarioDAO.criar({
        nome,
        email,
        senha: senhaCriptografada,
        tipo
      });

      // Registra log de cadastro
      await logDAO.registrar({
        usuario_id: usuarioLogado?.id || novoId,
        acao: TipoAcao.CADASTRO_USUARIO,
        descricao: `Usuário ${nome} (${tipo}) cadastrado`,
        entidade: 'usuarios',
        entidade_id: novoId
      });

      // Busca usuário criado (sem senha)
      const usuarioCriado = await usuarioDAO.buscarPorId(novoId);
      const usuarioPublico: UsuarioPublico = {
        id: usuarioCriado!.id!,
        nome: usuarioCriado!.nome,
        email: usuarioCriado!.email,
        tipo: usuarioCriado!.tipo,
        data_criacao: usuarioCriado!.data_criacao!
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
        data_criacao: usuario.data_criacao!
      };

      sucesso(res, usuarioPublico, 'Perfil obtido com sucesso');
    } catch (error) {
      console.error('Erro ao obter perfil:', error);
      erro(res, 'Erro ao obter perfil', 500);
    }
  }
}

// Exporta instância singleton
export const authController = new AuthController();
