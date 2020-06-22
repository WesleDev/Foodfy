const express = require("express")
const routes = express.Router()
const chefs = require("../app/controllers/chefs")
const multer = require("../app/middlewares/multer")

const { onlyUsers, onlyAdmin } = require("../app/middlewares/session");


routes.get("/",onlyUsers, chefs.index)
routes.get("/create",onlyAdmin, chefs.create)
routes.get("/:id",onlyUsers, chefs.show)
routes.get("/:id/edit",onlyAdmin, chefs.edit)
routes.post("/",onlyAdmin, multer.array("photos", 1), chefs.post)
routes.put("/",onlyAdmin, multer.array("photos", 1), chefs.put)
routes.delete("/",onlyAdmin, chefs.delete)

module.exports = routes