import { query } from '../util/database';
import { Log, TipoAcao } from '../modelo';

export class LogDAO {
  async registrar(log: Log): Promise<void> {
    const sql = `
      INSERT INTO logs (id, usuario_id, acao, descricao, entidade, entidade_id, data_criacao)
      VALUES ($1, $2, $3, $4, $5, $6, NOW())
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
      WHERE usuario_id = $1 
      ORDER BY data_criacao DESC 
      LIMIT $2
    `;

    const rows = await query<any[]>(sql, [usuarioId, limite]);

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
      WHERE acao = $1 
      ORDER BY data_criacao DESC 
      LIMIT $2
    `;

    const rows = await query<any[]>(sql, [acao, limite]);

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
    let sql = 'SELECT * FROM logs WHERE entidade = $1';
    const params: unknown[] = [entidade];

    if (entidadeId) {
      sql += ' AND entidade_id = $2';
      params.push(entidadeId);
    }

    sql += ' ORDER BY data_criacao DESC';

    const rows = await query<any[]>(sql, params);

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
      LIMIT $1
    `;

    const rows = await query<any[]>(sql, [limite]);

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
      LIMIT $1 OFFSET $2
    `;

    const rows = await query<any[]>(sql, [porPagina, offset]);

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
      sql += ' AND usuario_id = $' + (params.length + 1);
      params.push(filtros.usuarioId);
    }

    if (filtros.acao) {
      sql += ' AND acao = $' + (params.length + 1);
      params.push(filtros.acao);
    }

    if (filtros.entidade) {
      sql += ' AND entidade = $' + (params.length + 1);
      params.push(filtros.entidade);
    }

    if (filtros.dataInicio) {
      sql += ' AND data_criacao >= $' + (params.length + 1);
      params.push(filtros.dataInicio);
    }

    if (filtros.dataFim) {
      sql += ' AND data_criacao <= $' + (params.length + 1);
      params.push(filtros.dataFim);
    }

    sql += ' ORDER BY data_criacao DESC';

    const rows = await query<any[]>(sql, params);

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