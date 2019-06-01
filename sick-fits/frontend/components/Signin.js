import React, { Component } from 'react'
import { Mutation } from 'react-apollo'
import gql from 'graphql-tag'
import Form from './styles/Form'
import Error from './ErrorMessage'
import { CURRENT_USER_QUERY } from './User'

const SIGNIN_MUTATION = gql`
  mutation SIGNIN_MUTATION($email: String!, $password: String!) {
    signin(email: $email, password: $password) {
      id
      name
      email
    }
  }
`

const getIntialValues = () => {
  return {
    email: '',
    password: ''
  }
}

class Signin extends Component {
  state = {
    ...getIntialValues()
  }

  saveToState = e => {
    this.setState({ [e.target.name]: e.target.value })
  }

  handleSubmit = signup => async e => {
    e.preventDefault()
    await signup()
    this.setState({ ...getIntialValues() })
  }

  render() {
    return (
      <Mutation
        refetchQueries={[{ query: CURRENT_USER_QUERY }]}
        mutation={SIGNIN_MUTATION}
        variables={this.state}
      >
        {(signup, { error, loading }) => (
          <Form
            method="post"
            onSubmit={this.handleSubmit(signup)}
          >
            <fieldset disabled={loading} aria-busy={loading}>
              <h2>Sign in</h2>
              <Error error={error} />
              <label htmlFor="email">
                Email
                <input
                  type="email"
                  name="email"
                  placeholder="email"
                  value={this.state.email}
                  onChange={this.saveToState}
                />
              </label>
              <label htmlFor="password">
                Password
                <input
                  type="password"
                  name="password"
                  placeholder="password"
                  value={this.state.password}
                  onChange={this.saveToState}
                />
              </label>

              <button type="submit">Sign in</button>
            </fieldset>
          </Form>
        )}
      </Mutation>
    )
  }
}

export default Signin