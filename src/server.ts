/**
 * Servidor Express - API de Controle de Fiados
 * 
 * Estrutura MVC (Model-View-Controller):
 * - src/modelo/: Interfaces e tipos TypeScript
 * - src/dao/: Data Access Objects para acesso ao banco
 * - src/controle/: Controllers com regras de negócio
 * - src/util/: Utilitários (database, jwt, criptografia)
 */

import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import { testarConexao } from './util/database';
import { authController, usuarioController } from './controle';
import { autenticar, autenticarOpcional, apenasDono } from './controle/middleware';

// Cria a aplicação Express
const app = express();
const PORT = process.env.PORT || 3001;

// ==========================================
// MIDDLEWARES GLOBAIS
// ==========================================

// Habilita CORS para permitir requisições de outros domínios
app.use(cors());

// Parser de JSON para requisições com body
app.use(express.json());

// Parser de URL encoded para formulários
app.use(express.urlencoded({ extended: true }));

// Middleware de log de requisições (desenvolvimento)
app.use((req: Request, _res: Response, next: NextFunction) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

// ==========================================
// ROTAS PÚBLICAS (sem autenticação)
// ==========================================

// Rota de health check
app.get('/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Rota de informações da API
app.get('/', (_req: Request, res: Response) => {
  res.json({
    nome: 'API de Controle de Fiados',
    versao: '1.0.0',
    descricao: 'Sistema para controle de vendas no fiado',
    endpoints: {
      publicos: {
        'GET /': 'Informações da API',
        'GET /health': 'Health check',
        'POST /login': 'Realizar login',
        'POST /usuarios': 'Cadastrar primeiro dono (sem auth) ou funcionário (com auth)'
      },
      autenticados: {
        'GET /usuarios/me': 'Obter perfil do usuário logado',
        'GET /usuarios': 'Listar todos os usuários (apenas DONO)',
        'GET /usuarios/:id': 'Buscar usuário por ID (apenas DONO)',
        'DELETE /usuarios/:id': 'Remover usuário (apenas DONO)',
        'GET /usuarios/estatisticas': 'Estatísticas de usuários (apenas DONO)'
      }
    }
  });
});

// ==========================================
// ROTAS DE AUTENTICAÇÃO
// ==========================================

// POST /login - Realizar login
app.post('/login', (req, res) => authController.login(req, res));

// POST /usuarios - Cadastrar usuário (auth opcional - primeiro dono não precisa)
app.post('/usuarios', autenticarOpcional, (req, res) => authController.cadastrar(req, res));

// ==========================================
// ROTAS DE USUÁRIO (autenticadas)
// ==========================================

// GET /usuarios/me - Perfil do usuário logado
app.get('/usuarios/me', autenticar, (req, res) => authController.perfil(req, res));

// GET /usuarios/estatisticas - Estatísticas (apenas DONO)
app.get('/usuarios/estatisticas', autenticar, apenasDono, (req, res) => usuarioController.estatisticas(req, res));

// GET /usuarios - Listar todos os usuários (apenas DONO)
app.get('/usuarios', autenticar, apenasDono, (req, res) => usuarioController.listar(req, res));

// GET /usuarios/:id - Buscar usuário por ID (apenas DONO)
app.get('/usuarios/:id', autenticar, apenasDono, (req, res) => usuarioController.buscarPorId(req, res));

// DELETE /usuarios/:id - Remover usuário (apenas DONO)
app.delete('/usuarios/:id', autenticar, apenasDono, (req, res) => usuarioController.remover(req, res));

// ==========================================
// MIDDLEWARE DE ERRO GLOBAL
// ==========================================

app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error('Erro não tratado:', err);
  res.status(500).json({
    sucesso: false,
    mensagem: 'Erro interno do servidor',
    erro: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// ==========================================
// ROTA 404
// ==========================================

app.use((_req: Request, res: Response) => {
  res.status(404).json({
    sucesso: false,
    mensagem: 'Rota não encontrada'
  });
});

// ==========================================
// INICIALIZAÇÃO DO SERVIDOR
// ==========================================

async function iniciar() {
  try {
    // Testa conexão com o banco de dados
    const conexaoOk = await testarConexao();
    
    if (!conexaoOk) {
      console.warn('Aviso: Não foi possível conectar ao banco de dados.');
      console.warn('Certifique-se de que o MySQL está rodando e as tabelas foram criadas.');
    }

    // Inicia o servidor
    app.listen(PORT, () => {
      console.log('==========================================');
      console.log('  API de Controle de Fiados');
      console.log('==========================================');
      console.log(`  Servidor rodando em: http://localhost:${PORT}`);
      console.log(`  Ambiente: ${process.env.NODE_ENV || 'development'}`);
      console.log('==========================================');
    });
  } catch (error) {
    console.error('Erro ao iniciar o servidor:', error);
    process.exit(1);
  }
}

// Inicia o servidor
iniciar();

export default app;
