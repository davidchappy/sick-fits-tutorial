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
  },

  async order(parent, args, ctx, info) {
    // 1. Logged in
    checkLoggedIn(ctx.request)

    // 2. Query current order
    const order = await ctx.db.query.order({
      where: { id: args.id }
    }, info)

    // 3. Check if have permission
    const ownsOrder = order.user.id === ctx.request.userID
    const canSeeAllOrders = ctx.request.user.permissions.includes('ADMIN')
    if (!ownsOrder && !canSeeAllOrders ) return new Error('You can\'t see this')

    // 4. Return order
    return order
  },

  async orders(parent, args, ctx, info) {
    // 1. Logged in
    checkLoggedIn(ctx.request)

    // 2. Return orders
    return ctx.db.query.orders({
      where: { user: { id: ctx.request.userID }}
    }, info)
  }
};

module.exports = Query;
