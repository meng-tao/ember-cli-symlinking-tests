// http://blog.ponyfoo.com/2014/01/27/my-first-gulp-adventure
var gulp = require('gulp');
var gutil = require('gulp-util');
var bump = require('gulp-bump');
var git = require('gulp-git');
var jshint = require('gulp-jshint');
var clean = require('gulp-clean');
var rename = require('gulp-rename');
var uglify = require('gulp-uglify');
var size = require('gulp-size');
var connect = require('connect');
var mocha = require('gulp-mocha');
var mochaPhantomJS = require('gulp-mocha-phantomjs');

var BUMP_TYPES = ['major', 'minor', 'patch', 'prerelease'];

gulp.task('lint', function () {
  gulp.src('./src/*.js')
    .pipe(jshint())
    .pipe(jshint.reporter('default'));
});

gulp.task('mocha', function () {
  return gulp.src('test/index.html')
          .pipe(mochaPhantomJS({reporter: 'list'}));
});

gulp.task('build', ['lint'], function () {
  gulp.src('./src/jquery.textarea_autosize.js')
    .pipe(gulp.dest('./dist'))
    .pipe(rename('jquery.textarea_autosize.min.js'))
    .pipe(uglify())
    .pipe(size({showFiles: true}))
    .pipe(gulp.dest('./dist'));
});

gulp.task('watch', ['build'], function() {
  return gulp.watch('src/*.js', ['build']);
});

gulp.task('validation', function () {
  if (BUMP_TYPES.indexOf(gutil.env.type) == -1)
    throw new Error('\ntype argument is required for gulp bump\nSupported values: major, minor, patch, prerelease\n\nExample:\n\tgulp bump --type major');
});

gulp.task('bump', ['validation', 'build'], function () {
  return gulp.src(['./package.json', './bower.json'])
    .pipe(bump({type: gutil.env.type}))
    .pipe(gulp.dest('./'));
});

gulp.task('tag', ['build'], function () {
  var pkg = require('./package.json');
  var v = 'v' + pkg.version;
  var message = 'Release ' + v;
  
  var exec = require('child_process').exec;
  exec('git commit -a -m "' + message + '"', function (error, stdout, stderr) {});
  exec('git tag -a -m "' + message + '"', function (error, stdout, stderr) {});
  exec('git push origin --tags', function (error, stdout, stderr) {});
});

gulp.task('npm', ['tag'], function (done) {
  require('child_process')
    .spawn('npm', ['publish'], { stdio: 'inherit' })
    .on('close', done);
});

gulp.task('server', function() {
  connect.createServer(connect.static(__dirname)).listen(3000);
});

gulp.task('browser', ['server'], function() {
  child_process.spawn('open', ['http://localhost:3000/index.html']);
});

gulp.task('test', ['lint', 'mocha']);
gulp.task('ci', ['build']);
gulp.task('release', ['npm']);

gulp.task('default', ['watch', 'browser']);
