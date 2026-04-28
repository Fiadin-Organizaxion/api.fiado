#!/usr/bin/env node
require('dotenv/config')
const { Pool } = require('pg')
const bcrypt = require('bcrypt')

async function main() {
  const email = process.argv[2] || 'auto-user@example.com'
  const senha = process.argv[3] || '123456'
  const nome = process.argv[4] || 'AutoUser'
  const tipo = process.argv[5] || 'DONO'

  const pool = new Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } })

  try {
    const hash = await bcrypt.hash(senha, 10)

    const sql = `INSERT INTO usuarios (id, nome, email, senha, tipo, data_criacao)
      VALUES ((SELECT COALESCE(MAX(id),0)+1 FROM usuarios), $1, $2, $3, $4, NOW()) RETURNING id`;
    const res = await pool.query(sql, [nome, email, hash, tipo])

    console.log('CREATED', { id: res.rows[0].id, email, nome, tipo })
    process.exit(0)
  } catch (err) {
    console.error('ERROR', err.message || err)
    process.exit(1)
  } finally {
    await pool.end()
  }
}

main()
