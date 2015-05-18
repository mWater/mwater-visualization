var H, HoverMixin, JoinExprLeafComponent, JoinExprNodeComponent, JoinExprTreeComponent;

HoverMixin = require('./HoverMixin');

H = React.DOM;

module.exports = JoinExprTreeComponent = React.createClass({
  propTypes: {
    tree: React.PropTypes.array.isRequired,
    selectedValue: React.PropTypes.object,
    onSelect: React.PropTypes.func.isRequired
  },
  render: function() {
    var elems, i, item, len, ref;
    elems = [];
    ref = this.props.tree;
    for (i = 0, len = ref.length; i < len; i++) {
      item = ref[i];
      if (item.getChildren == null) {
        elems.push(React.createElement(JoinExprLeafComponent, {
          item: item,
          onSelect: this.props.onSelect,
          selectedValue: this.props.selectedValue
        }));
      } else {
        elems.push(React.createElement(JoinExprNodeComponent, {
          item: item,
          onSelect: this.props.onSelect,
          selectedValue: this.props.selectedValue
        }));
      }
    }
    return H.div(null, elems);
  }
});

JoinExprLeafComponent = React.createClass({
  mixins: [HoverMixin],
  handleClick: function() {
    return this.props.onSelect(this.props.item.value);
  },
  render: function() {
    var selected, style, typeElemStyle, typeElemText;
    style = {
      padding: 4,
      borderRadius: 4,
      cursor: "pointer"
    };
    selected = _.isEqual(this.props.selectedValue, this.props.item.value);
    if (selected) {
      style.color = "#EEE";
      style.backgroundColor = this.state.hovered ? "#286090" : "#337AB7";
    } else if (this.state.hovered) {
      style.backgroundColor = "#CCC";
    }
    typeElemStyle = {
      color: "#999",
      fontStyle: "italic",
      fontSize: "60%",
      display: "inline-block",
      paddingLeft: 6
    };
    switch (this.props.item.type) {
      case "uuid":
        typeElemText = "#";
        break;
      case "decimal":
        typeElemText = "123.4";
        break;
      case "integer":
        typeElemText = "123";
        break;
      case "text":
        typeElemText = "abc";
        break;
      case "enum":
        typeElemText = "choice";
    }
    return H.div({
      style: style,
      onClick: this.handleClick
    }, this.props.item.name, H.div({
      style: typeElemStyle
    }, typeElemText));
  }
});

JoinExprNodeComponent = React.createClass({
  getInitialState: function() {
    if (this.props.item.value.joinIds.length < 1) {
      return {
        collapse: "open"
      };
    }
    return {
      collapse: "closed"
    };
  },
  handleArrowClick: function() {
    if (this.state.collapse === "open") {
      return this.setState({
        collapse: "closed"
      });
    } else if (this.state.collapse === "closed") {
      return this.setState({
        collapse: "open"
      });
    }
  },
  render: function() {
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
        }
      }, React.createElement(JoinExprTreeComponent, {
        tree: this.props.item.getChildren(),
        onSelect: this.props.onSelect,
        selectedValue: this.props.selectedValue
      }));
    }
    return H.div(null, H.div({
      onClick: this.handleArrowClick,
      style: {
        cursor: "pointer",
        padding: 4
      }
    }, H.span({
      style: {
        color: "#AAA",
        cursor: "pointer",
        paddingRight: 3
      }
    }, arrow), this.props.item.name), children);
  }
});
