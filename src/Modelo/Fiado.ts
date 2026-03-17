import { randomUUID } from "crypto"

export enum StatusFiado {
  ABERTO = 'ABERTO',
  QUITADO = 'QUITADO'
}

export type FiadoProps = {
  id: string
  clienteId: string
  descricao: string
  valor: number
  status: StatusFiado
  registradoPor: string
  dataCriacao: Date
  dataQuitacao: Date | null
}

export class Fiado {
  private constructor(readonly props: FiadoProps) {}

  public static build(clienteId: string, descricao: string, valor: number, registradoPor: string) {
    const props: FiadoProps = {
      id: randomUUID(),
      clienteId,
      descricao,
      valor,
      status: StatusFiado.ABERTO,
      registradoPor,
      dataCriacao: new Date(),
      dataQuitacao: null
    }
    return new Fiado(props)
  }

  public static construir(
    id: string,
    clienteId: string,
    descricao: string,
    valor: number,
    status: StatusFiado,
    registradoPor: string,
    dataCriacao: Date,
    dataQuitacao: Date | null
  ) {
    const props: FiadoProps = {
      id,
      clienteId,
      descricao,
      valor,
      status,
      registradoPor,
      dataCriacao,
      dataQuitacao
    }
    return new Fiado(props)
  }

  public alterarDescricao(novaDescricao: string): Fiado {
    const novasProps: FiadoProps = {
      ...this.props,
      descricao: novaDescricao
    }
    return new Fiado(novasProps)
  }

  public alterarValor(novoValor: number): Fiado {
    const novasProps: FiadoProps = {
      ...this.props,
      valor: novoValor
    }
    return new Fiado(novasProps)
  }

  public quitar(): Fiado {
    const novasProps: FiadoProps = {
      ...this.props,
      status: StatusFiado.QUITADO,
      dataQuitacao: new Date()
    }
    return new Fiado(novasProps)
  }

  public reabrir(): Fiado {
    const novasProps: FiadoProps = {
      ...this.props,
      status: StatusFiado.ABERTO,
      dataQuitacao: null
    }
    return new Fiado(novasProps)
  }

  public get id() {
    return this.props.id
  }

  public get clienteId() {
    return this.props.clienteId
  }

  public get descricao() {
    return this.props.descricao
  }

  public get valor() {
    return this.props.valor
  }

  public get status() {
    return this.props.status
  }

  public get registradoPor() {
    return this.props.registradoPor
  }

  public get dataCriacao() {
    return this.props.dataCriacao
  }

  public get dataQuitacao() {
    return this.props.dataQuitacao
  }

  public estaAberto(): boolean {
    return this.props.status === StatusFiado.ABERTO
  }

  public estaQuitado(): boolean {
    return this.props.status === StatusFiado.QUITADO
  }
}
