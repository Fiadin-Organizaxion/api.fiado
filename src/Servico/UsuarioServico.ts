import { Usuario, TipoUsuario } from '../modelo/Usuario'
import { usuarioDAO } from '../dao'
import { hashSenha, compararSenha } from '../util/criptografia'
import { 
  CriarUsuarioDTO, 
  AtualizarUsuarioDTO, 
  UsuarioRespostaDTO,
  LoginDTO,
  LoginRespostaDTO 
} from '../dto/UsuarioDTO'
import { gerarToken } from '../util/jwt'

export class UsuarioServico {
  
  // Converte Usuario para DTO de resposta (sem senha)
  private toRespostaDTO(usuario: Usuario): UsuarioRespostaDTO {
    return {
      id: usuario.id,
      nome: usuario.nome,
      email: usuario.email,
      tipo: usuario.tipo,
      dataCriacao: usuario.dataCriacao
    }
  }

  async criar(dto: CriarUsuarioDTO): Promise<UsuarioRespostaDTO> {
    // Verificar se já existe usuário com este email
    const usuarioExistente = await usuarioDAO.buscarPorEmail(dto.email)
    if (usuarioExistente) {
      throw new Error('Email já cadastrado')
    }

    // Se for o primeiro usuário, deve ser DONO
    const totalUsuarios = await usuarioDAO.contarTotal()
    if (totalUsuarios === 0 && dto.tipo !== TipoUsuario.DONO) {
      throw new Error('O primeiro usuário deve ser do tipo DONO')
    }

    // Hash da senha
    const senhaHash = await hashSenha(dto.senha)

    // Criar entidade Usuario
    const usuario = Usuario.build(dto.nome, dto.email, senhaHash, dto.tipo)

    // Persistir no banco
    await usuarioDAO.criar(usuario)

    return this.toRespostaDTO(usuario)
  }

  async login(dto: LoginDTO): Promise<LoginRespostaDTO> {
    // Buscar usuário por email
    const usuario = await usuarioDAO.buscarPorEmail(dto.email)
    if (!usuario) {
      throw new Error('Credenciais inválidas')
    }

    // Verificar senha
    const senhaValida = await compararSenha(dto.senha, usuario.senha)
    if (!senhaValida) {
      throw new Error('Credenciais inválidas')
    }

    // Gerar token JWT
    const token = gerarToken({
      id: usuario.id,
      nome: usuario.nome,
      email: usuario.email,
      tipo: usuario.tipo
    })

    return {
      token,
      usuario: {
        id: usuario.id,
        nome: usuario.nome,
        tipo: usuario.tipo
      }
    }
  }

  async buscarPorId(id: string): Promise<UsuarioRespostaDTO | null> {
    const usuario = await usuarioDAO.buscarPorId(id)
    if (!usuario) {
      return null
    }
    return this.toRespostaDTO(usuario)
  }

  async buscarPorEmail(email: string): Promise<UsuarioRespostaDTO | null> {
    const usuario = await usuarioDAO.buscarPorEmail(email)
    if (!usuario) {
      return null
    }
    return this.toRespostaDTO(usuario)
  }

  async listarTodos(): Promise<UsuarioRespostaDTO[]> {
    const usuarios = await usuarioDAO.listarTodos()
    return usuarios.map(u => this.toRespostaDTO(u))
  }

  async listarPorTipo(tipo: TipoUsuario): Promise<UsuarioRespostaDTO[]> {
    const usuarios = await usuarioDAO.listarPorTipo(tipo)
    return usuarios.map(u => this.toRespostaDTO(u))
  }

  async atualizar(id: string, dto: AtualizarUsuarioDTO): Promise<UsuarioRespostaDTO> {
    // Buscar usuário existente
    let usuario = await usuarioDAO.buscarPorId(id)
    if (!usuario) {
      throw new Error('Usuário não encontrado')
    }

    // Aplicar alterações usando métodos imutáveis
    if (dto.nome) {
      usuario = usuario.alterarNome(dto.nome)
    }

    if (dto.email) {
      // Verificar se novo email já está em uso
      const emailEmUso = await usuarioDAO.buscarPorEmail(dto.email)
      if (emailEmUso && emailEmUso.id !== id) {
        throw new Error('Email já está em uso')
      }
      usuario = usuario.alterarEmail(dto.email)
    }

    if (dto.senha) {
      const senhaHash = await hashSenha(dto.senha)
      usuario = usuario.alterarSenha(senhaHash)
    }

    // Persistir alterações
    await usuarioDAO.atualizar(usuario)

    return this.toRespostaDTO(usuario)
  }

  async excluir(id: string): Promise<void> {
    const usuario = await usuarioDAO.buscarPorId(id)
    if (!usuario) {
      throw new Error('Usuário não encontrado')
    }

    // Verificar se é o único DONO
    if (usuario.tipo === TipoUsuario.DONO) {
      const donos = await usuarioDAO.listarPorTipo(TipoUsuario.DONO)
      if (donos.length === 1) {
        throw new Error('Não é possível excluir o único DONO do sistema')
      }
    }

    await usuarioDAO.excluir(id)
  }
}

export const usuarioServico = new UsuarioServico()
