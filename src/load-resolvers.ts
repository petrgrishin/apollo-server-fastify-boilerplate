import { globSync } from 'glob';
import { getInstanceByToken, Service } from 'fastify-decorators';
import { Resolver } from './resolver';

@Service()
export class LoadResolvers {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    load(patern: string): any[] {
        const files = globSync(patern);
        const modules = files.map((file) => {
            // eslint-disable-next-line @typescript-eslint/no-var-requires
            const module = require('../' + file.replace('.ts', '')).default;
            return getInstanceByToken<Resolver>(module).resolver;
        });
        return modules;
    }
}
