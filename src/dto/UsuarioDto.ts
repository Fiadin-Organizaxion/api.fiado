import { TipoUsuario } from '../modelo/Usuario'

// DTO para criação de usuário (entrada)
export type CriarUsuarioDTO = {
  nome: string
  email: string
  senha: string
  tipo: TipoUsuario
}

// DTO para atualização de usuário (entrada)
export type AtualizarUsuarioDTO = {
  nome?: string
  email?: string
  senha?: string
}

// DTO para resposta pública de usuário (saída - sem senha)
export type UsuarioRespostaDTO = {
  id: string
  nome: string
  email: string
  tipo: TipoUsuario
  dataCriacao: Date
}

// DTO para login (entrada)
export type LoginDTO = {
  email: string
  senha: string
}

// DTO para resposta de login (saída)
export type LoginRespostaDTO = {
  token: string
  usuario: {
    id: string
    nome: string
    tipo: TipoUsuario
  }
}

// DTO para payload do JWT
export type JwtPayloadDTO = {
  id: string
  nome: string
  email: string
  tipo: TipoUsuario
  iat?: number
  exp?: number
}
