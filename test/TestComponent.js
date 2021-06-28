let TestComponent;
import React from 'react';
import ReactDOM from 'react-dom';
import TestUtils from 'react-addons-test-utils';
const R = React.createElement;

export default TestComponent = class TestComponent {
  constructor(elem) {
    this.comp = TestUtils.renderIntoDocument(
      React.createElement(ComponentWrapper, {elem}));
  }

  setElement(elem) {
    return this.comp.setElement(elem);
  }

  getComponent() {
    return this.comp.getComponent();
  }

  getComponentNode() {
    return this.comp.getComponentNode();
  }
};

// Wraps a react component, re-render
class ComponentWrapper extends React.Component {
  constructor(props) {
    this.setElement = this.setElement.bind(this);
    super(props);
    this.state = { elem: this.props.elem };
  }

  setElement(elem) {
    return this.setState({elem});
  }

  getComponent() {
    return this.refs.comp;
  }

  getComponentNode() {
    return ReactDOM.findDOMNode(this.refs.comp);
  }

  render() {
    return R('div', null,
      React.cloneElement(this.state.elem, {ref: "comp"}));
  }
}

