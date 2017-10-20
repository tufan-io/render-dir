
import { test } from 'ava';
import { renderDir } from '../..';
import * as tmp from 'tmp';
import * as execa from 'execa';

const srcdir = 'src/test/fixtures';

const JSON2 = j => JSON.stringify(j, null, 2);

test('renderDir API identity transform', async (t) => {
  const expected = [{
    src: 'file1.json',
    dst: 'file1.json'
  }, {
    src: 'subdir1/file11.json',
    dst: 'subdir1/file11.json'
  }, {
    src: 'subdir1/octocat-spinner-32.gif',
    dst: 'subdir1/octocat-spinner-32.gif'
  }, {
    src: 'subdir1/skip.txt',
    dst: 'subdir1/skip.txt'
  }, {
    src: 'transform-error.js',
    dst: 'transform-error.js'
  }, {
    src: 'transform.js',
    dst: 'transform.js'
  }];
  const dstdir = tmp.dirSync().name;
  const actual = await renderDir(srcdir, dstdir);
  t.deepEqual(actual, expected, dstdir);
});

test('renderDir API skip transform', async (t) => {
  const expected = [{
    src: 'file1.json',
    dst: 'file1.json'
  }, {
    src: 'subdir1/file11.json',
    dst: 'subdir1/file11.json'
  }, {
    src: 'subdir1/octocat-spinner-32.gif',
    dst: 'subdir1/octocat-spinner-32.gif'
  }, {
    src: 'transform-error.js',
    dst: 'transform-error.js'
  }, {
    src: 'transform.js',
    dst: 'transform.js'
  }];
  const dstdir = tmp.dirSync().name;
  const actual = await renderDir(srcdir, dstdir, (desc) => {
    return (desc.path === 'subdir1/skip.txt') ? null : desc;
  });
  const order = (a, b) => a.src < b.src;
  t.deepEqual(actual, expected, dstdir);
});


test('renderDir API error when processing', async (t) => {
  try {
    const dstdir = tmp.dirSync().name;
    await renderDir(srcdir, dstdir, (desc) => {
      if (desc.path === 'subdir1/skip.txt') {
        throw new Error(`throws an error instead of skip.txt`);
      }
      return desc;
    });
  } catch (err) {
    t.regex(err.message, /throws an error instead of skip.txt/);
  }
});

test(`renderDir CLI with custom transform`, async t => {
  const dstdir = tmp.dirSync().name;
  const result = await execa(
    `node`,
    [
      `build/cli.js`,
      `-x`,
      `src/test/fixtures/transform.js`,
      `src/test/fixtures`,
      dstdir
    ]);
  t.is(result.stdout, `files rendered to ${dstdir}`, JSON2(result));
});

test(`renderDir CLI default transform`, async t => {
  const dstdir = tmp.dirSync().name;
  const result = await execa(
    `node`,
    [
      `build/cli.js`,
      `src/test/fixtures`,
      dstdir
    ]);
  t.is(result.stdout, `files rendered to ${dstdir}`, JSON2(result));
});

test(`renderDir CLI with transform error`, async t => {
  const dstdir = tmp.dirSync().name;
  const result = await execa(
    `node`,
    [
      `build/cli.js`,
      `-x`,
      `src/test/fixtures/transform-error.js`,
      `src/test/fixtures`,
      dstdir
    ]);
  t.regex(result.stderr, /trigger an error.*/, JSON2(result));
});
