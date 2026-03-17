/**
 * Configuração de conexão com o banco de dados MySQL/MariaDB
 * Utiliza mysql2 com pool de conexões para melhor performance
 */

import mysql from 'mysql2/promise';

// Configurações do banco de dados (sem dotenv, usando variáveis de ambiente)
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306'),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'fiado_db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
};

// Pool de conexões
const pool = mysql.createPool(dbConfig);

/**
 * Executa uma query no banco de dados
 * @param sql - Query SQL a ser executada
 * @param params - Parâmetros para a query (previne SQL injection)
 * @returns Resultado da query
 */
export async function query<T>(sql: string, params?: unknown[]): Promise<T> {
  const [rows] = await pool.execute(sql, params);
  return rows as T;
}

/**
 * Obtém uma conexão do pool
 * Útil para transações
 */
export async function getConnection() {
  return await pool.getConnection();
}

/**
 * Testa a conexão com o banco de dados
 */
export async function testarConexao(): Promise<boolean> {
  try {
    const connection = await pool.getConnection();
    console.log('Conexão com o banco de dados estabelecida com sucesso!');
    connection.release();
    return true;
  } catch (error) {
    console.error('Erro ao conectar com o banco de dados:', error);
    return false;
  }
}

export default pool;
