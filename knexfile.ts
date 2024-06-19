/**
 * @type { Object.<string, import("knex").Knex.Config> }
 */
module.exports = {
    development: {
        client: 'better-sqlite3',
        connection: {
            filename: './db.sqlite3',
        },
        useNullAsDefault: true,
        migrations: {
            stub: './migrations/migration.stub',
            // extension: 'ts',
            getNewMigrationName: (name: string) => {
                return `${Date.now()}-${name}.ts`;
            },
        },
    },
};
