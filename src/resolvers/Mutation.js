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
    // Creates a new category
    async createCategory(parent, args, ctx, info) {
        // Setting to last index if name is miscellaneous
        var index = 0;
        if (args.name.toLowerCase() === "miscellaneous") {
            index = await ctx.db.query.categoriesConnection(
                { where: {} },
                "{ aggregate { count } }"
            );
            index = JSON.parse(JSON.stringify(index));
            index = index.aggregate.count;
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
        }

        var category = await ctx.db.mutation.createCategory(
            {
                data: {
                    ...args,
                    serializedName: serializeName(args.name),
                    index: index,
                },
            },
            info
        );
        return category;
    },
    // Creates a new page
    async createPage(parent, args, ctx, info) {
        var index = 0;
        var categoryId = 0;
        // If user did not mention a category
        if (!args.categoryId) {
            // getting miscellaneous category
            var misc = await ctx.db.query.category({
                where: {
                    serializedName: "miscellaneous",
                },
            });
            misc = JSON.parse(JSON.stringify(misc));

            // if miscellaneous category does not exist
            if (!misc) {
                // Count number of categories
                miscIndex = await ctx.db.query.categoriesConnection(
                    { where: {} },
                    "{ aggregate { count } }"
                );
                miscIndex = JSON.parse(JSON.stringify(miscIndex));
                miscIndex = miscIndex.aggregate.count;

                misc = await ctx.db.mutation.createCategory({
                    data: {
                        name: "Miscellaneous",
                        serializedName: "miscellaneous",
                        index: miscIndex,
                    },
                });
                categoryId = misc.id;
            } else {
                var lastMiscPage = await ctx.db.query.pagesConnection(
                    {
                        where: {
                            category: {
                                id: misc.id,
                            },
                        },
                    },
                    "{ aggregate { count } }"
                );
                index = JSON.parse(JSON.stringify(lastMiscPage)).aggregate.count + 1;
                categoryId = misc.id;
            }
        } else {
            var lastPage = await ctx.db.query.pagesConnection(
                {
                    where: {
                        category: {
                            id: args.categoryId,
                        },
                    },
                },
                "{ aggregate { count } }"
            );
            index = JSON.parse(JSON.stringify(lastPage)).aggregate.count + 1;
            categoryId = args.categoryId;
        }
        var page = await ctx.db.mutation.createPage(
            {
                data: {
                    index: index,
                    name: args.name,
                    serializedName: serializeName(args.name),
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
    // Edits the content of a page
    async editContent(parent, args, ctx, info) {
        var page = await ctx.db.mutation.updatePage(
            {
                data: { content: args.content, modifiedBy: { connect: { id: args.userId } } },
                where: { serializedName: args.pageSerial },
            },
            info
        );
        return page;
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
    //Edits a category
    async editCategory(parent, args, ctx, info) {
        var category = await ctx.db.mutation.updateCategory(
            {
                data: { serializedName: args.name, name: args.name, emoji: args.emoji},
                where: { serializedName: args.categorySerial },
            },
            info
        );

        return category;

    },
};

module.exports = Mutation;
