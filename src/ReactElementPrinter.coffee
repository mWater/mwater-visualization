$ = require 'jquery'
ReactDOM = require 'react-dom'

# Prints a React element
module.exports = class ReactElementPrinter
  # constructor: ->

  # Options include:
  #  
  print: (element, options) ->
    # Add special CSS printing rules
    extraCss = $('''
<style id="react_element_printer_css">
  @media print {
    /* Hide body and get rid of margins */
    body {
      visibility: hidden;
      margin: 0;
      padding: 0;
    }

    /* Hide all children of body */
    body > * {
      display: none;
    }

    /* Setup special region */
    #react_element_printer {
      display: block !important;
      visibility: visible;
    }
  }

  /* Don't show when not printing */
  #react_element_printer {
    /* Removed because causes c3 titles to be hidden for mysterious reasons
    display: none;
    */
  }

  /* Default to letter sized pages */
  @page  {
    size: 8.5in 11in; 
    margin: 0.5in 0.5in 0.5in 0.5in; 
  }
</style>
      ''')

    $("body").append(extraCss)

    # Add special region to body
    $("body").append('<div id="react_element_printer"></div>')

    # Render element into special region
    ReactDOM.render(element, $("#react_element_printer").get(0), =>
      # Wait for element to render
      _.delay () =>
        # Call print
        window.print()

        # Unmount component
        ReactDOM.unmountComponentAtNode($("#react_element_printer").get(0))

        # Remove rest of nodes
        $("#react_element_printer").remove()
        $("#react_element_printer_css").remove()
      , 1000
      )
