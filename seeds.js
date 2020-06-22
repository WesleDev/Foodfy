const { hash } = require('bcryptjs')
const faker = require("faker")
const User = require('./src/app/models/User')


  async function createUsers() {
      let users = []
      const admin = {
          name: "Administrador",
          email: "adm@foodfy.com",
          is_admin: true
      }
      users.push(admin)
      while (users.length < 3) {
          const user = {
              name: faker.name.firstName(),
              email: faker.internet.email(),
              password: await hash("senha", 4),
              is_admin: false
          }
          users.push(user)
      }
      const usersPromise = users.map(user => User.create(user))
      await Promise.all(usersPromise)
  }

  createUsers()



