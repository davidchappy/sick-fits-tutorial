const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const { randomBytes } = require('crypto')
const { promisify } = require('util')

const setTokenOnCookie = (response, token) => {
  response.cookie('token', token, {
    httpOnly: true,
    maxAge: 1000 * 60 * 60 * 24 * 365
  })
}

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
    // Create JWT token for them (ie, sign them in)
    const token = jwt.sign({ userID: user.id }, process.env.APP_SECRET)
    // Set the JWT as a cookie on the response
    setTokenOnCookie(ctx.response, token)

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
    setTokenOnCookie(ctx.response, token)

    // 5. Return user
    return user
  },

  async signout(parent, args, ctx, info) {
    ctx.response.clearCookie('token')

    return { message: "Successfully signed out" }
  },

  async requestReset(parent, { email }, ctx, info) {
    // 1. Check if is real user
    const user = await ctx.db.query.user({ where: { email }})
    if (!user) throw new Error(`No such user found for email ${email}`)

    // 2. Set reset token and expiry
    const resetToken = (await promisify(randomBytes)(20)).toString('hex')
    console.log({ resetToken })
    const resetTokenExpiry = Date.now() + (1000 * 60 * 60) // 1 hour
    const res = await ctx.db.mutation.updateUser({
      where: { email },
      data: { resetToken, resetTokenExpiry }
    })
    // Email the reset token
    return { message: "Thanks!" }
  },

  async resetPassword(parent, { resetToken, password, confirmPassword }, ctx, info) {
    // 1. check if passwords match
    if (password !== confirmPassword) throw new Error('Passwords do not match')

    // 2. check if legit token
    // 3. check if expired
    const [user] = await ctx.db.query.users({
      where: {
        resetToken,
        resetTokenExpiry_gte: Date.now() - (1000 * 60 * 60)
      },
    })
    if (!user) throw new Error('This token is either invalid or expired')

    // 4. hash new password
    const newPassword = await bcrypt.hash(password, 10)

    // 5. save new password to the user and remove old resettoken fields
    const updatedUser = await ctx.db.mutation.updateUser({
      where: {
        email: user.email
      },
      data: {
        password: newPassword,
        resetToken: null,
        resetTokenExpiry: null
      }
    })

    // 6. generate jwt
    const token = jwt.sign({ userID: updatedUser.id }, process.env.APP_SECRET)

    // 7. set token on cookie
    setTokenOnCookie(ctx.response, token)

    // 8. return new user
    return user
  }
};

module.exports = mutations;
