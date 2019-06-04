import Downshift from 'downshift'
import Router from 'next/router'
import { ApolloConsumer } from 'react-apollo'
import gql from 'graphql-tag'
import debounce from 'lodash.debounce'
import { DropDown, DropDownItem, SearchStyles } from './styles/DropDown'

const SEARCH_ITEMS_QUERY = gql`
  query SEARCH_ITEMS_QUERY($searchTerm: String!) {
    items(where: {
      OR: [
        { title_contains: $searchTerm },
        { description_contains: $searchTerm }
      ]
    }) {
      id
      image
      title
    }
  }
`

class AutoComplete extends React.Component {
  state = {
    items: [],
    loading: false
  }

  handleSearchChange = debounce(async (event, client) => {
    this.setState({ loading: true })

    // manually query apollo client
    const res = await client.query({
      query: SEARCH_ITEMS_QUERY,
      variables: { searchTerm: event.target.value }
    })

    this.setState({
      items: res.data.items,
      loading: false
    })
  }, 350)

  render() {
    return (
      <SearchStyles>
        <div>
          <ApolloConsumer>
            {client => {
              return (
                <input
                  type="search"
                  name="search"
                  id="search"
                  onChange={event => {
                    // use events in React after render!!
                    event.persist()
                    this.handleSearchChange(event, client)
                  }}
                />
              )
            }}
          </ApolloConsumer>
          <DropDown>
            {this.state.items.map(item => (
              <DropDownItem key={item.id}>
                <img width="50" src={item.image} alt={item.title}/>
                {item.title}
              </DropDownItem>
            ))}
            <p>Items go here</p>
          </DropDown>
        </div>
      </SearchStyles>
    )
  }
}

export default AutoComplete;