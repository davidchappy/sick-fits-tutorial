import { Query } from 'react-apollo'
import gql from 'graphql-tag'

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
                {possiblePermissions.map((permission, i) => (
                  <th key={i}>{permission}</th>
                ))}
                <th>👇</th>
              </tr>
            </thead>
            <tbody>
              {data.users.map(user => (
                <User user={user}  key={user.id}/>
              ))}
            </tbody>
          </Table>
        </div>
      )
    }}
  </Query>
)

class User extends React.Component {
  render() {
    const { user } = this.props

    return (
      <tr>
        <td>{user.name}</td>
        <td>{user.email}</td>
        {possiblePermissions.map((permission, i) => (
          <td key={i}>
            <label htmlFor={`${user.id}-permission-${permission}`}>
              <input type='checkbox' />
            </label>
          </td>
        ))}
        <td><SickButton>Update</SickButton></td>
      </tr>
    )
  }
}

export default Permissions
