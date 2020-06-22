const db = require("../../config/db")
const { date } = require("../../lib/utils")
const User = require("./User")

module.exports = {
  create(data) {
    const query = `
      INSERT INTO recipes (
        user_id,
        chef_id,
        title,
        ingredients,
        preparation,
        information,
        created_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING id
    `

    const values = [
      data.user_id,
      data.chef,
      data.title,
      data.ingredients,
      data.preparation,
      data.information,
      date(Date.now()).iso
    ]

    try {
      return db.query(query, values)
    } catch (err) {
      throw new Error(err)
    }
  },
  async findOne(id) {
    const query = `
            SELECT recipes.*, chefs.id as chef_id, chefs.name as chef_name, files.path as photo
            FROM recipes_files
            FULL JOIN recipes ON (recipes_files.recipe_id = recipes.id)
            LEFT JOIN files ON (recipes_files.file_id = files.id)
            LEFT JOIN chefs ON (recipes.chef_id = chefs.id)
            WHERE recipes.id = $1
        `

    const results = await db.query(query, [id])
    return results.rows[0]
  },
  find(id) {
    try {
      return db.query(
        `
        SELECT recipes.*, chefs.name AS chef_name
        FROM recipes
        LEFT JOIN chefs ON (recipes.chef_id = chefs.id)
        WHERE recipes.id = $1
      `,
        [id]
      )
    } catch (err) {
      throw new Error(err)
    }
  },
  findAll() {
    try {
      return db.query(
        `
        SELECT recipes.*, chefs.id as chef_id, chefs.name AS chef_name
        FROM recipes
        LEFT JOIN chefs ON (recipes.chef_id = chefs.id)
        ORDER BY created_at DESC
      `
      )
    } catch (err) {
      throw new Error(err)
    }
  },
  update(data, callback) {
    const query = `
      UPDATE recipes SET 
        chef_id=($1),
        title=($2),
        ingredients=($3),
        preparation=($4),
        information=($5)
      WHERE id = $6
    `
    const values = [
      data.chef,
      data.title,
      data.ingredients,
      data.preparation,
      data.information,
      data.id
    ]

    try {
      return db.query(query, values)
    } catch (err) {
      throw new Error(err)
    }
  },
  delete(id, callback) {
    try {
      return db.query(`DELETE FROM recipes WHERE id = $1`, [id])
    } catch (err) {
      throw new Error(err)
    }
  },
  async paginate(params) {
    const { filter, limit, offset, order_by, user_id: id } = params
    let user = ""
    if (id) {
      user = await User.findOne({ where: { id } })
    }

    let adminQuery = ``

    if (user.is_admin == false) {
      adminQuery = `
        AND recipes.user_id = '${id}'
      `
    }

    let query = "",
      filterQuery = "",
      totalQuery = `(
        SELECT count(*) FROM recipes
      ) AS total`

    if (filter) {
      filterQuery = `
        WHERE recipes.title ILIKE '%${filter}%'
      `

      totalQuery = `(
        SELECT count(*) FROM recipes
        ${filterQuery}
      ) AS total`
    }

    query = `
      SELECT recipes.*, ${totalQuery}, chefs.name AS chef_name, images.array_to_string as files_id
      FROM recipes
      JOIN chefs ON (recipes.chef_id = chefs.id)
      JOIN (
        SELECT recipe_id, array_to_string(array_agg(file_id), ',')
        FROM recipe_files
        GROUP BY recipe_id
      ) images ON (recipes.id = images.recipe_id)
      ${filterQuery}
      ${adminQuery}
      ORDER BY ${order_by} LIMIT $1 OFFSET $2
    `

    try {
      return db.query(query, [limit, offset])
    } catch (err) {
      throw new Error(err)
    }
  },
  chefSelectOptions() {
    try {
      return db.query(`
        SELECT name, id FROM chefs
      `)
    } catch (err) {
      throw new Error(err)
    }
  },
  files(id) {
    try {
      return db.query(
        `
      SELECT * FROM recipe_files WHERE recipe_id = $1 
    `,
        [id]
      )
    } catch (err) {
      throw new Error(err)
    }
  },
  async files_(id) {
    const query = `
      SELECT recipe_files.*, files.path FROM recipe_files
      LEFT JOIN files ON (recipe_files.file_id = files.id)
      WHERE recipe_files.recipe_id = $1
  `

    const results = await db.query(query, [id])
    return results.rows
  }
}

