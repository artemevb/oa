const gulp = require('gulp');
const postcss = require('gulp-postcss');
const tailwindcss = require('tailwindcss');
const autoprefixer = require('autoprefixer');
const cssnano = require('cssnano');
const terser = require('gulp-terser');
const sourcemaps = require('gulp-sourcemaps');
const connect = require('gulp-connect'); // <-- чтобы запустить dev-сервер

// Если НЕ хотите копировать HTML, можно убрать эту задачу
function htmlTask() {
  // Либо закомментировать, либо вообще удалить
  return gulp.src('./src/**/*.html')
    .pipe(gulp.dest('./dist')); 
  // Но фактически она вам не нужна, если
  // вы хотите, чтобы HTML жил только в src.
}

// CSS task
function cssTask() {
  return gulp.src('./src/css/**/*.css')
    .pipe(sourcemaps.init())
    .pipe(postcss([ tailwindcss(), autoprefixer(), cssnano() ]))
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest('./dist/css'));
}

// JS task (если нужно)
function jsTask() {
  return gulp.src('./src/js/**/*.js')
    .pipe(sourcemaps.init())
    .pipe(terser())
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest('./dist/js'));
}

// Image task (если нужно, складывает картинки в dist)
function imageTask() {
  return gulp.src('./src/images/**/*')
    .pipe(gulp.dest('./dist/images'))
    .on('end', () => console.log('Images copied!'));
}

// dev-сервер, который раздаёт всё из корня проекта
function serveTask() {
  connect.server({
    root: '.',   // <-- ключевой момент! Сервер стартует в корне
    port: 1313,
    livereload: true
  });
}

// Перезагрузка gulp-connect
function reloadTask(done) {
  connect.reload();
  done();
}

// Watch task — следим за src, при изменениях пересобираем и делаем reload
function watchTask() {
  gulp.watch('./src/css/**/*.css', gulp.series(cssTask, reloadTask));
  gulp.watch('./src/js/**/*.js', gulp.series(jsTask, reloadTask));
  gulp.watch('./src/images/**/*', gulp.series(imageTask, reloadTask));

  // Если хотите, чтобы при изменении HTML тоже перезагружался браузер:
  gulp.watch('./src/**/*.html', reloadTask);
}

// Задача по умолчанию: собираем нужные ресурсы, поднимаем сервер, смотрим
exports.default = gulp.series(
  gulp.parallel(cssTask, jsTask, imageTask /*, htmlTask - если надо */),
  gulp.parallel(serveTask, watchTask)
);

// Задача build — только сборка (без сервера)
exports.build = gulp.series(
  gulp.parallel(cssTask, jsTask, imageTask /*, htmlTask */)
);
