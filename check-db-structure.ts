import 'dotenv/config'
import { query } from './src/util/database'

async function verificar() {
  try {
    console.log('🔍 VERIFICANDO ESTRUTURA DO BANCO\n')
    console.log(`DATABASE_URL: ${process.env.DATABASE_URL?.substring(0, 60)}...\n`)
    
    // Verifica se a tabela `usuarios` existe
    const sql = `
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name
    `

    const resultado = await query<any>(sql)

    console.log(`📊 Tabelas encontradas: ${resultado.length}\n`)

    if (resultado.length === 0) {
      console.log('❌ BANCO VAZIO! Nenhuma tabela encontrada.')
      console.log('\n⚠️  Você precisa:')
      console.log('  1. Criar as tabelas no Supabase')
      console.log('  2. Ou apontar para o banco correto\n')
    } else {
      console.log('✅ Tabelas encontradas:')
      resultado.forEach((row: any) => {
        console.log(`  - ${row.table_name}`)
      })
    }

  } catch (error: any) {
    console.error('❌ Erro:', error.message)
  }
  
  process.exit(0)
}

verificar()
