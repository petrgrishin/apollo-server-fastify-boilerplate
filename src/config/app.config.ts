import { Service } from 'fastify-decorators';
import { Config, Nullable, Option } from 'config-decorator';

@Service()
@Config('app')
export class AppConfig {
    @Option({
        type: 'string',
        default: 'dev',
    })
    public readonly env!: string;

    @Option({
        type: 'string',
        default: '127.0.0.1',
    })
    @Nullable()
    public readonly host!: string;

    @Option({
        type: 'number',
        default: 3030,
    })
    @Nullable()
    public readonly port!: number;
}
