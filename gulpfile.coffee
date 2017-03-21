_ = require 'lodash'
gulp = require 'gulp'
gutil = require 'gulp-util'
glob = require 'glob'
browserify = require 'browserify'
source = require 'vinyl-source-stream'
concat = require 'gulp-concat'
rework = require 'gulp-rework'
reworkNpm = require 'rework-npm'
browserSync = require 'browser-sync'
reload = browserSync.reload
coffee = require 'gulp-coffee' 
watchify = require 'watchify'
replace = require 'gulp-replace'
webpack = require 'webpack'
WebpackDevServer = require 'webpack-dev-server'

# Compile coffeescript to js in lib/
gulp.task 'coffee', ->
  gulp.src('./src/**/*.coffee')
    .pipe(coffee({ bare: true }))
    .pipe(gulp.dest('./lib/'))

gulp.task 'coffee:watch', ->
  gulp.watch('./src/**/*.coffee', gulp.series('coffee'))

# Copy non-coffeescript files
gulp.task 'copy', ->
  gulp.src(['./src/**/*.js', './src/**/*.css', './src/**/*.txt'])
    .pipe(gulp.dest('./lib/'))

makeBrowserifyBundle = ->
  shim(browserify("./demo.coffee",
    extensions: [".coffee"]
    basedir: "./src/"
    debug: true
  ))

bundleDemoJs = (bundle) ->
  bundle.bundle()
    .on("error", gutil.log)
    .pipe(source("demo.js"))
    .pipe(gulp.dest("./dist/js/"))

gulp.task "browserify", ->
  bundleDemoJs(makeBrowserifyBundle())

gulp.task "dist", ->
  shim(browserify({ extensions: [".coffee"], basedir: "./src/" }))
  .require('./index.coffee', {expose: 'mwater-visualization'})
  .bundle()
  .on("error", gutil.log)
  .pipe(source("mwater-visualization.js"))
  .pipe(gulp.dest("./dist/js/"))

gulp.task "libs_css", ->
  return gulp.src([
    "bower_components/bootstrap/dist/css/bootstrap.css"
    "bower_components/bootstrap/dist/css/bootstrap-theme.css"
    "bower_components/c3/c3.css"
  ]).pipe(concat("libs.css"))
    # Remove print background color removal (https://github.com/h5bp/html5-boilerplate/issues/1643)
    .pipe(replace('  *,\n  *:before,\n  *:after {\n    color: #000 !important;\n    text-shadow: none !important;\n    background: transparent !important;\n    -webkit-box-shadow: none !important;\n            box-shadow: none !important;\n  }', ''))
    .pipe(gulp.dest("./dist/css/"))

gulp.task "libs_js", ->
  return gulp.src([
    "bower_components/jquery/dist/jquery.js"
    "bower_components/bootstrap/dist/js/bootstrap.js"
    "bower_components/lodash/lodash.js"
    "bower_components/d3/d3.js"
    "bower_components/c3/c3.js"
    # "vendor/react-15.0.2.js"
    # "vendor/react-dom-15.0.2.js"
  ]).pipe(concat("libs.js"))
    .pipe(gulp.dest("./dist/js/"))

gulp.task "copy_fonts", ->
  return gulp.src(["bower_components/bootstrap/dist/fonts/*"]).pipe(gulp.dest("./dist/fonts/"))

# gulp.task "copy_images", ->
#   gulp.src([
#     # "./bower_components/select2/*.png"
#     # "./bower_components/select2/*.gif"
#   ]).pipe(gulp.dest("./dist/css/"))

gulp.task "index_css", ->
  return gulp.src("./src/index.css")
    .pipe(rework(reworkNpm("./src/")))
    .pipe gulp.dest("./dist/css/")

gulp.task 'copy_assets', ->
  return gulp.src("assets/**/*")
    .pipe(gulp.dest('dist/'))

gulp.task 'prepare_tests', ->
  files = glob.sync("./test/**/*Tests.coffee")
  files = _.map(files, (f) -> "." + f)
  bundler = shim(browserify({ 
    entries: files, 
    basedir: "./src/"
    extensions: [".js", ".coffee"] }))
  return bundler.bundle()
    .on('error', gutil.log)
    .on('error', -> throw "Failed")
    .pipe(source('browserified.js'))
    .pipe(gulp.dest('./test'))

gulp.task "build", gulp.parallel([
  "browserify"
  "dist"
  "libs_js"
  "libs_css"
  # "copy_images"
  "copy_fonts"
  "copy_assets"
  "index_css"
])

gulp.task "watch", gulp.series([
  "libs_js"
  "libs_css"
  "copy_fonts"
  "copy_assets"
  "index_css"
  ->
    webpackConfig = require './webpack.config.js'

    # Include version
    webpackConfig.plugins = [
      new webpack.HotModuleReplacementPlugin(),
      new webpack.NamedModulesPlugin(),
    ]
    webpackConfig.entry.unshift('webpack-dev-server/client?http://localhost:3000', 'webpack/hot/only-dev-server');

    compiler = webpack(webpackConfig)

    new WebpackDevServer(compiler, { hot: true, contentBase: "dist", publicPath: "/js/" }).listen 3000, "localhost", (err) =>
      if err 
        throw new gutil.PluginError("webpack-dev-server", err)

      # Server listening
      gutil.log("[webpack-dev-server]", "http://localhost:3000/demo.html")
])

gulp.task "test", gulp.series([
  "copy_assets"
  ->
    webpackConfig = require './webpack.config.tests.js'
    compiler = webpack(webpackConfig)

    new WebpackDevServer(compiler, { }).listen 8081, "localhost", (err) =>
      if err 
        throw new gutil.PluginError("webpack-dev-server", err)

      # Server listening
      gutil.log("[webpack-dev-server]", "http://localhost:8081/mocha.html")
])


gulp.task "default", gulp.series("copy", "coffee")

# Shim non-browserify friendly libraries to allow them to be 'require'd
shim = (instance) ->
  shims = {
    jquery: './jquery-shim'
    lodash: './lodash-shim'
    underscore: './lodash-shim'
    react: './react-shim'
    "react-dom": './react-dom-shim'
  }

  # Add shims
  for name, path of shims
    instance.require(path, {expose: name})

  return instance
