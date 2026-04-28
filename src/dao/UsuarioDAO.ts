/**
 * DAO de Usuario
 * Responsável por todas as operações de banco de dados relacionadas a usuários
 */

import { query } from '../util/database';
import { Usuario, TipoUsuario } from '../modelo/Usuario';
import { CriarUsuarioDTO, UsuarioRespostaDTO } from '../dto/UsuarioDto';

// Mapeia row do banco (snake_case) para instância de Usuario
function mapRowToUsuario(row: any): Usuario {
  return Usuario.construir(
    row.id,
    row.nome,
    row.email,
    row.senha,
    row.tipo as TipoUsuario,
    new Date(row.data_criacao)
  );
}

/**
 * Classe DAO para operações com usuários
 */
export class UsuarioDAO {

  /**
   * Cria um novo usuário no banco de dados
   */
  async criar(usuario: CriarUsuarioDTO): Promise<number> {
    const sql = `
      INSERT INTO usuarios (nome, email, senha, tipo, data_criacao)
      VALUES ($1, $2, $3, $4, NOW())
      RETURNING id
    `;

    const rows = await query<{ id: number }[]>(sql, [
      usuario.nome,
      usuario.email,
      usuario.senha,
      usuario.tipo
    ]);

    return rows[0]?.id ?? 0;
  }

  /**
   * Busca usuário por ID
   */
  async buscarPorId(id: number): Promise<Usuario | null> {
    const sql = `SELECT * FROM usuarios WHERE id = $1`;

    const rows = await query<any[]>(sql, [id]);

    return rows[0] ? mapRowToUsuario(rows[0]) : null;
  }

  /**
   * Busca usuário por email
   */
  async buscarPorEmail(email: string): Promise<Usuario | null> {
    const sql = `SELECT * FROM usuarios WHERE email = $1`;

    const rows = await query<any[]>(sql, [email]);

    return rows[0] ? mapRowToUsuario(rows[0]) : null;
  }

  /**
   * Lista todos os usuários (sem senha)
   */
  async listarTodos(): Promise<UsuarioRespostaDTO[]> {
    const sql = `
      SELECT id, nome, email, tipo, data_criacao
      FROM usuarios
      ORDER BY data_criacao DESC
    `;

    const rows = await query<any[]>(sql);
    return rows.map(r => ({
      id: r.id,
      nome: r.nome,
      email: r.email,
      tipo: r.tipo,
      dataCriacao: new Date(r.data_criacao)
    }));
  }

  /**
   * Lista usuários por tipo
   */
  async listarPorTipo(tipo: TipoUsuario): Promise<UsuarioRespostaDTO[]> {
    const sql = `
      SELECT id, nome, email, tipo, data_criacao
      FROM usuarios
      WHERE tipo = $1
      ORDER BY data_criacao DESC
    `;

    const rows = await query<any[]>(sql, [tipo]);
    return rows.map(r => ({
      id: r.id,
      nome: r.nome,
      email: r.email,
      tipo: r.tipo,
      dataCriacao: new Date(r.data_criacao)
    }));
  }

  /**
   * Atualiza dados do usuário
   */
  async atualizar(id: number, dados: Partial<CriarUsuarioDTO>): Promise<boolean> {
    const campos: string[] = [];
    const valores: unknown[] = [];
    let index = 1;

    if (dados.nome) {
      campos.push(`nome = $${index++}`);
      valores.push(dados.nome);
    }

    if (dados.email) {
      campos.push(`email = $${index++}`);
      valores.push(dados.email);
    }

    if (dados.senha) {
      campos.push(`senha = $${index++}`);
      valores.push(dados.senha);
    }

    if (campos.length === 0) return false;

    valores.push(id);

    const sql = `
      UPDATE usuarios
      SET ${campos.join(', ')}
      WHERE id = $${index}
      RETURNING id
    `;

    const rows = await query<{ id: number }[]>(sql, valores);

    return rows.length > 0;
  }

  /**
   * Remove um usuário
   */
  async remover(id: number): Promise<boolean> {
    const sql = `
      DELETE FROM usuarios
      WHERE id = $1
      RETURNING id
    `;

    const rows = await query<{ id: number }[]>(sql, [id]);

    return rows.length > 0;
  }

  /**
   * Verifica se existe algum usuário do tipo DONO
   */
  async existeDono(): Promise<boolean> {
    const sql = `
      SELECT COUNT(*)::int as total
      FROM usuarios
      WHERE tipo = $1
    `;

    const rows = await query<{ total: number }[]>(sql, [TipoUsuario.DONO]);

    return (rows[0]?.total ?? 0) > 0;
  }

  /**
   * Conta total de usuários
   */
  async contarTotal(): Promise<number> {
    const sql = `
      SELECT COUNT(*)::int as total
      FROM usuarios
    `;

    const rows = await query<{ total: number }[]>(sql);

    return rows[0]?.total ?? 0;
  }
}

/**
 * Instância singleton
 */
export const usuarioDAO = new UsuarioDAO();