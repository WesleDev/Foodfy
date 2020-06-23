const Recipe = require("../models/Recipe")
const RecipeFile = require("../models/RecipeFile")
const File = require("../models/File")
const Chef = require("../models/Chef")

module.exports = {
  async index(req, res) {
    let { filter, page, limit } = req.query
    let user_id = req.session.userId

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
      user_id,
    }

    let results = await Recipe.paginate(params)
    let recipes = results.rows

    let mathTotal =
      recipes[0] == undefined ? 0 : Math.ceil(recipes[0].total / limit)

    const pagination = {
      total: mathTotal,
      page,
    };

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
                  
  return res.render("admin/recipes/index", {recipes: allRecipes, pagination, filter})

   
  },
  async create(req, res) {
   
    results = await Recipe.chefSelectOptions()
    const chefOptions = results.rows; 
    return res.render("admin/recipes/create", { chefOptions })
  },
  async show(req, res) {
    results = await Recipe.find(req.params.id);
    const recipe = results.rows[0];
    results = await File.recipeImages(req.params.id);
    let files = results.rows;
    files = files.map((file) => ({
      ...file,
      file_path: `${req.protocol}://${req.headers.host}${file.file_path.replace(
        "public",
        ""
      )}`,
    }));

    return res.render("admin/recipes/show", { recipe, files });
  },
  async edit(req, res) {
    results = await Recipe.find(req.params.id);
    const recipe = results.rows[0];

    results = await Recipe.chefSelectOptions();
    const chefOptions = results.rows;

    results = await File.recipeImages(req.params.id);
    let files = results.rows;
    files = files.map((file) => ({
      ...file,
      file_path: `${req.protocol}://${req.headers.host}${file.file_path.replace(
        "public",
        ""
      )}`,
    }));

    return res.render("admin/recipes/edit", {
      recipe,
      files,
      chefOptions,
    });
  },
  async post(req, res) {
    const keys = Object.keys(req.body);

    for (key of keys) {
      if (req.body[key] == "") return res.send("Please, fill all the fields!");
    }

    if (req.files.length == 0) {
      return res.send("Please, send at least one image");
    }

    req.body.user_id = req.session.userId

    let results = await Recipe.create(req.body);
    const recipeId = results.rows[0].id;
    const filesPromise = req.files.map((file) =>
      File.create(file, recipeId)
        .then((response) => {
          file_id = response.rows[0].id;
          recipe_id = recipeId;
          RecipeFile.create({ recipe_id, file_id });
        })
        .catch(function (err) {
          throw new Error(err);
        })
    );
    await Promise.all(filesPromise);

    return res.redirect(`/admin/recipes/${recipeId}`);
  },
  async put(req, res) {
    const keys = Object.keys(req.body);

    for (key of keys) {
      if (req.body[key] == "" && key != "removed_files")
        return res.send("Preencha todos os campos!");
    }

    if (req.files.length != 0) {
      const filesPromise = req.files.map((file) =>
        File.create(file, req.body.id)
          .then((response) => {
            file_id = response.rows[0].id;
            recipe_id = req.body.id;
            RecipeFile.create({ recipe_id, file_id });
          })
          .catch(function (err) {
            throw new Error(err);
          })
      );
      await Promise.all(filesPromise);
    }

    if (req.body.removed_files) {
      const removedFiles = req.body.removed_files.split(",");
      const lastIndex = removedFiles.length - 1;
      removedFiles.splice(lastIndex, 1);

      const removedFilesPromise = removedFiles.map((id) => {
        File.deleteRecipe(id);
        File.delete(id);
      });
      await Promise.all(removedFilesPromise);
    }

    await Recipe.update(req.body);

    return res.redirect(`/admin/recipes/${req.body.id}`);
  },
  async delete(req, res) {
    results = await Recipe.files(req.body.id);
    files = results.rows;

    const deletePromise = files.map(
      async (file) => await File.delete(file.file_id)
    );
    let resolve = await Promise.all(deletePromise);

    await Recipe.delete(req.body.id);

    return res.redirect("/admin/recipes");
  }
};
