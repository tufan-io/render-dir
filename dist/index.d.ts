import * as fs from 'graceful-fs';
export interface FileDescriptor {
    path: string;
    content: string;
    stats: fs.Stats;
    mime: string;
}
export declare const renderDir: (srcdir: string, dstdir: string, transformer?: (fdesc: FileDescriptor) => FileDescriptor) => Promise<{}>;
