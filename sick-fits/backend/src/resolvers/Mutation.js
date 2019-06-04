const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const { randomBytes } = require('crypto')
const { promisify } = require('util')

const { checkLoggedIn, setTokenOnCookie, hasPermission } = require('../utils')
const { transport, makeANiceEmail } = require('../mail')

const mutations = {
  async createItem(parent, args, ctx, info) {
    // checked if logged in
    checkLoggedIn(ctx.request)

    const item = await ctx.db.mutation.createItem({
      data: {
        // This is how we create relationships
        user: {
          connect: {
            id: ctx.request.userID
          }
        },
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
    const item = await ctx.db.query.item({ where }, `{ id title user { id } }`)

    // check if they own that item, or have permissions
    const ownsItem = item.user.id === ctx.request.userID

    const hasPermissions = ctx.request.user.permissions.some(permission => {
      return ['ADMIN', 'ITEMDELETE'].includes(permission)
    })

    if (!ownsItem && !hasPermissions) throw new Error('You do not have permission to do that')

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
    if (!user) throw new Error(`No user found for email ${email}`)

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
    const resetTokenExpiry = Date.now() + (1000 * 60 * 60) // 1 hour
    const res = await ctx.db.mutation.updateUser({
      where: { email },
      data: { resetToken, resetTokenExpiry }
    })

    try {
       // Email the reset token
      const mailRes = await transport.sendMail({
        from: "davidchappy@gmail.com",
        to: user.email,
        subject: 'Your password reset token',
        html: makeANiceEmail(`Your Password reset token is here!
        \n\n <a href="${process.env.FRONTEND_URL}/reset?resetToken=${resetToken}">Click here to reset</a>`)
      })
      console.log("Sending reset token email", mailRes)
    } catch (error) {
      return new Error("Oops!", error)
    }

    // Return success message
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
  },

  async updatePermissions(parent, args, ctx, info) {
    // 1. Check if logged in
    checkLoggedIn(ctx.request)

    // 2. Query current user
    const currentUser = await ctx.db.query.user({
      where: {
        id: ctx.request.userID
      }
    }, info)

    // 3. Check if have permissions
    hasPermission(currentUser, ['ADMIN', 'PERMISSIONUPDATE'])

    // 4. Update the permissions
    return ctx.db.mutation.updateUser({
      data: {
        permissions: {
          set: args.permissions
        }
      },
      where: {
        id: args.userID
      }
    }, info)
  },

  async addToCart(parent, args, ctx, info) {
    // 1. Make sure they are signed in
    checkLoggedIn(ctx.request)

    // 2. Query user's current cart
    const { userID } = ctx.request

    const [existingCartItem] = await ctx.db.query.cartItems({
      where: {
        user: { id: userID },
        item: { id: args.id }
      }
    })

    // 3. Check if item is in cart (and increment)
    if (existingCartItem) {
      console.log('This item is already in the cart')
      return ctx.db.mutation.updateCartItem({
        where: { id: existingCartItem.id },
        data: { quantity: existingCartItem.quantity + 1 }
      }, info)
    }

    // 4. If not, create a fresh item
    return ctx.db.mutation.createCartItem({
      data: {
        user: {
          connect: { id: userID }
        },
        item: {
          connect: { id: args.id }
        }
      }
    }, info)
  },

  async removeFromCart(parent, args, ctx, info) {
    // 1. Find the cart item
    const cartItem = await ctx.db.query.cartItem({
      where: { id: args.id }
    }, `{ id, user { id } }`)
    if (!cartItem) throw new Error('No cart item found')

    // 2. Make sure they own it
    const { userID } = ctx.request
    const ownerID = cartItem.user.id

    if (userID !== ownerID) return new Error('You can only delete items from your own cart')

    // 3. Delete the item
    return ctx.db.mutation.deleteCartItem({
      where: { id: args.id }
    }, info)
  }
};

module.exports = mutations;
