/**
 * DAO de Fiado
 * Responsável por todas as operações de banco de dados relacionadas a fiados
 */

import { query } from '../util/database'
import { Fiado, StatusFiado } from '../modelo/Fiado'
import {
  FiltroFiadoDTO,
  FiadoComClienteDTO,
  ResumoFinanceiroDTO
} from '../dto/FiadoDto'

// Interface para resultados do banco
interface FiadoRow {
  id: string
  cliente_id: string
  descricao: string
  valor: number
  status: StatusFiado
  registrado_por: string
  data_criacao: Date
  data_quitacao: Date | null
}

interface FiadoComClienteRow {
  id: string
  descricao: string
  valor: number
  status: StatusFiado
  data_criacao: Date
  data_quitacao: Date | null
  cliente_id: string
  cliente_nome: string
}

interface ResumoRow {
  total_aberto: number
  total_quitado: number
  quantidade_abertos: number
  quantidade_quitados: number
}

export class FiadoDAO {

  // Converte row do banco para entidade Fiado
  private toEntity(row: FiadoRow): Fiado {
    return Fiado.construir(
      row.id,
      row.cliente_id,
      row.descricao,
      Number(row.valor),
      row.status,
      row.registrado_por,
      new Date(row.data_criacao),
      row.data_quitacao
        ? new Date(row.data_quitacao)
        : null
    )
  }

  async criar(fiado: Fiado): Promise<void> {
    const sql = `
      INSERT INTO fiados (
        id,
        cliente_id,
        descricao,
        valor,
        status,
        registrado_por,
        data_criacao,
        data_quitacao
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    `

    await query(sql, [
      fiado.id,
      fiado.clienteId,
      fiado.descricao,
      fiado.valor,
      fiado.status,
      fiado.registradoPor,
      fiado.dataCriacao,
      fiado.dataQuitacao
    ])
  }

  async buscarPorId(id: string): Promise<Fiado | null> {
    const sql = `
      SELECT *
      FROM fiados
      WHERE id = $1
    `

    const rows = await query<FiadoRow[]>(sql, [id])

    return rows.length > 0
      ? this.toEntity(rows[0]!)
      : null
  }

  async listarTodos(): Promise<Fiado[]> {
    const sql = `
      SELECT *
      FROM fiados
      ORDER BY data_criacao DESC
    `

    const rows = await query<FiadoRow[]>(sql)

    return rows.map(row => this.toEntity(row))
  }

  async listarPorCliente(clienteId: string): Promise<Fiado[]> {
    const sql = `
      SELECT *
      FROM fiados
      WHERE cliente_id = $1
      ORDER BY data_criacao DESC
    `

    const rows = await query<FiadoRow[]>(sql, [clienteId])

    return rows.map(row => this.toEntity(row))
  }

  async listarPorStatus(status: StatusFiado): Promise<Fiado[]> {
    const sql = `
      SELECT *
      FROM fiados
      WHERE status = $1
      ORDER BY data_criacao DESC
    `

    const rows = await query<FiadoRow[]>(sql, [status])

    return rows.map(row => this.toEntity(row))
  }

  async listarComFiltros(filtros: FiltroFiadoDTO): Promise<Fiado[]> {
    let sql = `
      SELECT *
      FROM fiados
      WHERE 1=1
    `

    const params: unknown[] = []

    if (filtros.clienteId) {
      params.push(filtros.clienteId)
      sql += ` AND cliente_id = $${params.length}`
    }

    if (filtros.status) {
      params.push(filtros.status)
      sql += ` AND status = $${params.length}`
    }

    if (filtros.dataInicio) {
      params.push(filtros.dataInicio)
      sql += ` AND data_criacao >= $${params.length}`
    }

    if (filtros.dataFim) {
      params.push(filtros.dataFim)
      sql += ` AND data_criacao <= $${params.length}`
    }

    sql += ` ORDER BY data_criacao DESC`

    const rows = await query<FiadoRow[]>(sql, params)

    return rows.map(row => this.toEntity(row))
  }

  async listarComDadosCliente(): Promise<FiadoComClienteDTO[]> {
    const sql = `
      SELECT
        f.id,
        f.descricao,
        f.valor,
        f.status,
        f.data_criacao,
        f.data_quitacao,
        c.id as cliente_id,
        c.nome as cliente_nome
      FROM fiados f
      INNER JOIN clientes c
        ON f.cliente_id = c.id
      ORDER BY f.data_criacao DESC
    `

    const rows = await query<FiadoComClienteRow[]>(sql)

    return rows.map(row => ({
      id: row.id,
      descricao: row.descricao,
      valor: Number(row.valor),
      status: row.status,
      dataCriacao: new Date(row.data_criacao),
      dataQuitacao: row.data_quitacao
        ? new Date(row.data_quitacao)
        : null,
      cliente: {
        id: row.cliente_id,
        nome: row.cliente_nome
      }
    }))
  }

  async atualizar(fiado: Fiado): Promise<void> {
    const sql = `
      UPDATE fiados
      SET
        descricao = $1,
        valor = $2,
        status = $3,
        data_quitacao = $4
      WHERE id = $5
    `

    await query(sql, [
      fiado.descricao,
      fiado.valor,
      fiado.status,
      fiado.dataQuitacao,
      fiado.id
    ])
  }

  async excluir(id: string): Promise<void> {
    const sql = `
      DELETE FROM fiados
      WHERE id = $1
    `

    await query(sql, [id])
  }

  async obterResumoFinanceiro(): Promise<ResumoFinanceiroDTO> {
    const sql = `
      SELECT
        COALESCE(
          SUM(
            CASE
              WHEN status = 'ABERTO'
              THEN valor
              ELSE 0
            END
          ),
          0
        ) as total_aberto,

        COALESCE(
          SUM(
            CASE
              WHEN status = 'QUITADO'
              THEN valor
              ELSE 0
            END
          ),
          0
        ) as total_quitado,

        COUNT(
          CASE
            WHEN status = 'ABERTO'
            THEN 1
          END
        ) as quantidade_abertos,

        COUNT(
          CASE
            WHEN status = 'QUITADO'
            THEN 1
          END
        ) as quantidade_quitados

      FROM fiados
    `

    const rows = await query<ResumoRow[]>(sql)

    return {
      totalAberto: Number(rows[0]?.total_aberto || 0),
      totalQuitado: Number(rows[0]?.total_quitado || 0),
      quantidadeAbertos: Number(rows[0]?.quantidade_abertos || 0),
      quantidadeQuitados: Number(rows[0]?.quantidade_quitados || 0)
    }
  }
}

export const fiadoDAO = new FiadoDAO()