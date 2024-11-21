/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export function up(knex) {
  return knex.schema.createTable("prices", (table) => {
    table.increments("id").primary(); // Primary key for the prices table
    table
      .integer("game_id")
      .unsigned()
      .references("games.id")
      .onUpdate("CASCADE")
      .onDelete("CASCADE");
    table.string("platform_name").notNullable(); // Name of the platform (e.g., Steam, GOG)
    table.decimal("original_price", 10, 2).notNullable(); // Original price of the game
    table.decimal("discount", 5, 2).defaultTo(0); // Discount percentage (0 if no discount)
    table.decimal("discounted_price", 10, 2); // Price after discount
    table.string("url").notNullable(); // URL to the store page

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
  return knex.schema.dropTable("prices"); // Drop the prices table
}
