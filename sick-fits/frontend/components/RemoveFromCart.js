import { Mutation } from 'react-apollo'
import styled from 'styled-components'
import PropTypes from 'prop-types'
import gql from 'graphql-tag'
import { CURRENT_USER_QUERY } from './User'

const REMOVE_FROM_CART_MUTATION = gql`
  mutation REMOVE_FROM_CART_MUTATION($id: ID!) {
    removeFromCart(id: $id) {
      id
    }
  }
`

const BigButton = styled.button`
  font-size: 3rem;
  background: none;
  border: 0;
  &:hover {
    color: ${props => props.theme.red};
    cursor: pointer;
  }
`

class RemoveFromCart extends React.Component {
  static propTypes = {
    id: PropTypes.string.isRequired
  }

  render() {
    return (
    <Mutation
      variables={{ id: this.props.id }}
      mutation={REMOVE_FROM_CART_MUTATION}
      // refetchQueries={[{ query:  }]}
    >
      {(removeFromCart, { loading, error }) => (
        <BigButton
          onClick={() => {
            removeFromCart().catch(err => alert(err))
          }}
          disabled={loading}
          title={"Delete Item"}
        >
          &times;

        </BigButton>
      )}
    </Mutation>
    )
  }
}

export default RemoveFromCart