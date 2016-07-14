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

# Compile coffeescript to js in lib/
gulp.task 'coffee', ->
  gulp.src('./src/**/*.coffee')
    .pipe(coffee({ bare: true }))
    .pipe(gulp.dest('./lib/'))

# Copy non-coffeescript files
gulp.task 'copy', ->
  gulp.src(['./src/**/*.js', './src/**/*.css', './src/**/*.txt'])
    .pipe(gulp.dest('./lib/'))

gulp.task "browserify", ->
  shim(browserify("./demo.coffee",
    extensions: [".coffee"]
    basedir: "./src/"
  )).bundle()
  .on("error", gutil.log)
  .pipe(source("demo.js"))
  .pipe(gulp.dest("./dist/js/"))

gulp.task "dist", ->
  shim(browserify({ extensions: [".coffee"], basedir: "./src/" }))
  .require('./index.coffee', {expose: 'mwater-visualization'})
  .bundle()
  .on("error", gutil.log)
  .pipe(source("mwater-visualization.js"))
  .pipe(gulp.dest("./dist/js/"))

gulp.task "water_org_libs_css", ->
  return gulp.src([
    "bower_components/bootstrap/dist/css/bootstrap.min.css"
    "bower_components/bootstrap/dist/css/bootstrap-theme.min.css"
    "bower_components/c3/c3.min.css"
  ]).pipe(concat("libs.css"))
    .pipe(gulp.dest("./dist/water_org/"))

gulp.task "water_org_libs_js", ->
  return gulp.src([
    "bower_components/bootstrap/dist/js/bootstrap.js"
    "bower_components/lodash/lodash.min.js"
    "bower_components/c3/c3.min.js"
  ]).pipe(concat("libs.js"))
    .pipe(gulp.dest("./dist/water_org/"))

gulp.task "water_org_index_js", ->
  shim(browserify({ extensions: [".coffee"], basedir: "./src/" }))
  .require('./water_org.coffee', { expose: 'water-org-visualization' })
  .bundle()
  .on("error", gutil.log)
  .pipe(source("index.js"))
  .pipe(gulp.dest("./dist/water_org/"))

gulp.task "water_org_index_css", ->
  return gulp.src("./src/index.css")
    .pipe(rework(reworkNpm("./src/")))
    .pipe(gulp.dest("./dist/water_org/"))

gulp.task "libs_css", ->
  return gulp.src([
    "bower_components/bootstrap/dist/css/bootstrap.css"
    "bower_components/bootstrap/dist/css/bootstrap-theme.css"
    "bower_components/c3/c3.css"
  ]).pipe(concat("libs.css"))
    .pipe(gulp.dest("./dist/css/"))

gulp.task "libs_js", ->
  return gulp.src([
    "bower_components/jquery/dist/jquery.js"
    "bower_components/bootstrap/dist/js/bootstrap.js"
    "bower_components/lodash/lodash.js"
    "bower_components/d3/d3.js"
    "bower_components/c3/c3.js"
    "vendor/react-15.0.2.js"
    "vendor/react-dom-15.0.2.js"
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

gulp.task "water_org", gulp.parallel([
  "copy_assets"
  "water_org_libs_js"
  "water_org_libs_css"
  "water_org_index_js"
  "water_org_index_css"
  ])

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

gulp.task 'watch', gulp.series([
  'build'
  gulp.parallel([
    -> browserSync({ server: "./dist", startPath: "demo.html#63272963e7e4f479899d3d248a585187", ghostMode: false, notify: false })
    -> gulp.watch("./src/**", gulp.series(['browserify', 'index_css', -> reload()]))
  ])
])

gulp.task "default", gulp.series("copy", "coffee", "build")

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
