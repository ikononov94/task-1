'use strict';

// Подключение плагинов через переменные (connection of plugins through variables):
var gulp = require('gulp'), // Gulp
    autoprefixer = require('gulp-autoprefixer'), // Добавление вендорных префиксов (adding of vendor prefixers)
    concat = require('gulp-concat'), // Объединение файлов (files merger)
    csso = require('gulp-csso'), // Минификация CSS-файлов (minification of CSS files)
    del = require('del'), // Удаление папок и файлов (delete of folders and files)
    imagemin = require('gulp-imagemin'), // Оптимизация изображений (images optimization)
    plumber = require('gulp-plumber'), // Обработка ошибок (error handling)
    pngquant = require('imagemin-pngquant'), // Оптимизация PNG-изображений (PNG images optimization)
    pug = require('gulp-pug'), // Pug
    rename = require('gulp-rename'), // Переименование файлов (files rename)
    stylus = require('gulp-stylus'); // Stylus

// Подключение Browsersync (connection of Browsersync):
var browserSync = require('browser-sync').create(),
    reload = browserSync.reload;

// Таск для работы Browsersync, автообновление браузера (Browsersync task, autoreload of browser):
gulp.task('serve', function() {
    browserSync.init({
        server: './app'
    });
    gulp.watch(['./app/pages/*.pug', './app/blocks/**/*.pug'], gulp.series('html'));
    gulp.watch('./app/blocks/**/*.styl', gulp.series('css'));
    gulp.watch('*.html').on('change', reload);
});

// Таск для работы Pug, преобразование Pug в HTML (Pug to HTML conversion task):
gulp.task('html', function () {
    return gulp.src('./app/pages/*.pug')
        .pipe(plumber())
        .pipe(pug({pretty: true}))
        .pipe(gulp.dest('./app'))
        .pipe(browserSync.stream());
});

// Таск для преобразования Stylus-файлов в CSS (Stylus to CSS conversion):
gulp.task('css', function() {
    return gulp.src('./app/config/styles.styl')
        .pipe(plumber())
        .pipe(stylus())
        .pipe(autoprefixer(['last 2 versions'], { cascade: true }))
        .pipe(gulp.dest('./app/assets/css'))
        .pipe(rename({suffix: '.min'}))
        .pipe(csso())
        .pipe(gulp.dest('./app/assets/css'))
        .pipe(browserSync.stream());
});


// Таск для предварительной очистки (удаления) production-папки (task for delete of production folder dist):
gulp.task('clean', function() {
    return del('./dist');
});

// Таск для обработки изображений (images optimization task):
gulp.task('img', function() {
    return gulp.src([
        './app/blocks/**/*.jpg',
        './app/blocks/**/*.png',
        './app/blocks/**/*.svg'
    ])
        .pipe(imagemin({  // Сжимаем их с наилучшими настройками с учетом кеширования
            interlaced: true,
            progressive: true,
            svgoPlugins: [{removeViewBox: false}],
            use: [pngquant()]
        }))
        .pipe(gulp.dest('./dist/images'));
});

// Таск для формирования production-папки (task for creating of production folder dist):
gulp.task('dist', function () {
    var htmlDist = gulp.src('./app/*.html')
        .pipe(gulp.dest('./dist'));
    var cssDist = gulp.src('./app/assets/css/*.css')
        .pipe(gulp.dest('./dist/css'));
    var fontDist = gulp.src('./app/assets/fonts/*.ttf')
        .pipe(gulp.dest('./dist/fonts'))
    return htmlDist, cssDist, fontDist;
});

// Таск для сборки (build task):
gulp.task('build', gulp.parallel('html', 'css'));

// Таск для разработки (development task):
gulp.task('default', gulp.series('build', 'serve'));

// Таск для production (production task):
gulp.task('public', gulp.series('clean', 'img', 'dist'));