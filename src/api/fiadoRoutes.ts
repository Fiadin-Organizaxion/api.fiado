import { Router } from 'express'
import { fiadoController } from '../controle'
import { autenticar } from '../controle/middleware/autenticacao'
import { donoOuFuncionario } from '../controle/middleware/autorizacao'

const router = Router()

// ROTAS DE FIADO
router.get('/fiados', autenticar, donoOuFuncionario, (req, res) => fiadoController.listar(req, res))
router.get('/fiados/com-cliente', autenticar, donoOuFuncionario, (req, res) => fiadoController.listarComCliente(req, res))
router.get('/fiados/resumo', autenticar, donoOuFuncionario, (req, res) => fiadoController.obterResumo(req, res))
router.get('/fiados/:id', autenticar, donoOuFuncionario, (req, res) => fiadoController.buscarPorId(req, res))
router.post('/fiados', autenticar, donoOuFuncionario, (req, res) => fiadoController.cadastrar(req, res))
router.put('/fiados/:id', autenticar, donoOuFuncionario, (req, res) => fiadoController.atualizar(req, res))
router.post('/fiados/:id/quitar', autenticar, donoOuFuncionario, (req, res) => fiadoController.quitar(req, res))
router.post('/fiados/:id/reabrir', autenticar, donoOuFuncionario, (req, res) => fiadoController.reabrir(req, res))
router.delete('/fiados/:id', autenticar, donoOuFuncionario, (req, res) => fiadoController.excluir(req, res))

export default router
