// TODO: This file was created by bulk-decaffeinate.
// Sanity-check the conversion and remove this comment.
let UpdateableComponent;
import _ from 'lodash';
import React from 'react';

// Convenience wrapper that allows updating state
export default UpdateableComponent = class UpdateableComponent extends React.Component {
  constructor(props) {
    super(props);
    this.state = _.clone(this.props || {});
  }

  // Creates update function
  update = name => {
    return value => {
      const upt = {};
      upt[name] = value;
      this.setState(upt);
      return console.log(JSON.stringify(upt, null, 2));
    };
  };
  // action("update")(upt)

  render() {
    return this.props.children(this.state, this.update);
  }
};

