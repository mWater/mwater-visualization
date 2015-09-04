var H, VerticalLayoutComponent,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

H = React.DOM;

module.exports = VerticalLayoutComponent = (function(superClass) {
  extend(VerticalLayoutComponent, superClass);

  VerticalLayoutComponent.propTypes = {
    height: React.PropTypes.number.isRequired,
    relativeHeights: React.PropTypes.object.isRequired
  };

  function VerticalLayoutComponent() {
    VerticalLayoutComponent.__super__.constructor.apply(this, arguments);
    this.state = {
      availableHeight: 0
    };
  }

  VerticalLayoutComponent.prototype.componentWillReceiveProps = function(nextProps) {
    if (nextProps.height !== this.props.height) {
      return this.recalculateSize(nextProps);
    }
  };

  VerticalLayoutComponent.prototype.componentDidMount = function() {
    return this.recalculateSize(this.props);
  };

  VerticalLayoutComponent.prototype.recalculateSize = function(props) {
    var availableHeight, child, i, len, node, ref;
    availableHeight = props.height;
    ref = props.children;
    for (i = 0, len = ref.length; i < len; i++) {
      child = ref[i];
      if (!child) {
        continue;
      }
      if (props.relativeHeights[child.key]) {
        continue;
      }
      node = React.findDOMNode(this.refs[child.key]);
      availableHeight -= $(node).outerHeight();
    }
    return this.setState({
      availableHeight: availableHeight
    });
  };

  VerticalLayoutComponent.prototype.getComponent = function(key) {
    return this.refs[key];
  };

  VerticalLayoutComponent.prototype.render = function() {
    return H.div({
      style: {
        height: this.props.height
      }
    }, React.Children.map(this.props.children, (function(_this) {
      return function(child) {
        var height;
        if (!child) {
          return;
        }
        if (child.key && _this.props.relativeHeights[child.key]) {
          if (_this.state.availableHeight) {
            height = _this.state.availableHeight * _this.props.relativeHeights[child.key];
            return H.div({
              style: {
                height: height,
                position: "relative"
              }
            }, H.div({
              style: {
                height: height
              },
              ref: child.key
            }, React.cloneElement(child, {
              height: height
            })));
          }
          return null;
        }
        return H.div({
          ref: child.key
        }, child);
      };
    })(this)));
  };

  return VerticalLayoutComponent;

})(React.Component);
