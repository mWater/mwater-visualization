$ = require 'jquery'
ReactDOM = require 'react-dom'

# Prints a React element
module.exports = class ReactElementPrinter
  # constructor: ->

  # Options include:
  # delay: ms to wait before printing to allow elements to render
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
      opacity: 100%
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

  #react_element_printer_splash {
    display: flex; 
    align-items: center;
    justify-content: center;    
    position: fixed; 
    left: 0;
    top: 0;
    z-index: 9999;
    width: 100%;
    height: 100%;
    overflow: visible;    
    background-color: rgba(255,255,255,0.7);
  }

  @media print {
    #react_element_printer_splash {
      display: none;
    }
  }

</style>
      ''')

    $("body").append(extraCss)

    # Add special region to body
    $("body").append('<div id="react_element_printer"></div>')

    # Add warning that printing
    $("body").append('''
      <div id="react_element_printer_splash">
        <div style="font-size: 30pt;">
          <i class="fa fa-spinner fa-spin"></i>
          Preparing to print...
        </div>
      </div>
    ''')

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
        $("#react_element_printer_splash").remove()
      , options.delay or 1000
      )
