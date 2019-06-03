import { Query } from 'react-apollo'
import gql from 'graphql-tag'
import PropTypes from 'prop-types'

import Error from './ErrorMessage'
import Table from './styles/Table'
import SickButton from './styles/SickButton'

const possiblePermissions = [
  `ADMIN`,
  `USER`,
  `ITEMCREATE`,
  `ITEMUPDATE`,
  `ITEMDELETE`,
  `PERMISSIONUPDATE`
]

const ALL_USERS_QUERY = gql`
  query ALL_USERS_QUERY {
    users {
      id
      name
      email
      permissions
    }
  }
`

const Permissions = props => (
  <Query query={ALL_USERS_QUERY}>
    {({ data, loading, error }) => {
      if (loading) return <p>Loading...</p>
      if (error) return <Error error={error}/>
      console.log({ data  })
      return (
        <div>
          <h2>Manage Permissions</h2>
          <Table>
            <thead>
              <tr>
                <th>Nme</th>
                <th>Email</th>
                {possiblePermissions.map(permission => (
                  <th key={permission}>{permission}</th>
                ))}
                <th>👇</th>
              </tr>
            </thead>
            <tbody>
              {data.users.map(user => (
                <UserPermissions user={user} key={user.id}/>
              ))}
            </tbody>
          </Table>
        </div>
      )
    }}
  </Query>
)

class UserPermissions extends React.Component {
  static propTypes = {
    user: PropTypes.shape({
      name: PropTypes.string,
      email: PropTypes.string,
      id: PropTypes.string,
      permissions: PropTypes.array
    }).isRequired
  }

  state = {
    permissions: this.props.user.permissions
  }

  handlePermissionChange = event => {
    let nextPermissions = [...this.state.permissions]
    const { checked, value } = event.target

    if (checked) {
      nextPermissions.push(value)
    } else {
      nextPermissions = nextPermissions.filter(permission => permission !== value)
    }

    this.setState({ permissions: nextPermissions })
  }

  render() {
    const { user } = this.props

    return (
      <tr>
        <td>{user.name}</td>
        <td>{user.email}</td>
        {possiblePermissions.map((permission, i) => (
          <td key={`${user.id}-permission-${permission}`}>
            <label htmlFor={`${user.id}-permission-${permission}`}>
              <input
                type='checkbox'
                checked={this.state.permissions.includes(permission)}
                value={permission}
                onChange={this.handlePermissionChange}
              />
            </label>
          </td>
        ))}
        <td><SickButton>Update</SickButton></td>
      </tr>
    )
  }
}

export default Permissions
