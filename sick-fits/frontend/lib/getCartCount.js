const getCartCount = cart => {
  return cart.reduce((tally, item) => tally + item.quantity, 0)
}

export default getCartCount