import { TipoAcao } from '../modelo/Log'

// DTO para criação de log (entrada)
export type CriarLogDTO = {
  usuarioId: string
  acao: TipoAcao
  descricao: string
  entidade?: string
  entidadeId?: string
}

// DTO para resposta de log (saída)
export type LogRespostaDTO = {
  id: string
  usuarioId: string
  acao: TipoAcao
  descricao: string
  entidade: string | null
  entidadeId: string | null
  dataCriacao: Date
}

// DTO para filtros de busca de logs
export type FiltroLogDTO = {
  usuarioId?: string
  acao?: TipoAcao
  entidade?: string
  dataInicio?: Date
  dataFim?: Date
}
