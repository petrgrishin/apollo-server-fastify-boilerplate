import type { Knex } from 'knex';

const tableName = 'tenant';

export async function up(knex: Knex): Promise<void> {
    if (await knex.schema.hasTable(tableName)) {
        console.error('Table already exists');
        return process.exit(1);
    }
    await knex.schema.createTable(tableName, (t) => {
        t.increments('id', { primaryKey: true }).notNullable();
        t.string('title').notNullable();
        t.string('description').notNullable();
    });
}

export async function down(knex: Knex): Promise<void> {
    return knex.schema.dropTable(tableName);
}
