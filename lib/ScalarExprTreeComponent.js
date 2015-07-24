var H, HoverComponent, React, ScalarExprTreeComponent, ScalarExprTreeLeafComponent, ScalarExprTreeNodeComponent, ScalarExprTreeTreeComponent,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty,
  bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

HoverComponent = require('./HoverComponent');

React = require('react');

H = React.DOM;

module.exports = ScalarExprTreeComponent = (function(superClass) {
  extend(ScalarExprTreeComponent, superClass);

  function ScalarExprTreeComponent() {
    return ScalarExprTreeComponent.__super__.constructor.apply(this, arguments);
  }

  ScalarExprTreeComponent.propTypes = {
    tree: React.PropTypes.array.isRequired,
    value: React.PropTypes.object,
    onChange: React.PropTypes.func.isRequired,
    height: React.PropTypes.number.isRequired
  };

  ScalarExprTreeComponent.prototype.render = function() {
    return H.div({
      style: {
        overflowY: "scroll",
        height: this.props.height,
        border: "solid 1px #CCC"
      }
    }, React.createElement(ScalarExprTreeTreeComponent, {
      tree: this.props.tree,
      value: this.props.value,
      onChange: this.props.onChange,
      frame: this
    }));
  };

  return ScalarExprTreeComponent;

})(React.Component);

ScalarExprTreeTreeComponent = (function(superClass) {
  extend(ScalarExprTreeTreeComponent, superClass);

  function ScalarExprTreeTreeComponent() {
    return ScalarExprTreeTreeComponent.__super__.constructor.apply(this, arguments);
  }

  ScalarExprTreeTreeComponent.propTypes = {
    tree: React.PropTypes.array.isRequired,
    value: React.PropTypes.object,
    onChange: React.PropTypes.func.isRequired,
    frame: React.PropTypes.element
  };

  ScalarExprTreeTreeComponent.prototype.render = function() {
    var elems, i, item, len, ref;
    elems = [];
    ref = this.props.tree;
    for (i = 0, len = ref.length; i < len; i++) {
      item = ref[i];
      if (item.children) {
        elems.push(React.createElement(ScalarExprTreeNodeComponent, {
          item: item,
          onChange: this.props.onChange,
          value: this.props.value,
          frame: this.props.frame
        }));
      } else {
        elems.push(React.createElement(HoverComponent, {
          key: item.name
        }, React.createElement(ScalarExprTreeLeafComponent, {
          item: item,
          onChange: this.props.onChange,
          value: this.props.value,
          frame: this.props.frame
        })));
      }
    }
    return H.div(null, elems);
  };

  return ScalarExprTreeTreeComponent;

})(React.Component);

ScalarExprTreeLeafComponent = (function(superClass) {
  extend(ScalarExprTreeLeafComponent, superClass);

  function ScalarExprTreeLeafComponent() {
    this.handleClick = bind(this.handleClick, this);
    return ScalarExprTreeLeafComponent.__super__.constructor.apply(this, arguments);
  }

  ScalarExprTreeLeafComponent.prototype.handleClick = function() {
    return this.props.onChange(this.props.item.value);
  };

  ScalarExprTreeLeafComponent.prototype.isSelected = function() {
    return this.props.value && _.isEqual(this.props.value, this.props.item.value);
  };

  ScalarExprTreeLeafComponent.prototype.componentDidMount = function() {
    var frame, leaf;
    if (this.props.frame && this.isSelected()) {
      leaf = React.findDOMNode(this);
      frame = React.findDOMNode(this.props.frame);
      return window.requestAnimationFrame(function() {
        return frame.scrollTop = leaf.offsetTop - 60;
      });
    }
  };

  ScalarExprTreeLeafComponent.prototype.render = function() {
    var style;
    style = {
      padding: 4,
      borderRadius: 4,
      cursor: "pointer"
    };
    if (this.isSelected()) {
      style.color = "#EEE";
      style.backgroundColor = this.props.hovered ? "#286090" : "#337AB7";
    } else if (this.props.hovered) {
      style.backgroundColor = "#EEE";
    }
    return H.div({
      style: style,
      onClick: this.handleClick
    }, this.props.item.name);
  };

  return ScalarExprTreeLeafComponent;

})(React.Component);

ScalarExprTreeNodeComponent = (function(superClass) {
  extend(ScalarExprTreeNodeComponent, superClass);

  function ScalarExprTreeNodeComponent(props) {
    this.handleArrowClick = bind(this.handleArrowClick, this);
    ScalarExprTreeNodeComponent.__super__.constructor.apply(this, arguments);
    this.state = {
      collapse: this.props.item.initiallyOpen ? "open" : "closed"
    };
  }

  ScalarExprTreeNodeComponent.prototype.handleArrowClick = function() {
    if (this.state.collapse === "open") {
      return this.setState({
        collapse: "closed"
      });
    } else if (this.state.collapse === "closed") {
      return this.setState({
        collapse: "open"
      });
    }
  };

  ScalarExprTreeNodeComponent.prototype.render = function() {
    var arrow, children;
    arrow = null;
    if (this.state.collapse === "closed") {
      arrow = H.span({
        className: "glyphicon glyphicon-triangle-right"
      });
    } else if (this.state.collapse === "open") {
      arrow = H.span({
        className: "glyphicon glyphicon-triangle-bottom"
      });
    }
    if (this.state.collapse === "open") {
      children = H.div({
        style: {
          paddingLeft: 25
        },
        key: "tree"
      }, React.createElement(ScalarExprTreeTreeComponent, {
        tree: this.props.item.children(),
        onChange: this.props.onChange,
        value: this.props.value,
        frame: this.props.frame
      }));
    }
    return H.div(null, H.div({
      onClick: this.handleArrowClick,
      style: {
        cursor: "pointer",
        padding: 4
      },
      key: "arrow"
    }, H.span({
      style: {
        color: "#AAA",
        cursor: "pointer",
        paddingRight: 3
      }
    }, arrow), this.props.item.name), children);
  };

  return ScalarExprTreeNodeComponent;

})(React.Component);
