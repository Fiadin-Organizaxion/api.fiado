// DTO para criação de cliente (entrada)
export type CriarClienteDTO = {
  nome: string
  telefone?: string
  endereco?: string
}

// DTO para atualização de cliente (entrada)
export type AtualizarClienteDTO = {
  nome?: string
  telefone?: string
  endereco?: string
}

// DTO para resposta de cliente (saída)
export type ClienteRespostaDTO = {
  id: string
  nome: string
  telefone: string | null
  endereco: string | null
  criadoPor: string
  dataCriacao: Date
}

// DTO para listagem de clientes com total de fiados
export type ClienteComFiadosDTO = {
  id: string
  nome: string
  telefone: string | null
  endereco: string | null
  totalFiados: number
  valorTotalAberto: number
}
