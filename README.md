# render-dir

<!-- badge -->
[![npm license](https://img.shields.io/npm/l/render-dir.svg)](https://www.npmjs.com/package/render-dir)
[![travis status](https://img.shields.io/travis/tufan-io/render-dir.svg)](https://travis-ci.org/tufan-io/render-dir)
[![Build status](https://ci.appveyor.com/api/projects/status/90am2usst4qeutgi?svg=true)](https://ci.appveyor.com/project/tufan-io/render-dir)
[![Coverage Status](https://coveralls.io/repos/github/tufan-io/render-dir/badge.svg?branch=master)](https://coveralls.io/github/tufan-io/render-dir?branch=master)
[![David](https://david-dm.org/tufan-io/render-dir/status.svg)](https://david-dm.org/tufan-io/render-dir)
[![David](https://david-dm.org/tufan-io/render-dir/dev-status.svg)](https://david-dm.org/tufan-io/render-dir?type=dev)
[![Commitizen friendly](https://img.shields.io/badge/commitizen-friendly-brightgreen.svg)](http://commitizen.github.io/cz-cli/)
[![NPM](https://nodei.co/npm/render-dir.png?downloads=true&downloadRank=true&stars=true)](https://nodei.co/npm/render-dir/)
<!-- endbadge -->

Simple convenience function to help copy a source directory to a destinaton directory, with file contents being transformed.

Provides a promise based interface, that provides two things -

1. A file path transformation
2. A file content transformation

## File Transformation

This is the raison d'etre for the library. Since different tools use
different template engines, `render-dir` does not force an opinion.

The `transformer()` is invoked with the content of each file,
allowing the user to provide the actual transformation logic,
while getting a convenient `promised` interface to `fs` book-keeping

## Installation

> NOTE: We *strongly* prefer local installations versus global. Prevents most if not all occurances of "works-on-my-machine" symptom.

```bash
npm install render-dir
```

```bash
yarn install render-dir
```

## Usage

renderDir is implmented as a simple API, but also exposed as an CLI,
with the callback being provided in a javascript file, with the default
export.

### API

```TypeScript

const renderDir = require('render-dir');

renderDir(srcdir: string, dstdir: string, transformer?: (fdesc: FileDescriptor) => FileDescriptor) => Promise<{}>
```

## CLI

```bash

  Usage: render-dir [options] <srcdir> <dstdir>

  Applies transform & copies files from 'srcdir' -> 'dstdir', with filtering


  Options:

    -V, --version                output the version number
    -x, --transform <transform>  file with default exported function, used to transform file/content
    -h, --help                   output usage information
```

```bash
npx render-dir -x ./transform.js /src/template/dir/ /dst/dir/rendered/
```

## Development Tooling

- [Development tooling](./docs/DevTools.md)
- [Changelog](./CHANGELOG)

## License

[Apache-2.0](./LICENSE.md)

## Code of Conduct

Please note that this project is released with a [Contributor Code of Conduct](code-of-conduct.md). By participating in this project you agree to abide by its terms.

## Support

Bugs, PRs, comments, suggestions welcomed!
