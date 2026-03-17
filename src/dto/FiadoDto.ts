import { StatusFiado } from '../modelo/Fiado'

// DTO para criação de fiado (entrada)
export type CriarFiadoDTO = {
  clienteId: string
  descricao: string
  valor: number
}

// DTO para atualização de fiado (entrada)
export type AtualizarFiadoDTO = {
  descricao?: string
  valor?: number
}

// DTO para resposta de fiado (saída)
export type FiadoRespostaDTO = {
  id: string
  clienteId: string
  descricao: string
  valor: number
  status: StatusFiado
  registradoPor: string
  dataCriacao: Date
  dataQuitacao: Date | null
}

// DTO para fiado com dados do cliente
export type FiadoComClienteDTO = {
  id: string
  descricao: string
  valor: number
  status: StatusFiado
  dataCriacao: Date
  dataQuitacao: Date | null
  cliente: {
    id: string
    nome: string
  }
}

// DTO para filtros de busca de fiados
export type FiltroFiadoDTO = {
  clienteId?: string
  status?: StatusFiado
  dataInicio?: Date
  dataFim?: Date
}

// DTO para resumo financeiro
export type ResumoFinanceiroDTO = {
  totalAberto: number
  totalQuitado: number
  quantidadeAbertos: number
  quantidadeQuitados: number
}
