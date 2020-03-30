const { forwardTo } = require("prisma-binding");

const Query = {
    users: forwardTo("db"),
    pages: forwardTo("db"),
    categories: forwardTo("db"),
    user: forwardTo("db"),
    page: forwardTo("db"),
    category: forwardTo("db"),
    usersConnection: forwardTo("db"),
    pagesConnection: forwardTo("db"),
    categoriesConnection: forwardTo("db"),
    // async page(parent, args, ctx, info) {
    //     const page = await ctx.db.query.page({ where: { id: args.pageId } });
    //     return page;
    // },
    // // Query a category
    // async category(parent, args, ctx, info) {
    //     const category = await ctx.db.query.category({ where: { id: args.categoryId } });
    //     return category;
    // },
    // // Query a user
    // async user(parent, args, ctx, info) {
    //     const user = await ctx.db.query.user({ where: { id: args.userId } });
    //     return user;
    // },
};

module.exports = Query;
