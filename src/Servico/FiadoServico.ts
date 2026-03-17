import { Fiado, StatusFiado } from '../modelo/Fiado'
import { fiadoDAO } from '../dao'
import { clienteDAO } from '../dao'
import { 
  CriarFiadoDTO, 
  AtualizarFiadoDTO, 
  FiadoRespostaDTO,
  FiadoComClienteDTO,
  FiltroFiadoDTO,
  ResumoFinanceiroDTO 
} from '../dto/FiadoDTO'

export class FiadoServico {
  
  // Converte Fiado para DTO de resposta
  private toRespostaDTO(fiado: Fiado): FiadoRespostaDTO {
    return {
      id: fiado.id,
      clienteId: fiado.clienteId,
      descricao: fiado.descricao,
      valor: fiado.valor,
      status: fiado.status,
      registradoPor: fiado.registradoPor,
      dataCriacao: fiado.dataCriacao,
      dataQuitacao: fiado.dataQuitacao
    }
  }

  async criar(dto: CriarFiadoDTO, usuarioId: string): Promise<FiadoRespostaDTO> {
    // Verificar se cliente existe
    const cliente = await clienteDAO.buscarPorId(dto.clienteId)
    if (!cliente) {
      throw new Error('Cliente não encontrado')
    }

    // Validar valor
    if (dto.valor <= 0) {
      throw new Error('Valor deve ser maior que zero')
    }

    // Criar entidade Fiado
    const fiado = Fiado.build(dto.clienteId, dto.descricao, dto.valor, usuarioId)

    // Persistir no banco
    await fiadoDAO.criar(fiado)

    return this.toRespostaDTO(fiado)
  }

  async buscarPorId(id: string): Promise<FiadoRespostaDTO | null> {
    const fiado = await fiadoDAO.buscarPorId(id)
    if (!fiado) {
      return null
    }
    return this.toRespostaDTO(fiado)
  }

  async listarTodos(): Promise<FiadoRespostaDTO[]> {
    const fiados = await fiadoDAO.listarTodos()
    return fiados.map(f => this.toRespostaDTO(f))
  }

  async listarPorCliente(clienteId: string): Promise<FiadoRespostaDTO[]> {
    const fiados = await fiadoDAO.listarPorCliente(clienteId)
    return fiados.map(f => this.toRespostaDTO(f))
  }

  async listarPorStatus(status: StatusFiado): Promise<FiadoRespostaDTO[]> {
    const fiados = await fiadoDAO.listarPorStatus(status)
    return fiados.map(f => this.toRespostaDTO(f))
  }

  async listarComFiltros(filtros: FiltroFiadoDTO): Promise<FiadoRespostaDTO[]> {
    const fiados = await fiadoDAO.listarComFiltros(filtros)
    return fiados.map(f => this.toRespostaDTO(f))
  }

  async listarComCliente(): Promise<FiadoComClienteDTO[]> {
    return await fiadoDAO.listarComDadosCliente()
  }

  async atualizar(id: string, dto: AtualizarFiadoDTO): Promise<FiadoRespostaDTO> {
    // Buscar fiado existente
    let fiado = await fiadoDAO.buscarPorId(id)
    if (!fiado) {
      throw new Error('Fiado não encontrado')
    }

    // Não permitir alterar fiado quitado
    if (fiado.estaQuitado()) {
      throw new Error('Não é possível alterar fiado já quitado')
    }

    // Aplicar alterações usando métodos imutáveis
    if (dto.descricao) {
      fiado = fiado.alterarDescricao(dto.descricao)
    }

    if (dto.valor !== undefined) {
      if (dto.valor <= 0) {
        throw new Error('Valor deve ser maior que zero')
      }
      fiado = fiado.alterarValor(dto.valor)
    }

    // Persistir alterações
    await fiadoDAO.atualizar(fiado)

    return this.toRespostaDTO(fiado)
  }

  async quitar(id: string): Promise<FiadoRespostaDTO> {
    // Buscar fiado existente
    let fiado = await fiadoDAO.buscarPorId(id)
    if (!fiado) {
      throw new Error('Fiado não encontrado')
    }

    // Verificar se já está quitado
    if (fiado.estaQuitado()) {
      throw new Error('Fiado já está quitado')
    }

    // Quitar usando método imutável
    fiado = fiado.quitar()

    // Persistir alterações
    await fiadoDAO.atualizar(fiado)

    return this.toRespostaDTO(fiado)
  }

  async reabrir(id: string): Promise<FiadoRespostaDTO> {
    // Buscar fiado existente
    let fiado = await fiadoDAO.buscarPorId(id)
    if (!fiado) {
      throw new Error('Fiado não encontrado')
    }

    // Verificar se está quitado
    if (fiado.estaAberto()) {
      throw new Error('Fiado já está aberto')
    }

    // Reabrir usando método imutável
    fiado = fiado.reabrir()

    // Persistir alterações
    await fiadoDAO.atualizar(fiado)

    return this.toRespostaDTO(fiado)
  }

  async obterResumoFinanceiro(): Promise<ResumoFinanceiroDTO> {
    return await fiadoDAO.obterResumoFinanceiro()
  }

  async excluir(id: string): Promise<void> {
    const fiado = await fiadoDAO.buscarPorId(id)
    if (!fiado) {
      throw new Error('Fiado não encontrado')
    }

    await fiadoDAO.excluir(id)
  }
}

export const fiadoServico = new FiadoServico()
