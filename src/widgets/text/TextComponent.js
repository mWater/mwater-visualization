let TextComponent;
import PropTypes from 'prop-types';
import React from 'react';
const R = React.createElement;
import _ from 'lodash';
import RichTextComponent from '../../richtext/RichTextComponent';
import ExprInsertModalComponent from './ExprInsertModalComponent';
import ExprUpdateModalComponent from './ExprUpdateModalComponent';
import ExprItemsHtmlConverter from '../../richtext/ExprItemsHtmlConverter';

// Text component which is provided with the data it needs, rather than loading it.
// Used by TextWidgetComponent and also by other components that embed text fields
export default TextComponent = (function() {
  TextComponent = class TextComponent extends React.Component {
    constructor(...args) {
      super(...args);
      this.handleItemsChange = this.handleItemsChange.bind(this);
      this.handleInsertExpr = this.handleInsertExpr.bind(this);
      this.handleItemClick = this.handleItemClick.bind(this);
      this.handleAddExpr = this.handleAddExpr.bind(this);
      this.refRichTextComponent = this.refRichTextComponent.bind(this);
    }

    static initClass() {
      this.propTypes = { 
        design: PropTypes.object.isRequired,
        onDesignChange: PropTypes.func, // Called with new design. null/undefined for readonly
      
        schema: PropTypes.object.isRequired,
        dataSource: PropTypes.object.isRequired, // Data source to use for chart
        exprValues: PropTypes.object.isRequired, // Expression values
  
        width: PropTypes.number,
        height: PropTypes.number,
  
        singleRowTable: PropTypes.string,  // Table that is filtered to have one row
        namedStrings: PropTypes.object // Optional lookup of string name to value. Used for {{branding}} and other replacement strings in text widget
      };
  
      this.contextTypes =
        {locale: PropTypes.string};
        // e.g. "en"
    }

    createItemsHtmlConverter() {
      return new ExprItemsHtmlConverter(
        this.props.schema, 
        (this.props.onDesignChange != null), 
        this.props.exprValues, 
        // Display summaries if in design more and singleRowTable is set
        (this.props.onDesignChange != null) && (this.props.singleRowTable != null),
        // Only replace named strings if not editing
        (this.props.onDesignChange == null) ? this.props.namedStrings : undefined,
        this.context.locale
      );
    }

    handleItemsChange(items) {
      const design = _.extend({}, this.props.design, {items});
      return this.props.onDesignChange(design);
    }

    handleInsertExpr(item) {
      const html = '<div data-embed="' + _.escape(JSON.stringify(item)) + '"></div>';

      return this.editor.pasteHTML(html);
    }

    replaceItem(item) {
      var replaceItemInItems = (items, item) => _.map(items, function(i) {
        if (i.id === item.id) {
          return item;
        } else if (i.items) {
          return _.extend({}, i, {items: replaceItemInItems(i.items, item)});
        } else {
          return i;
        }
        });

      const items = replaceItemInItems(this.props.design.items || [], item);
      return this.props.onDesignChange(_.extend({}, this.props.design, {items}));
    }

    handleItemClick(item) {
      return this.exprUpdateModal.open(item, item => {
        // Replace in items
        return this.replaceItem(item);
      });
    }

    handleAddExpr(ev) {
      ev.preventDefault();
      return this.exprInsertModal.open();
    }

    renderExtraPaletteButtons() {
      return R('div', {key: "expr", className: "mwater-visualization-text-palette-item", onMouseDown: this.handleAddExpr},
        R('i', {className: "fa fa-plus"}),
        " Field");
    }

    renderModals() {
      return [
        R(ExprInsertModalComponent, {key: "exprInsertModal", ref: (c => { return this.exprInsertModal = c; }), schema: this.props.schema, dataSource: this.props.dataSource, onInsert: this.handleInsertExpr, singleRowTable: this.props.singleRowTable}),
        R(ExprUpdateModalComponent, {key: "exprUpdateModal", ref: (c => { return this.exprUpdateModal = c; }), schema: this.props.schema, dataSource: this.props.dataSource, singleRowTable: this.props.singleRowTable})
      ];
    }
  
    refRichTextComponent(c) { return this.editor = c; }
  
    render() {
      const style = { 
        position: "relative"
      };

      style.width = this.props.width;
      style.height = this.props.height;

      return R('div', null,
        this.renderModals(),
        R(RichTextComponent, {
          ref: this.refRichTextComponent,
          className: `mwater-visualization-text-widget-style-${this.props.design.style || "default"}`,
          style,
          items: this.props.design.items,
          onItemsChange: this.props.onDesignChange ? this.handleItemsChange : undefined,
          onItemClick: this.handleItemClick,
          itemsHtmlConverter: this.createItemsHtmlConverter(),
          includeHeadings: (this.props.design.style === "default") || !this.props.design.style,
          extraPaletteButtons: this.renderExtraPaletteButtons()
        }
        )
      );
    }
  };
  TextComponent.initClass();
  return TextComponent;
})();
