import { Request, Response } from 'express'
import { clienteServico, logServico } from '../servico'
import { sucesso, erro, naoEncontrado, naoAutorizado } from '../util/respostas'
import { CriarClienteDTO, AtualizarClienteDTO } from '../dto'

export class ClienteController {
  async listar(req: Request, res: Response): Promise<void> {
    try {
      const nome = req.query.nome as string | undefined

      const clientes = nome
        ? await clienteServico.buscarPorNome(nome)
        : await clienteServico.listarTodos()

      sucesso(res, clientes, 'Clientes listados com sucesso')
    } catch (error) {
      console.error('Erro ao listar clientes:', error)
      erro(res, 'Erro ao listar clientes', 500)
    }
  }

  async listarComFiados(req: Request, res: Response): Promise<void> {
    try {
      const clientes = await clienteServico.listarComFiados()
      sucesso(res, clientes, 'Clientes com fiados listados com sucesso')
    } catch (error) {
      console.error('Erro ao listar clientes com fiados:', error)
      erro(res, 'Erro ao listar clientes com fiados', 500)
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

      const cliente = await clienteServico.buscarPorId(id)

      if (!cliente) {
        naoEncontrado(res, 'Cliente não encontrado')
        return
      }

      sucesso(res, cliente, 'Cliente encontrado com sucesso')
    } catch (error) {
      console.error('Erro ao buscar cliente:', error)
      erro(res, 'Erro ao buscar cliente', 500)
    }
  }

  async cadastrar(req: Request, res: Response): Promise<void> {
    try {
      const { nome, telefone, endereco } = req.body
      const usuarioId = req.usuario?.id

      if (!usuarioId) {
        naoAutorizado(res, 'Usuário não autenticado')
        return
      }

      if (!nome) {
        erro(res, 'Nome é obrigatório')
        return
      }

      const dto: CriarClienteDTO = {
        nome,
        telefone,
        endereco
      }

      const cliente = await clienteServico.criar(dto, String(usuarioId))

      try {
        await logServico.registrarCadastroCliente(
          String(usuarioId),
          cliente.id,
          cliente.nome
        )
      } catch (logError) {
        console.error('Erro ao registrar log de cadastro de cliente:', logError)
      }

      sucesso(res, cliente, 'Cliente cadastrado com sucesso', 201)
    } catch (error) {
      console.error('Erro ao cadastrar cliente:', error)
      erro(res, 'Erro ao cadastrar cliente', 500)
    }
  }

  async atualizar(req: Request, res: Response): Promise<void> {
    try {
      const rawId = req.params.id
      const id = Array.isArray(rawId) ? rawId[0] : rawId
      const dto: AtualizarClienteDTO = req.body

      if (!id) {
        erro(res, 'ID inválido')
        return
      }

      const cliente = await clienteServico.atualizar(id, dto)

      try {
        await logServico.registrarAtualizacao(
          String(req.usuario?.id ?? '0'),
          'cliente',
          id,
          `Cliente ${cliente.nome} atualizado`
        )
      } catch (logError) {
        console.error('Erro ao registrar log de atualização de cliente:', logError)
      }

      sucesso(res, cliente, 'Cliente atualizado com sucesso')
    } catch (error) {
      console.error('Erro ao atualizar cliente:', error)
      if (error instanceof Error && error.message === 'Cliente não encontrado') {
        naoEncontrado(res, error.message)
        return
      }
      erro(res, 'Erro ao atualizar cliente', 500)
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

      await clienteServico.excluir(id)

      try {
        await logServico.registrarExclusao(
          String(req.usuario?.id ?? '0'),
          'cliente',
          id,
          `Cliente ${id} excluído`
        )
      } catch (logError) {
        console.error('Erro ao registrar log de exclusão de cliente:', logError)
      }

      sucesso(res, null, 'Cliente excluído com sucesso')
    } catch (error) {
      console.error('Erro ao excluir cliente:', error)
      if (error instanceof Error && error.message === 'Cliente não encontrado') {
        naoEncontrado(res, error.message)
        return
      }
      erro(res, error instanceof Error ? error.message : 'Erro ao excluir cliente', 400)
    }
  }
}

export const clienteController = new ClienteController()
