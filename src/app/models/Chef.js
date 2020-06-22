const db = require("../../config/db")
const { date } = require("../../lib/utils")

module.exports = {

  create(data, file_id) {
    const query = `
      INSERT INTO chefs (
        name,
        file_id
        ) VALUES ($1, $2)
        RETURNING id
    `

    const values = [data.name, file_id]

    try {
      return db.query(query, values)
    } catch (err) {
      throw new Error(err)
    }
  },
  findChefEdit(id) {
    try {
      return db.query(
        `
           SELECT chefs.*, count(recipes) AS total_recipes
           FROM chefs
           LEFT JOIN recipes ON (chefs.id = recipes.chef_id)
           WHERE chefs.id = $1
           GROUP BY chefs.id
         `,
        [id]
      )
    } catch (err) {
      throw new Error(err)
    }
  },
  async find(id) {
    const query = `
        SELECT chefs.*, count(recipes) AS total_recipes, files.path as photo
        FROM chefs
        LEFT JOIN files ON (chefs.file_id = files.id)
        LEFT JOIN recipes ON (chefs.id = recipes.chef_id)
        WHERE chefs.id = $1
        GROUP BY chefs.id, files.path
    `

    const results = await db.query(query, [id])
    return results.rows[0]
  },
  async findChefsRecipes(id) {
    const query = `
  SELECT recipes.*, chefs.id as chef_id, chefs.name as chef_name
          FROM recipes
          LEFT JOIN chefs ON (recipes.chef_id = chefs.id)
          WHERE chef_id = $1
          ORDER BY recipes.id DESC
  `

    const recipes = await db.query(query, [id])
    return recipes.rows
  },
  update(data, file_id) {
    try {
      return db.query(
        `
      UPDATE chefs SET 
        name=($1),
        file_id=($2)
      WHERE id = $3
    `,
        [data.name, file_id, data.id]
      )
    } catch (err) {
      throw new Error(err)
    }
  },
  delete(id) {
    try {
      return db.query(`DELETE FROM chefs WHERE id = $1`, [id])
    } catch (err) {
      throw new Error(err)
    }
  },
  paginate(params) {
    const { filter, limit, offset } = params

    let query = "",
      filterQuery = "",
      totalQuery = `(
        SELECT count(*) FROM chefs
      ) AS total`

    if (filter) {
      filterQuery = `
        WHERE chefs.name ILIKE '%${filter}%'
      `

      totalQuery = `(
        SELECT count(*) FROM chefs
        ${filterQuery}
      ) AS total`
    }

    query = `
      SELECT chefs.*, ${totalQuery}, count(recipes) as total_recipes
      FROM chefs
      LEFT JOIN recipes ON (chefs.id = recipes.chef_id)
      ${filterQuery}
      GROUP BY chefs.id LIMIT $1 OFFSET $2
    `
    try {
      return db.query(query, [limit, offset])
    } catch (err) {
      throw new Error(err)
    }
    db.query(query, [limit, offset])
  },
  findRecipes(id) {
    try {
      return db.query(
        `
        SELECT *
        FROM recipes
        WHERE recipes.chef_id = $1
      `,
        [id]
      )
    } catch (err) {
      throw new Error(err)
    }
  },
  files(id) {
    return db.query(`
    SELECT * FROM files WHERE chef_id = $1`, [id])
  },
  async findChefsRecipes(id) {
    const query = `
    SELECT recipes.*, chefs.id as chef_id, chefs.name as chef_name
            FROM recipes
            LEFT JOIN chefs ON (recipes.chef_id = chefs.id)
            WHERE chef_id = $1
            ORDER BY recipes.id DESC
    `

    const recipes = await db.query(query, [id])
    return recipes.rows
  },
}
