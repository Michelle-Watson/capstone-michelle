/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export function up(knex) {
  return knex.schema.createTable("games", (table) => {
    table.increments("id").primary(); // Primary key for the games table
    table.string("title").notNullable(); // Game title
    table.text("description"); // Description of the game
    table.date("release_date"); // Release date of the game
    table.string("imageurlSmall"); // URL for the small image
    table.string("imageurlBig"); // URL for the large image
    table.timestamp("created_at").defaultTo(knex.fn.now());
    table
      .timestamp("updated_at")
      .defaultTo(knex.raw("CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP"));
  });
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export function down(knex) {
  return knex.schema.dropTable("games"); // Drop the games table
}
