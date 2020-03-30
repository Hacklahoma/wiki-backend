// Transforms "This Is a Name" to "this-is-a-name" for more friendly urls
function serializeName(name) {
    return name
        .trim()
        .toLowerCase()
        .replace(/ /g, "-");
}

const Mutation = {
    // Creates a new user
    async createUser(parent, args, ctx, info) {
        const user = await ctx.db.mutation.createUser(
            {
                data: {
                    ...args,
                },
            },
            info
        );
        return user;
    },
    // Creates a new page
    async createPage(parent, args, ctx, info) {
        var page = await ctx.db.mutation.createPage(
            {
                data: {
                    id: serializeName(args.name),
                    index: args.index,
                    name: args.name,
                    createdBy: {
                        connect: {
                            id: args.userId,
                        },
                    },
                    category: {
                        connect: {
                            id: args.categoryId,
                        },
                    },
                },
            },
            info
        );
        return page;
    },
    // Creates a new category
    async createCategory(parent, args, ctx, info) {
        var category = await ctx.db.mutation.createCategory(
            {
                data: {
                    ...args,
                    id: serializeName(args.name),
                },
            },
            info
        );
        return category;
    },
};

module.exports = Mutation;
