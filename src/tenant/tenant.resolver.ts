import { Service } from 'fastify-decorators';
import { Resolver } from '../resolver';
import { TenantService } from './tenant.service';

@Service()
export default class TenantResolver implements Resolver {
    constructor(private tenantService: TenantService) {}

    public readonly resolver = {
        Query: {
            tenants: async () => {
                return this.tenantService.getTenants();
            },
        },
    };
}
