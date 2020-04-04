const { GraphQLServer } = require("graphql-yoga");
const Mutation = require("./resolvers/Mutation");
const Query = require("./resolvers/Query");
const Category = require("./resolvers/Category");
const Page = require("./resolvers/Page");
const db = require("./db");

function createServer() {
    return new GraphQLServer({
        typeDefs: "src/schema.graphql",
        resolvers: {
            Mutation,
            Query,
            // Category,
            // Page,
        },
        resolverValidationOptions: {
            requireResolversForResolveType: false,
        },
        context: (req) => ({ ...req, db }),
    });
}

module.exports = createServer;