var $, ReactDOM, ReactElementPrinter;

$ = require('jquery');

ReactDOM = require('react-dom');

module.exports = ReactElementPrinter = (function() {
  function ReactElementPrinter() {}

  ReactElementPrinter.prototype.print = function(element, options) {
    var extraCss;
    extraCss = $('<style id="react_element_printer_css">\n  @media print {\n    /* Hide body and get rid of margins */\n    body {\n      visibility: hidden;\n      margin: 0;\n      padding: 0;\n      opacity: 100%\n    }\n\n    /* Hide all children of body */\n    body > * {\n      display: none;\n    }\n\n    /* Setup special region */\n    #react_element_printer {\n      display: block !important;\n      visibility: visible;\n    }\n  }\n\n  /* Don\'t show when not printing */\n  #react_element_printer {\n    /* Removed because causes c3 titles to be hidden for mysterious reasons\n    display: none;\n    */\n  }\n\n  /* Default to letter sized pages */\n  @page  {\n    size: 8.5in 11in; \n    margin: 0.5in 0.5in 0.5in 0.5in; \n  }\n\n  #react_element_printer_splash {\n    display: flex; \n    align-items: center;\n    justify-content: center;    \n    position: fixed; \n    left: 0;\n    top: 0;\n    z-index: 9999;\n    width: 100%;\n    height: 100%;\n    overflow: visible;    \n    background-color: rgba(255,255,255,0.7);\n  }\n\n  @media print {\n    #react_element_printer_splash {\n      display: none;\n    }\n  }\n\n</style>');
    $("body").append(extraCss);
    $("body").append('<div id="react_element_printer"></div>');
    $("body").append('<div id="react_element_printer_splash">\n  <div style="font-size: 30pt;">\n    <i class="fa fa-spinner fa-spin"></i>\n    Preparing to print...\n  </div>\n</div>');
    return ReactDOM.render(element, $("#react_element_printer").get(0), (function(_this) {
      return function() {
        return _.delay(function() {
          window.print();
          ReactDOM.unmountComponentAtNode($("#react_element_printer").get(0));
          $("#react_element_printer").remove();
          $("#react_element_printer_css").remove();
          return $("#react_element_printer_splash").remove();
        }, options.delay || 1000);
      };
    })(this));
  };

  return ReactElementPrinter;

})();
