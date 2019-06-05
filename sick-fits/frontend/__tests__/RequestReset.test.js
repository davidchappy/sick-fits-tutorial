import { mount } from 'enzyme'
import wait from 'waait'
import toJSON from 'enzyme-to-json'
import RequestReset, { REQUEST_RESET_MUTATION } from '../components/RequestReset'
import { MockedProvider } from 'react-apollo/test-utils'

const mocks = [
  {
    request: {
      query: REQUEST_RESET_MUTATION,
      variables: { email: 'davidchappy@gmail.com' }
    },
    result: {
      data: { requestReset: { message: 'success', __typename: 'Message' } }
    }
  }
]

describe('<RequestReset />', () => {
  it('renders and matches snapshot', async () => {
    const wrapper = mount(
      <MockedProvider>
        <RequestReset />
      </MockedProvider>
    )
    const form = wrapper.find('form[data-test="form"]')
    expect(toJSON(form)).toMatchSnapshot()
    // console.log(wrapper.debug())
  })

  it('calls the mutation', async () => {
    const wrapper = mount(
      <MockedProvider mocks={mocks}>
        <RequestReset />
      </MockedProvider>
    )

    // simulate typing an email address
    wrapper
      .find('input')
      .simulate('change', { target: { name: 'email', value: 'davidchappy@gmail.com' } })

    // submit form
    wrapper.find('form').simulate('submit')

    await wait(50)
    wrapper.update()
    const success = wrapper.find('p')
    expect(success.text()).toContain('reset')
    expect(toJSON(success)).toMatchSnapshot()
    // console.log(success.debug())
  })
})
