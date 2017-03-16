# Karma configuration
# Generated on Fri Sep 18 2015 08:23:23 GMT-0400 (EDT)
webpack = require 'webpack'

module.exports = (config) ->
  config.set

    # base path that will be used to resolve all patterns (eg. files, exclude)
    basePath: ''


    # frameworks to use
    # available frameworks: https://npmjs.org/browse/keyword/karma-adapter
    frameworks: ['mocha']


    # list of files / patterns to load in the browser
    files: [
      "bower_components/jquery/dist/jquery.js"
      "bower_components/bootstrap/dist/js/bootstrap.js"
      "bower_components/lodash/lodash.js"
      "bower_components/react/react-with-addons.js"
      "bower_components/react/react-dom.js"
      'test/test_index.coffee'
      {
        pattern: '**/*.js.map',
        included: false
      }
    ]


    # list of files to exclude
    exclude: [
    ]


    # preprocess matching files before serving them to the browser
    # available preprocessors: https://npmjs.org/browse/keyword/karma-preprocessor
    preprocessors: {
      'test/test_index.coffee': ['webpack']
    }

    webpack: {
      devtool: 'inline-source-map',
      module: {
        loaders: [
          { test: /\.coffee$/, loader: ["coffee-loader"] },
        ]
      },
      resolve: {
        extensions: [".coffee", ".js", ".json"]
      },
      externals: {
        xlsx: "XLSX"
        react: "React",
        "react-dom": "ReactDOM",
        jquery: "$"
        lodash: '_'
        d3: "d3"
        leaflet: "L"
        'react/lib/ExecutionEnvironment': true
        'react/addons': true,
        'react/lib/ReactContext': 'window'      
      }    
      # Needed for bugs that don't show source maps https://github.com/webpack-contrib/karma-webpack/issues/188
      plugins: [
        new webpack.SourceMapDevToolPlugin({
          filename: null, # if no value is provided the sourcemap is inlined
          test: /\.(coffee|js)($|\?)/i # process .js and .coffee files only
        })
      ]
    }

    # test results reporter to use
    # possible values: 'dots', 'progress'
    # available reporters: https://npmjs.org/browse/keyword/karma-reporter
    reporters: ['progress']

    # web server port
    port: 9876


    # enable / disable colors in the output (reporters and logs)
    colors: true


    # level of logging
    # possible values:
    # - config.LOG_DISABLE
    # - config.LOG_ERROR
    # - config.LOG_WARN
    # - config.LOG_INFO
    # - config.LOG_DEBUG
    logLevel: config.LOG_INFO


    # enable / disable watching file and executing tests whenever any file changes
    autoWatch: true


    # start these browsers
    # available browser launchers: https://npmjs.org/browse/keyword/karma-launcher
    #browsers: ['Chrome']
    browsers: []


    # Continuous Integration mode
    # if true, Karma captures browsers, runs the tests and exits
    singleRun: false

    plugins: ['karma-webpack', 'karma-mocha', 'karma-chrome-launcher']
