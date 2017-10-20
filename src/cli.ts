#!/usr/bin/env node

import * as path from 'path';
import * as program from 'commander';
import { red, green } from 'chalk';
import { renderDir } from '.';
import * as readPkg from 'read-pkg-up';

const pkg = readPkg();

program
  .version(pkg.version)
  .usage(`[options] <srcdir> <dstdir>`)
  .description(`Applies transform & copies files from 'srcdir' -> 'dstdir', with filtering`)
  .option(
  `-x, --transform <transform>`,
  `file with default exported function, used to transform file/content`)
  .parse(process.argv);

let _args = [program.args[0], program.args[1]];

if (program.transform) {
  const tpath = path.resolve(program.transform);
  const transformer = require(tpath);
  _args.push(transformer);
}

renderDir.apply(null, _args)
  .then(() => {
    console.log(green(`files rendered to ${_args[1]}`));
  })
  .catch(err => {
    console.error(red(err.message));
    console.error(red(err.stack));
  });
