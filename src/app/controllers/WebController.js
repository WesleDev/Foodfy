const Recipe = require("../models/Recipe")
const Chef = require("../models/Chef")
const File = require("../models/File")

module.exports = {
  async index(req, res) {
    let { filter, page, limit } = req.query

    page = page || 1
    limit = limit || 6
    let offset = limit * (page - 1)
    order_by = "created_at"
    if (filter) {
      order_by = "updated_at"
    }

    const params = {
      filter,
      page,
      limit,
      offset,
      order_by,
    }

    let results = await Recipe.paginate(params)
    let recipes = results.rows

    let mathTotal =
      recipes[0] == undefined ? 0 : Math.ceil(recipes[0].total / limit)

    const pagination = {
      total: mathTotal,
      page,
    }

    async function getImage(recipeId) {
      let results = await Recipe.files_(recipeId)

      const files = results.map(file => `${req.protocol}://${req.headers.host}${file.path.replace("public", "")}`)

      return files[0]
    }

    const recipeFilesPromises = recipes.map(async recipe => {
      recipe.photo = await getImage(recipe.id)
      return recipe
    })

    const allRecipes = await Promise.all(recipeFilesPromises)

    return res.render("web/index", { recipes: allRecipes, pagination, filter })
  },
  about(req, res) {
    return res.render("web/about")
  },
  async show(req, res) {
    let { filter, page, limit } = req.query


    page = page || 1
    limit = limit || 6
    let offset = limit * (page - 1)
    order_by = "created_at DESC"
    if (filter) {
      order_by = "updated_at DESC"
    }

    const params = {
      filter,
      page,
      limit,
      offset,
      order_by,
    }

    let results = await Recipe.paginate(params)
    let recipes = results.rows

    let mathTotal =
      recipes[0] == undefined ? 0 : Math.ceil(recipes[0].total / limit)

    const pagination = {
      total: mathTotal,
      page,
    }

    async function getImage(recipeId) {
      let results = await Recipe.files_(recipeId)

      const files = results.map(file => `${req.protocol}://${req.headers.host}${file.path.replace("public", "")}`)

      return files[0]
    }

    const recipeFilesPromises = recipes.map(async recipe => {
      recipe.photo = await getImage(recipe.id)
      return recipe
    })

    const allRecipes = await Promise.all(recipeFilesPromises)

    return res.render("web/recipes", { recipes: allRecipes, pagination, filter })
  },
  async showOne(req, res) {
    results = await Recipe.find(req.params.id)
    const recipe = results.rows[0]
    results = await File.recipeImages(req.params.id)
    let files = results.rows
    files = files.map((file) => ({
      ...file,
      file_path: `${req.protocol}://${req.headers.host}${file.file_path.replace(
        "public",
        ""
      )}`,
    }))

    return res.render("web/recipepage", { recipe, files })
  },
  async chefs(req, res) {
    let { filter, page, limit } = req.query

    page = page || 1
    limit = limit || 16
    let offset = limit * (page - 1)

    const params = {
      filter,
      page,
      limit,
      offset,
    }

    results = await Chef.paginate(params)
    chefs = results.rows

    let mathTotal =
      chefs[0] == undefined ? 0 : Math.ceil(chefs[0].total / limit)

    const pagination = {
      total: mathTotal,
      page,
    }

    chefs = chefs.map(async (chef) => {
      results = await File.find(chef.file_id)
      file = results.rows[0]
      file = `${req.protocol}://${req.headers.host}${file.path.replace(
        "public",
        ""
      )}`;
      chef.file_path = file
      return chef
    })

    chefs = await Promise.all(chefs)

    return res.render("web/chefs", {
      chefs,
      pagination,
      filter,
    })
  },
  async chefsShowOne(req, res) {
    const chef = await Chef.find(req.params.id)
    const avatar = `${req.protocol}://${req.headers.host}${chef.photo.replace("public", "")}`
    const recipes = await Chef.findChefsRecipes(req.params.id)

    async function getImage(recipeId) {
      let results = await Recipe.files_(recipeId)

      const files = results.map(file => `${req.protocol}://${req.headers.host}${file.path.replace("public", "")}`)

      return files[0]
    }

    const recipeFilesPromises = recipes.map(async recipe => {
      recipe.photo = await getImage(recipe.id)
      return recipe
    })

    const allRecipes = await Promise.all(recipeFilesPromises)
    
    return res.render("web/chefsShowOne", { chef, avatar, recipes: allRecipes })
  }
}
