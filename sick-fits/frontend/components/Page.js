import React, { Component } from 'react'
import styled, { ThemeProvider, injectGlobal } from "styled-components"
import Header from "./Header"
import Meta from "./Meta"

const theme = {
  red: '#ff0000',
  black: "#393939",
  grey: "#3a3a3a",
  offWhite: "#ededed",
  maxWidth: "1000px",
  bs: "0 12px 24px 0 rgba(0,0,0,0.09"
}

const StyledPage = styled.div`
  background: ${props => props.theme.offWhite};
  color: ${props => props.theme.black};
`

const Inner = styled.div`
  max-width: ${props => props.theme.maxWidth};
  background: ${props => props.theme.red};
  margin: 0 auto;
  padding: 2rem;
  background:red;
`

export default class Page extends Component {
  render() {
    return (
      <ThemeProvider theme={theme}>
        <StyledPage>
          <Meta />
          <Header />
          <Inner>{this.props.children}</Inner>
        </StyledPage>
      </ThemeProvider>
    )
  }
}
