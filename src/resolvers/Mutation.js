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
        } 
        else {
            // Get the categories in index order
            var categories = await ctx.db.query.categories({
                orderBy: "index_ASC",
            });
            categories = JSON.parse(JSON.stringify(categories));
            //get index that the new category should be at
            index = categories.length-1;
            //Update the miscellaneous categories index
            ctx.db.mutation.updateCategory({
                where: {
                    serializedName: "miscellaneous" 
                },
                data: {
                    index: categories.length,
                },
            });
        }

        //Create a new category with the new index and arguments
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
        //Delete the category based on the serial
        var category = await ctx.db.mutation.deleteCategory(
            {
                where: {
                    serializedName: args.categorySerial
                },
            },
            info
        );

        //Gets the categories in index order
        var categories = await ctx.db.query.categories({
            orderBy: "index_ASC",
            first: category.index + 1,
        });

        categories = JSON.parse(JSON.stringify(categories));

        //Updates the categories based on the new index
        for (i in categories) {
            ctx.db.mutation.updateCategory({
                where: {
                    id: categories[i].id,
                },
                data: {
                    index: i,
                },
            });
        }
        return category;
    },
    //Edits a category based on a name
    async editCategory(parent, args, ctx, info) {
        //Gets the category and updates it based on the new name
        var category = await ctx.db.mutation.updateCategory(
            {
                data: { serializedName: serializeName(args.name), name: args.name, emoji: args.emoji},
                where: { serializedName: args.categorySerial },
            },
            info
        );

        return category;
    },
    //Move a category based on an index
    async moveCategory(parent, args, ctx, info) {
        //Gets the categories in index order
        var categories = await ctx.db.query.categories({
            orderBy: "index_ASC",
        });
        categories = JSON.parse(JSON.stringify(categories));

        //First checks to see if the index is in the bounds
        if(args.index >= categories.length-1 || args.index < 0){
            return{
                error:{
                    id: "moveCategory",
                    message: "Index Out Of Bound"
                }
            }
        }

        //Next check for the different cases there can be
        //Grab the category
        var categoryIndex = await ctx.db.query.category({
            where:{
                serializedName: args.categorySerial,
            }
        })

        categoryIndex = JSON.parse(JSON.stringify(categoryIndex));
        //Get the index from the category
        categoryIndex = parseInt(categoryIndex.index);

        //Checks to see if the index is the same
        if(categoryIndex === args.index){
            return{
                error:{
                    id: "moveCategory",
                    message: "Index not being moved"
                }
            }
        }
        //Checks the last case where the new category index is lower
        else if(args.index < categoryIndex){
            //Make room for the category
            for (i = args.index; i < categoryIndex; i++) {
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
        //Checks the last case where the new category index is bigger
        else {
            //Make room for the category to be moved
            for (i = categoryIndex+1; i <= args.index; i++) {
                ctx.db.mutation.updateCategory({
                    where: {
                        id: categories[i].id,
                    },
                    data: {
                        index: categories[i].index - 1,
                    },
                });
            }
        }
        //Update the category's index
        var category = ctx.db.mutation.updateCategory({
            where: {
                serializedName: args.categorySerial
            },
            data: {
                index: args.index,
            },
        })
        return category;
    }
};

module.exports = Mutation;
