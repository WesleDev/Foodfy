const Chef = require("../models/Chef");
const File = require("../models/File");
const Recipe = require("../models/Recipe");

module.exports = {
  async index(req, res) {
    let { filter, page, limit } = req.query;

    page = page || 1;
    limit = limit || 16;
    let offset = limit * (page - 1);

    const params = {
      filter,
      page,
      limit,
      offset,
    };

    results = await Chef.paginate(params);
    chefs = results.rows;

    let mathTotal =
      chefs[0] == undefined ? 0 : Math.ceil(chefs[0].total / limit);

    const pagination = {
      total: mathTotal,
      page,
    };

    chefs = chefs.map(async (chef) => {
      results = await File.find(chef.file_id);
      file = results.rows[0];
      file = `${req.protocol}://${req.headers.host}${file.path.replace(
        "public",
        ""
      )}`;
      chef.file_path = file;
      return chef;
    });

    chefs = await Promise.all(chefs);

    return res.render("admin/chefs/index", {
      chefs,
      pagination,
      filter,
    });
  },
  create(req, res) {
    return res.render("admin/chefs/create");
  },
  async show(req, res) {
  

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

        
        
        return res.render("admin/chefs/show", { chef, avatar, recipes: allRecipes })
        
  },
  async edit(req, res) {
    results = await Chef.findChefEdit(req.params.id);
    chef = results.rows[0];

    results = await File.find(chef.file_id);
    let files = results.rows;
    files = files.map((file) => ({
      ...file,
      file_path: `${req.protocol}://${req.headers.host}${file.path.replace(
        "public",
        ""
      )}`,
    }));

    return res.render("admin/chefs/edit", { chef, files });
  },
  async post(req, res) {
    const keys = Object.keys(req.body);

    for (key of keys) {
      if (req.body[key] == "") return res.send("Please, fill all the fields!");
    }

    if (req.files.length == 0) {
      return res.send("Por favor, envie pelo menos uma imagem");
    }
    results = await File.create(...req.files);
    file_id = results.rows[0].id;
    results = await Chef.create(req.body, file_id);
    chef_id = results.rows[0].id;
    
    return res.redirect(`/admin/chefs/${chef_id}`);
  },
  async put(req, res) {
    const keys = Object.keys(req.body);

    results = await Chef.findChefEdit(req.body.id);
    let file_id = results.rows[0].file_id;

    for (key of keys) {
      if (req.body[key] == "" && key != "removed_files")
        return res.send("Preencha todos os campos!");
    }

    if (req.files.length != 0) {
      results = await File.create(...req.files);
      file_id = results.rows[0].id;
    }

    if (req.body.removed_files) {
      const removedFiles = req.body.removed_files.split(",");
      const lastIndex = removedFiles.length - 1;
      removedFiles.splice(lastIndex, 1);

      await File.delete(removedFiles);
    }

    Chef.update(req.body, file_id);
    return res.redirect(`/admin/chefs/${req.body.id}`);
  },
  async delete(req, res) {
    results = await Chef.findChefEdit(req.body.id);
    const chef = results.rows[0];
    if (chef.total_recipes > 0)
      return res.send("Você não pode deletar um chef que tenha receitas!");

    await Chef.delete(req.body.id);
    await File.delete(chef.file_id);

    return res.redirect("/admin/chefs");
  },
};
