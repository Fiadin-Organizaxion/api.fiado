import { Router } from 'express'
import { clienteController } from '../Controle'
import { autenticar } from '../Controle/middleware/autenticacao'
import { donoOuFuncionario } from '../Controle/middleware/autorizacao'

const router = Router()

// ROTAS DE CLIENTE
router.get('/clientes', autenticar, donoOuFuncionario, (req, res) => clienteController.listar(req, res))
router.get('/clientes/com-fiados', autenticar, donoOuFuncionario, (req, res) => clienteController.listarComFiados(req, res))
router.get('/clientes/:id', autenticar, donoOuFuncionario, (req, res) => clienteController.buscarPorId(req, res))
router.post('/clientes', autenticar, donoOuFuncionario, (req, res) => clienteController.cadastrar(req, res))
router.put('/clientes/:id', autenticar, donoOuFuncionario, (req, res) => clienteController.atualizar(req, res))
router.delete('/clientes/:id', autenticar, donoOuFuncionario, (req, res) => clienteController.excluir(req, res))

export default router
