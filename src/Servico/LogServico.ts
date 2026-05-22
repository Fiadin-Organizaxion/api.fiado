import { Log, TipoAcao } from '../modelo'
import { logDAO } from '../dao'
import { CriarLogDTO, LogRespostaDTO, FiltroLogDTO } from '../dto'

export class LogServico {
  
  // Converte Log para DTO de resposta
  private toRespostaDTO(log: Log): LogRespostaDTO {
    return {
      id: log.id,
      usuarioId: String(log.usuarioId),
      acao: log.acao,
      descricao: log.descricao,
      entidade: log.entidade,
      entidadeId: log.entidadeId !== null ? String(log.entidadeId) : null,
      dataCriacao: log.dataCriacao
    }
  }

  async registrar(dto: CriarLogDTO): Promise<LogRespostaDTO> {
    const usuarioId = Number(dto.usuarioId)
    if (Number.isNaN(usuarioId)) {
      throw new Error('usuarioId inválido')
    }

    const entidadeId = dto.entidadeId !== undefined ? dto.entidadeId : undefined

    // Criar entidade Log
    const log = Log.build(
      usuarioId,
      dto.acao,
      dto.descricao,
      dto.entidade,
      entidadeId
    )

    // Persistir no banco
    await logDAO.registrar(log)

    return this.toRespostaDTO(log)
  }

  // Métodos auxiliares para registrar ações específicas
  async registrarLogin(usuarioId: string): Promise<void> {
    await this.registrar({
      usuarioId,
      acao: TipoAcao.LOGIN,
      descricao: 'Usuário realizou login no sistema'
    })
  }

  async registrarCadastroUsuario(usuarioId: string, novoUsuarioId: string): Promise<void> {
    await this.registrar({
      usuarioId,
      acao: TipoAcao.CADASTRO_USUARIO,
      descricao: 'Novo usuário cadastrado no sistema',
      entidade: 'usuario',
      entidadeId: novoUsuarioId
    })
  }

  async registrarCadastroCliente(usuarioId: string, clienteId: string, nomeCliente: string): Promise<void> {
    await this.registrar({
      usuarioId,
      acao: TipoAcao.CADASTRO_CLIENTE,
      descricao: `Cliente "${nomeCliente}" cadastrado`,
      entidade: 'cliente',
      entidadeId: clienteId
    })
  }

  async registrarRegistroFiado(usuarioId: string, fiadoId: string, valor: number): Promise<void> {
    await this.registrar({
      usuarioId,
      acao: TipoAcao.REGISTRO_FIADO,
      descricao: `Fiado registrado no valor de R$ ${valor.toFixed(2)}`,
      entidade: 'fiado',
      entidadeId: fiadoId
    })
  }

  async registrarQuitacaoFiado(usuarioId: string, fiadoId: string, valor: number): Promise<void> {
    await this.registrar({
      usuarioId,
      acao: TipoAcao.QUITACAO_FIADO,
      descricao: `Fiado quitado no valor de R$ ${valor.toFixed(2)}`,
      entidade: 'fiado',
      entidadeId: fiadoId
    })
  }

  async registrarAtualizacao(usuarioId: string, entidade: string, entidadeId: string, descricao: string): Promise<void> {
    await this.registrar({
      usuarioId,
      acao: TipoAcao.ATUALIZACAO,
      descricao,
      entidade,
      entidadeId
    })
  }

  async registrarExclusao(usuarioId: string, entidade: string, entidadeId: string, descricao: string): Promise<void> {
    await this.registrar({
      usuarioId,
      acao: TipoAcao.EXCLUSAO,
      descricao,
      entidade,
      entidadeId
    })
  }

  async buscarPorId(id: string): Promise<LogRespostaDTO | null> {
    const logs = await logDAO.listarTodos(1)
    const log = logs.find(l => l.id === id)
    if (!log) {
      return null
    }
    return this.toRespostaDTO(log)
  }

  async listarTodos(): Promise<LogRespostaDTO[]> {
    const logs = await logDAO.listarTodos()
    return logs.map(l => this.toRespostaDTO(l))
  }

  async listarPorUsuario(usuarioId: string): Promise<LogRespostaDTO[]> {
    const logs = await logDAO.listarPorUsuario(usuarioId)
    return logs.map(l => this.toRespostaDTO(l))
  }

  async listarPorAcao(acao: TipoAcao): Promise<LogRespostaDTO[]> {
    const logs = await logDAO.listarPorAcao(acao)
    return logs.map(l => this.toRespostaDTO(l))
  }

  async listarComFiltros(filtros: FiltroLogDTO): Promise<LogRespostaDTO[]> {
    const logs = await logDAO.listarComFiltros(filtros)
    return logs.map(l => this.toRespostaDTO(l))
  }

  async listarPorEntidade(entidade: string, entidadeId?: string): Promise<LogRespostaDTO[]> {
    const logs = await logDAO.listarPorEntidade(entidade, entidadeId)
    return logs.map(l => this.toRespostaDTO(l))
  }
}

export const logServico = new LogServico()
