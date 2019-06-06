import React from 'react'
import { Mutation } from 'react-apollo'
import gql from 'graphql-tag'
import { CURRENT_USER_QUERY } from './User'

const ADD_TO_CART_MUTATION = gql`
  mutation ADD_TO_CART_MUTATION($id: ID!) {
    addToCart(id: $id) {
      id
      quantity
    }
  }
`

class AddToCart extends React.Component {
  render() {
    const { id } = this.props

    return (
      <Mutation
        mutation={ADD_TO_CART_MUTATION}
        refetchQueries={[{ query: CURRENT_USER_QUERY }]}
        variables={{ id }}
      >
        {(addToCart, { loading }) => (
          <button
            onClick={addToCart}
            disabled={loading}
          >
            Add{loading ? 'ing' : ''} to cart 🛒
          </button>
        )}
      </Mutation>
    )
  }
}

export default AddToCart
export { ADD_TO_CART_MUTATION }