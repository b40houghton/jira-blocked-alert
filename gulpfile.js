'use strict';

var gulp = require('gulp'),
	gutil = require('gulp-util'),
	glob = require('glob'),
	sourcemaps = require('gulp-sourcemaps'),
	gulpif = require('gulp-if'),
	eventStream = require('event-stream'),
	source = require('vinyl-source-stream'),
	buffer = require('vinyl-buffer'),
	browserify = require('browserify'),
	watchify = require('watchify'),
	babel = require('babelify'),
	uglify = require('gulp-uglify'),
	runSequence = require('run-sequence'),
	rename = require('gulp-rename');

var paths = {
	'scripts': {
		'src': './public/javascripts/bundle/*.js',
		'dest': './public/javascripts/',
		'build': './build/js/',
		'filename': 'global'
	}
};

var env = gutil.env;

/*
	* ----------------------------- *
	| Browserify compile/watch func |
	* ----------------------------- *

	* Browserify - entry main.js
	* Watchify - enable watching for browserify
	* Babelify - Babel transform for browserify
	* Write sourcemaps if not production
	* Uglify if production
	* Rename to <FILENAME>-min.js if production
*/

function compile(done, watch) {
	glob(paths.scripts.src, (err, files) => {
		if(err) done(err);

		var tasks = files.map( entry => {

			var b = browserify({
				entries: [entry],
				extensions: ['.js'],
				debug: true,
				cache: {},
				packageCache: {}
			}).transform("babelify", {
				presets: ["react","es2015"]
			});

			const bundle = () => {
				return b.bundle()
					.on('error', function (err) { console.log(err); this.emit('end'); })
					.pipe(source(entry))
					.pipe(buffer())
					.pipe(rename(function (path) {
						path.dirname = '';
						path.basename += '.bundle';
					}))
					.pipe(gulpif(env.node_env !== 'production', sourcemaps.init( { loadMaps: true } ))) // dev env only
					.pipe(gulpif(env.node_env !== 'production', sourcemaps.write())) // dev env only
					.pipe(gulpif(env.node_env !== 'production', gulp.dest(paths.scripts.dest))) // dev env only
					.pipe(gulpif(env.node_env === 'production', uglify())) //prod env only
					.pipe(gulpif(paths.scripts.filename.length && env.node_env === 'production', rename({prefix: paths.scripts.filename + '-'}))) //prod env only
					.pipe(gulpif(env.node_env === 'production', rename({suffix: '.min'}))) //prod env only
					.pipe(gulpif(env.node_env === 'production', gulp.dest(paths.scripts.build))); //prod env only
			};


			if (watch) {
				b = watchify(b);
				b.on('update', function () {
					console.log('-> bundling...');
					bundle();
				});
			}

			return bundle();
		});

		eventStream.merge(tasks).on('end', done);
	});
}

/*
	* ------------ *
	| Script tasks |
	* ------------ *

	* Browserify - entry main.js
	* Watchify - enable watching for browserify
	* Babelify - Babel transform for browserify
	* Write sourcemaps if not production
	* Uglify if production
*/

gulp.task('scripts', function (done) { return compile(done); });
gulp.task('scripts:watch', function (done) { return compile(done, true); });


gulp.task('watch', ['scripts'], function () {
	runSequence(['scripts:watch']);
});

gulp.task('default', ['scripts']);
