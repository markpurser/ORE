var gulp = require('gulp'),
    jshint = require('gulp-jshint'),
    uglify = require('gulp-uglify'),
    concat = require('gulp-concat'),
    gutil = require('gulp-util'),
    addsrc = require('gulp-add-src');

gulp.task('default', function() {
    gulp.src('src/*.js')
        .pipe(jshint())
        .pipe(jshint.reporter('default'))
        .pipe(gutil.env.production ? uglify() : gutil.noop())
        .pipe(addsrc.prepend('header'))
        .pipe(concat('ore.min.js'))
        .pipe(gulp.dest('lib'))
        .pipe(gulp.dest('examples/game/js'));
});