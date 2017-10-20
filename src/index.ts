
import * as engchk from 'runtime-engine-check';
engchk(); // checks node version matches spec in package.json
import * as fs from 'graceful-fs';
import * as klaw from 'klaw';
import * as a from 'awaiting';
import * as path from 'path';
import * as fileType from 'file-type';
import * as mkdirp from 'mkdirp';

export interface FileDescriptor {
  path: string;
  content: string;
  stats: fs.Stats;
  mime: string;
}

const getContentAndMime = async fpath => {
  let content = await a.callback(fs.readFile, fpath);
  const type = fileType(content);
  const mime = (type && type.mime) || 'utf8';
  content = mime === 'utf8' ? content.toString('utf8') : content;
  return { content, mime };
};

const reorder = (paths) => {
  // ensures that all files copied are resorted in order,
  // helps make testing and validation predictable
  return paths.sort((a, b) => a.src > b.src);
};

const defaultTx = (fdesc) => fdesc;

export const renderDir = async (
  srcdir: string,
  dstdir: string,
  transformer: (fdesc: FileDescriptor) => null | FileDescriptor = defaultTx
) => {
  return new Promise((resolve, reject) => {
    const state = {
      paths: [],
      cb_count: 0,
      done: false,
      errors: <string[]>[]
    };

    const isThisTheEnd = () => {
      if (
        state.done === true &&
        state.cb_count === 0
      ) {
        state.errors.length
          ? reject(new Error(state.errors.join('\n')))
          : resolve(reorder(state.paths));
      }
    };

    klaw(srcdir)
      .on('data', async f => {
        // ignore directories
        if (f.stats.isDirectory()) return;
        state.cb_count++;
        try {
          const { content, mime } = await getContentAndMime(f.path);
          const srcpath = path.relative(srcdir, f.path);
          const result = await transformer(<FileDescriptor>{
            path: srcpath,
            stats: f.stats,
            content,
            mime
          });
          if (result) {
            const dstpath = path.join(dstdir, result.path);
            const parsed = path.parse(dstpath);
            await a.callback(mkdirp, parsed.dir);
            state.paths.push({ src: srcpath, dst: result.path });
            // write the file to destination
            if (result.mime === 'utf8') {
              await a.callback(fs.writeFile, dstpath, result.content, 'utf8');
            } else {
              await a.callback(fs.writeFile, dstpath, result.content);
            }
          } /* else {} // this file is filtered */
        } catch (err) {
          state.errors.push(err.message);
        } finally {
          state.cb_count--;
          isThisTheEnd();
        }
      })
      .on('error',
      /* istanbul ignore next */
      err => {
        state.errors.push(err);
        isThisTheEnd();
      })
      .on('end', () => {
        state.done = true;
        isThisTheEnd();
      });
  });
};
