// TODO: This file was created by bulk-decaffeinate.
// Sanity-check the conversion and remove this comment.
let RichTextComponent;
import PropTypes from 'prop-types';
import React from 'react';
const R = React.createElement;
import _ from 'lodash';
import { ContentEditableComponent } from 'mwater-expressions-ui';
import ItemsHtmlConverter from './ItemsHtmlConverter';
import FloatAffixed from 'react-float-affixed';
import FontColorPaletteItem from './FontColorPaletteItem';
import FontSizePaletteItem from './FontSizePaletteItem';

export default RichTextComponent = (function() {
  RichTextComponent = class RichTextComponent extends React.Component {
    static initClass() {
      this.propTypes = { 
        // Items (content) to display. See ItemsHtmlConverter
        items: PropTypes.array,
        onItemsChange: PropTypes.func, // Called with new items
  
        onItemClick: PropTypes.func,
  
        className: PropTypes.string,  // Optional className of editor wrapper
        style: PropTypes.object,  // Optional style of editor wrapper
  
        // Converter to use for editing
        itemsHtmlConverter: PropTypes.object,
  
        // True (default) to include heading h1, h2 in palette
        includeHeadings: PropTypes.bool,
  
        // Extra buttons to put in palette
        extraPaletteButtons: PropTypes.node
      };
  
      this.defaultProps = {
        includeHeadings: true,
        items: [],
        itemsHtmlConverter: new ItemsHtmlConverter()
      };
    }

    constructor(props) {
      super(props);

      this.state = {
        focused: false
      };
    }

    handleClick = ev => {
      // If click is in component or in palette component, ignore, otherwise remove focus
      if (!this.entireComponent.contains(ev.target) && (!this.paletteComponent || !this.paletteComponent.contains(ev.target))) {
        return this.setState({focused: false});
      }
    };

    // Paste HTML in
    pasteHTML(html) {
      return this.contentEditable.pasteHTML(html);
    }

    focus() {
      return this.contentEditable.focus();
    }

    handleInsertExpr = item => {
      const html = '<div data-embed="' + _.escape(JSON.stringify(item)) + '"></div>';

      return this.contentEditable.pasteHTML(html);
    };

    handleSetFontSize = size => {
      // Requires a selection
      let html = this.contentEditable.getSelectedHTML();
      if (!html) {
        return alert("Please select text first to set size");
      }

      // Clear existing font-size styles. This is clearly a hack, but font sizes are absolute in execCommand which
      // doesn't mix with our various dashboard stylings, so we need to use percentages
      html = html.replace(/font-size:\s*\d+%;?/g, "");

      return this.contentEditable.pasteHTML(`<span style=\"font-size:${size}\">` + html + "</span>");
    };

    handleSetFontColor = color => {
      // Requires a selection
      const html = this.contentEditable.getSelectedHTML();
      if (!html) {
        return alert("Please select text first to set color");
      }

      return this.handleCommand("foreColor", color);
    };

    handleChange = elem => {
      const items =  this.props.itemsHtmlConverter.convertElemToItems(elem);

      // Check if changed
      if (!_.isEqual(items, this.props.items)) {
        return this.props.onItemsChange(items);
      } else {
        // Re-render as HTML may have been mangled and needs a round-trip
        return this.forceUpdate();
      }
    };

    handleFocus = () => { return this.setState({focused: true}); };
    handleBlur = () => { return this.setState({focused: false}); };

    // Perform a command such as bold, underline, etc.
    handleCommand = (command, param, ev) => {
      // Don't lose focus
      ev?.preventDefault();

      // Use CSS for some commands 
      if (['foreColor'].includes(command)) {
        document.execCommand("styleWithCSS", null, true);
        document.execCommand(command, false, param);
        return document.execCommand("styleWithCSS", null, false);
      } else {
        return document.execCommand(command, false, param);
      }
    };

    handleCreateLink = ev => {
      // Don't lose focus
      ev.preventDefault();

      // Ask for url
      const url = window.prompt("Enter URL to link to");
      if (url) {
        return document.execCommand("createLink", false, url);
      }
    };

    handleEditorClick = ev => {
      // Be sure focused
      if (!this.state.focused) {
        this.setState({focused: true});
      }

      if (ev.target.dataset?.embed || ev.target.parentElement?.dataset?.embed) {
        const item = JSON.parse(ev.target.dataset?.embed || ev.target.parentElement?.dataset?.embed);
        if (item != null) {
          return this.props.onItemClick?.(item);
        }
      }
    };

    createHtml() {
      return this.props.itemsHtmlConverter.convertItemsToHtml(this.props.items);
    }

    renderPalette() {
      return R(FloatAffixed, {style: {zIndex: 9999}, edges: "over,under,left,right", align: "center", render: this.renderPaletteContent});
    }

    renderPaletteContent = (schemeName, {edges}) => {
      return R('div', {key: "palette", className: "mwater-visualization-text-palette", ref: (c => { return this.paletteComponent = c; })},
          R('div', {key: "bold", className: "mwater-visualization-text-palette-item", onMouseDown: this.handleCommand.bind(null, "bold", null)},
            R('b', null, "B")),
          R('div', {key: "italic", className: "mwater-visualization-text-palette-item", onMouseDown: this.handleCommand.bind(null, "italic", null)},
            R('i', null, "I")),
          R('div', {key: "underline", className: "mwater-visualization-text-palette-item", onMouseDown: this.handleCommand.bind(null, "underline", null)},
            R('span', {style: { textDecoration: "underline" }}, "U")),
          R(FontColorPaletteItem, {key: "foreColor", onSetColor: this.handleSetFontColor, position: schemeName === "over" ? "under" : "over"}),
          R(FontSizePaletteItem, {key: "fontSize", onSetSize: this.handleSetFontSize, position: schemeName === "over" ? "under" : "over"}),
          R('div', {key: "link", className: "mwater-visualization-text-palette-item", onMouseDown: this.handleCreateLink},
            R('i', {className: "fa fa-link"})),
          R('div', {key: "justifyLeft", className: "mwater-visualization-text-palette-item", onMouseDown: this.handleCommand.bind(null, "justifyLeft", null)},
            R('i', {className: "fa fa-align-left"})),
          R('div', {key: "justifyCenter", className: "mwater-visualization-text-palette-item", onMouseDown: this.handleCommand.bind(null, "justifyCenter", null)},
            R('i', {className: "fa fa-align-center"})),
          R('div', {key: "justifyRight", className: "mwater-visualization-text-palette-item", onMouseDown: this.handleCommand.bind(null, "justifyRight", null)},
            R('i', {className: "fa fa-align-right"})),
          R('div', {key: "justifyFull", className: "mwater-visualization-text-palette-item", onMouseDown: this.handleCommand.bind(null, "justifyFull", null)},
            R('i', {className: "fa fa-align-justify"})),
          R('div', {key: "insertUnorderedList", className: "mwater-visualization-text-palette-item", onMouseDown: this.handleCommand.bind(null, "insertUnorderedList", null)},
            R('i', {className: "fa fa-list-ul"})),
          R('div', {key: "insertOrderedList", className: "mwater-visualization-text-palette-item", onMouseDown: this.handleCommand.bind(null, "insertOrderedList", null)},
            R('i', {className: "fa fa-list-ol"})),
          this.props.includeHeadings ?
            [
              R('div', {key: "h1", className: "mwater-visualization-text-palette-item", onMouseDown: this.handleCommand.bind(null, "formatBlock", "<H1>")},
                R('i', {className: "fa fa-header"})),
              R('div', {key: "h2", className: "mwater-visualization-text-palette-item", onMouseDown: this.handleCommand.bind(null, "formatBlock", "<H2>")},
                R('i', {className: "fa fa-header", style: { fontSize: "80%" }})),
              R('div', {key: "p", className: "mwater-visualization-text-palette-item", onMouseDown: this.handleCommand.bind(null, "formatBlock", "<div>")},
                "\u00b6")
            ] : undefined,
          R('div', {key: "removeFormat", className: "mwater-visualization-text-palette-item", onMouseDown: this.handleCommand.bind(null, "removeFormat", null), style: { paddingLeft: 5, paddingRight: 5 }},
            R('img', {src: removeFormatIcon, style: { height: 20 }})),
          this.props.extraPaletteButtons);
    };

    refContentEditable = c => { return this.contentEditable = c; };

    renderHtml() {
      if (this.props.onItemsChange != null) {
        return R('div', {key: "contents", style: this.props.style, className: this.props.className},
          R(ContentEditableComponent, { 
            ref: this.refContentEditable,
            style: { outline: "none" },
            html: this.createHtml(),
            onChange: this.handleChange,
            onClick: this.handleEditorClick,
            onFocus: this.handleFocus,
            onBlur: this.handleBlur
          }
          ),
          (this.props.items?.[0] == null) ?
            R('div', {key: "placeholder", style: { color: "#DDD", position: "absolute", top: 0, left: 0, right: 0, pointerEvents: "none" }}, "Click to Edit") : undefined
        );

      } else {
        return R('div', {key: "contents", style: this.props.style, className: this.props.className, dangerouslySetInnerHTML: { __html: this.createHtml() }});
      }
    }

    render() {
      return R('div', {style: { position: "relative" }, ref: (c => { return this.entireComponent = c; })},
        this.renderHtml(),
        this.state.focused ?
          this.renderPalette() : undefined
      );
    }
  };
  RichTextComponent.initClass();
  return RichTextComponent;
})();


var removeFormatIcon = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABUAAAAVCAYAAACpF6WWAAAABmJLR0QA/wD/AP+gvaeTAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAr0lEQVQ4y91U2w3CMAy8VB0kbFA2YYVuABOZbsAmGaFscnzgSlGSBgfCB1g6OXbkkx+yHUn0lgFfkN8hHSt/lma71kxdhIv6Dom/HGicflB97NVTD2ACsPQc1En1zUpqKb+pdEumzaVbSNPSRRFL7iNZQ1BstvApsmODZJXUa8A58W9Ea4nwFWkNa0Sc/Q+F1dyDRD30AO6qJV/wtgxNPR3fOEJXALO+5092/0+P9APt7i9xOIlepwAAAABJRU5ErkJggg==";