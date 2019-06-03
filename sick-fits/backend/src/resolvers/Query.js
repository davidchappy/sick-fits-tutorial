const { forwardTo } = require("prisma-binding")
const { checkLoggedIn, hasPermission } = require('../utils')

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
  },
  async users(parent, args, ctx, info) {
    // 1. Check if logged in
    checkLoggedIn(ctx.request)

    // 2. Check if user has permissions to query all the users
    hasPermission(ctx.request.user, ['ADMIN', 'PERMISSIONUPDATE'])

    // 3. If they do, query all the users
    return ctx.db.query.users({}, info)
  }
};

module.exports = Query;
