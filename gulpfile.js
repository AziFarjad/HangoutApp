
var gulp = require('gulp');
var nodemon = require('gulp-nodemon');

gulp.task('serve', function() {
  nodemon({
      script: 'server.js',
      watch: ['./'],
      ext: 'js html',
  }).on('restart', function() { console.log('restarted!'); });
});
