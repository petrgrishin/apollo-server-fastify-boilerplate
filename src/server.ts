import 'reflect-metadata';
import createFastify from 'fastify';
import { getInstanceByToken } from 'fastify-decorators';
import fastifyGracefulExit from '@mgcrea/fastify-graceful-exit';
import { AppConfig } from './config/app.config';
import { ApolloServer } from '@apollo/server';
import { ApolloServerPluginDrainHttpServer } from '@apollo/server/plugin/drainHttpServer';
import { ApolloServerPluginInlineTrace } from '@apollo/server/plugin/inlineTrace';
import fastifyApollo, {
    fastifyApolloDrainPlugin,
} from '@as-integrations/fastify';
import { loadFilesSync } from '@graphql-tools/load-files';
import { WebSocketServer } from 'ws';
import { useServer } from 'graphql-ws/lib/use/ws';
import { mergeResolvers, mergeTypeDefs } from '@graphql-tools/merge';
import { buildSubgraphSchema } from '@apollo/subgraph';
import { GraphQLResolverMap } from '@apollo/subgraph/dist/schema-helper/resolverMap';
import { LoadResolvers } from './load-resolvers';

const appConfig = getInstanceByToken<AppConfig>(AppConfig);

let loggerOptions = {};
if (appConfig.env === 'dev') {
    loggerOptions = {
        level: 'debug',
        transport: {
            target: '@mgcrea/pino-pretty-compact',
            options: {
                translateTime: 'HH:MM:ss Z',
                ignore: 'pid,hostname',
                colorize: true,
            },
        },
    };
}

const loadedFiles = loadFilesSync(`${__dirname}/**/*.graphql`);
const typeDefs = mergeTypeDefs(loadedFiles);

const loadResolvers = getInstanceByToken<LoadResolvers>(LoadResolvers);
const resolvers = mergeResolvers(
    loadResolvers.load(`**/*.resolver.ts`),
) as GraphQLResolverMap;

const schema = buildSubgraphSchema([
    {
        typeDefs,
        resolvers,
    },
]);

const fastify = createFastify({
    logger: loggerOptions,
    disableRequestLogging: true,
});

const httpServer = fastify.server;

const wsServer = new WebSocketServer({
    server: httpServer,
    verifyClient: async (info, callback) => {
        // TODO Example
        // if (!info.req.headers['x-webauth-user']) {
        //     callback(false, 401);
        //     return;
        // }
        // console.log('user ->>>', info.origin, info.secure, info.req.headers['x-webauth-user']);
        callback(true);
    },
});

const serverCleanup = useServer({ schema }, wsServer);

const server = new ApolloServer({
    schema,
    plugins: [
        fastifyApolloDrainPlugin(fastify),
        ApolloServerPluginInlineTrace(),
        ApolloServerPluginDrainHttpServer({ httpServer }),
        {
            async serverWillStart() {
                return {
                    async drainServer() {
                        await serverCleanup.dispose();
                    },
                };
            },
        },
    ],
});

// if (appConfig.env === 'dev') {
//
// }

fastify.register(fastifyGracefulExit, { timeout: 3000 });

const start = async () => {
    try {
        await server.start();
        await fastify.register(fastifyApollo(server));
        fastify.log.info(
            `GraphQL docs available at http://${appConfig.host}:${appConfig.port}/graphql`,
        );

        await fastify.listen({
            port: appConfig.port,
            host: appConfig.host,
        });
    } catch (error) {
        fastify.log.error(error);
        process.exit(1);
    }
};

start().catch((error) => {
    console.error(error);
    process.exit(1);
});
