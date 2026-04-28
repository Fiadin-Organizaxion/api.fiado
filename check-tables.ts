import 'dotenv/config'
import { query } from './src/util/database'

async function verificarTabelas() {
  console.log('🔍 Verificando tabelas no banco de dados...\n')

  try {
    // Verifica se a tabela `usuarios` existe
    const sql = `
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name
    `

    const resultado = await query<any>(sql)

    if (resultado.length === 0) {
      console.log('❌ Nenhuma tabela encontrada no schema public!')
      console.log('\n⚠️  As tabelas precisam ser criadas no Supabase.\n')
      console.log('Tabelas necessárias:')
      console.log('  - usuarios')
      console.log('  - fiados')
      console.log('  - receitas')
      console.log('  - despesas')
      console.log('  - categorias')
      console.log('  - logs')
      return
    }

    console.log('✅ Tabelas encontradas:')
    resultado.forEach((row: any, i: number) => {
      console.log(`  ${i + 1}. ${row.table_name}`)
    })

  } catch (error: any) {
    console.error('❌ Erro ao verificar tabelas:', error.message)
  }
}

verificarTabelas().then(() => {
  process.exit(0)
})
