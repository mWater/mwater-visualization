var $, Child, Parent, R, React, ReactDOM, VerticalLayoutComponent,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

React = require('react');

ReactDOM = require('react-dom');

R = React.createElement;

$ = require('jquery');

VerticalLayoutComponent = require('./VerticalLayoutComponent');

Parent = (function(superClass) {
  extend(Parent, superClass);

  function Parent() {
    return Parent.__super__.constructor.apply(this, arguments);
  }

  Parent.prototype.componentDidMount = function() {
    return console.log(this.refs);
  };

  Parent.prototype.render = function() {
    return R('div', null, R('div', {
      ref: "simple"
    }, R('div', {
      ref: "complex"
    })), React.createElement(Child, {}, R('div', {
      ref: "simple2"
    }, R('div', {
      ref: "complex2"
    }))));
  };

  return Parent;

})(React.Component);

Child = (function(superClass) {
  extend(Child, superClass);

  function Child() {
    return Child.__super__.constructor.apply(this, arguments);
  }

  Child.prototype.render = function() {
    return R('div', {
      style: {
        height: this.props.height,
        backgroundColor: this.props.backgroundColor
      }
    }, this.props.children);
  };

  return Child;

})(React.Component);

$(function() {
  var sample;
  sample = React.createElement(VerticalLayoutComponent, {
    height: 200,
    relativeHeights: {
      a: 0.6,
      b: 0.4
    }
  }, React.createElement(Child, {
    key: "a",
    backgroundColor: "red"
  }), React.createElement(Child, {
    key: "b",
    backgroundColor: "green"
  }), React.createElement(Child, {
    key: "c",
    backgroundColor: "blue",
    height: 50
  }));
  return ReactDOM.render(sample, document.body);
});
