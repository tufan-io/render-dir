#!/usr/bin/env node
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const path = require("path");
const program = require("commander");
const chalk_1 = require("chalk");
const _1 = require(".");
const readPkg = require("read-pkg-up");
const pkg = readPkg();
program
    .version(pkg.version)
    .usage(`[options] <srcdir> <dstdir>`)
    .description(`Applies transform & copies files from 'srcdir' -> 'dstdir', with filtering`)
    .option(`-x, --transform <transform>`, `file with default exported function, used to transform file/content`)
    .parse(process.argv);
let _args = [program.args[0], program.args[1]];
if (program.transform) {
    const tpath = path.resolve(program.transform);
    const transformer = require(tpath);
    _args.push(transformer);
}
_1.renderDir.apply(null, _args)
    .then(() => {
    console.log(chalk_1.green(`files rendered to ${_args[1]}`));
})
    .catch(err => {
    console.error(chalk_1.red(err.message));
    console.error(chalk_1.red(err.stack));
});
