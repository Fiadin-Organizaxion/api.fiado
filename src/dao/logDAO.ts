import { query } from '../util/database';
import { Log, TipoAcao } from '../modelo';
import { RowDataPacket } from 'mysql2';

// Interface para resultados do banco
interface LogRow extends RowDataPacket {
  id: string;
  usuario_id: number;
  acao: TipoAcao;
  descricao: string;
  entidade: string | null;
  entidade_id: number | null;
  data_criacao: Date;
}

export class LogDAO {
  async registrar(log: Log): Promise<void> {
    const sql = `
      INSERT INTO logs (id, usuario_id, acao, descricao, entidade, entidade_id, data_criacao)
      VALUES (?, ?, ?, ?, ?, ?, NOW())
    `;
    
    await query(sql, [
      log.id,
      log.usuarioId,
      log.acao,
      log.descricao,
      log.entidade,
      log.entidadeId
    ]);
  }

  async buscarPorUsuario(usuarioId: string, limite = 100): Promise<Log[]> {
    const sql = `
      SELECT * FROM logs 
      WHERE usuario_id = ? 
      ORDER BY data_criacao DESC 
      LIMIT ?
    `;

    const rows = await query<LogRow[]>(sql, [usuarioId, limite]);

    return rows.map(row =>
      Log.construir(
        row.id,
        String(row.usuario_id),
        row.acao,
        row.descricao,
        new Date(row.data_criacao),
        row.entidade || undefined,
        row.entidade_id ? String(row.entidade_id) : undefined
      )
    );
  }

  async listarPorUsuario(usuarioId: string, limite = 100): Promise<Log[]> {
    return this.buscarPorUsuario(usuarioId, limite);
  }

  async buscarPorAcao(acao: TipoAcao, limite = 100): Promise<Log[]> {
    const sql = `
      SELECT * FROM logs 
      WHERE acao = ? 
      ORDER BY data_criacao DESC 
      LIMIT ?
    `;

    const rows = await query<LogRow[]>(sql, [acao, limite]);

    return rows.map(row =>
      Log.construir(
        row.id,
        String(row.usuario_id),
        row.acao,
        row.descricao,
        new Date(row.data_criacao),
        row.entidade || undefined,
        row.entidade_id ? String(row.entidade_id) : undefined
      )
    );
  }

  async listarPorAcao(acao: TipoAcao, limite = 100): Promise<Log[]> {
    return this.buscarPorAcao(acao, limite);
  }

  async buscarPorEntidade(entidade: string, entidadeId?: string): Promise<Log[]> {
    let sql = 'SELECT * FROM logs WHERE entidade = ?';
    const params: unknown[] = [entidade];

    if (entidadeId) {
      sql += ' AND entidade_id = ?';
      params.push(entidadeId);
    }

    sql += ' ORDER BY data_criacao DESC';

    const rows = await query<LogRow[]>(sql, params);

    return rows.map(row =>
      Log.construir(
        row.id,
        String(row.usuario_id),
        row.acao,
        row.descricao,
        new Date(row.data_criacao),
        row.entidade || undefined,
        row.entidade_id ? String(row.entidade_id) : undefined
      )
    );
  }

  async listarPorEntidade(entidade: string, entidadeId?: string): Promise<Log[]> {
    return this.buscarPorEntidade(entidade, entidadeId);
  }

  async listarTodos(limite = 1000): Promise<Log[]> {
    const sql = `
      SELECT * FROM logs 
      ORDER BY data_criacao DESC 
      LIMIT ?
    `;

    const rows = await query<LogRow[]>(sql, [limite]);

    return rows.map(row =>
      Log.construir(
        row.id,
        String(row.usuario_id),
        row.acao,
        row.descricao,
        new Date(row.data_criacao),
        row.entidade || undefined,
        row.entidade_id ? String(row.entidade_id) : undefined
      )
    );
  }

  async listarTodosPaginado(pagina = 1, porPagina = 50): Promise<Log[]> {
    const offset = (pagina - 1) * porPagina;

    const sql = `
      SELECT * FROM logs 
      ORDER BY data_criacao DESC 
      LIMIT ? OFFSET ?
    `;

    const rows = await query<LogRow[]>(sql, [porPagina, offset]);

    return rows.map(row =>
      Log.construir(
        row.id,
        String(row.usuario_id),
        row.acao,
        row.descricao,
        new Date(row.data_criacao),
        row.entidade || undefined,
        row.entidade_id ? String(row.entidade_id) : undefined
      )
    );
  }

  async listarComFiltros(filtros: {
    usuarioId?: string;
    acao?: TipoAcao;
    entidade?: string;
    dataInicio?: Date;
    dataFim?: Date;
  }): Promise<Log[]> {
    let sql = 'SELECT * FROM logs WHERE 1=1';
    const params: unknown[] = [];

    if (filtros.usuarioId) {
      sql += ' AND usuario_id = ?';
      params.push(filtros.usuarioId);
    }

    if (filtros.acao) {
      sql += ' AND acao = ?';
      params.push(filtros.acao);
    }

    if (filtros.entidade) {
      sql += ' AND entidade = ?';
      params.push(filtros.entidade);
    }

    if (filtros.dataInicio) {
      sql += ' AND data_criacao >= ?';
      params.push(filtros.dataInicio);
    }

    if (filtros.dataFim) {
      sql += ' AND data_criacao <= ?';
      params.push(filtros.dataFim);
    }

    sql += ' ORDER BY data_criacao DESC';

    const rows = await query<LogRow[]>(sql, params);

    return rows.map(row =>
      Log.construir(
        row.id,
        String(row.usuario_id),
        row.acao,
        row.descricao,
        new Date(row.data_criacao),
        row.entidade || undefined,
        row.entidade_id ? String(row.entidade_id) : undefined
      )
    );
  }

  async contarTotal(): Promise<number> {
    const sql = 'SELECT COUNT(*) as total FROM logs';
    const rows = await query<Array<{ total: number }>>(sql);

    return rows[0]?.total || 0;
  }
}

export const logDAO = new LogDAO();