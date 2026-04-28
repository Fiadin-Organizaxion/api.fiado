import 'dotenv/config'
import { query } from './src/util/database'
import { hashSenha } from './src/util/criptografia'

async function testarInsercao() {
  console.log('📝 Testando inserção de usuário diretamente no banco...\n')

  try {
    // Verifica estrutura da tabela
    console.log('🔍 Colunas da tabela usuarios:')
    const colunas = await query<any>(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'usuarios'
      ORDER BY ordinal_position
    `)
    
    colunas.forEach((col: any) => {
      const nullable = col.is_nullable === 'YES' ? '(nullable)' : '(required)'
      console.log(`  - ${col.column_name}: ${col.data_type} ${nullable}`)
    })

    console.log('\n📤 Tentando inserir um usuário...')
    
    const nome = 'Raul'
    const email = 'raul@email.com'
    const senhaOriginal = '123456'
    const tipo = 'DONO'
    
    // Criptografa a senha
    const senha = await hashSenha(senhaOriginal)
    
    console.log(`  Nome: ${nome}`)
    console.log(`  Email: ${email}`)
    console.log(`  Tipo: ${tipo}`)
    console.log(`  Senha (criptografada): ${senha.substring(0, 20)}...`)

    const resultado = await query<any>(`
      INSERT INTO usuarios (nome, email, senha, tipo, data_criacao)
      VALUES ($1, $2, $3, $4, NOW())
      RETURNING id, nome, email, tipo, data_criacao
    `, [nome, email, senha, tipo])

    console.log('\n✅ Usuário criado com sucesso!')
    console.log('ID:', resultado[0].id)
    console.log('Data criação:', resultado[0].data_criacao)

  } catch (error: any) {
    console.error('\n❌ Erro ao inserir usuário:', error.message)
    console.error('Detalhes:', error)
  }
  
  process.exit(0)
}

testarInsercao()
