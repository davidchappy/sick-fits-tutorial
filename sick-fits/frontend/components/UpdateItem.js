import React, { Component } from 'react'
import { Mutation, Query } from 'react-apollo'
import gql from 'graphql-tag'
import Router from 'next/router'

import Error from './ErrorMessage'
import Form from './styles/Form'
import formatMoney from '../lib/formatMoney'

const SINGLE_ITEM_QUERY = gql`
  query SINGLE_ITEM_QUERY($id: ID!) {
    item(where: { id: $id }) {
      id
      title
      description
      image
      largeImage
      price
    }
  }
`

const UPDATE_ITEM_MUTATION = gql`
  mutation UPDATE_ITEM_MUTATION(
    $id: ID!
    $title: String
    $description: String
    $price: Int
  ) {
    updateItem(
      id: $id
      title: $title
      description: $description
      price: $price
    ) {
      id
      title
      description
      price
    }
  }
`

class UpdateItem extends Component {
  state = {

  }

  handleChange = event => {
    const { name, type, value } = event.target

    const val = type === 'number' ? parseFloat(value) : value

    this.setState({
      [name]: val
    })
  }

  handleUpdate = updateItem => async event => {
    // Stop the form from submitting
    event.preventDefault()

    // Call the mutation
    const res = await updateItem({
      variables: {
        id: this.props.id,
        ...this.state
      }
    })
  }

  render() {
    return (
      <Query
        query={SINGLE_ITEM_QUERY}
        variables={{ id: this.props.id }}
      >
        {({ data, loading }) => {
          if (loading) return <p>Loading...</p>
          if (!data.item) return <p>No item found for ID {this.props.id}</p>
          return (
            <Mutation
              mutation={UPDATE_ITEM_MUTATION}
              variables={this.state}
            >
              {(updateItem, { loading, error }) => (
                <Form onSubmit={this.handleUpdate(updateItem)}>
                  <Error error={error}/>
                  <fieldset disabled={loading} aria-busy={loading} >
                    <label htmlFor="title">
                      Title
                      <input
                        type="text"
                        id="title"
                        name="title"
                        placeholder="Title"
                        required
                        defaultValue={data.item.title}
                        onChange={this.handleChange}
                      />
                    </label>

                    <label htmlFor="price">
                      Price
                      <input
                        type="number"
                        id="price"
                        name="price"
                        placeholder="Price"
                        required
                        defaultValue={data.item.price}
                        onChange={this.handleChange}
                      />
                    </label>

                    <label htmlFor="description">
                      Description
                      <textarea
                        type="text"
                        id="description"
                        name="description"
                        placeholder="Description"
                        required
                        defaultValue={data.item.description}
                        onChange={this.handleChange}
                      />
                    </label>
                    <button type="submit">Sav{loading ? "ing" : "e"} Changes</button>
                  </fieldset>
                </Form>
              )}
            </Mutation>
          )
        }}
      </Query>
    )
  }
}

export default UpdateItem
export { UPDATE_ITEM_MUTATION }