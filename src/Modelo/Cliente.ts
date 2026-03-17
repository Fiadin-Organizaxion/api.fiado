import { randomUUID } from "crypto"

export type ClienteProps = {
  id: string
  nome: string
  telefone: string | null
  endereco: string | null
  criadoPor: string
  dataCriacao: Date
}

export class Cliente {
  private constructor(readonly props: ClienteProps) {}

  public static build(nome: string, criadoPor: string, telefone?: string, endereco?: string) {
    const props: ClienteProps = {
      id: randomUUID(),
      nome,
      telefone: telefone || null,
      endereco: endereco || null,
      criadoPor,
      dataCriacao: new Date()
    }
    return new Cliente(props)
  }

  public static construir(id: string, nome: string, criadoPor: string, dataCriacao: Date, telefone?: string, endereco?: string) {
    const props: ClienteProps = {
      id,
      nome,
      telefone: telefone || null,
      endereco: endereco || null,
      criadoPor,
      dataCriacao
    }
    return new Cliente(props)
  }

  public alterarNome(novoNome: string): Cliente {
    const novasProps: ClienteProps = {
      ...this.props,
      nome: novoNome
    }
    return new Cliente(novasProps)
  }

  public alterarTelefone(novoTelefone: string | null): Cliente {
    const novasProps: ClienteProps = {
      ...this.props,
      telefone: novoTelefone
    }
    return new Cliente(novasProps)
  }

  public alterarEndereco(novoEndereco: string | null): Cliente {
    const novasProps: ClienteProps = {
      ...this.props,
      endereco: novoEndereco
    }
    return new Cliente(novasProps)
  }

  public get id() {
    return this.props.id
  }

  public get nome() {
    return this.props.nome
  }

  public get telefone() {
    return this.props.telefone
  }

  public get endereco() {
    return this.props.endereco
  }

  public get criadoPor() {
    return this.props.criadoPor
  }

  public get dataCriacao() {
    return this.props.dataCriacao
  }
}
