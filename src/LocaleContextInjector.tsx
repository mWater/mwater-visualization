import React from "react"
import PropTypes from 'prop-types'

/** Adds the locale to the context */
export default class LocaleContextInjector extends React.Component<{ locale: string }> { 
  static childContextTypes = {
    locale: PropTypes.string
  }

  getChildContext() {
    return { locale: this.props.locale }
  } 

  render() {
    return this.props.children
  }
}