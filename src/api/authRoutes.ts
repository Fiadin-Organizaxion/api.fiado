import { Router } from 'express'
import { authController } from '../Controle'
import { autenticarOpcional } from '../Controle/middleware'

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