import { Router } from 'express'
import { authController, usuarioController } from '../controle'
import { autenticar, apenasDono } from '../controle/middleware'

const router = Router()

// ==========================================
// ROTAS DE USUÁRIO
// ==========================================

// GET /usuarios/me - Perfil do usuário logado
router.get('/usuarios/me', autenticar, (req, res) =>
  authController.perfil(req, res)
)

// GET /usuarios/estatisticas
router.get('/usuarios/estatisticas', autenticar, apenasDono, (req, res) =>
  usuarioController.estatisticas(req, res)
)

// GET /usuarios
router.get('/usuarios', autenticar, apenasDono, (req, res) =>
  usuarioController.listar(req, res)
)

// GET /usuarios/:id
router.get('/usuarios/:id', autenticar, apenasDono, (req, res) =>
  usuarioController.buscarPorId(req, res)
)

// DELETE /usuarios/:id
router.delete('/usuarios/:id', autenticar, apenasDono, (req, res) =>
  usuarioController.remover(req, res)
)

export default router