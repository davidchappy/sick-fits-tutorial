import React, { Component } from 'react'
import { Query } from 'react-apollo'
import styled from "styled-components"
import gql from 'graphql-tag'

import Item from "./Item"

const ALL_ITEMS_QUERY = gql`
  query ALL_ITEMS_QUERY {
    items {
      id
      title
      price
      description
      image
      largeImage
    }
  }
`

const Center = styled.div`
  text-align: center;
`

const ItemsList = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  grid-gap: 60px;
  max-width: ${props => props.theme.maxWidth};
  margin: 0 auto;
`

export default class Items extends Component {
  render() {
    return (
      <Center>
        <Query
          query={ALL_ITEMS_QUERY}
        >
          {({ data, loading, error }) => {
            if (loading) return <p>Loading...</p>
            if (error) return <p>Error: {error}</p>
            return (
              <ItemsList>
                {data.items.map(item => (
                  <Item
                    key={item.id}
                    item={item}
                  />
                ))}
              </ItemsList>
            )
          }}
        </Query>
      </Center>
    )
  }
}

export { ALL_ITEMS_QUERY }