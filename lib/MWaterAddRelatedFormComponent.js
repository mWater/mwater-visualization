var AddRelatedFormModalComponent, ExprUtils, H, MWaterAddRelatedFormComponent, ModalPopupComponent, R, React, _, formUtils, moment, querystring, ui,
  bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

_ = require('lodash');

React = require('react');

H = React.DOM;

R = React.createElement;

moment = require('moment');

ModalPopupComponent = require('react-library/lib/ModalPopupComponent');

querystring = require('querystring');

ExprUtils = require('mwater-expressions').ExprUtils;

ui = require('./UIComponents');

formUtils = require('mwater-forms/lib/formUtils');

module.exports = MWaterAddRelatedFormComponent = (function(superClass) {
  extend(MWaterAddRelatedFormComponent, superClass);

  MWaterAddRelatedFormComponent.propTypes = {
    table: React.PropTypes.string.isRequired,
    apiUrl: React.PropTypes.string.isRequired,
    client: React.PropTypes.string,
    user: React.PropTypes.string,
    onSelect: React.PropTypes.func.isRequired,
    schema: React.PropTypes.object.isRequired
  };

  function MWaterAddRelatedFormComponent() {
    this.handleSelect = bind(this.handleSelect, this);
    this.handleOpen = bind(this.handleOpen, this);
    MWaterAddRelatedFormComponent.__super__.constructor.apply(this, arguments);
    this.state = {
      open: false,
      waitingForTable: null
    };
  }

  MWaterAddRelatedFormComponent.prototype.componentWillReceiveProps = function(nextProps) {
    if (this.state.waitingForTable && nextProps.schema.getTable(this.state.waitingForTable)) {
      return this.setState({
        waitingForTable: null
      });
    }
  };

  MWaterAddRelatedFormComponent.prototype.handleOpen = function() {
    return this.setState({
      open: true
    });
  };

  MWaterAddRelatedFormComponent.prototype.handleSelect = function(table) {
    this.setState({
      open: false
    });
    if (!this.props.schema.getTable(table)) {
      this.setState({
        waitingForTable: table
      });
    }
    return this.props.onSelect(table);
  };

  MWaterAddRelatedFormComponent.prototype.render = function() {
    return H.div(null, this.state.waitingForTable ? H.div(null, H.i({
      className: "fa fa-spin fa-spinner"
    }), " Adding...") : H.a({
      className: "btn btn-link",
      onClick: this.handleOpen
    }, "+ Add Related Form"), this.state.open ? R(AddRelatedFormModalComponent, {
      table: this.props.table,
      apiUrl: this.props.apiUrl,
      client: this.props.client,
      user: this.props.user,
      onSelect: this.handleSelect,
      onCancel: (function(_this) {
        return function() {
          return _this.setState({
            open: false
          });
        };
      })(this)
    }) : void 0);
  };

  return MWaterAddRelatedFormComponent;

})(React.Component);

AddRelatedFormModalComponent = (function(superClass) {
  extend(AddRelatedFormModalComponent, superClass);

  AddRelatedFormModalComponent.propTypes = {
    table: React.PropTypes.string.isRequired,
    apiUrl: React.PropTypes.string.isRequired,
    client: React.PropTypes.string,
    user: React.PropTypes.string,
    onSelect: React.PropTypes.func.isRequired,
    onCancel: React.PropTypes.func.isRequired
  };

  AddRelatedFormModalComponent.contextTypes = {
    locale: React.PropTypes.string
  };

  function AddRelatedFormModalComponent() {
    AddRelatedFormModalComponent.__super__.constructor.apply(this, arguments);
    this.state = {
      items: null,
      search: ""
    };
  }

  AddRelatedFormModalComponent.prototype.componentDidMount = function() {
    var query;
    query = {};
    query.selector = JSON.stringify({
      state: {
        $ne: "deleted"
      }
    });
    if (this.props.client) {
      query.client = this.props.client;
    }
    return $.getJSON(this.props.apiUrl + "forms?" + querystring.stringify(query), (function(_this) {
      return function(forms) {
        var items;
        forms = _.sortByOrder(forms, [
          function(form) {
            if (form.created.by === _this.props.user) {
              return 1;
            } else {
              return 0;
            }
          }, function(form) {
            return form.modified.on;
          }
        ], ['desc', 'desc']);
        forms = _.filter(forms, function(form) {
          return formUtils.findEntityQuestion(form.design, _this.props.table.split(".")[1]);
        });
        items = _.map(forms, function(form) {
          return {
            name: ExprUtils.localizeString(form.design.name, _this.context.locale),
            desc: "Modified " + (moment(form.modified.on, moment.ISO_8601).format("ll")),
            onClick: _this.props.onSelect.bind(null, "responses:" + form._id)
          };
        });
        return _this.setState({
          items: items
        });
      };
    })(this)).fail((function(_this) {
      return function(xhr) {
        return _this.setState({
          error: xhr.responseText
        });
      };
    })(this));
  };

  AddRelatedFormModalComponent.prototype.renderContents = function() {
    var items, searchStringRegExp;
    if (!this.state.items) {
      return H.div({
        className: "alert alert-info"
      }, H.i({
        className: "fa fa-spin fa-spinner"
      }), " Loading...");
    }
    items = this.state.items;
    if (this.state.search) {
      searchStringRegExp = new RegExp(_.escapeRegExp(this.state.search), "i");
      items = _.filter(items, (function(_this) {
        return function(item) {
          return item.name.match(searchStringRegExp);
        };
      })(this));
    }
    return H.div(null, H.input({
      type: "text",
      className: "form-control",
      placeholder: "Search...",
      key: "search",
      ref: this.searchRef,
      style: {
        marginBottom: 10
      },
      value: this.state.search,
      onChange: (function(_this) {
        return function(ev) {
          return _this.setState({
            search: ev.target.value
          });
        };
      })(this)
    }), R(ui.OptionListComponent, {
      items: items
    }));
  };

  AddRelatedFormModalComponent.prototype.render = function() {
    return R(ModalPopupComponent, {
      showCloseX: true,
      onClose: this.props.onCancel,
      header: "Add Related Survey"
    }, this.renderContents());
  };

  return AddRelatedFormModalComponent;

})(React.Component);
