
var gulp = require('gulp');
var nodemon = require('gulp-nodemon');

gulp.task('serve', function() {
  nodemon({
      script: 'server.js',
      watch: ['./'],
      ext: 'js',
  }).on('restart', function() { console.log('restarted!'); });
});
