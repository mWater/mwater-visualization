gulp = require 'gulp'
gutil = require 'gulp-util'
browserify = require 'browserify'
source = require 'vinyl-source-stream'
concat = require 'gulp-concat'
rework = require 'gulp-rework'
reworkNpm = require 'rework-npm'
browserSync = require 'browser-sync'
reload = browserSync.reload

gulp.task "browserify", ->
  shim(browserify("./index.coffee",
    extensions: [".coffee"]
    basedir: "./src/"
  )).bundle()
  .on("error", gutil.log)
  .pipe(source("index.js"))
  .pipe gulp.dest("./dist/js/")

gulp.task "libs_css", ->
  return gulp.src([
    "./bower_components/bootstrap/dist/css/bootstrap.css"
    "./bower_components/bootstrap/dist/css/bootstrap-theme.css"
  ]).pipe(concat("libs.css"))
    .pipe(gulp.dest("./dist/css/"))

gulp.task "libs_js", ->
  return gulp.src([
    "./bower_components/jquery/dist/jquery.js"
    "./bower_components/bootstrap/dist/js/bootstrap.js"
    "./bower_components/lodash/dist/lodash.js"
    "./bower_components/backbone/backbone.js"
    "./bower_components/react/react-with-addons.js"
  ]).pipe(concat("libs.js"))
    .pipe(gulp.dest("./dist/js/"))

gulp.task "copy_fonts", ->
  return gulp.src(["./bower_components/bootstrap/dist/fonts/*"]).pipe(gulp.dest("./dist/fonts/"))

gulp.task "copy_images", ->
  gulp.src([
    # "./bower_components/select2/*.png"
    # "./bower_components/select2/*.gif"
  ]).pipe(gulp.dest("./dist/css/"))

gulp.task "index_css", ->
  return gulp.src("./src/index.css")
    .pipe(rework(reworkNpm("./src/")))
    .pipe gulp.dest("./dist/css/")

gulp.task 'copy_assets', ->
  return gulp.src("assets/**/*")
    .pipe(gulp.dest('dist/'))

gulp.task "watch", ->
  return gulp.watch("./src/**", ["build"])

gulp.task "build", gulp.parallel([
  "browserify"
  "libs_js"
  "libs_css"
  "copy_images"
  "copy_fonts"
  "copy_assets"
  "index_css"
])

gulp.task 'serve', gulp.series([
  'build'
  gulp.parallel([
    -> browserSync({ server: "./dist" })
    -> gulp.watch("./src/**", gulp.series(['build', -> reload()]))
  ])
])

gulp.task "default", gulp.series("build")

# Shim non-browserify friendly libraries to allow them to be 'require'd
shim = (instance) ->
  shims = {
    jquery: './jquery-shim'
    lodash: './lodash-shim'
    underscore: './lodash-shim'
    backbone: './backbone-shim' 
    react: './react-shim'
  }

  # Add shims
  for name, path of shims
    instance.require(path, {expose: name})

  return instance
