var H, LargeListComponent, LoadedPageComponent, LoadingPageComponent, React, _, shallowequal,
  bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty,
  indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

React = require('react');

H = React.DOM;

_ = require('lodash');

shallowequal = require('shallowequal');

module.exports = LargeListComponent = (function(superClass) {
  extend(LargeListComponent, superClass);

  LargeListComponent.propTypes = {
    loadRows: React.PropTypes.func.isRequired,
    renderRow: React.PropTypes.func.isRequired,
    rowHeight: React.PropTypes.number.isRequired,
    pageSize: React.PropTypes.number.isRequired,
    height: React.PropTypes.number.isRequired,
    rowCount: React.PropTypes.number.isRequired,
    bufferSize: React.PropTypes.number.isRequired,
    useLoadingPlaceholder: React.PropTypes.bool
  };

  function LargeListComponent(props) {
    this.renderLoadingPage = bind(this.renderLoadingPage, this);
    this.renderLoadedPage = bind(this.renderLoadedPage, this);
    this.handleScroll = bind(this.handleScroll, this);
    LargeListComponent.__super__.constructor.apply(this, arguments);
    this.state = {
      loadedPages: [],
      loadingPages: []
    };
    this.handleScroll = _.throttle(this.handleScroll, 250);
  }

  LargeListComponent.prototype.componentDidMount = function() {
    this.loadVisiblePages();
    return React.findDOMNode(this).addEventListener("scroll", this.handleScroll);
  };

  LargeListComponent.prototype.handleScroll = function(ev) {
    return this.loadVisiblePages();
  };

  LargeListComponent.prototype.componentWillReceiveProps = function(nextProps) {
    var key, refresh, reset, value;
    reset = false;
    for (key in nextProps) {
      value = nextProps[key];
      if (this.props[key] !== value) {
        if (key !== "renderRow") {
          reset = true;
        } else {
          refresh = true;
        }
      }
    }
    if (reset) {
      return this.setState({
        loadedPages: [],
        loadingPages: []
      }, (function(_this) {
        return function() {
          return _this.loadVisiblePages();
        };
      })(this));
    }
  };

  LargeListComponent.prototype.shouldComponentUpdate = function(nextProps, nextState) {
    return !shallowequal(nextProps, this.props) || !shallowequal(nextState, this.state);
  };

  LargeListComponent.prototype.getPageRowCount = function(page) {
    return Math.min(this.props.pageSize, this.props.rowCount - page * this.props.pageSize);
  };

  LargeListComponent.prototype.loadVisiblePages = function() {
    var j, len, page, results, toLoadPages, visiblePages;
    visiblePages = this.getVisiblePages();
    toLoadPages = _.difference(visiblePages, this.state.loadingPages);
    toLoadPages = _.difference(toLoadPages, _.pluck(this.state.loadedPages, "page"));
    if (toLoadPages.length === 0) {
      return;
    }
    this.setState({
      loadingPages: _.union(toLoadPages, this.state.loadingPages)
    });
    results = [];
    for (j = 0, len = toLoadPages.length; j < len; j++) {
      page = toLoadPages[j];
      results.push((function(_this) {
        return function(page) {
          return _this.props.loadRows(page * _this.props.pageSize, _this.getPageRowCount(page), function(err, rows) {
            var loadedPages, loadingPages;
            loadingPages = _.without(_this.state.loadingPages, page);
            if (!err) {
              loadedPages = _this.state.loadedPages.slice();
              loadedPages.push({
                page: page,
                rows: rows
              });
              visiblePages = _this.getVisiblePages();
              loadedPages = _.filter(loadedPages, function(p) {
                var ref;
                return ref = p.page, indexOf.call(visiblePages, ref) >= 0;
              });
            }
            return _this.setState({
              loadingPages: loadingPages,
              loadedPages: loadedPages
            });
          });
        };
      })(this)(page));
    }
    return results;
  };

  LargeListComponent.prototype.getVisiblePages = function() {
    var maxPage, maxPixels, maxRow, minPage, minPixels, minRow;
    minPixels = React.findDOMNode(this).scrollTop;
    maxPixels = minPixels + this.props.height;
    minRow = Math.floor(minPixels / this.props.rowHeight);
    maxRow = Math.ceil(maxPixels / this.props.rowHeight);
    minRow -= this.props.bufferSize;
    maxRow += this.props.bufferSize;
    if (minRow < 0) {
      minRow = 0;
    }
    if (maxRow >= this.props.rowCount) {
      maxRow = this.props.rowCount - 1;
    }
    minPage = Math.floor(minRow / this.props.pageSize);
    maxPage = Math.floor(maxRow / this.props.pageSize);
    return _.range(minPage, maxPage + 1);
  };

  LargeListComponent.prototype.renderLoadedPage = function(loadedPage) {
    return React.createElement(LoadedPageComponent, {
      key: loadedPage.page,
      loadedPage: loadedPage,
      pageSize: this.props.pageSize,
      rowHeight: this.props.rowHeight,
      renderRow: this.props.renderRow
    });
  };

  LargeListComponent.prototype.renderLoadingPage = function(loadingPage) {
    return React.createElement(LoadingPageComponent, {
      key: loadingPage,
      loadingPage: loadingPage,
      pageSize: this.props.pageSize,
      rowHeight: this.props.rowHeight,
      renderRow: this.props.renderRow,
      rowCount: this.props.rowCount
    });
  };

  LargeListComponent.prototype.render = function() {
    return H.div({
      style: {
        height: this.props.height,
        overflowY: "scroll",
        position: "relative"
      }
    }, H.div({
      style: {
        height: this.props.rowHeight * this.props.rowCount
      }
    }, _.map(this.state.loadedPages, this.renderLoadedPage), this.props.useLoadingPlaceholder ? _.map(this.state.loadingPages, this.renderLoadingPage) : void 0));
  };

  return LargeListComponent;

})(React.Component);

