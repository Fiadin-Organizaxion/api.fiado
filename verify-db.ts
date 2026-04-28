import 'dotenv/config'
import { usuarioDAO } from './src/dao'

async function verificar() {
  try {
    const todos = await usuarioDAO.listarTodos()
    
    console.log('📊 VERIFICANDO BANCO DE DADOS\n')
    console.log(`DATABASE_URL: ${process.env.DATABASE_URL?.substring(0, 60)}...\n`)
    
    console.log(`👥 Total de usuários no banco: ${todos.length}\n`)
    
    if (todos.length > 0) {
      console.log('Usuários encontrados:')
      todos.forEach((u, i) => {
        console.log(`  ${i + 1}. ID: ${u.id} | Nome: ${u.nome} | Email: ${u.email} | Tipo: ${u.tipo}`)
      })
    } else {
      console.log('❌ Nenhum usuário encontrado!')
    }

  } catch (error: any) {
    console.error('❌ Erro ao verificar banco:', error.message)
  }
  
  process.exit(0)
}

verificar()
