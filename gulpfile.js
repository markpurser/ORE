var gulp = require('gulp'),
    jshint = require('gulp-jshint'),
    uglify = require('gulp-uglify'),
    concat = require('gulp-concat');

gulp.task('default', function() {
    gulp.src('src/*.js')
        .pipe(jshint())
        .pipe(jshint.reporter('default'))
        .pipe(uglify())
        .pipe(concat('ore.min.js'))
        .pipe(gulp.dest('lib'))
        .pipe(gulp.dest('examples/game/js'));
});