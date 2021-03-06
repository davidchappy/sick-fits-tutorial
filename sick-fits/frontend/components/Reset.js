import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { Mutation } from 'react-apollo'
import gql from 'graphql-tag'
import Router from "next/router"

import Form from './styles/Form'
import Error from './ErrorMessage'
import { CURRENT_USER_QUERY } from './User'

const RESET_PASSWORD_MUTATION = gql`
  mutation RESET_PASSWORD_MUTATION($resetToken: String!, $password: String!, $confirmPassword: String!) {
    resetPassword(resetToken: $resetToken, password: $password, confirmPassword: $confirmPassword) {
      id
      name
      email
    }
  }
`

const getIntialValues = () => {
  return {
    password: '',
    confirmPassword: ''
  }
}

class Reset extends Component {
  static propTypes = {
    resetToken: PropTypes.string.isRequired
  }
  state = {
    ...getIntialValues()
  }

  saveToState = e => {
    this.setState({ [e.target.name]: e.target.value })
  }

  handleSubmit = resetPassword => async e => {
    e.preventDefault()
    await resetPassword()
    this.setState({ ...getIntialValues() })
    Router.push('/')
  }

  render() {
    return (
      <Mutation
        mutation={RESET_PASSWORD_MUTATION}
        variables={{
          ...this.state,
          resetToken: this.props.resetToken
        }}
        refetchQueries={[{ query: CURRENT_USER_QUERY }]}
      >
        {(resetPassword, { error, loading }) => (
          <Form
            method="post"
            onSubmit={this.handleSubmit(resetPassword)}
          >
            <fieldset disabled={loading} aria-busy={loading}>
              <h2>Rest your password</h2>
              <Error error={error} />
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

              <label htmlFor="confirmPassword">
                Confirm your password
                <input
                  type="password"
                  name="confirmPassword"
                  placeholder="confirm password"
                  value={this.state.confirmPassword}
                  onChange={this.saveToState}
                />
              </label>

              <button type="submit">Reset password</button>
            </fieldset>
          </Form>
        )}
      </Mutation>
    )
  }
}

export default Reset