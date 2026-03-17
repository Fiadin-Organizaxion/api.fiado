import { Cliente } from '../modelo/Cliente'
import { clienteDAO } from '../dao'
import { 
  CriarClienteDTO, 
  AtualizarClienteDTO, 
  ClienteRespostaDTO,
  ClienteComFiadosDTO 
} from '../dto/ClienteDTO'

export class ClienteServico {
  
  // Converte Cliente para DTO de resposta
  private toRespostaDTO(cliente: Cliente): ClienteRespostaDTO {
    return {
      id: cliente.id,
      nome: cliente.nome,
      telefone: cliente.telefone,
      endereco: cliente.endereco,
      criadoPor: cliente.criadoPor,
      dataCriacao: cliente.dataCriacao
    }
  }

  async criar(dto: CriarClienteDTO, usuarioId: string): Promise<ClienteRespostaDTO> {
    // Criar entidade Cliente
    const cliente = Cliente.build(dto.nome, usuarioId, dto.telefone, dto.endereco)

    // Persistir no banco
    await clienteDAO.criar(cliente)

    return this.toRespostaDTO(cliente)
  }

  async buscarPorId(id: string): Promise<ClienteRespostaDTO | null> {
    const cliente = await clienteDAO.buscarPorId(id)
    if (!cliente) {
      return null
    }
    return this.toRespostaDTO(cliente)
  }

  async listarTodos(): Promise<ClienteRespostaDTO[]> {
    const clientes = await clienteDAO.listarTodos()
    return clientes.map(c => this.toRespostaDTO(c))
  }

  async listarComFiados(): Promise<ClienteComFiadosDTO[]> {
    return await clienteDAO.listarComTotalFiados()
  }

  async buscarPorNome(nome: string): Promise<ClienteRespostaDTO[]> {
    const clientes = await clienteDAO.buscarPorNome(nome)
    return clientes.map(c => this.toRespostaDTO(c))
  }

  async atualizar(id: string, dto: AtualizarClienteDTO): Promise<ClienteRespostaDTO> {
    // Buscar cliente existente
    let cliente = await clienteDAO.buscarPorId(id)
    if (!cliente) {
      throw new Error('Cliente não encontrado')
    }

    // Aplicar alterações usando métodos imutáveis
    if (dto.nome) {
      cliente = cliente.alterarNome(dto.nome)
    }

    if (dto.telefone !== undefined) {
      cliente = cliente.alterarTelefone(dto.telefone || null)
    }

    if (dto.endereco !== undefined) {
      cliente = cliente.alterarEndereco(dto.endereco || null)
    }

    // Persistir alterações
    await clienteDAO.atualizar(cliente)

    return this.toRespostaDTO(cliente)
  }

  async excluir(id: string): Promise<void> {
    const cliente = await clienteDAO.buscarPorId(id)
    if (!cliente) {
      throw new Error('Cliente não encontrado')
    }

    // Verificar se cliente tem fiados em aberto
    const temFiadosAbertos = await clienteDAO.temFiadosAbertos(id)
    if (temFiadosAbertos) {
      throw new Error('Não é possível excluir cliente com fiados em aberto')
    }

    await clienteDAO.excluir(id)
  }
}

export const clienteServico = new ClienteServico()
