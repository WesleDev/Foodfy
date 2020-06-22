const express = require('express')
const routes = express.Router()

const SessionController = require('../app/controllers/SessionController')
const UserController = require('../app/controllers/UserController')

const UserValidator = require("../app/validators/users")
const SessionValidator = require("../app/validators/session")

const {
    onlyAdmin,
    isLoggedRedirectToAdmin,
} = require("../app/middlewares/session")



routes.get('/login', isLoggedRedirectToAdmin, SessionController.loginForm) // pagina de login
routes.post('/login',SessionValidator.login, SessionController.login) // fazer login
routes.post('/logout', SessionController.logout) // fazer logout

routes.get('/forgot-password', SessionController.forgotForm) //pagina esqueci a senha
routes.get("/password-reset", SessionController.resetForm) // formulario pra resetar a senha
routes.post("/forgot-password",SessionValidator.forgot, SessionController.forgot) // esqueci a senha
routes.post("/password-reset", SessionValidator.reset, SessionController.reset)

routes.get("/create",onlyAdmin, UserController.create) //Cadastrar um usuário

routes.get("/edit/:id",onlyAdmin, UserController.edit) //Editar um usuário

// Rotas que o administrador irá acessar para gerenciar usuários
routes.get('/',onlyAdmin, UserController.list) //Mostrar a lista de usuários cadastrados
routes.post('/',onlyAdmin,UserValidator.post,  UserController.post) //Cadastrar um usuário
routes.put('/',onlyAdmin, UserController.put) // Editar um usuário
routes.delete('/',onlyAdmin,UserValidator.del, UserController.delete) // Deletar um usuário

module.exports = routes