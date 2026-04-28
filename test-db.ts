import 'dotenv/config'
import { testarConexao } from './src/util/database'

// Log das variáveis de ambiente
console.log('='.repeat(50))
console.log('🔍 TESTE DE CONFIGURAÇÃO')
console.log('='.repeat(50))

console.log(`\n📌 Variáveis de Ambiente:`)
console.log(`DATABASE_URL definida: ${!!process.env.DATABASE_URL}`)
console.log(`PORT: ${process.env.PORT || 'não definida'}`)
console.log(`NODE_ENV: ${process.env.NODE_ENV || 'não definida'}`)
console.log(`JWT_SECRET: ${!!process.env.JWT_SECRET ? 'definida' : 'não definida'}`)

if (process.env.DATABASE_URL) {
  // Oculta a senha
  const url = process.env.DATABASE_URL
  const partes = url.split('@')
  const urlOcultada = url.substring(0, 20) + '***' + partes[1]
  console.log(`CONNECTION STRING: ${urlOcultada}`)
}

console.log('\n' + '='.repeat(50))
console.log('🔗 TESTANDO CONEXÃO COM O BANCO')
console.log('='.repeat(50) + '\n')

testarConexao().then((sucesso) => {
  if (sucesso) {
    console.log('\n✅ Conexão estabelecida com sucesso!')
    process.exit(0)
  } else {
    console.log('\n❌ Falha na conexão com o banco')
    process.exit(1)
  }
}).catch((error) => {
  console.error('\n❌ Erro ao testar conexão:', error.message)
  process.exit(1)
})
