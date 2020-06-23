const { Pool } = require('pg')

module.exports = new Pool({
    user: '', //Seu usuário do PostgreSQL aqui
    password: '', //Sua senha do PostgreSQL aqui
    host: 'localhost',
    port: 5432,
    database: 'foodfy'
})