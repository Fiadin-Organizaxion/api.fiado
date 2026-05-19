/**
 * DAO de Cliente
 * Responsável por todas as operações de banco de dados relacionadas a clientes
 */

import { query } from '../util/database'
import { Cliente } from '../modelo/Cliente'
import { ClienteComFiadosDTO } from '../dto/ClienteDto'

// Interface para resultados do banco
interface ClienteRow {
  id: string
  nome: string
  telefone: string | null
  endereco: string | null
  criado_por: string
  data_criacao: Date
}

interface ClienteComFiadosRow {
  id: string
  nome: string
  telefone: string | null
  endereco: string | null
  total_fiados: number
  valor_total_aberto: number
}

export class ClienteDAO {

  // Converte row do banco para entidade Cliente
  private toEntity(row: ClienteRow): Cliente {
    return Cliente.construir(
      row.id,
      row.nome,
      row.criado_por,
      new Date(row.data_criacao),
      row.telefone || undefined,
      row.endereco || undefined
    )
  }

  async criar(cliente: Cliente): Promise<void> {
    const sql = `
      INSERT INTO clientes (
        id,
        nome,
        telefone,
        endereco,
        criado_por,
        data_criacao
      )
      VALUES ($1, $2, $3, $4, $5, $6)
    `

    await query(sql, [
      cliente.id,
      cliente.nome,
      cliente.telefone,
      cliente.endereco,
      cliente.criadoPor,
      cliente.dataCriacao
    ])
  }

  async buscarPorId(id: string): Promise<Cliente | null> {
    const sql = `
      SELECT *
      FROM clientes
      WHERE id = $1
    `

    const rows = await query<ClienteRow[]>(sql, [id])

    return rows.length > 0 ? this.toEntity(rows[0]!) : null
  }

  async listarTodos(): Promise<Cliente[]> {
    const sql = `
      SELECT *
      FROM clientes
      ORDER BY nome ASC
    `

    const rows = await query<ClienteRow[]>(sql)

    return rows.map(row => this.toEntity(row))
  }

  async buscarPorNome(nome: string): Promise<Cliente[]> {
    const sql = `
      SELECT *
      FROM clientes
      WHERE nome ILIKE $1
      ORDER BY nome ASC
    `

    const rows = await query<ClienteRow[]>(sql, [`%${nome}%`])

    return rows.map(row => this.toEntity(row))
  }

  async listarComTotalFiados(): Promise<ClienteComFiadosDTO[]> {
    const sql = `
      SELECT 
        c.id,
        c.nome,
        c.telefone,
        c.endereco,
        COUNT(f.id) as total_fiados,
        COALESCE(
          SUM(
            CASE 
              WHEN f.status = 'ABERTO' 
              THEN f.valor 
              ELSE 0 
            END
          ),
          0
        ) as valor_total_aberto
      FROM clientes c
      LEFT JOIN fiados f 
        ON c.id = f.cliente_id
      GROUP BY 
        c.id,
        c.nome,
        c.telefone,
        c.endereco
      ORDER BY c.nome ASC
    `

    const rows = await query<ClienteComFiadosRow[]>(sql)

    return rows.map(row => ({
      id: row.id,
      nome: row.nome,
      telefone: row.telefone,
      endereco: row.endereco,
      totalFiados: Number(row.total_fiados),
      valorTotalAberto: Number(row.valor_total_aberto)
    }))
  }

  async atualizar(cliente: Cliente): Promise<void> {
    const sql = `
      UPDATE clientes
      SET
        nome = $1,
        telefone = $2,
        endereco = $3
      WHERE id = $4
    `

    await query(sql, [
      cliente.nome,
      cliente.telefone,
      cliente.endereco,
      cliente.id
    ])
  }

  async excluir(id: string): Promise<void> {
    const sql = `
      DELETE FROM clientes
      WHERE id = $1
    `

    await query(sql, [id])
  }

  async temFiadosAbertos(clienteId: string): Promise<boolean> {
    const sql = `
      SELECT COUNT(*) as total
      FROM fiados
      WHERE cliente_id = $1
      AND status = 'ABERTO'
    `

    const rows = await query<Array<{ total: string }>>(sql, [clienteId])

    return rows.length > 0
      ? Number(rows[0]!.total) > 0
      : false
  }
}

export const clienteDAO = new ClienteDAO()