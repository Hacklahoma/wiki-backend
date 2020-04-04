const Category = {
    pages(parent, args, ctx, info) {
        return ctx.db.query.category({ id: parent.id }).pages();
    },
};

module.exports = Category;
