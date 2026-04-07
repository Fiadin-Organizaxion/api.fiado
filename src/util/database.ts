import { Pool } from 'pg'

// Configuração usando a connection string do Supabase
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  },
  max: 10 // máximo de conexões no pool
})

/**
 * Executa uma query no banco de dados
 */
export async function query<T>(sql: string, params?: any[]): Promise<T> {
  try {
    const result = await pool.query(sql, params)
    return result.rows as T
  } catch (error) {
    console.error('Erro ao executar query:', error)
    throw error
  }
}

/**
 * Obtém uma conexão do pool
 */
export async function getConnection() {
  try {
    return await pool.connect()
  } catch (error) {
    console.error('Erro ao obter conexão do pool:', error)
    throw error
  }
}

/**
 * Testa a conexão com o banco de dados
 */
export async function testarConexao(): Promise<boolean> {
  try {
    const client = await pool.connect()

    const result = await client.query('SELECT NOW()')

    console.log('✅ Conexão com o Supabase estabelecida com sucesso!')
    console.log('🕒 Horário do banco:', result.rows[0].now)

    client.release()
    return true

  } catch (error) {
    console.error('❌ Erro ao conectar com o banco:', error)
    return false
  }
}

export default pool