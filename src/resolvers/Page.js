const Page = {
    category(parent, args, ctx, info) {
        return ctx.db.query.page({ id: parent.id }).category();
    },
};

module.exports = Page;
