const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const jwtDecode = require('jwt-decode')

const mutations = {
  // checked if logged in
  async createItem(parent, args, ctx, info) {
    const item = await ctx.db.mutation.createItem({
      data: {
        ...args
      }
    }, info)

    return item
  },

  updateItem(parent, args, ctx, info) {
    const updates = { ...args }
    delete updates.id

    return ctx.db.mutation.updateItem(
      {
        data: updates,
        where: {
          id: args.id
        },
      },
      info
    )
  },

  async deleteItem(parent, args, ctx, info) {
    const where = { id: args.id }

    // find the item
    const item = await ctx.db.query.item({ where }, `{ id title }`)

    // check if htey own that item, or have permissions
    // TODO

    // delete it
    return ctx.db.mutation.deleteItem({ where }, info)
  },

  async signup(parent, args, ctx, info) {
    args.email = args.email.toLowerCase()

    // hash their password
    const password = await bcrypt.hash(args.password, 10)
    // create user in db
    const user = await ctx.db.mutation.createUser({
      data: {
        ...args,
        password,
        permissions: { set: ['USER'] }
      },
      info
    })
    // Create JWT token for them
    const token = jwt.sign({ userID: user.id }, process.env.APP_SECRET)
    // Set the JWT as a cookie on the response
    ctx.response.cookie('token', token, {
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24 * 365
    })
    // Return the user to the browser
    return user
  },

  async signin(parent, { email, password }, ctx, info) {
    // 1. Check if there's a user
    const user = await ctx.db.query.user({ where: { email } })
    if (!user) throw new Error(`No such user found for email ${email}`)

    // 2. Check password
    const valid = await bcrypt.compare(password, user.password)
    if (!valid) throw new Error('Invalid password')

    // 3. Generate JWT
    const token = jwt.sign({ userID: user.id }, process.env.APP_SECRET)

    // 4. Set cookie with token
    ctx.response.cookie('token', token, {
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24 * 365
    })

    // 5. Return user
    return user
  },

  async signout(parent, args, ctx, info) {
    ctx.response.clearCookie('token')

    return { message: "Successfully signed out" }
  }
};

module.exports = mutations;
