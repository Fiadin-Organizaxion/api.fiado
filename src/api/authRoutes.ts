import { Router } from 'express'
import { authController } from '../controle'
import { autenticarOpcional } from '../controle/middleware'

const router = Router()

// ==========================================
// ROTAS DE AUTENTICAÇÃO
// ==========================================

// POST /login - Realizar login
router.post('/login', (req, res) => authController.login(req, res))

// POST /usuarios - Cadastrar usuário
router.post('/usuarios', autenticarOpcional, (req, res) =>
  authController.cadastrar(req, res)
)

export default router