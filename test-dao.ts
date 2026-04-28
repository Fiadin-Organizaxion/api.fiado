import 'dotenv/config'
import { usuarioDAO } from './src/dao'
import { hashSenha } from './src/util/criptografia'
import { TipoUsuario } from './src/modelo'

async function testar() {
  console.log('🧪 Testando DAO diretamente...\n')

  try {
    // Verifica se email já existe
    const emailTeste = `test-${Date.now()}@email.com`
    console.log(`📧 Verificando se email existe: ${emailTeste}`)
    
    const usuarioExistente = await usuarioDAO.buscarPorEmail(emailTeste)
    console.log(`✅ Email disponível: ${!usuarioExistente}\n`)

    // Testa criar usuário
    console.log('📝 Criando novo usuário...')
    const senha = await hashSenha('123456')
    
    const novoId = await usuarioDAO.criar({
      nome: 'Teste User',
      email: emailTeste,
      senha,
      tipo: TipoUsuario.FUNCIONARIO
    })

    console.log(`✅ Usuário criado com ID: ${novoId}\n`)

    // Busca o usuário criado
    console.log('🔍 Buscando usuário criado...')
    const usuario = await usuarioDAO.buscarPorId(novoId)
    
    if (usuario) {
      console.log('✅ Usuário encontrado:')
      console.log(`   Nome: ${usuario.nome}`)
      console.log(`   Email: ${usuario.email}`)
      console.log(`   Tipo: ${usuario.tipo}`)
      console.log(`   Data Criação: ${usuario.dataCriacao}`)
    } else {
      console.log('❌ Usuário não encontrado')
    }

  } catch (error: any) {
    console.error('❌ Erro:', error.message)
    console.error('Stack:', error.stack)
  }

  process.exit(0)
}

testar()
