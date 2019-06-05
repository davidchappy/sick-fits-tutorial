import { Query } from 'react-apollo'
import gql from 'graphql-tag'
import { format, formatDistance } from 'date-fns'
import Link from 'next/link'
import styled from 'styled-components'

import getCartCount from '../lib/getCartCount'
import formatMoney from '../lib/formatMoney'
import OrderItemStyles from './styles/OrderItemStyles'
import { createdAtStandard } from '../lib/dateFormats'
import Error from './ErrorMessage'

const ORDERS_QUERY = gql`
  query ORDERS_QUERY {
    orders(orderBy: createdAt_DESC) {
      id
      items {
        id
        title
        description
        image
        price
        quantity
      }
      total
      createdAt
    }
  }
`

const OrderUL = styled.ul`
  display: grid;
  grid-gap: 4rem;
  grid-template-columns: repeat(auto-fit, minmax(40%, 1fr));
`

class OrderList extends React.Component {
  render() {
    return (
      <Query
        query={ORDERS_QUERY}
      >
        {({ data: { orders }, loading, error }) => {
          if (loading) return <p>Loading...</p>
          if (error) return <Error error={error} />
          return (
            <div>
              <h2>You have {orders.length} orders</h2>
              <OrderUL>
                {orders.map(order => (
                  <OrderItemStyles key={order.id}>
                    <Link href={{
                      pathname: '/order',
                      query: { id: order.id }
                    }}>
                      <a>
                        <div className="order-meta">
                          <p>{getCartCount(order.items)} Total Items</p>
                          <p>{order.items.length} Product Types</p>
                          <p>{formatDistance(order.createdAt, new Date())} ago</p>
                          <p>{formatMoney(order.total)}</p>
                        </div>
                        <div className="images">
                          {order.items.map(item => (
                            <img key={item.id} src={item.image} alt={item.title} />
                          ))}
                        </div>
                      </a>
                    </Link>

                  </OrderItemStyles>
                ))}
              </OrderUL>
            </div>
          )
        }}
      </Query>
    )
  }
}

export default OrderList