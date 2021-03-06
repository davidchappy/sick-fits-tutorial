import React from "react"
import { Mutation } from 'react-apollo'
import Link from "next/link"

import NavStyles from "./styles/NavStyles"
import User from './User'
import Signout from './Signout'
import CartCount from './CartCount'
import getCartCount from '../lib/getCartCount'
import { TOGGLE_CART_MUTATION } from '../components/Cart'

const Nav = () => {
  return (
    <User>
      {({ data: { me } }) => (
        <NavStyles data-test="nav">
          <Link href="/items">
            <a>Shop</a>
          </Link>
          {
            me && (
              <>
                <Link href="/sell">
                  <a>Sell</a>
                </Link>
                <Link href="/orders">
                  <a>Orders</a>
                </Link>
                <Link href="/me">
                  <a>Account</a>
                </Link>
                <Signout />
                <Mutation mutation={TOGGLE_CART_MUTATION}>
                  {toggleCart => (
                    <button onClick={toggleCart}>
                      🛒
                      <CartCount count={getCartCount(me.cart)}/>
                    </button>
                  )}
                </Mutation>
              </>
            )
          }
          {
            !me &&
            <Link href="/signup">
              <a>Signup</a>
            </Link>
          }
        </NavStyles>
    )}
    </User>
  )
}

export default Nav