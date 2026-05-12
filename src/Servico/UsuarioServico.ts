import { Usuario, TipoUsuario } from '../modelo/Usuario'
import { usuarioDAO } from '../dao'
import { hashSenha, compararSenha } from '../util/criptografia'
import { 
  CriarUsuarioDTO, 
  AtualizarUsuarioDTO, 
  UsuarioRespostaDTO,
  LoginDTO,
  LoginRespostaDTO 
} from '../dto/UsuarioDto'
import { gerarToken } from '../util/jwt'

export class UsuarioServico {
  
  private obterIdUsuario(usuario: Usuario): number {
    if (usuario.id === undefined) {
      throw new Error('ID do usuário não definido')
    }
    return usuario.id
  }

  // Converte Usuario para DTO de resposta (sem senha)
  private toRespostaDTO(usuario: Usuario): UsuarioRespostaDTO {
    return {
      id: this.obterIdUsuario(usuario),
      nome: usuario.nome,
      email: usuario.email,
      tipo: usuario.tipo,
      dataCriacao: usuario.dataCriacao
    }
  }

  async criar(dto: CriarUsuarioDTO): Promise<UsuarioRespostaDTO> {
    const usuarioExistente = await usuarioDAO.buscarPorEmail(dto.email)
    if (usuarioExistente) {
      throw new Error('Email já cadastrado')
    }

    const totalUsuarios = await usuarioDAO.contarTotal()
    if (totalUsuarios === 0 && dto.tipo !== TipoUsuario.DONO) {
      throw new Error('O primeiro usuário deve ser do tipo DONO')
    }

    const senhaHash = await hashSenha(dto.senha)

    const usuario = Usuario.build(dto.nome, dto.email, senhaHash, dto.tipo)

    // 🔥 CORREÇÃO AQUI
    const id = await usuarioDAO.criar({
      nome: usuario.nome,
      email: usuario.email,
      senha: usuario.senha,
      tipo: usuario.tipo
    })

    // Atualiza o ID na entidade
    usuario.id = id

    return this.toRespostaDTO(usuario)
  }

  async login(dto: LoginDTO): Promise<LoginRespostaDTO> {
    const usuario = await usuarioDAO.buscarPorEmail(dto.email)
    if (!usuario) {
      throw new Error('Credenciais inválidas')
    }

    const senhaValida = await compararSenha(dto.senha, usuario.senha)
    if (!senhaValida) {
      throw new Error('Credenciais inválidas')
    }

    const id = this.obterIdUsuario(usuario)

    const token = gerarToken({
      id,
      nome: usuario.nome,
      email: usuario.email,
      tipo: usuario.tipo
    })

    return {
      token,
      usuario: {
        id,
        nome: usuario.nome,
        tipo: usuario.tipo
      }
    }
  }

  async buscarPorId(id: number): Promise<UsuarioRespostaDTO | null> {
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
    return usuarios.map(u => this.toRespostaDTO(u as Usuario))
  }

  async listarPorTipo(tipo: TipoUsuario): Promise<UsuarioRespostaDTO[]> {
    const usuarios = await usuarioDAO.listarPorTipo(tipo)
    return usuarios.map(u => this.toRespostaDTO(u as Usuario))
  }

  async atualizar(id: number, dto: AtualizarUsuarioDTO): Promise<UsuarioRespostaDTO> {
    let usuario = await usuarioDAO.buscarPorId(id)
    if (!usuario) {
      throw new Error('Usuário não encontrado')
    }

    if (dto.nome) {
      usuario = usuario.alterarNome(dto.nome)
    }

    if (dto.email) {
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

    // 🔥 CORREÇÃO AQUI
    await usuarioDAO.atualizar(id, {
      nome: usuario.nome,
      email: usuario.email,
      senha: usuario.senha
    })

    return this.toRespostaDTO(usuario)
  }

  async excluir(id: number): Promise<void> {
    const usuario = await usuarioDAO.buscarPorId(id)
    if (!usuario) {
      throw new Error('Usuário não encontrado')
    }

    if (usuario.tipo === TipoUsuario.DONO) {
      const donos = await usuarioDAO.listarPorTipo(TipoUsuario.DONO)
      if (donos.length === 1) {
        throw new Error('Não é possível excluir o único DONO do sistema')
      }
    }

    // 🔥 CORREÇÃO AQUI
    await usuarioDAO.remover(id)
  }
}

export const usuarioServico = new UsuarioServico()