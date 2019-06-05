import ItemComponent from '../components/Item'
import { shallow } from 'enzyme'

const fakeItem = {
  id: 'ABC123',
  title: 'A cool item',
  description: 'This item',
  price: 5000,
  image: 'dog.jpg',
  largeImage: 'largedog.jpg'
}

describe('<Item />', () => {
  const wrapper = shallow(<ItemComponent item={fakeItem}/>)

  it ('renders the image properly', () => {
    const img = wrapper.find('img')
    expect(img.props().src).toBe(fakeItem.image)
    expect(img.props().alt).toBe(fakeItem.title)
  })

  it('renders the price tag and title', () => {
    const PriceTag = wrapper.find('PriceTag')
    expect(PriceTag.children().text()).toBe('$50')

    expect(wrapper.find('Title a').text()).toBe(fakeItem.title)
  })

  it('renders out the buttons separately', () => {
    const buttonList = wrapper.find('.buttonList')
    console.log(buttonList.debug())

    expect(buttonList.children()).toHaveLength(3)
    expect(buttonList.find('Link')).toHaveLength(1)
    expect(buttonList.find('AddToCart').exists()).toBe(true)
    // expect(buttonList.find('DeleteItem')).toHaveLength(1)
  })
})