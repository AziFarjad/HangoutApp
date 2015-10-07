
var gulp = require('gulp');
var nodemon = require('gulp-nodemon');

var uglify = require('gulp-uglify');
var clean = require('gulp-clean');
var concat = require('gulp-concat');
var striplog = require('gulp-strip-debug');
var minifycss = require('gulp-minify-css');
var gutil = require('gulp-util');
var sass = require('gulp-sass');
var notify = require("gulp-notify");
var connect = require('gulp-connect');

gulp.task('serve', function() {
  nodemon({
      script: 'server.js',
      watch: ['./'],
      ext: 'js html',
  }).on('restart', function() { console.log('restarted!'); });
});

gulp.task('css', function() {
  return gulp.src(['public/assets/vendor/materialize/sass/**/*.scss'])
      .pipe(sass({style: 'compressed', errLogToConsole: true}))  // Compile sass
      .pipe(concat('app.min.css'))                               // Concat all css
      .pipe(gulp.dest('public/assets/build/css/'))                      // Set the destination to assets/css
});

// Clean all builds
gulp.task('clean', function() {
  return gulp.src(['assets/build/'], {read: false})
    .pipe(clean());
});

// web server
gulp.task('webserver', function() {
  connect.server();
});

// Default task - clean the build dir
// Then rebuild the js and css files

gulp.task('watch', function(){
  gulp.watch(['public/assets/vendor/materialize/sass/**/*.scss'], ['css']); // Watch and run sass on changes
  gulp.src('assets/*')
    .pipe(notify('An asset has changed'));
});

gulp.task('default', ['clean', 'css', 'watch']);