"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const engchk = require("runtime-engine-check");
engchk();
const fs = require("graceful-fs");
const klaw = require("klaw");
const a = require("awaiting");
const path = require("path");
const fileType = require("file-type");
const mkdirp = require("mkdirp");
const getContentAndMime = (fpath) => __awaiter(this, void 0, void 0, function* () {
    let content = yield a.callback(fs.readFile, fpath);
    const type = fileType(content);
    const mime = (type && type.mime) || 'utf8';
    content = mime === 'utf8' ? content.toString('utf8') : content;
    return { content, mime };
});
const reorder = (paths) => {
    return paths.sort((a, b) => a.src > b.src);
};
const defaultTx = (fdesc) => fdesc;
exports.renderDir = (srcdir, dstdir, transformer = defaultTx) => __awaiter(this, void 0, void 0, function* () {
    return new Promise((resolve, reject) => {
        const state = {
            paths: [],
            cb_count: 0,
            done: false,
            errors: []
        };
        const isThisTheEnd = () => {
            if (state.done === true &&
                state.cb_count === 0) {
                state.errors.length
                    ? reject(new Error(state.errors.join('\n')))
                    : resolve(reorder(state.paths));
            }
        };
        klaw(srcdir)
            .on('data', (f) => __awaiter(this, void 0, void 0, function* () {
            if (f.stats.isDirectory())
                return;
            state.cb_count++;
            try {
                const { content, mime } = yield getContentAndMime(f.path);
                const srcpath = path.relative(srcdir, f.path);
                const result = yield transformer({
                    path: srcpath,
                    stats: f.stats,
                    content,
                    mime
                });
                if (result) {
                    const dstpath = path.join(dstdir, result.path);
                    const parsed = path.parse(dstpath);
                    yield a.callback(mkdirp, parsed.dir);
                    state.paths.push({ src: srcpath, dst: result.path });
                    if (result.mime === 'utf8') {
                        yield a.callback(fs.writeFile, dstpath, result.content, 'utf8');
                    }
                    else {
                        yield a.callback(fs.writeFile, dstpath, result.content);
                    }
                }
            }
            catch (err) {
                state.errors.push(err.message);
            }
            finally {
                state.cb_count--;
                isThisTheEnd();
            }
        }))
            .on('error', err => {
            state.errors.push(err);
            isThisTheEnd();
        })
            .on('end', () => {
            state.done = true;
            isThisTheEnd();
        });
    });
});
