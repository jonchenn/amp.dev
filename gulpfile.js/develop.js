/**
 * Copyright 2019 The AMP HTML Authors. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS-IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

'use strict';

const gulp = require('gulp');
const {project} = require('@lib/utils');
const grow = require('@lib/utils/grow');
const config = require('@lib/config');
const Platform = require('@lib/platform');
const signale = require('signale');
const build = require('./build.js');
const {samplesBuilder} = require('@lib/build/samplesBuilder');

function bootstrap(done) {
  gulp.parallel(build.buildBoilerplate, build.buildPlayground, build.importAll)(done);
}

function develop() {
  gulp.series(gulp.parallel(build.buildFrontend, build.collectStatics), run)();
}

function extract() {
  gulp.series(gulp.parallel(build.buildFrontend, build.collectStatics), () => {
    config.configureGrow();

    grow('translations extract')
        .catch(() => {
          signale.fatal('Grow had an error starting up. There probably is a broken' +
            'document in the project. See the log above for details.');
          process.exit(1);
        });
  })();
}

function run() {
  config.configureGrow();
  grow(`run --port ${config.hosts.pages.port}`).catch(() => {
    signale.fatal('Grow had an error starting up. There probably is a broken' +
      'document in the project. See the log above for details.');
    process.exit(1);
  });

  signale.info('Watching icons, templates, styles and samples ...');
  samplesBuilder.build();
  gulp.watch(`${project.paths.ICONS}/**/*.svg`, build.icons);
  gulp.watch(`${project.paths.FRONTEND_TEMPLATES}/**/*.j2`, build.templates);
  gulp.watch(`${project.paths.SCSS}/**/*.scss`, build.sass);

  new Platform().start();
}

exports.bootstrap = bootstrap;
exports.develop = develop;
exports.extract = extract;
