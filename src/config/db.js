const { Pool } = require('pg')

module.exports = new Pool({
    user: 'postgres', //Seu usuário do PostgreSQL aqui
    password: '335923', //Sua senha do PostgreSQL aqui
    host: 'localhost',
    port: 5432,
    database: 'foodfy'
})