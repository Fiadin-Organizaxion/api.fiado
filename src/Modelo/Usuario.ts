import { randomUUID } from "crypto"

export enum TipoUsuario {
  DONO = 'DONO',
  FUNCIONARIO = 'FUNCIONARIO'
}

export type UsuarioProps = {
  id: string
  nome: string
  email: string
  senha: string
  tipo: TipoUsuario
  dataCriacao: Date
}

export class Usuario {
  private constructor(readonly props: UsuarioProps) {}

  public static build(nome: string, email: string, senha: string, tipo: TipoUsuario) {
    const props: UsuarioProps = {
      id: randomUUID(),
      nome,
      email,
      senha,
      tipo,
      dataCriacao: new Date()
    }
    return new Usuario(props)
  }

  public static construir(id: string, nome: string, email: string, senha: string, tipo: TipoUsuario, dataCriacao: Date) {
    const props: UsuarioProps = {
      id,
      nome,
      email,
      senha,
      tipo,
      dataCriacao
    }
    return new Usuario(props)
  }

  public alterarNome(novoNome: string): Usuario {
    const novasProps: UsuarioProps = {
      ...this.props,
      nome: novoNome
    }
    return new Usuario(novasProps)
  }

  public alterarEmail(novoEmail: string): Usuario {
    const novasProps: UsuarioProps = {
      ...this.props,
      email: novoEmail
    }
    return new Usuario(novasProps)
  }

  public alterarSenha(novaSenha: string): Usuario {
    const novasProps: UsuarioProps = {
      ...this.props,
      senha: novaSenha
    }
    return new Usuario(novasProps)
  }

  public get id() {
    return this.props.id
  }

  public get nome() {
    return this.props.nome
  }

  public get email() {
    return this.props.email
  }

  public get senha() {
    return this.props.senha
  }

  public get tipo() {
    return this.props.tipo
  }

  public get dataCriacao() {
    return this.props.dataCriacao
  }
}
