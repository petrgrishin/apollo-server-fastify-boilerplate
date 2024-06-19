import { Service } from 'fastify-decorators';
import { SqliteService } from '../db/sqlite.service';

@Service()
export class TenantService {
    constructor(private database: SqliteService) {}

    public getTenants(): object {
        return this.database.knex('tenant').select();
    }

    public getTenantById(id: number) {
        return this.database.knex('tenant').where('id', id).select().first();
    }
}
