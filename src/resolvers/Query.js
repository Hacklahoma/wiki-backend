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
};

module.exports = Query;
