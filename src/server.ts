import express, { Request, Response, NextFunction } from 'express'
import cors from 'cors'

import { testarConexao } from './util/database'

// ROTAS DA API
import authRoutes from './api/authRoutes'
import usuarioRoutes from './api/usuarioRoutes'
import receitaRoutes from './api/receitaRoutes'
import despesaRoutes from './api/despesaRoutes'
import categoriaRoutes from './api/categoriaRoutes'

// Cria a aplicação Express
const app = express()
const PORT = process.env.PORT

// ==========================================
// MIDDLEWARES GLOBAIS
// ==========================================

// Habilita CORS
app.use(cors())

// Parser de JSON
app.use(express.json())

// Parser de formulários
app.use(express.urlencoded({ extended: true }))

// Log de requisições (desenvolvimento)
app.use((req: Request, _res: Response, next: NextFunction) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`)
  next()
})

// ==========================================
// ROTAS DA API
// ==========================================

app.use(authRoutes)
app.use(usuarioRoutes)
app.use(receitaRoutes)
app.use(despesaRoutes)
app.use(categoriaRoutes)

// ==========================================
// MIDDLEWARE DE ERRO GLOBAL
// ==========================================

app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error('Erro não tratado:', err)

  res.status(500).json({
    sucesso: false,
    mensagem: 'Erro interno do servidor',
    erro: process.env.NODE_ENV === 'development' ? err.message : undefined
  })
})

// ==========================================
// ROTA 404
// ==========================================

app.use((_req: Request, res: Response) => {
  res.status(404).json({
    sucesso: false,
    mensagem: 'Rota não encontrada'
  })
})

// ==========================================
// INICIALIZAÇÃO DO SERVIDOR
// ==========================================

async function iniciar() {
  try {
    // Testa conexão com o banco
    const conexaoOk = await testarConexao()

    if (!conexaoOk) {
      console.warn('Aviso: Não foi possível conectar ao banco de dados.')
      console.warn(
        'Certifique-se de que o MySQL está rodando e as tabelas foram criadas.'
      )
    }

    // Inicia o servidor
    app.listen(PORT, () => {
      console.log('==========================================')
      console.log('  API de Controle de Fiados')
      console.log('==========================================')
      console.log(`  Servidor rodando em: http://localhost:${PORT}`)
      console.log(`  Ambiente: ${process.env.NODE_ENV || 'development'}`)
      console.log('==========================================')
    })
  } catch (error) {
    console.error('Erro ao iniciar o servidor:', error)
    process.exit(1)
  }
}

// Inicia servidor
iniciar()

export default app