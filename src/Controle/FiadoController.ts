import { Request, Response } from 'express'
import { fiadoServico } from '../Servico'
import { sucesso, erro, naoEncontrado, naoAutorizado } from '../util/respostas'
import { StatusFiado } from '../modelo/Fiado'
import { CriarFiadoDTO, AtualizarFiadoDTO, FiltroFiadoDTO } from '../dto'

export class FiadoController {
  async listar(req: Request, res: Response): Promise<void> {
    try {
      const filtro: FiltroFiadoDTO = {}
      const { clienteId, status, dataInicio, dataFim } = req.query

      if (clienteId) {
        filtro.clienteId = String(clienteId)
      }

      if (status && Object.values(StatusFiado).includes(status as StatusFiado)) {
        filtro.status = status as StatusFiado
      }

      if (dataInicio) {
        const inicio = new Date(String(dataInicio))
        if (!Number.isNaN(inicio.getTime())) {
          filtro.dataInicio = inicio
        }
      }

      if (dataFim) {
        const fim = new Date(String(dataFim))
        if (!Number.isNaN(fim.getTime())) {
          filtro.dataFim = fim
        }
      }

      const fiados = Object.keys(filtro).length > 0
        ? await fiadoServico.listarComFiltros(filtro)
        : await fiadoServico.listarTodos()

      sucesso(res, fiados, 'Fiados listados com sucesso')
    } catch (error) {
      console.error('Erro ao listar fiados:', error)
      erro(res, 'Erro ao listar fiados', 500)
    }
  }

  async listarComCliente(req: Request, res: Response): Promise<void> {
    try {
      const fiados = await fiadoServico.listarComCliente()
      sucesso(res, fiados, 'Fiados com cliente listados com sucesso')
    } catch (error) {
      console.error('Erro ao listar fiados com cliente:', error)
      erro(res, 'Erro ao listar fiados com cliente', 500)
    }
  }

  async obterResumo(req: Request, res: Response): Promise<void> {
    try {
      const resumo = await fiadoServico.obterResumoFinanceiro()
      sucesso(res, resumo, 'Resumo financeiro obtido com sucesso')
    } catch (error) {
      console.error('Erro ao obter resumo financeiro:', error)
      erro(res, 'Erro ao obter resumo financeiro', 500)
    }
  }

  async buscarPorId(req: Request, res: Response): Promise<void> {
    try {
      const rawId = req.params.id
      const id = Array.isArray(rawId) ? rawId[0] : rawId

      if (!id) {
        erro(res, 'ID inválido')
        return
      }

      const fiado = await fiadoServico.buscarPorId(id)

      if (!fiado) {
        naoEncontrado(res, 'Fiado não encontrado')
        return
      }

      sucesso(res, fiado, 'Fiado encontrado com sucesso')
    } catch (error) {
      console.error('Erro ao buscar fiado:', error)
      erro(res, 'Erro ao buscar fiado', 500)
    }
  }

  async cadastrar(req: Request, res: Response): Promise<void> {
    try {
      const { clienteId, descricao, valor } = req.body
      const usuarioId = req.usuario?.id

      if (!usuarioId) {
        naoAutorizado(res, 'Usuário não autenticado')
        return
      }

      if (!clienteId || !descricao || valor === undefined) {
        erro(res, 'clienteId, descricao e valor são obrigatórios')
        return
      }

      const parsedValor = Number(valor)
      if (Number.isNaN(parsedValor) || parsedValor <= 0) {
        erro(res, 'Valor deve ser um número maior que zero')
        return
      }

      const dto: CriarFiadoDTO = {
        clienteId: String(clienteId),
        descricao: String(descricao),
        valor: parsedValor
      }

      const fiado = await fiadoServico.criar(dto, String(usuarioId))
      sucesso(res, fiado, 'Fiado cadastrado com sucesso', 201)
    } catch (error) {
      console.error('Erro ao cadastrar fiado:', error)
      erro(res, error instanceof Error ? error.message : 'Erro ao cadastrar fiado', 400)
    }
  }

  async atualizar(req: Request, res: Response): Promise<void> {
    try {
      const rawId = req.params.id
      const id = Array.isArray(rawId) ? rawId[0] : rawId
      const { descricao, valor } = req.body
      const dto: AtualizarFiadoDTO = {}

      if (!id) {
        erro(res, 'ID inválido')
        return
      }

      if (descricao !== undefined) {
        dto.descricao = String(descricao)
      }

      if (valor !== undefined) {
        const parsedValor = Number(valor)
        if (Number.isNaN(parsedValor) || parsedValor <= 0) {
          erro(res, 'Valor deve ser um número maior que zero')
          return
        }
        dto.valor = parsedValor
      }

      if (Object.keys(dto).length === 0) {
        erro(res, 'Informe ao menos um campo para atualizar')
        return
      }

      const fiado = await fiadoServico.atualizar(id, dto)
      sucesso(res, fiado, 'Fiado atualizado com sucesso')
    } catch (error) {
      console.error('Erro ao atualizar fiado:', error)
      if (error instanceof Error && error.message === 'Fiado não encontrado') {
        naoEncontrado(res, error.message)
        return
      }
      erro(res, error instanceof Error ? error.message : 'Erro ao atualizar fiado', 400)
    }
  }

  async quitar(req: Request, res: Response): Promise<void> {
    try {
      const rawId = req.params.id
      const id = Array.isArray(rawId) ? rawId[0] : rawId

      if (!id) {
        erro(res, 'ID inválido')
        return
      }

      const fiado = await fiadoServico.quitar(id)
      sucesso(res, fiado, 'Fiado quitado com sucesso')
    } catch (error) {
      console.error('Erro ao quitar fiado:', error)
      if (error instanceof Error && error.message === 'Fiado não encontrado') {
        naoEncontrado(res, error.message)
        return
      }
      erro(res, error instanceof Error ? error.message : 'Erro ao quitar fiado', 400)
    }
  }

  async reabrir(req: Request, res: Response): Promise<void> {
    try {
      const rawId = req.params.id
      const id = Array.isArray(rawId) ? rawId[0] : rawId

      if (!id) {
        erro(res, 'ID inválido')
        return
      }

      const fiado = await fiadoServico.reabrir(id)
      sucesso(res, fiado, 'Fiado reaberto com sucesso')
    } catch (error) {
      console.error('Erro ao reabrir fiado:', error)
      if (error instanceof Error && error.message === 'Fiado não encontrado') {
        naoEncontrado(res, error.message)
        return
      }
      erro(res, error instanceof Error ? error.message : 'Erro ao reabrir fiado', 400)
    }
  }

  async excluir(req: Request, res: Response): Promise<void> {
    try {
      const rawId = req.params.id
      const id = Array.isArray(rawId) ? rawId[0] : rawId

      if (!id) {
        erro(res, 'ID inválido')
        return
      }

      await fiadoServico.excluir(id)
      sucesso(res, null, 'Fiado excluído com sucesso')
    } catch (error) {
      console.error('Erro ao excluir fiado:', error)
      if (error instanceof Error && error.message === 'Fiado não encontrado') {
        naoEncontrado(res, error.message)
        return
      }
      erro(res, error instanceof Error ? error.message : 'Erro ao excluir fiado', 400)
    }
  }
}

export const fiadoController = new FiadoController()
