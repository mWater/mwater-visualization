let ColorComponent;
import PropTypes from 'prop-types';
import React from 'react';
const R = React.createElement;

import ClickOutHandler from 'react-onclickout';
import { SketchPicker } from "react-color";
import { SwatchesPicker } from 'react-color';

// Simple color well with popup
export default ColorComponent = (function() {
  ColorComponent = class ColorComponent extends React.Component {
    static initClass() {
      this.propTypes = { 
        color: PropTypes.string,
        onChange: PropTypes.func
      };
    }

    constructor(props) {
      this.handleClick = this.handleClick.bind(this);
      this.handleClose = this.handleClose.bind(this);
      this.handleReset = this.handleReset.bind(this);
      this.handleTransparent = this.handleTransparent.bind(this);
      this.handleAdvanced = this.handleAdvanced.bind(this);
      super(props);
      this.state = { open: false, advanced: false };
    }

    handleClick() {
      return this.setState({open: !this.state.open, advanced: false});
    }

    handleClose(color) {
      return this.props.onChange(color.hex);
    }

    handleReset() {
      this.setState({open: false});
      return this.props.onChange(null);
    }

    handleTransparent() {
      this.setState({open: false});
      return this.props.onChange("transparent");
    }

    handleAdvanced() {
      return this.setState({advanced: !this.state.advanced});
    }

    render() {
      const style = {
        height: 20,
        width: 20,
        border: "solid 2px #888",
        borderRadius: 4,
        backgroundColor: this.props.color,
        cursor: "pointer",
        display: "inline-block"
      };

      if (!this.props.color) {
        // http://lea.verou.me/css3patterns/#diagonal-stripes
        style.backgroundColor = "#AAA";
        style.backgroundImage = "repeating-linear-gradient(45deg, transparent, transparent 2px, rgba(255,255,255,.7) 2px, rgba(255,255,255,.7) 4px)";
      }

      const popupPosition = {
        position: 'absolute',
        top: 0,
        left: 30,
        zIndex: 1000,
        backgroundColor: "white",
        border: "solid 1px #DDD",
        borderRadius: 3
      };

      return R('div', {style: { position: "relative", display: "inline-block" }},
        R('div', {style, onClick: this.handleClick}),
        this.state.open ?
          React.createElement(ClickOutHandler, {onClickOut: (() => this.setState({open: false}))},
            R('div', {style: popupPosition},
              R('button', {type: "button", className: "btn btn-link btn-sm", onClick: this.handleReset},
                R('i', {className: "fa fa-undo"}),
                " Reset Color"),
              // R 'button', type: "button", className: "btn btn-link btn-sm", onClick: @handleTransparent,
              //   R 'i', className: "fa fa-ban"
              //   " None"
              R('button', {type: "button", className: "btn btn-link btn-sm", onClick: this.handleAdvanced},
                this.state.advanced ? "Basic" : "Advanced"),
              
              this.state.advanced ?
                React.createElement(SketchPicker, {color: this.props.color || undefined, disableAlpha: true, onChangeComplete: this.handleClose})
              :
                React.createElement(SwatchesPicker, {color: this.props.color || undefined, onChangeComplete: this.handleClose})
            )
          ) : undefined
      );
    }
  };
  ColorComponent.initClass();
  return ColorComponent;
})();