LoadingPageComponent = (function(superClass) {
  extend(LoadingPageComponent, superClass);

  function LoadingPageComponent() {
    this.render = bind(this.render, this);
    return LoadingPageComponent.__super__.constructor.apply(this, arguments);
  }

  LoadingPageComponent.propTypes = {
    loadingPage: React.PropTypes.number.isRequired,
    renderRow: React.PropTypes.func.isRequired,
    rowHeight: React.PropTypes.number.isRequired,
    pageSize: React.PropTypes.number.isRequired,
    rowCount: React.PropTypes.number.isRequired
  };

  LoadingPageComponent.prototype.shouldComponentUpdate = function(nextProps, nextState) {
    return !shallowequal(nextProps, this.props);
  };

  LoadingPageComponent.prototype.getPageRowCount = function(page) {
    return Math.min(this.props.pageSize, this.props.rowCount - page * this.props.pageSize);
  };

  LoadingPageComponent.prototype.render = function(loadingPage) {
    loadingPage = this.props.loadingPage;
    return H.div({
      style: {
        position: "absolute",
        top: loadingPage * this.props.pageSize * this.props.rowHeight,
        left: 0,
        right: 0
      }
    }, _.map(_.range(0, this.getPageRowCount(loadingPage)), (function(_this) {
      return function(i) {
        return _this.props.renderRow(null, i + loadingPage * _this.props.pageSize);
      };
    })(this)));
  };

  return LoadingPageComponent;

})(React.Component);

LoadedPageComponent = (function(superClass) {
  extend(LoadedPageComponent, superClass);

  function LoadedPageComponent() {
    return LoadedPageComponent.__super__.constructor.apply(this, arguments);
  }

  LoadedPageComponent.propTypes = {
    loadedPage: React.PropTypes.object.isRequired,
    renderRow: React.PropTypes.func.isRequired,
    rowHeight: React.PropTypes.number.isRequired,
    pageSize: React.PropTypes.number.isRequired
  };

  LoadedPageComponent.prototype.shouldComponentUpdate = function(nextProps, nextState) {
    return !shallowequal(nextProps, this.props);
  };

  LoadedPageComponent.prototype.render = function() {
    var loadedPage;
    loadedPage = this.props.loadedPage;
    return H.div({
      style: {
        position: "absolute",
        top: loadedPage.page * this.props.pageSize * this.props.rowHeight,
        left: 0,
        right: 0
      }
    }, _.map(loadedPage.rows, (function(_this) {
      return function(row, i) {
        return _this.props.renderRow(row, i + loadedPage.page * _this.props.pageSize);
      };
    })(this)));
  };

  return LoadedPageComponent;

})(React.Component);
