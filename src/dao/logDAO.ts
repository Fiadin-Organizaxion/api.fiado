/**
 * DAO de Log
 * Responsável por todas as operações de banco de dados relacionadas a logs
 */

import { query } from '../util/database';
import { Log, LogCriacao, TipoAcao } from '../modelo';
import { ResultSetHeader, RowDataPacket } from 'mysql2';

// Interface para resultados do banco
interface LogRow extends RowDataPacket, Log {}

/**
 * Classe DAO para operações com logs
 */
export class LogDAO {
  /**
   * Registra um novo log no banco de dados
   * @param log - Dados do log a ser registrado
   * @returns ID do log criado
   */
  async registrar(log: LogCriacao): Promise<number> {
    const sql = `
      INSERT INTO logs (usuario_id, acao, descricao, entidade, entidade_id, data_criacao)
      VALUES (?, ?, ?, ?, ?, NOW())
    `;
    
    const result = await query<ResultSetHeader>(sql, [
      log.usuario_id,
      log.acao,
      log.descricao,
      log.entidade || null,
      log.entidade_id || null
    ]);
    
    return result.insertId;
  }

  /**
   * Busca logs por usuário
   * @param usuarioId - ID do usuário
   * @param limite - Limite de resultados (padrão: 100)
   * @returns Lista de logs do usuário
   */
  async buscarPorUsuario(usuarioId: number, limite = 100): Promise<Log[]> {
    const sql = `
      SELECT * FROM logs 
      WHERE usuario_id = ? 
      ORDER BY data_criacao DESC 
      LIMIT ?
    `;
    const rows = await query<LogRow[]>(sql, [usuarioId, limite]);
    
    return rows;
  }

  /**
   * Busca logs por tipo de ação
   * @param acao - Tipo da ação
   * @param limite - Limite de resultados (padrão: 100)
   * @returns Lista de logs do tipo especificado
   */
  async buscarPorAcao(acao: TipoAcao, limite = 100): Promise<Log[]> {
    const sql = `
      SELECT * FROM logs 
      WHERE acao = ? 
      ORDER BY data_criacao DESC 
      LIMIT ?
    `;
    const rows = await query<LogRow[]>(sql, [acao, limite]);
    
    return rows;
  }

  /**
   * Busca logs por entidade
   * @param entidade - Nome da entidade
   * @param entidadeId - ID da entidade (opcional)
   * @returns Lista de logs da entidade
   */
  async buscarPorEntidade(entidade: string, entidadeId?: number): Promise<Log[]> {
    let sql = 'SELECT * FROM logs WHERE entidade = ?';
    const params: unknown[] = [entidade];

    if (entidadeId) {
      sql += ' AND entidade_id = ?';
      params.push(entidadeId);
    }

    sql += ' ORDER BY data_criacao DESC';
    const rows = await query<LogRow[]>(sql, params);
    
    return rows;
  }

  /**
   * Lista todos os logs com paginação
   * @param pagina - Número da página (começa em 1)
   * @param porPagina - Quantidade por página
   * @returns Lista de logs paginada
   */
  async listarTodos(pagina = 1, porPagina = 50): Promise<Log[]> {
    const offset = (pagina - 1) * porPagina;
    const sql = `
      SELECT * FROM logs 
      ORDER BY data_criacao DESC 
      LIMIT ? OFFSET ?
    `;
    const rows = await query<LogRow[]>(sql, [porPagina, offset]);
    
    return rows;
  }

  /**
   * Conta total de logs
   * @returns Total de logs registrados
   */
  async contarTotal(): Promise<number> {
    const sql = 'SELECT COUNT(*) as total FROM logs';
    const rows = await query<Array<{ total: number }>>(sql);
    
    return rows[0].total;
  }
}

// Exporta instância singleton
export const logDAO = new LogDAO();
