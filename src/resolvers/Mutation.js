// Transforms "This Is a Name" to "this-is-a-name" for more friendly urls
function serializeName(name) {
    return name.trim().toLowerCase().replace(/ /g, "-");
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
        var lastPage = await ctx.db.query.pages({
            where: {
                category: {
                    id: args.categoryId,
                },
            },
            orderBy: "index_ASC",
            last: 1,
        });
        var index = JSON.parse(JSON.stringify(lastPage))[0].index + 1;

        // If user did not mention a category
        if (!args.categoryId) {
            // getting miscellaneous category
            var miscExists = await ctx.db.query.category({
                where: {
                    id: "miscellaneous",
                },
            });
            // if miscellaneous category does not exist
            if (!miscExists) {
                // create it
                await ctx.db.mutation.createCategory({
                    name: "Miscellaneous",
                });
            }
            categoryId = "miscellaneous";
        } else {
            categoryId = args.categoryId;
        }

        var page = await ctx.db.mutation.createPage(
            {
                data: {
                    id: serializeName(args.name),
                    index: index,
                    name: args.name,
                    createdBy: {
                        connect: {
                            id: args.userId,
                        },
                    },
                    category: {
                        connect: {
                            id: categoryId,
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
        // Setting to last index if name is miscellaneous
        if (args.name.toLowerCase() === "miscellaneous") {
            var categories = await ctx.db.query.categories({
                orderBy: "index_ASC",
                last: 1,
            });
            categories = JSON.parse(JSON.stringify(categories));
            var index = categories[0].index + 1;
        // Name is not miscellaneous
        } else {
            // Getting categories and increasing index by 1 to make room
            var categories = await ctx.db.query.categories({
                orderBy: "index_ASC",
            });
            categories = JSON.parse(JSON.stringify(categories));
            for (i in categories) {
                ctx.db.mutation.updateCategory({
                    where: {
                        id: categories[i].id,
                    },
                    data: {
                        index: categories[i].index + 1,
                    },
                });
            }
            var index = 0;
        }
        var category = await ctx.db.mutation.createCategory(
            {
                data: {
                    ...args,
                    id: serializeName(args.name),
                    index: index,
                },
            },
            info
        );
        return category;
    },
    // Deletes a new category
    async deleteCategory(parent, args, ctx, info) {
        var category = await ctx.db.mutation.deleteCategory(
            {
                where: {
                    ...args,
                },
            },
            info
        );

        var categories = await ctx.db.query.categories({
            orderBy: "index_ASC",
            first: category.index + 1,
        });

        categories = JSON.parse(JSON.stringify(categories));
        for (i in categories) {
            ctx.db.mutation.updateCategory({
                where: {
                    id: categories[i].id,
                },
                data: {
                    index: categories[i].index - 1,
                },
            });
        }
        return category;
    },
};

module.exports = Mutation;
