var path        = require('path');
var fs          = require('fs');
var gulp        = require('gulp');
var util        = require('gulp-util');
var sass        = require('gulp-sass') ;
var notify      = require("gulp-notify") ;
var uglify      = require('gulp-uglify');
var minifycss   = require('gulp-clean-css');
var minifhtml   = require('gulp-htmlmin');
var twig        = require('gulp-twig');
var data        = require('gulp-data');
var uncss       = require('gulp-uncss');
var concat      = require('gulp-concat');
var prefix      = require('gulp-autoprefixer');
var rename      = require('gulp-rename');
var order       = require("gulp-order");

var config = {
    production: !!util.env.production
};

function swallowError (error) {
  console.log(error.toString())
  this.emit('end')
}


gulp.task('twig', function () {
    return gulp.src('src/templates/*.twig')
        .pipe(data( function(file) {
          return JSON.parse(
            fs.readFileSync('src/departures.json')
          );
        }))
        .pipe(twig())
        .pipe(config.production ? minifhtml({collapseWhitespace: true}) : util.noop())
        .pipe(gulp.dest('dist'));
});


gulp.task('sass', ['twig'], function() {
    return gulp.src('src/scss/**/*.scss')
        .pipe(sass())
        .pipe(concat('main.css'))
        .pipe(config.production ? uncss({html: ['dist/*.html']}) : util.noop())
        .pipe(prefix({
            browsers: ['> 2%'],
            cascade: false
        }))
        .pipe(config.production ? minifycss() : util.noop())
        .on('error', swallowError)
        .pipe(gulp.dest('dist/css'));
});


gulp.task('js', ['twig'], function() {
    return gulp.src('src/js/**/*.js')
        .pipe(order([
            "vendor/*.js",
            "*.js"
        ]))
        .pipe(config.production ? uglify() : util.noop())
        .pipe(concat('main.js'))
        .on('error', swallowError)
        .pipe(gulp.dest('dist/js'));
});

gulp.task('assets', ['twig'], function() {
    return gulp.src(['src/assets/**/*'])
        .pipe(gulp.dest('dist/assets'));
})


// watch files
gulp.task('watch', function() {
    gulp.watch('src/scss/**/*.scss', ['sass']);
    gulp.watch('src/templates/*.twig', ['sass']);
    gulp.watch('src/js/**/*.js', ['js']);
    gulp.watch('src/assets/**/*', ['assets']);
});


// Default Task
gulp.task('default', ['sass', 'watch', 'js', 'assets']);
