import { Service } from 'fastify-decorators';
import { knex as KnexFactory, Knex } from 'knex';

@Service()
export class SqliteService {
    public readonly knex: Knex;

    constructor() {
        const config = {
            client: 'better-sqlite3',
            connection: {
                filename: './db.sqlite3',
                database: 'main',
            },
            useNullAsDefault: true,
        };
        console.info('Opening postgres connection...');
        this.knex = KnexFactory(config);

        process.on('SIGINT', async () => {
            console.warn(
                'Postgres connection is closing from signal="SIGINT" ...',
            );
            await this.knex.destroy();
            console.warn('Postgres connection closed.');
        });
    }
}
