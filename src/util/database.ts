import dns from 'node:dns'
import { Pool } from 'pg'

const databaseUrl = process.env.DATABASE_URL

if (!databaseUrl) {
  throw new Error('DATABASE_URL não foi definida no ambiente')
}

dns.setDefaultResultOrder('ipv4first')

// Configuração usando a connection string do Supabase
const pool = new Pool({
  connectionString: databaseUrl,
  ssl: {
    rejectUnauthorized: false
  },
  connectionTimeoutMillis: 10000,
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
  let client

  try {
    client = await pool.connect()

    const result = await client.query('SELECT NOW()')

    console.log('✅ Conexão com o Supabase estabelecida com sucesso!')
    console.log('🕒 Horário do banco:', result.rows[0].now)

    return true

  } catch (error) {
    console.error('❌ Erro ao conectar com o banco:', error)
    return false
  } finally {
    client?.release()
  }
}

export default pool