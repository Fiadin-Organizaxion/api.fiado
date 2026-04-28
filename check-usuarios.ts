import 'dotenv/config'
import { usuarioDAO } from './src/dao'
import { TipoUsuario } from './src/modelo'

async function verificar() {
  try {
    const donos = await usuarioDAO.listarPorTipo(TipoUsuario.DONO)
    console.log(`\n👑 Donos cadastrados: ${donos.length}`)
    
    if (donos.length > 0) {
      console.log('\nDetalhes dos donos:')
      donos.forEach((d, i) => {
        console.log(`  ${i + 1}. ${d.nome} (${d.email})`)
      })
    } else {
      console.log('\n⚠️  Nenhum dono encontrado!')
    }

    const todos = await usuarioDAO.listarTodos()
    console.log(`\n👥 Total de usuários: ${todos.length}`)
    
  } catch (error: any) {
    console.error('Erro:', error.message)
  }
  
  process.exit(0)
}

verificar()
