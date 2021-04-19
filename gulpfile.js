let preprocessor = 'less'; 
const { src, dest, parallel, series, watch } = require('gulp');
const browserSync = require('browser-sync').create();
const concat = require('gulp-concat');
const uglify = require('gulp-uglify-es').default;
const sass = require('gulp-sass');
const less = require('gulp-less');
const autoprefixer = require('gulp-autoprefixer');
const cleancss = require('gulp-clean-css');
const imagemin = require('gulp-imagemin');
const newer = require('gulp-newer');
const del = require('del');
const ts = require('gulp-typescript');

function browsersync() {
	browserSync.init({ 
		server: { baseDir: 'app/' }, 
		notify: false, 
		online: true 
	})
}

function scripts() {
	return src([ 
		// 'node_modules/jquery/dist/jquery.min.js', 
		'app/js/app.js',
		'app/js/main.js',
	])
	.pipe(concat('app.min.js')) 
	.pipe(uglify()) 
	.pipe(dest('app/js/'))
	.pipe(browserSync.stream())
}

function typescript(){
	return src([
		'app/ts/typescript/**/*.ts',
	])
        .pipe(ts({
            noImplicitAny: true,
            outFile: 'types.js'
        }))
		.pipe(concat('./min/types.min.js')) 
		.pipe(uglify()) 
        .pipe(dest('app/ts'));
}



function styles() {
	return src('app/' + preprocessor + '/*.' + preprocessor + '')
	.pipe(eval(preprocessor)())
	.pipe(concat('app.min.css'))
	.pipe(autoprefixer({ overrideBrowserslist: ['last 10 versions'], grid: true }))
	.pipe(cleancss( { level: { 1: { specialComments: 0 } }/* , format: 'beautify' */ } ))
	.pipe(dest('app/css/'))
	.pipe(browserSync.stream())
}

function images() {
	return src('app/images/src/**/*')
	.pipe(newer('app/images/dest/'))
	.pipe(imagemin())
	.pipe(dest('app/images/dest/'))
}

function cleanimg() {
	return del('app/images/dest/**/*', { force: true })
}

function buildcopy() {
	return src([
		'app/css/**/*.min.css',
		'app/js/**/*.min.js',
		'app/ts/**/*.min.js',
		'app/images/dest/**/*',
		'app/**/*.html',
		], { base: 'app' })
	.pipe(dest('dist')) 
}
 
function cleandist() {
	return del('dist/**/*', { force: true })
}

function startwatch() {

	watch(['app/**/*.js', '!app/**/*.min.js'], scripts);
	watch(['app/**/*.ts', '!app/**/*.min.ts'], typescript);
	watch('app/**/' + preprocessor + '/**/*', styles);
	watch('app/**/*.html').on('change', browserSync.reload);
	watch('app/images/src/**/*', images);
 
}

exports.browsersync = browsersync;
exports.scripts = scripts;
exports.typescript = typescript;
exports.styles = styles;
exports.images = images;
exports.cleanimg = cleanimg;
exports.build = series(cleandist, styles, scripts, typescript, images, buildcopy);
exports.default = parallel(styles, scripts, typescript, browsersync, startwatch);