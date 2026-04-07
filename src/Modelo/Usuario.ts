export enum TipoUsuario {
  DONO = 'DONO',
  FUNCIONARIO = 'FUNCIONARIO'
}

export type UsuarioProps = {
  id?: number
  nome: string
  email: string
  senha: string
  tipo: TipoUsuario
  dataCriacao: Date
}

export class Usuario {
  private constructor(private props: UsuarioProps) {}

  public static build(nome: string, email: string, senha: string, tipo: TipoUsuario) {
    return new Usuario({
      nome,
      email,
      senha,
      tipo,
      dataCriacao: new Date()
    })
  }

  public static construir(
    id: number,
    nome: string,
    email: string,
    senha: string,
    tipo: TipoUsuario,
    dataCriacao: Date
  ) {
    return new Usuario({
      id,
      nome,
      email,
      senha,
      tipo,
      dataCriacao
    })
  }

  public alterarNome(novoNome: string): Usuario {
    return new Usuario({
      ...this.props,
      nome: novoNome
    })
  }

  public alterarEmail(novoEmail: string): Usuario {
    return new Usuario({
      ...this.props,
      email: novoEmail
    })
  }

  public alterarSenha(novaSenha: string): Usuario {
    return new Usuario({
      ...this.props,
      senha: novaSenha
    })
  }

  public get id(): number | undefined {
    return this.props.id
  }

  public set id(value: number) {
    this.props.id = value
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