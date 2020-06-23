const express = require('express')
const routes = express.Router()
const web = require("../app/controllers/WebController")

const admin = require('./admin')

routes.use("/admin", admin)

//home
routes.get("/", web.index)

routes.get("/about", web.about)
routes.get("/recipes", web.show)
routes.get("/recipes/:id", web.showOne)
routes.get("/chefs", web.chefs)
routes.get("/chefsShowOne/:id", web.chefsShowOne)

//admin
routes.get("/admin", function (req, res) {
    return res.redirect("/admin/profile")
})


module.exports = routes