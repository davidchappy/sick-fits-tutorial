const { forwardTo } = require("prisma-binding")

const Query = {
  items: forwardTo('db'),
  item: forwardTo('db'),
  itemsConnection: forwardTo('db'),
  // Return current user with a userID (set from token)
  me(parent, args, ctx, info) {
    const { response, request } = ctx
    if (!request.userID) return null

    return ctx.db.query.user({
      where: { id: request.userID }
    }, info)
  }
};

module.exports = Query;
