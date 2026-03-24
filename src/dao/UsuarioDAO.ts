/**
 * DAO de Usuario
 * Responsável por todas as operações de banco de dados relacionadas a usuários
 */

import { query } from '../util/database';
import { Usuario, UsuarioCriacao, UsuarioPublico, TipoUsuario } from '../modelo';
import { ResultSetHeader, RowDataPacket } from 'mysql2';

// Interface para resultados do banco
interface UsuarioRow extends RowDataPacket, Usuario {}

/**
 * Classe DAO para operações com usuários
 */
export class UsuarioDAO {
  /**
   * Cria um novo usuário no banco de dados
   * @param usuario - Dados do usuário a ser criado
   * @returns ID do usuário criado
   */
  async criar(usuario: UsuarioCriacao): Promise<number> {
    const sql = `
      INSERT INTO usuarios (nome, email, senha, tipo, data_criacao)
      VALUES (?, ?, ?, ?, NOW())
    `;
    
    const result = await query<ResultSetHeader>(sql, [
      usuario.nome,
      usuario.email,
      usuario.senha,
      usuario.tipo
    ]);
    
    return result.insertId;
  }

  /**
   * Busca usuário por ID
   * @param id - ID do usuário
   * @returns Usuário encontrado ou null
   */
  async buscarPorId(id: number): Promise<Usuario | null> {
    const sql = 'SELECT * FROM usuarios WHERE id = ?';
    const rows = await query<UsuarioRow[]>(sql, [id]);
    
    if (!rows || rows.length === 0) return null;
    return rows[0] as Usuario;
  }

  /**
   * Busca usuário por email
   * @param email - Email do usuário
   * @returns Usuário encontrado ou null
   */
  async buscarPorEmail(email: string): Promise<Usuario | null> {
    const sql = 'SELECT * FROM usuarios WHERE email = ?';
    const rows = await query<UsuarioRow[]>(sql, [email]);
    
    if (!rows || rows.length === 0) return null;
    return rows[0] as Usuario;
  }

  /**
   * Lista todos os usuários (sem senha)
   * @returns Lista de usuários públicos
   */
  async listarTodos(): Promise<UsuarioPublico[]> {
    const sql = 'SELECT id, nome, email, tipo, data_criacao FROM usuarios ORDER BY data_criacao DESC';
    const rows = await query<UsuarioPublico[]>(sql);
    
    return rows;
  }

  /**
   * Lista usuários por tipo
   * @param tipo - Tipo do usuário (DONO ou FUNCIONARIO)
   * @returns Lista de usuários públicos do tipo especificado
   */
  async listarPorTipo(tipo: TipoUsuario): Promise<UsuarioPublico[]> {
    const sql = 'SELECT id, nome, email, tipo, data_criacao FROM usuarios WHERE tipo = ? ORDER BY data_criacao DESC';
    const rows = await query<UsuarioPublico[]>(sql, [tipo]);
    
    return rows;
  }

  /**
   * Atualiza dados do usuário
   * @param id - ID do usuário
   * @param dados - Dados a serem atualizados
   * @returns true se atualizado com sucesso
   */
  async atualizar(id: number, dados: Partial<UsuarioCriacao>): Promise<boolean> {
    const campos: string[] = [];
    const valores: unknown[] = [];

    if (dados.nome) {
      campos.push('nome = ?');
      valores.push(dados.nome);
    }
    if (dados.email) {
      campos.push('email = ?');
      valores.push(dados.email);
    }
    if (dados.senha) {
      campos.push('senha = ?');
      valores.push(dados.senha);
    }

    if (campos.length === 0) return false;

    valores.push(id);
    const sql = `UPDATE usuarios SET ${campos.join(', ')} WHERE id = ?`;
    const result = await query<ResultSetHeader>(sql, valores);
    
    return result.affectedRows > 0;
  }

  /**
   * Remove um usuário
   * @param id - ID do usuário
   * @returns true se removido com sucesso
   */
  async remover(id: number): Promise<boolean> {
    const sql = 'DELETE FROM usuarios WHERE id = ?';
    const result = await query<ResultSetHeader>(sql, [id]);
    
    return result.affectedRows > 0;
  }

  /**
   * Verifica se existe algum usuário do tipo DONO
   * @returns true se existir pelo menos um dono
   */
  async existeDono(): Promise<boolean> {
    const sql = 'SELECT COUNT(*) as total FROM usuarios WHERE tipo = ?';
    const rows = await query<Array<{ total: number }>>(sql, [TipoUsuario.DONO]);
    
    if (!rows || rows.length === 0) return false;
    return (rows[0] as { total: number }).total > 0;
  }

  /**
   * Conta total de usuários
   * @returns Total de usuários cadastrados
   */
  async contarTotal(): Promise<number> {
    const sql = 'SELECT COUNT(*) as total FROM usuarios';
    const rows = await query<Array<{ total: number }>>(sql);
    
    if (!rows || rows.length === 0) return 0;
    return (rows[0] as { total: number }).total;
  }
}

// Exporta instância singleton
export const usuarioDAO = new UsuarioDAO();
