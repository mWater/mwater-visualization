var H, QueryDataLoadingComponent, React, _,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

React = require('react');

H = React.DOM;

_ = require('lodash');

module.exports = QueryDataLoadingComponent = (function(superClass) {
  extend(QueryDataLoadingComponent, superClass);

  QueryDataLoadingComponent.propTypes = {
    elemFactory: React.PropTypes.func,
    queries: React.PropTypes.any,
    dataSource: React.PropTypes.func.isRequired
  };

  function QueryDataLoadingComponent(props) {
    QueryDataLoadingComponent.__super__.constructor.apply(this, arguments);
    this.state = {
      currentElem: null,
      loadingQueries: null
    };
  }

  QueryDataLoadingComponent.prototype.componentDidMount = function() {
    return this.update();
  };

  QueryDataLoadingComponent.prototype.componentDidUpdate = function(prevProps, prevState) {
    if (prevProps.elemFactory !== this.props.elemFactory || !_.isEqual(this.props.queries, prevProps.queries)) {
      return this.update();
    }
  };

  QueryDataLoadingComponent.prototype.update = function(prevProps, prevState) {
    var loadingQueries;
    if (this.state.loadingQueries) {
      return;
    }
    if (this.props.elemFactory && this.props.queries) {
      loadingQueries = this.props.queries;
      this.setState({
        loadingQueries: loadingQueries
      });
      return this.props.dataSource(this.props.queries, (function(_this) {
        return function(err, data) {
          var elem;
          if (_.isEqual(loadingQueries, _this.props.queries)) {
            if (err) {
              return _this.setState({
                currentElem: H.div({
                  className: "alert alert-danger"
                }, "Error loading data"),
                loadingQueries: null
              });
            } else {
              elem = _this.props.elemFactory(data);
              return _this.setState({
                currentElem: elem,
                loadingQueries: null
              });
            }
          } else {
            _this.setState({
              loadingQueries: null
            });
            return _this.update();
          }
        };
      })(this));
    }
  };

  QueryDataLoadingComponent.prototype.render = function() {
    var style;
    style = {
      width: "100%",
      height: "100%"
    };
    if (this.state.loadingQueries) {
      style.opacity = 0.5;
    }
    if (!this.props.elemFactory || !this.props.queries || !this.state.currentElem) {
      style.backgroundColor = "#E0E0E0";
      style.opacity = 0.35;
    }
    return H.div({
      style: style
    }, this.state.currentElem);
  };

  return QueryDataLoadingComponent;

})(React.Component);
