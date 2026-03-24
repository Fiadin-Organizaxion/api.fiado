import { randomUUID } from "crypto"

export enum TipoAcao {
  CADASTRO_USUARIO = 'CADASTRO_USUARIO',
  LOGIN = 'LOGIN',
  CADASTRO_CLIENTE = 'CADASTRO_CLIENTE',
  REGISTRO_FIADO = 'REGISTRO_FIADO',
  QUITACAO_FIADO = 'QUITACAO_FIADO',
  ATUALIZACAO = 'ATUALIZACAO',
  EXCLUSAO = 'EXCLUSAO'
}

export type LogProps = {
  id: string
  usuarioId: number
  acao: TipoAcao
  descricao: string
  entidade: string | null
  entidadeId: number | null
  dataCriacao: Date
}

export type LogCriacao = {
  usuario_id: number
  acao: TipoAcao
  descricao: string
  entidade: string | null
  entidade_id: number | null
}

export class Log {
  private constructor(readonly props: LogProps) {}

  public static build(
    usuarioId: number,
    acao: TipoAcao,
    descricao: string,
    entidade?: string,
    entidadeId?: number
  ) {
    const props: LogProps = {
      id: randomUUID(),
      usuarioId,
      acao,
      descricao,
      entidade: entidade || null,
      entidadeId: entidadeId || null,
      dataCriacao: new Date()
    }
    return new Log(props)
  }

  public static construir(
    id: string,
    usuarioId: string,
    acao: TipoAcao,
    descricao: string,
    dataCriacao: Date,
    entidade?: string,
    entidadeId?: string
  ) {
    // 🔒 Conversões seguras
    const usuarioIdNum = Number(usuarioId)
    const entidadeIdNum = entidadeId ? Number(entidadeId) : null

    // 🔒 Validações
    if (isNaN(usuarioIdNum)) {
      throw new Error("usuarioId inválido")
    }

    if (entidadeId && isNaN(entidadeIdNum!)) {
      throw new Error("entidadeId inválido")
    }

    const props: LogProps = {
      id,
      usuarioId: usuarioIdNum,
      acao,
      descricao,
      entidade: entidade || null,
      entidadeId: entidadeIdNum,
      dataCriacao
    }

    return new Log(props)
  }

  public get id() {
    return this.props.id
  }

  public get usuarioId() {
    return this.props.usuarioId
  }

  public get acao() {
    return this.props.acao
  }

  public get descricao() {
    return this.props.descricao
  }

  public get entidade() {
    return this.props.entidade
  }

  public get entidadeId() {
    return this.props.entidadeId
  }

  public get dataCriacao() {
    return this.props.dataCriacao
  }
}