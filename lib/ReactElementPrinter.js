var $, ReactElementPrinter;

$ = require('jquery');

module.exports = ReactElementPrinter = (function() {
  function ReactElementPrinter() {}

  ReactElementPrinter.prototype.print = function(element, options) {
    var extraCss;
    extraCss = $('<style id="react_element_printer_css">\n  @media print {\n    /* Hide body and get rid of margins */\n    body {\n      visibility: hidden;\n      margin: 0;\n      padding: 0;\n    }\n\n    /* Hide all children of body */\n    body > * {\n      display: none;\n    }\n\n    /* Setup special region */\n    #react_element_printer {\n      display: block !important;\n      visibility: visible;\n    }\n  }\n\n  /* Don\'t show when not printing */\n  #react_element_printer {\n    /* Removed because causes c3 titles to be hidden for mysterious reasons\n    display: none;\n    */\n  }\n\n  /* Default to letter sized pages */\n  @page  {\n    size: 8.5in 11in; \n    margin: 0.5in 0.5in 0.5in 0.5in; \n  }\n</style>');
    $("body").append(extraCss);
    $("body").append('<div id="react_element_printer"></div>');
    return React.render(element, $("#react_element_printer").get(0), (function(_this) {
      return function() {
        return _.delay(function() {
          window.print();
          React.unmountComponentAtNode($("#react_element_printer").get(0));
          $("#react_element_printer").remove();
          return $("#react_element_printer_css").remove();
        }, 1000);
      };
    })(this));
  };

  return ReactElementPrinter;

})();
