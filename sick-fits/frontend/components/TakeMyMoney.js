import StripeCheckout from 'react-stripe-checkout'
import { Mutation } from 'react-apollo'
import Router from 'next/router'
import NProgress from 'nprogress'
import PropTypes from 'prop-types'
import gql from 'graphql-tag'
import getConfig from 'next/config'

import calcTotalPrice from '../lib/calcTotalPrice'
import getCartCount from '../lib/getCartCount'
import Error from './ErrorMessage'
import User, { CURRENT_USER_QUERY } from './User'

class TakeMyMoney extends React.Component {
  onToken = res => {
    console.log('On token called')
    console.log({ res })
    const { id } = res

  }

  render() {
    return (
      <User>
        {({ data: { me }, loading, error }) => (
          <StripeCheckout
            amount={calcTotalPrice(me.cart)}
            name="Sick Fits"
            description={`Order of ${getCartCount(me.cart)} items`}
            image={me.cart.length && me.cart[0].item && me.cart[0].item.image}
            stripeKey={getConfig().publicRuntimeConfig.publicStripeKey}
            currency="USD"
            email={me.email}
            token={res => this.onToken(res)}
          >{this.props.children}</StripeCheckout>
        )}
      </User>
    );
  }
}

export default TakeMyMoney;


